/**
 * scripts/seedPlaces.js
 * -----------------------------------------------------------------------
 * Inserta un catálogo de ejemplo de lugares turísticos en Xicotepec y la
 * Sierra Norte de Puebla (segmento principal del piloto, según el Canvas).
 * Útil para probar de inmediato los endpoints geoespaciales de la App
 * Móvil (/local/nearby) y el Smartwatch (/wearable/nearby).
 *
 * Uso:
 *   node scripts/seedPlaces.js
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../src/models/mongodb/Place');
const googleMapsService = require('../src/services/googleMapsService');
const logger = require('../src/utils/logger');

// Base pública de la API para armar las URLs del proxy de fotos
// (GET /maps/photo?ref=...). Ajusta API_PUBLIC_URL en .env si tu servidor
// corre en otro puerto/dominio; por defecto asume desarrollo local.
const API_PUBLIC_URL = process.env.API_PUBLIC_URL || 'http://localhost:4000/api/v1';

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

const buildFallbackImageUrl = (place) =>
  googleMapsService.buildFallbackImageUrl(`${place.name} ${place.municipality} Puebla turismo`);

// Coordenadas aproximadas de Xicotepec, Necaxa y Huauchinango, Puebla: [lng, lat]
const samplePlaces = [
  {
    name: 'Cascada de Patla',
    category: 'naturaleza',
    description: 'Cascada de aguas turquesas rodeada de selva, ideal para nadar.',
    address: 'Patla, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9765, 20.2569] },
    tags: ['familiar', 'aventura', 'vista'],
    priceLevel: 1,
  },
  {
    name: 'Parroquia de San Juan Bautista',
    category: 'sitio_cultural',
    description: 'Templo histórico en el centro de Xicotepec.',
    address: 'Centro, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9503, 20.2822] },
    tags: ['historia', 'arquitectura'],
    priceLevel: 1,
  },
  {
    name: 'Mirador de la Sierra Norte',
    category: 'naturaleza',
    description: 'Punto panorámico con vista a las montañas de la región.',
    address: 'Carretera Xicotepec-Necaxa',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9601, 20.2701] },
    tags: ['vista', 'fotografia'],
    priceLevel: 1,
  },
  {
    name: 'Mercado Municipal Xicotepec',
    category: 'entretenimiento',
    description: 'Mercado tradicional con productos regionales, artesanías y comida local.',
    address: 'Centro, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9512, 20.2808] },
    tags: ['artesanias', 'gastronomia', 'compras'],
    priceLevel: 1,
  },
  {
    name: 'Parque Juárez',
    category: 'entretenimiento',
    description: 'Parque recreativo familiar con áreas verdes y juegos infantiles.',
    address: 'Col. Centro, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9525, 20.2830] },
    tags: ['familiar', 'aire_libre'],
    priceLevel: 1,
  },
  {
    name: 'Museo Comunitario de Xicotepec',
    category: 'sitio_cultural',
    description: 'Exhibición de historia prehispánica y colonial de la región Totonaca-Náhuatl.',
    address: 'Centro histórico, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9508, 20.2815] },
    tags: ['historia', 'educativo'],
    priceLevel: 1,
  },
  {
    name: 'Grutas de Karmidas',
    category: 'naturaleza',
    description: 'Formaciones rocosas y cavernas naturales cerca de Villa Ávila Camacho.',
    address: 'Villa Ávila Camacho, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9982, 20.2461] },
    tags: ['aventura', 'exploracion'],
    priceLevel: 1,
  },
  {
    name: 'Balneario Poza Azul',
    category: 'naturaleza',
    description: 'Poza de aguas cristalinas ideal para nadar en temporada de calor.',
    address: 'Camino rural, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9612, 20.2685] },
    tags: ['familiar', 'nadar'],
    priceLevel: 1,
  },
  {
    name: 'Presa de Necaxa',
    category: 'naturaleza',
    description: 'Presa y paisaje de la Sierra Norte con miradores y caminatas.',
    address: 'Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9892, 20.2211] },
    tags: ['vista', 'fotografia', 'senderismo'],
    priceLevel: 1,
  },
  {
    name: 'Puente Colgante de Necaxa',
    category: 'naturaleza',
    description: 'Icónico puente colgante con vista a la presa Necaxa, popular punto fotográfico.',
    address: 'Carretera Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9908, 20.2197] },
    tags: ['vista', 'fotografia', 'aventura'],
    priceLevel: 1,
  },
  {
    name: 'Centro Ecoturístico Necaxa',
    category: 'entretenimiento',
    description: 'Espacio para disfrutar de la naturaleza, comida y recorridos en la región.',
    address: 'Carretera a Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9846, 20.2263] },
    tags: ['ecoturismo', 'familiar'],
    priceLevel: 2,
  },
  {
    name: 'Mirador de la Cañada',
    category: 'naturaleza',
    description: 'Mirador natural con amplias vistas del valle y de la presa.',
    address: 'Cañada de Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9864, 20.2250] },
    tags: ['vista', 'fotografia'],
    priceLevel: 1,
  },
  {
    name: 'Parroquia de San Miguel Arcángel',
    category: 'sitio_cultural',
    description: 'Templo histórico de la zona con arquitectura tradicional del norte de Puebla.',
    address: 'Centro de Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9869, 20.2235] },
    tags: ['historia', 'arquitectura'],
    priceLevel: 1,
  },
  {
    name: 'Mercado de Necaxa',
    category: 'restaurante',
    description: 'Mercado local para probar platillos típicos y productos de la región.',
    address: 'Plaza principal, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9879, 20.2208] },
    tags: ['gastronomia', 'local'],
    priceLevel: 1,
  },
  {
    name: 'Plaza de Armas de Huauchinango',
    category: 'sitio_cultural',
    description: 'Centro histórico y punto de encuentro de la ciudad.',
    address: 'Centro, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0540, 20.1762] },
    tags: ['historia', 'centro'],
    priceLevel: 1,
  },
  {
    name: 'Parroquia de San Juan Bautista de Huauchinango',
    category: 'sitio_cultural',
    description: 'Parroquia histórica con gran valor arquitectónico en la zona alta.',
    address: 'Centro histórico, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0528, 20.1754] },
    tags: ['historia', 'arquitectura'],
    priceLevel: 1,
  },
  {
    name: 'Mercado de Huauchinango',
    category: 'restaurante',
    description: 'Mercado tradicional con comida regional, frutas y artesanías.',
    address: 'Mercado principal, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0536, 20.1768] },
    tags: ['gastronomia', 'compras'],
    priceLevel: 1,
  },
  {
    name: 'Cerro de la Cruz',
    category: 'naturaleza',
    description: 'Mirador con vista panorámica de Huauchinango y su valle.',
    address: 'Cerro de la Cruz, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0509, 20.1738] },
    tags: ['vista', 'fotografia'],
    priceLevel: 1,
  },
  {
    name: 'Cañón del Río Necaxa',
    category: 'naturaleza',
    description: 'Paisaje escénico de barrancas y rutas de aventura cerca de la región.',
    address: 'Carretera Huauchinango-Necaxa, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0427, 20.1814] },
    tags: ['aventura', 'senderismo'],
    priceLevel: 1,
  },
  {
    name: 'Hotel Mirador de la Sierra',
    category: 'hotel',
    description: 'Hospedaje con vista a la sierra y acceso rápido al centro.',
    address: 'Carretera a Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0562, 20.1791] },
    tags: ['céntrico', 'vista'],
    priceLevel: 2,
  },
  {
    name: 'Feria del Café y la Sierra',
    category: 'evento',
    description: 'Evento cultural con música, comida típica y artesanías de la región.',
    address: 'Zócalo de Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0532, 20.1760] },
    tags: ['musica', 'gastronomia'],
    priceLevel: 1,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Conectado a MongoDB para siembra de datos.');

    await Place.deleteMany({ municipality: { $in: ['Xicotepec', 'Necaxa', 'Huauchinango'] } });
    const created = await Place.insertMany(samplePlaces);

    logger.info(`✅ ${created.length} lugares de ejemplo insertados en Xicotepec, Necaxa y Huauchinango.`);

    // Enriquecimiento con fotos reales de Google Places (best effort, uno
    // por uno para no disparar demasiadas peticiones en paralelo). Si no
    // hay GOOGLE_MAPS_API_KEY configurada, o Google no tiene el lugar
    // indexado, simplemente se deja sin foto — no detiene el seed.
    let withPhoto = 0;
    for (const place of created) {
      try {
        const photoReference = await googleMapsService.findPlacePhotoReference(
          `${place.name}, ${place.address || place.municipality}`
        );
        if (photoReference) {
          const photoUrl = googleMapsService.buildPhotoProxyUrl(API_PUBLIC_URL, photoReference);
          await Place.updateOne({ _id: place._id }, { photoReference, images: [photoUrl] });
          withPhoto += 1;
        } else {
          const fallbackImage = buildFallbackImageUrl(place);
          await Place.updateOne({ _id: place._id }, { images: [fallbackImage] });
        }
      } catch (photoError) {
        logger.warn(`Sin foto automática para "${place.name}": ${photoError.message}`);
      }
      await sleep(200); // pequeño respiro entre llamadas a la API de Google
    }

    logger.info(`🖼️  ${withPhoto}/${created.length} lugares quedaron con foto automática de Google Places.`);
  } catch (error) {
    logger.error(`❌ Error al sembrar lugares: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
