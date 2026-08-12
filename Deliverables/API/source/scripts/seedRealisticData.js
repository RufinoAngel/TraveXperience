/**
 * scripts/seedRealisticData.js
 * -----------------------------------------------------------------------
 * Inserta en la BD real los 60 usuarios + 150 itinerarios generados
 * (users.json / itineraries.json), resolviendo el mapeo tempId -> id
 * real de MySQL automáticamente.
 *
 * A diferencia de scripts/seedPlaces.js (que siembra el catálogo de
 * lugares en MongoDB), este script siembra USUARIOS e ITINERARIOS en
 * MySQL — pensado específicamente para dejar de depender del fallback
 * sintético de trainBudgetModel.js / trainClusteringModel.js
 * (MIN_REAL_SAMPLES=30, MIN_REAL_USERS=40).
 *
 * Uso:
 *   node scripts/seedRealisticData.js
 *
 * Requiere: users.json e itineraries.json en la raíz del proyecto
 * (o ajustar USERS_PATH / ITINERARIES_PATH abajo).
 * -----------------------------------------------------------------------
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { sequelize } = require('../src/config/mysql');
const User = require('../src/models/mysql/User');
const Itinerary = require('../src/models/mysql/Itinerary');
const logger = require('../src/utils/logger');

const USERS_PATH = path.resolve(__dirname, '../users.json');
const ITINERARIES_PATH = path.resolve(__dirname, '../itineraries.json');

// Password de prueba para TODOS los usuarios sembrados (documentado aquí
// para que el equipo pueda hacer login manual con cualquiera de ellos).
const SEED_PASSWORD = 'TravExperience2026!';

const run = async () => {
  await sequelize.authenticate();
  logger.info('Conectado a MySQL. Iniciando siembra de datos realistas...');

  const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  const itineraries = JSON.parse(fs.readFileSync(ITINERARIES_PATH, 'utf-8'));

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  // 1. Insertar usuarios y construir el mapeo tempId -> id real
  const tempIdToRealId = {};

  for (const u of users) {
    const created = await User.create({
      fullName: u.fullName,
      email: u.email,
      passwordHash,
      role: u.role,
      companyName: u.companyName,
      phone: u.phone,
      location: u.location,
      bio: u.bio,
      travelPreferences: u.travelPreferences,
      isActive: true,
    });
    tempIdToRealId[u.tempId] = created.id;
  }

  logger.info(`✅ ${users.length} usuarios insertados.`);

  // 2. Insertar itinerarios, resolviendo userTempId -> userId real
  let insertedCount = 0;
  let skippedCount = 0;

  for (const it of itineraries) {
    const realUserId = tempIdToRealId[it.userTempId];
    if (!realUserId) {
      skippedCount += 1;
      continue; // no debería pasar si users.json e itineraries.json vienen del mismo batch
    }

    await Itinerary.create({
      userId: realUserId,
      title: it.title,
      destination: it.destination,
      startDate: it.startDate,
      endDate: it.endDate,
      estimatedBudget: it.estimatedBudget,
      itineraryDetails: it.itineraryDetails,
      status: it.status,
    });
    insertedCount += 1;
  }

  logger.info(`✅ ${insertedCount} itinerarios insertados (${skippedCount} omitidos por mapeo faltante).`);
  logger.info(`Password de prueba para todos los usuarios sembrados: ${SEED_PASSWORD}`);
  logger.info('Siembra completa.');

  await sequelize.close();
};

run().catch((error) => {
  logger.error(`❌ Error al sembrar datos: ${error.message}`);
  process.exit(1);
});
