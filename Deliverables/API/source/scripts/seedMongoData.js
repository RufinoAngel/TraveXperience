/**
 * scripts/seedMongoData.js
 * -----------------------------------------------------------------------
 * Siembra Place, Hotel, Review, Favorite y ActivityLog en MongoDB con
 * datos coherentes de la región Xicotepec / Necaxa / Huauchinango.
 *
 * "Coherente" significa específicamente:
 *   - Todo evento `view_hotel` apunta a un Hotel real (entityType='hotel').
 *   - Todo evento `view_place` apunta a un Place real (entityType='place').
 *   - `write_review` corresponde exactamente a una Review real creada.
 *   - `save_favorite`/`remove_favorite` corresponden a Favorites reales
 *     (algunos favoritos se guardan y luego se eliminan, generando ambos
 *     eventos con las mismas referencias).
 *   - `search`, `app_open`, `wearable_sync` NO llevan entidad asociada.
 *
 * Requiere que scripts/seedRealisticData.js ya se haya corrido antes
 * (usa users.json para mapear tempId de usuario -> id real de MySQL por
 * email).
 *
 * Uso:
 *   node scripts/seedMongoData.js
 * -----------------------------------------------------------------------
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { sequelize } = require('../src/config/mysql');
const { connectMongoDB } = require('../src/config/mongodb');
const User = require('../src/models/mysql/User');
const Place = require('../src/models/mongodb/Place');
const Hotel = require('../src/models/mongodb/Hotel');
const Review = require('../src/models/mongodb/Review');
const Favorite = require('../src/models/mongodb/Favorite');
const ActivityLog = require('../src/models/mongodb/ActivityLog');
const logger = require('../src/utils/logger');

const SEED_DIR = path.resolve(__dirname, 'mongo-seed');
const USERS_JSON_PATH = path.resolve(__dirname, '../users.json');

const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf-8'));

const dropLegacyFavoriteIndex = async () => {
  const favoritesCollection = mongoose.connection.collection('favorites');
  const indexes = await favoritesCollection.indexes();
  const legacyIndex = indexes.find((index) => index.name === 'userId_1_placeId_1');

  if (legacyIndex) {
    logger.warn('⚠️ Se encontró un índice heredado favorites.userId_1_placeId_1. Eliminando para evitar conflictos de esquema.');
    await favoritesCollection.dropIndex('userId_1_placeId_1');
  }
};

/** Recalcula ratingAvg/ratingCount igual que reviewController.recalculateEntityRating */
const recalculateEntityRating = async (entityType, entityId) => {
  const EntityModel = entityType === 'place' ? Place : Hotel;
  const stats = await Review.aggregate([
    { $match: { entityType, entityId: new mongoose.Types.ObjectId(entityId) } },
    { $group: { _id: '$entityId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await EntityModel.findByIdAndUpdate(entityId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

const run = async () => {
  await sequelize.authenticate();
  await connectMongoDB();
  await dropLegacyFavoriteIndex();
  logger.info('Conectado a MySQL y MongoDB. Iniciando siembra de datos de Mongo...');

  // ---------------------------------------------------------------------
  // 0. Resolver tempId de usuario (users.json) -> id real de MySQL, por email
  // ---------------------------------------------------------------------
  const seedUsers = JSON.parse(fs.readFileSync(USERS_JSON_PATH, 'utf-8'));
  const emails = seedUsers.map((u) => u.email);
  const realUsers = await User.findAll({ where: { email: emails }, attributes: ['id', 'email', 'role'] });

  const emailToRealId = new Map(realUsers.map((u) => [u.email, u.id]));
  const tempUserIdToRealId = new Map();
  const adminRealIds = [];

  seedUsers.forEach((u) => {
    const realId = emailToRealId.get(u.email);
    if (realId) {
      tempUserIdToRealId.set(u.tempId, realId);
      if (u.role === 'administrador') adminRealIds.push(realId);
    }
  });

  if (tempUserIdToRealId.size === 0) {
    throw new Error(
      'No se encontró ningún usuario de users.json en MySQL. Corre primero scripts/seedRealisticData.js.'
    );
  }
  if (adminRealIds.length === 0) {
    throw new Error('No se encontraron usuarios administradores reales para asignar como dueños de hoteles.');
  }

  logger.info(`Usuarios resueltos: ${tempUserIdToRealId.size}/${seedUsers.length}. Admins: ${adminRealIds.length}.`);

  // ---------------------------------------------------------------------
  // 1. Insertar Places
  // ---------------------------------------------------------------------
  const placesRaw = loadJson('places.json');
  const placeTempIdToRealId = new Map();

  for (const p of placesRaw) {
    const created = await Place.create({
      name: p.name,
      category: p.category,
      description: p.description,
      address: p.address,
      municipality: p.municipality,
      location: p.location,
      images: p.images,
      tags: p.tags,
      priceLevel: p.priceLevel,
      isActive: p.isActive,
    });
    placeTempIdToRealId.set(p.tempId, created._id);
  }
  logger.info(`✅ ${placesRaw.length} places insertados.`);

  // ---------------------------------------------------------------------
  // 2. Insertar Hotels (ownerId = admin real, round-robin por ownerAdminIndex)
  // ---------------------------------------------------------------------
  const hotelsRaw = loadJson('hotels.json');
  const hotelTempIdToRealId = new Map();

  for (const h of hotelsRaw) {
    const ownerId = adminRealIds[h.ownerAdminIndex % adminRealIds.length];
    const created = await Hotel.create({
      name: h.name,
      category: h.category,
      description: h.description,
      address: h.address,
      municipality: h.municipality,
      location: h.location,
      mainImage: h.mainImage,
      images: h.images,
      amenities: h.amenities,
      rooms: h.rooms,
      ownerId,
      isActive: h.isActive,
    });
    hotelTempIdToRealId.set(h.tempId, created._id);
  }
  logger.info(`✅ ${hotelsRaw.length} hotels insertados.`);

  const resolveEntityId = (entityType, entityTempId) =>
    entityType === 'place' ? placeTempIdToRealId.get(entityTempId) : hotelTempIdToRealId.get(entityTempId);

  // ---------------------------------------------------------------------
  // 3. Insertar Reviews (y recalcular ratingAvg/ratingCount, igual que en producción)
  // ---------------------------------------------------------------------
  const reviewsRaw = loadJson('reviews.json');
  const touchedEntities = new Set();

  for (const r of reviewsRaw) {
    const userId = tempUserIdToRealId.get(r.userTempId);
    const entityId = resolveEntityId(r.entityType, r.entityTempId);
    if (!userId || !entityId) continue; // referencia no resoluble, se omite de forma segura

    await Review.create({
      userId,
      entityType: r.entityType,
      entityId,
      entityName: r.entityName,
      rating: r.rating,
      comment: r.comment,
      photos: r.photos,
      tags: r.tags,
      createdAt: new Date(r.createdAt),
    });
    touchedEntities.add(`${r.entityType}:${entityId}`);
  }

  for (const key of touchedEntities) {
    const [entityType, entityId] = key.split(':');
    await recalculateEntityRating(entityType, entityId);
  }
  logger.info(`✅ ${reviewsRaw.length} reviews insertadas y ratings recalculados.`);

  // ---------------------------------------------------------------------
  // 4. Insertar Favorites
  // ---------------------------------------------------------------------
  const favoritesRaw = loadJson('favorites.json');
  for (const fav of favoritesRaw) {
    const userId = tempUserIdToRealId.get(fav.userTempId);
    const entityId = resolveEntityId(fav.entityType, fav.entityTempId);
    if (!userId || !entityId) continue;

    await Favorite.create({ userId, entityType: fav.entityType, entityId });
  }
  logger.info(`✅ ${favoritesRaw.length} favorites insertados.`);

  // ---------------------------------------------------------------------
  // 5. Insertar ActivityLogs
  // ---------------------------------------------------------------------
  const logsRaw = loadJson('activity_logs.json');
  let insertedLogs = 0;

  for (const log of logsRaw) {
    const userId = tempUserIdToRealId.get(log.userTempId);
    if (!userId) continue;

    const entityId = log.entityType ? resolveEntityId(log.entityType, log.entityTempId) : undefined;
    if (log.entityType && !entityId) continue; // referencia no resoluble, se omite

    await ActivityLog.create({
      userId,
      eventType: log.eventType,
      entityType: log.entityType || undefined,
      entityId,
      metadata: log.metadata,
      source: log.source,
      createdAt: new Date(log.createdAt),
    });
    insertedLogs += 1;
  }
  logger.info(`✅ ${insertedLogs}/${logsRaw.length} activity logs insertados.`);

  logger.info('Siembra de MongoDB completa.');
  await mongoose.connection.close();
  await sequelize.close();
};

run().catch((error) => {
  logger.error('❌ Error al sembrar datos de Mongo:');
  console.error(error); // objeto completo, incluye .original / .parent si es de Sequelize o Mongoose
  process.exit(1);
});