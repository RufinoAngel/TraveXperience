require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../src/models/mongodb/Place');
const { sequelize } = require('../src/config/mysql');
const Itinerary = require('../src/models/mysql/Itinerary');
const logger = require('../src/utils/logger');
const { getRegionMunicipalities } = require('../src/utils/itineraryRegionHelper');

// A partir de ahora la plataforma SOLO opera en la Sierra Norte de Puebla,
// por lo que cualquier itinerario existente (sin importar su destino
// original: CDMX, Cancún, Monterrey, etc.) debe quedar dentro de estos
// 3 municipios.
const MUNICIPALITIES = ['Huauchinango', 'Necaxa', 'Xicotepec de Juárez'];

const MUNICIPALITY_ACTIVITIES = {
  Huauchinango: [
    'Centro de Huauchinango y miradores',
    'Mercado de los Sábados',
    'Parroquia de San Miguel Arcángel',
    'Mirador de la Peña',
    'Ruta de pueblos y gastronomía de la Sierra Norte',
  ],
  Necaxa: [
    'Cascada de Necaxa',
    'Presa de Necaxa',
    'Puentes colgantes de Necaxa',
    'Recorrido por la zona hidroeléctrica',
  ],
  'Xicotepec de Juárez': [
    'Xicotepec de Juárez y sus plazas tradicionales',
    'Museo Comunitario de Xicotepec',
    'Mirador de Xicotepec',
    'Ruta de pueblos y gastronomía de la Sierra Norte',
  ],
};

const normalizeText = (value = '') => String(value).trim().toLowerCase();

/** Detecta si un destino ya corresponde a uno de los 3 municipios. */
const matchExistingMunicipality = (destination) => {
  const normalized = normalizeText(destination);
  if (normalized.includes('huauchinango')) return 'Huauchinango';
  if (normalized.includes('necaxa')) return 'Necaxa';
  if (normalized.includes('xicotepec')) return 'Xicotepec de Juárez';
  return null;
};

/** Genera 2-4 actividades para un municipio, repartidas en los días del viaje. */
const buildItineraryDetails = (municipality, startDate, endDate) => {
  const pool = MUNICIPALITY_ACTIVITIES[municipality] || [];
  const durationDays = Math.max(
    1,
    Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
  );
  const count = Math.min(pool.length, Math.max(2, Math.min(4, durationDays)));

  return pool.slice(0, count).map((actividad, index) => ({
    actividad,
    dia: (index % durationDays) + 1,
    municipio: municipality,
  }));
};

const updateMongoPlaces = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const filter = {
    $or: [
      { municipality: { $regex: /huauchinango|necaxa|xicotepec/i } },
      { address: { $regex: /huauchinango|necaxa|xicotepec/i } },
      { description: { $regex: /sierra norte|huauchinango|necaxa|xicotepec/i } },
    ],
  };

  const places = await Place.find(filter);
  const updates = [];

  for (const place of places) {
    const regionMunicipalities = getRegionMunicipalities(place.municipality || place.address || '');
    const nextMunicipality = regionMunicipalities[0] || place.municipality || 'Xicotepec';

    const update = {
      municipality: nextMunicipality,
      tags: Array.from(new Set([...(place.tags || []), 'sierra-norte', 'puebla'])),
      description: place.description || `Lugar representativo de la Sierra Norte de Puebla en ${nextMunicipality}.`,
    };

    updates.push(Place.updateOne({ _id: place._id }, { $set: update }));
  }

  await Promise.all(updates);
  logger.info(`✅ ${places.length} lugares MongoDB actualizados.`);
};

const updateMySQLItineraries = async () => {
  await sequelize.authenticate();

  const itineraries = await Itinerary.findAll({ where: {} });
  const updates = [];
  let index = 0;

  for (const itinerary of itineraries) {
    const destination = String(itinerary.destination || '');

    // Si el destino ya es uno de los 3 municipios lo respetamos; si no,
    // se reparte de forma equilibrada (round-robin) entre los 3, ya que
    // la plataforma ya no maneja destinos fuera de la Sierra Norte.
    const nextDestination =
      matchExistingMunicipality(destination) || MUNICIPALITIES[index % MUNICIPALITIES.length];

    const updatedDetails = buildItineraryDetails(
      nextDestination,
      itinerary.startDate,
      itinerary.endDate
    );

    updates.push(
      itinerary.update({
        destination: nextDestination,
        itineraryDetails: updatedDetails,
      })
    );

    index += 1;
  }

  await Promise.all(updates);
  logger.info(`✅ ${updates.length} itinerarios MySQL actualizados a la Sierra Norte de Puebla.`);
};

(async () => {
  try {
    await updateMongoPlaces();
    await updateMySQLItineraries();
    logger.info('🎉 Contenido regional actualizado correctamente.');
  } catch (error) {
    logger.error(`❌ Error al actualizar contenido regional: ${error.message}`);
  } finally {
    await mongoose.disconnect().catch(() => {});
    await sequelize.close().catch(() => {});
    process.exit(0);
  }
})();
