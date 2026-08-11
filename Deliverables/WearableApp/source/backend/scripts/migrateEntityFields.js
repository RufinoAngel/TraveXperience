/**
 * scripts/migrateEntityFields.js
 * -----------------------------------------------------------------------
 * Migra documentos existentes de `favorites` y `reviews` del esquema
 * viejo (placeId fijo, solo Place) al esquema generalizado
 * (entityType/entityModel/entityId, soporta Place y Hotel).
 *
 * Es SEGURO correrlo más de una vez: solo toca documentos que todavía
 * tengan el campo viejo `placeId` y no tengan `entityType`.
 *
 * Uso:
 *   node scripts/migrateEntityFields.js
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Conectado a MongoDB para migración de entityType/entityId.');

    // Se usa .collection() (driver nativo) en vez de los modelos Mongoose
    // a propósito: los modelos ya solo conocen el esquema NUEVO, y
    // necesitamos leer/escribir el campo viejo `placeId` tal cual está
    // guardado en Mongo, sin que Mongoose lo filtre.
    const favoritesCollection = mongoose.connection.collection('favorites');
    const reviewsCollection = mongoose.connection.collection('reviews');

    // --- favorites ---
    const staleFavorites = await favoritesCollection
      .find({ placeId: { $exists: true }, entityType: { $exists: false } })
      .toArray();

    let favoritesMigrated = 0;
    for (const doc of staleFavorites) {
      await favoritesCollection.updateOne(
        { _id: doc._id },
        {
          $set: { entityType: 'place', entityModel: 'Place', entityId: doc.placeId },
          $unset: { placeId: '' },
        }
      );
      favoritesMigrated += 1;
    }
    logger.info(`✅ ${favoritesMigrated} favoritos migrados a entityType/entityId.`);

    // --- reviews ---
    const staleReviews = await reviewsCollection
      .find({ placeId: { $exists: true }, entityType: { $exists: false } })
      .toArray();

    let reviewsMigrated = 0;
    for (const doc of staleReviews) {
      await reviewsCollection.updateOne(
        { _id: doc._id },
        {
          $set: {
            entityType: 'place',
            entityModel: 'Place',
            entityId: doc.placeId,
            entityName: doc.placeName || 'Lugar sin nombre',
          },
          $unset: { placeId: '', placeName: '' },
        }
      );
      reviewsMigrated += 1;
    }
    logger.info(`✅ ${reviewsMigrated} reseñas migradas a entityType/entityId.`);

    if (favoritesMigrated === 0 && reviewsMigrated === 0) {
      logger.info('No había documentos con el esquema viejo — nada que migrar.');
    }
  } catch (error) {
    logger.error(`❌ Error durante la migración: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrate();
