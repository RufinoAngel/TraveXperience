/**
 * scripts/seedPlaces.js
 * -----------------------------------------------------------------------
 * Inserta un catálogo de ejemplo de lugares turísticos en Xicotepec,
 * Necaxa, Huauchinango y Tenango de las Flores (Sierra Norte de Puebla,
 * segmento principal del piloto según el Canvas).
 * Útil para probar de inmediato los endpoints geoespaciales de la App
 * Móvil (/local/nearby) y el Smartwatch (/wearable/nearby).
 *
 * ⚠️ El script es NO DESTRUCTIVO:
 *   1) Para cada lugar en `samplePlaces`, hace upsert por (name,
 *      municipality) — si ya existe, lo deja intacto; si no existe, lo
 *      crea. Nunca borra lugares que no estén en esta lista.
 *   2) Recorre TODOS los lugares de la base que no tengan imagen
 *      (`images` vacío o inexistente) — no solo los de esta lista — y
 *      les intenta poner una foto real de Google Places, con una imagen
 *      de respaldo (fallback) si Google no la tiene. Así puedes volver a
 *      correr este script cuantas veces quieras solo para "arreglar
 *      imágenes" sin arriesgar el resto del catálogo.
 *
 * 📍 Cobertura (81 lugares):
 *   - Xicotepec: 20
 *   - Necaxa: 20
 *   - Huauchinango: 21
 *   - Tenango de las Flores: 20 (localidad del municipio de Huauchinango,
 *     escenario de la película "Tizoc" con María Félix y Pedro Infante;
 *     se maneja como "municipality" propio en el catálogo, igual que
 *     Necaxa, para facilitar filtros y búsquedas por zona en la app)
 *
 * Nota sobre coordenadas: son aproximadas (estimadas alrededor del
 * centro de cada localidad) y suficientes para pruebas del feature de
 * geoposicionamiento. Si necesitas precisión real para producción,
 * conviene verificarlas contra Google Places / OSM antes de usarlas
 * fuera de un entorno de pruebas.
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
const API_PUBLIC_URL = process.env.API_PUBLIC_URL || 'http://10.91.20.6:4000/api/v1';

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

const buildFallbackImageUrl = (place) =>
  googleMapsService.buildFallbackImageUrl(`${place.name} ${place.municipality} Puebla turismo`);

// Coordenadas aproximadas: [lng, lat]
const samplePlaces = [
  // ===================== XICOTEPEC (20) =====================
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
    name: 'Templo de la Virgen de Guadalupe de Xicotepec',
    category: 'sitio_cultural',
    description: 'Santuario que alberga una de las imágenes guadalupanas más grandes de Puebla.',
    address: 'Centro, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9490, 20.2841] },
    tags: ['religioso', 'historia'],
    priceLevel: 1,
  },
  {
    name: 'Centro Ceremonial Xochipilli',
    category: 'sitio_cultural',
    description: 'Sitio ceremonial y cultural vinculado a las tradiciones indígenas de la región.',
    address: 'Zona rural, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9430, 20.2905] },
    tags: ['historia', 'tradicion'],
    priceLevel: 1,
  },
  {
    name: 'Palacio Municipal de Xicotepec',
    category: 'sitio_cultural',
    description: 'Edificio de gobierno con fachada histórica frente al zócalo.',
    address: 'Zócalo, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9520, 20.2825] },
    tags: ['arquitectura', 'centro'],
    priceLevel: 1,
  },
  {
    name: 'Balneario Las Truchas',
    category: 'naturaleza',
    description: 'Balneario familiar alimentado por manantiales de agua fría.',
    address: 'Camino rural, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9695, 20.2635] },
    tags: ['familiar', 'nadar'],
    priceLevel: 1,
  },
  {
    name: 'Cascada El Salto',
    category: 'naturaleza',
    description: 'Caída de agua de fácil acceso, popular para day-trips desde el centro.',
    address: 'Zona rural, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9840, 20.2532] },
    tags: ['aventura', 'fotografia'],
    priceLevel: 1,
  },
  {
    name: 'Mirador El Ocotal',
    category: 'naturaleza',
    description: 'Punto elevado entre bosques de pino y encino con vista al valle.',
    address: 'Carretera a Necaxa, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9655, 20.2745] },
    tags: ['vista', 'senderismo'],
    priceLevel: 1,
  },
  {
    name: 'Restaurante La Choza 1986',
    category: 'restaurante',
    description: 'Restaurante en el antiguo cine "Garza" de los años 50, platillos típicos de la región desde 1986.',
    address: 'Calle Reforma #100, Colonia Centro, Xicotepec de Juárez, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9518, 20.2818] },
    tags: ['gastronomia', 'regional'],
    priceLevel: 2,
  },
  {
    name: 'Ámame Café Restaurante Carranza',
    category: 'restaurante',
    description: 'Cafetería y restaurante bien valorado por su desayuno local y huerto propio.',
    address: 'Col. Carranza, Xicotepec de Juárez, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9509, 20.2812] },
    tags: ['cafe', 'local'],
    priceLevel: 1,
  },
  {
    name: 'Hotel Casablanca Xicotepec',
    category: 'hotel',
    description: 'Hotel de referencia en Xicotepec de Juárez, punto de orientación para otros negocios de la zona.',
    address: 'Xicotepec de Juárez, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9720, 20.2590] },
    tags: ['naturaleza', 'descanso'],
    priceLevel: 2,
  },
  {
    name: 'Feria de Xicotepec',
    category: 'evento',
    description: 'Feria regional anual con música, gastronomía y actividades culturales.',
    address: 'Centro, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9515, 20.2827] },
    tags: ['musica', 'gastronomia', 'tradicion'],
    priceLevel: 1,
  },
  {
    name: 'Sendero Ecológico Cuautempan',
    category: 'naturaleza',
    description: 'Ruta de senderismo entre bosque mesófilo y cafetales de sombra.',
    address: 'Zona rural, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9880, 20.2700] },
    tags: ['senderismo', 'ecoturismo'],
    priceLevel: 1,
  },
  {
    name: 'Balneario El Aguacate',
    category: 'naturaleza',
    description: 'Balneario rústico con pozas naturales y área de picnic.',
    address: 'Camino rural, Xicotepec, Puebla',
    municipality: 'Xicotepec',
    location: { type: 'Point', coordinates: [-97.9575, 20.2618] },
    tags: ['familiar', 'nadar'],
    priceLevel: 1,
  },

  // ===================== NECAXA (20) =====================
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
    name: 'Zona Hidroeléctrica de Necaxa',
    category: 'sitio_cultural',
    description: 'Complejo hidroeléctrico histórico, patrimonio industrial de principios del siglo XX.',
    address: 'Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9925, 20.2178] },
    tags: ['historia', 'industrial'],
    priceLevel: 1,
  },
  {
    name: 'Barrio Inglés de Necaxa',
    category: 'sitio_cultural',
    description: 'Colonia con arquitectura de estilo inglés construida por los técnicos de la hidroeléctrica.',
    address: 'Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9902, 20.2225] },
    tags: ['arquitectura', 'historia'],
    priceLevel: 1,
  },
  {
    name: 'Laguna Tenexcalco',
    category: 'naturaleza',
    description: 'Cuerpo de agua rodeado de vegetación, apto para paseos y observación de aves.',
    address: 'Zona rural, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9950, 20.2295] },
    tags: ['naturaleza', 'aves'],
    priceLevel: 1,
  },
  {
    name: 'Cascada Salto del Águila',
    category: 'naturaleza',
    description: 'Caída de agua en un cañón boscoso cerca de la presa.',
    address: 'Zona rural, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9805, 20.2185] },
    tags: ['aventura', 'fotografia'],
    priceLevel: 1,
  },
  {
    name: 'Restaurante Mariscos La Presa',
    category: 'restaurante',
    description: 'Restaurante frente a la presa especializado en pescados y mariscos de río.',
    address: 'Orilla de la presa, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9885, 20.2203] },
    tags: ['gastronomia', 'vista'],
    priceLevel: 2,
  },
  {
    name: 'Café Central Necaxa',
    category: 'restaurante',
    description: 'Cafetería local frente al parque principal.',
    address: 'Centro de Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9872, 20.2228] },
    tags: ['cafe', 'local'],
    priceLevel: 1,
  },
  {
    name: 'Hotel Presa Necaxa',
    category: 'hotel',
    description: 'Hospedaje con vista al embalse y acceso directo al puente colgante.',
    address: 'Carretera Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9915, 20.2205] },
    tags: ['vista', 'descanso'],
    priceLevel: 2,
  },
  {
    name: 'Balneario Los Reyes',
    category: 'naturaleza',
    description: 'Balneario de pozas naturales alimentado por arroyos de montaña.',
    address: 'Zona rural, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9790, 20.2310] },
    tags: ['familiar', 'nadar'],
    priceLevel: 1,
  },
  {
    name: 'Mirador Cerro Pelón',
    category: 'naturaleza',
    description: 'Cerro con sendero corto y vista de 360° a la presa y la sierra.',
    address: 'Zona rural, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9835, 20.2140] },
    tags: ['senderismo', 'vista'],
    priceLevel: 1,
  },
  {
    name: 'Capilla de Guadalupe Necaxa',
    category: 'sitio_cultural',
    description: 'Pequeña capilla histórica en un barrio alto de Necaxa.',
    address: 'Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9858, 20.2242] },
    tags: ['religioso', 'historia'],
    priceLevel: 1,
  },
  {
    name: 'Feria de la Presa',
    category: 'evento',
    description: 'Evento anual con actividades acuáticas, música y gastronomía junto a la presa.',
    address: 'Orilla de la presa, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9890, 20.2215] },
    tags: ['musica', 'gastronomia'],
    priceLevel: 1,
  },
  {
    name: 'Sendero Barranca Grande',
    category: 'naturaleza',
    description: 'Ruta de senderismo por una barranca con vegetación densa y arroyos.',
    address: 'Zona rural, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9968, 20.2160] },
    tags: ['senderismo', 'aventura'],
    priceLevel: 1,
  },
  {
    name: 'Zona de Pesca Necaxa',
    category: 'entretenimiento',
    description: 'Área habilitada para pesca deportiva en la presa.',
    address: 'Orilla de la presa, Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9899, 20.2192] },
    tags: ['pesca', 'familiar'],
    priceLevel: 1,
  },
  {
    name: 'Mirador del Embalse',
    category: 'naturaleza',
    description: 'Punto panorámico con vista completa del embalse y la cortina de la presa.',
    address: 'Carretera Necaxa, Puebla',
    municipality: 'Necaxa',
    location: { type: 'Point', coordinates: [-97.9920, 20.2185] },
    tags: ['vista', 'fotografia'],
    priceLevel: 1,
  },

  // ===================== HUAUCHINANGO (21) =====================
  {
    name: 'Plaza de la Constitución',
    category: 'sitio_cultural',
    description: 'Centro histórico y punto de encuentro de la ciudad de Huauchinango.',
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
  {
    name: 'Feria de Cuaresma de Huauchinango',
    category: 'evento',
    description: 'Una de las ferias más importantes de la Sierra Norte, con juegos mecánicos, música y gastronomía.',
    address: 'Centro, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0545, 20.1758] },
    tags: ['tradicion', 'musica', 'gastronomia'],
    priceLevel: 1,
  },
  {
    name: 'Museo Regional de Huauchinango',
    category: 'sitio_cultural',
    description: 'Museo con piezas arqueológicas y objetos de la historia local.',
    address: 'Centro histórico, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0522, 20.1749] },
    tags: ['historia', 'educativo'],
    priceLevel: 1,
  },
  {
    name: 'Barrio de Analco',
    category: 'sitio_cultural',
    description: 'Barrio tradicional con casas de arquitectura serrana y ambiente típico.',
    address: 'Barrio de Analco, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0568, 20.1745] },
    tags: ['tradicion', 'arquitectura'],
    priceLevel: 1,
  },
  {
    name: 'Parque Reforma',
    category: 'entretenimiento',
    description: 'Parque urbano con áreas verdes y juegos infantiles.',
    address: 'Col. Reforma, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0575, 20.1782] },
    tags: ['familiar', 'aire_libre'],
    priceLevel: 1,
  },
  {
    name: 'Cascada de Tenampulco',
    category: 'naturaleza',
    description: 'Caída de agua rodeada de vegetación, accesible por sendero corto.',
    address: 'Zona rural, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0390, 20.1850] },
    tags: ['aventura', 'fotografia'],
    priceLevel: 1,
  },
  {
    name: 'Balneario Xolotla',
    category: 'naturaleza',
    description: 'Balneario con pozas naturales de agua fresca, popular en temporada de calor.',
    address: 'Zona rural, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0655, 20.1690] },
    tags: ['familiar', 'nadar'],
    priceLevel: 1,
  },
  {
    name: 'Restaurante Del Lago',
    category: 'restaurante',
    description: 'Restaurante familiar bien valorado con cocina mexicana y latina.',
    address: 'Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0548, 20.1770] },
    tags: ['gastronomia', 'regional'],
    priceLevel: 2,
  },
  {
    name: 'La Casona',
    category: 'restaurante',
    description: 'Restaurante instalado en una construcción antigua del centro, cocina mexicana.',
    address: 'Centro, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0538, 20.1765] },
    tags: ['cafe', 'local'],
    priceLevel: 1,
  },
  {
    name: 'Hotel Villa de Cortez',
    category: 'hotel',
    description: 'Hotel bien valorado en el centro histórico, cerca de la Plaza de la Constitución.',
    address: 'Centro histórico, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0544, 20.1759] },
    tags: ['céntrico', 'descanso'],
    priceLevel: 3,
  },
  {
    name: 'Mirador Los Pinos',
    category: 'naturaleza',
    description: 'Mirador entre pinares con vista al valle de Huauchinango.',
    address: 'Zona alta, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0605, 20.1710] },
    tags: ['vista', 'senderismo'],
    priceLevel: 1,
  },
  {
    name: 'Iglesia del Santo Entierro',
    category: 'sitio_cultural',
    description: 'Iglesia emblemática de Huauchinango, uno de los templos mejor valorados de la ciudad.',
    address: 'Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0518, 20.1730] },
    tags: ['religioso', 'historia'],
    priceLevel: 1,
  },
  {
    name: 'Sendero Ecológico La Ceiba',
    category: 'naturaleza',
    description: 'Ruta de senderismo por bosque mesófilo con miradores naturales.',
    address: 'Zona rural, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0450, 20.1695] },
    tags: ['senderismo', 'ecoturismo'],
    priceLevel: 1,
  },
  {
    name: 'Mercado de Artesanías Huauchinango',
    category: 'entretenimiento',
    description: 'Mercado con artesanías textiles y de madera elaboradas por artesanos locales.',
    address: 'Centro, Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0530, 20.1772] },
    tags: ['artesanias', 'compras'],
    priceLevel: 1,
  },
  {
    name: 'Puente Negro de Huauchinango',
    category: 'naturaleza',
    description: 'Puente histórico sobre un río con vistas atractivas para fotografía.',
    address: 'Huauchinango, Puebla',
    municipality: 'Huauchinango',
    location: { type: 'Point', coordinates: [-98.0480, 20.1800] },
    tags: ['fotografia', 'historia'],
    priceLevel: 1,
  },

  // ===================== TENANGO DE LAS FLORES (20) =====================
  {
    name: 'Presa de Tenango de las Flores',
    category: 'naturaleza',
    description: 'Presa dentro de la Cuenca Hidrográfica del Río Necaxa, famosa por sus paseos en lancha.',
    address: 'Tenango de las Flores, Huauchinango, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1354, 20.2526] },
    tags: ['vista', 'lancha', 'fotografia'],
    priceLevel: 1,
  },
  {
    name: 'Paraje Turístico El Tizoc',
    category: 'entretenimiento',
    description: 'Área recreativa con pesca, cabalgata, senderismo y tirolesa junto a la presa.',
    address: 'Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1372, 20.2540] },
    tags: ['aventura', 'familiar'],
    priceLevel: 2,
  },
  {
    name: 'Casa de Piedra de Tizoc',
    category: 'sitio_cultural',
    description: 'Construcción inconclusa que aparece en la película "Tizoc" (1957), con María Félix y Pedro Infante.',
    address: 'Orilla de la presa, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1360, 20.2518] },
    tags: ['historia', 'cine'],
    priceLevel: 1,
  },
  {
    name: 'Árbol del Príncipe Tacuate',
    category: 'sitio_cultural',
    description: 'Árbol vinculado a la leyenda local del último descendiente de los príncipes Tacuate.',
    address: 'Orilla de la presa, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1365, 20.2530] },
    tags: ['leyenda', 'historia'],
    priceLevel: 1,
  },
  {
    name: 'Mercado Isabel Díaz Castilla',
    category: 'entretenimiento',
    description: 'Mercado de flores donde se comercializan azaleas, gardenias, hortensias y más.',
    address: 'Centro, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1335, 20.2510] },
    tags: ['flores', 'compras'],
    priceLevel: 1,
  },
  {
    name: 'Expo Flor Tenango',
    category: 'evento',
    description: 'El mayor evento floral de la región, con exhibición y venta de plantas de ornato.',
    address: 'Centro, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1330, 20.2505] },
    tags: ['flores', 'tradicion'],
    priceLevel: 1,
  },
  {
    name: 'Parroquia de San Juan Bautista de Tenango',
    category: 'sitio_cultural',
    description: 'Templo del centro de Tenango de las Flores.',
    address: 'Centro, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1328, 20.2515] },
    tags: ['religioso', 'historia'],
    priceLevel: 1,
  },
  {
    name: 'Museo Casa de Carranza',
    category: 'sitio_cultural',
    description: 'Museo local dedicado a la historia y tradiciones de la comunidad.',
    address: 'Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1342, 20.2521] },
    tags: ['historia', 'educativo'],
    priceLevel: 1,
  },
  {
    name: 'Tirolesa El Tizoc',
    category: 'entretenimiento',
    description: 'Tirolesa sobre la presa para los visitantes más aventureros.',
    address: 'Paraje El Tizoc, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1378, 20.2545] },
    tags: ['aventura', 'adrenalina'],
    priceLevel: 2,
  },
  {
    name: 'Cerro Chiltipetl',
    category: 'naturaleza',
    description: 'Cerro de 1,639 msnm con ruta de senderismo cerca de la presa.',
    address: 'Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1410, 20.2470] },
    tags: ['senderismo', 'naturaleza'],
    priceLevel: 1,
  },
  {
    name: 'Cerro Necaxaltépetl',
    category: 'naturaleza',
    description: 'Cerro de 1,727 msnm, mirador natural cercano a la presa de Tenango.',
    address: 'Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1320, 20.2565] },
    tags: ['senderismo', 'vista'],
    priceLevel: 1,
  },
  {
    name: 'Restaurante Mariscos La Presa Tenango',
    category: 'restaurante',
    description: 'Restaurante a la orilla de la presa especializado en mariscos y pescado de agua dulce.',
    address: 'Orilla de la presa, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1358, 20.2522] },
    tags: ['gastronomia', 'vista'],
    priceLevel: 2,
  },
  {
    name: 'Café Flores de Tenango',
    category: 'restaurante',
    description: 'Cafetería local cerca del mercado de flores.',
    address: 'Centro, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1333, 20.2508] },
    tags: ['cafe', 'local'],
    priceLevel: 1,
  },
  {
    name: 'Hotel Rural Tenango',
    category: 'hotel',
    description: 'Hospedaje sencillo con vista a la presa, ideal para escapadas de fin de semana.',
    address: 'Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1345, 20.2535] },
    tags: ['descanso', 'vista'],
    priceLevel: 2,
  },
  {
    name: 'Balneario Río Tenango',
    category: 'naturaleza',
    description: 'Balneario natural sobre uno de los afluentes que alimenta la presa.',
    address: 'Zona rural, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1290, 20.2495] },
    tags: ['familiar', 'nadar'],
    priceLevel: 1,
  },
  {
    name: 'Mirador Presa Tenango',
    category: 'naturaleza',
    description: 'Punto elevado con vista completa de la presa y sus alrededores.',
    address: 'Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1388, 20.2500] },
    tags: ['vista', 'fotografia'],
    priceLevel: 1,
  },
  {
    name: 'Vivero Regional de Flores',
    category: 'entretenimiento',
    description: 'Vivero comunitario donde se cultivan las flores que dan nombre al pueblo.',
    address: 'Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1318, 20.2498] },
    tags: ['flores', 'educativo'],
    priceLevel: 1,
  },
  {
    name: 'Cabalgata El Tizoc',
    category: 'entretenimiento',
    description: 'Paseos a caballo por los senderos alrededor de la presa.',
    address: 'Paraje El Tizoc, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1382, 20.2548] },
    tags: ['aventura', 'familiar'],
    priceLevel: 2,
  },
  {
    name: 'Zona de Pesca Presa Tenango',
    category: 'entretenimiento',
    description: 'Área habilitada para pesca deportiva dentro de la presa.',
    address: 'Orilla de la presa, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1348, 20.2512] },
    tags: ['pesca', 'familiar'],
    priceLevel: 1,
  },
  {
    name: 'Iglesia de la Virgen de Guadalupe Tenango',
    category: 'sitio_cultural',
    description: 'Templo dedicado a la Virgen de Guadalupe, sede de una de las dos grandes fiestas del pueblo.',
    address: 'Centro, Tenango de las Flores, Puebla',
    municipality: 'Tenango de las Flores',
    location: { type: 'Point', coordinates: [-98.1325, 20.2519] },
    tags: ['religioso', 'tradicion'],
    priceLevel: 1,
  },
];

/**
 * Inserta solo los lugares de `samplePlaces` que todavía NO existan en la
 * base (mismo `name` + `municipality`). A los que ya existen no los toca
 * — así nunca se pierde nada que ya esté cargado, venga de donde venga.
 */
const upsertSamplePlaces = async () => {
  let insertedCount = 0;
  let skippedCount = 0;

  for (const place of samplePlaces) {
    const result = await Place.updateOne(
      { name: place.name, municipality: place.municipality },
      { $setOnInsert: place },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      insertedCount += 1;
    } else {
      skippedCount += 1;
    }
  }

  logger.info(
    `✅ ${insertedCount} lugares nuevos insertados, ${skippedCount} ya existían y se dejaron sin cambios.`
  );
};

/**
 * Recorre TODOS los lugares de la base (no solo los de samplePlaces) que
 * no tengan imagen y les intenta poner una foto real de Google Places,
 * con una imagen de respaldo si Google no la tiene. Por eso es seguro
 * volver a correr este script exclusivamente para "arreglar imágenes":
 * nunca borra ni duplica lugares, y a los que ya tienen imagen no los toca.
 */
const backfillMissingImages = async () => {
  const placesWithoutImage = await Place.find({
    $or: [{ images: { $exists: false } }, { images: { $size: 0 } }],
  });

  logger.info(`🔍 ${placesWithoutImage.length} lugares sin imagen en toda la base. Buscando fotos...`);

  let withPhoto = 0;
  for (const place of placesWithoutImage) {
    try {
      const photoReference = await googleMapsService.findPlacePhotoReference(
        `${place.name}, ${place.address || place.municipality}`
      );
      if (photoReference) {
        const photoUrl = googleMapsService.buildPhotoProxyUrl(API_PUBLIC_URL, photoReference);
        await Place.updateOne({ _id: place._id }, { photoReference, images: [photoUrl] });
        withPhoto += 1;
      } else {
        // Nunca dejamos un lugar sin imagen: si Google no la tiene, usamos fallback.
        const fallbackImage = buildFallbackImageUrl(place);
        await Place.updateOne({ _id: place._id }, { images: [fallbackImage] });
      }
    } catch (photoError) {
      logger.warn(`Sin foto automática para "${place.name}": ${photoError.message}. Usando fallback.`);
      const fallbackImage = buildFallbackImageUrl(place);
      await Place.updateOne({ _id: place._id }, { images: [fallbackImage] });
    }
    await sleep(200); // pequeño respiro entre llamadas a la API de Google
  }

  logger.info(
    `🖼️  ${withPhoto}/${placesWithoutImage.length} lugares quedaron con foto automática de Google Places (el resto usa imagen de respaldo).`
  );
};

/**
 * Consulta el endpoint "Find Place From Text" de Google Places para obtener
 * las coordenadas reales de un lugar a partir de su nombre y dirección.
 * Es independiente de googleMapsService (que ya usa este script para fotos)
 * para no depender de sus métodos internos; si tu proyecto ya expone un
 * helper equivalente en services/googleMapsService.js, puedes sustituir
 * esta función por una llamada a ese helper.
 *
 * Requiere una API key de Google Maps/Places con el endpoint "Places API"
 * habilitado. Ajusta el nombre de la variable de entorno si en tu .env se
 * llama distinto (ej. GOOGLE_PLACES_API_KEY).
 */
const findRealCoordinates = async (query) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    logger.warn('⚠️  No hay GOOGLE_MAPS_API_KEY/GOOGLE_PLACES_API_KEY configurada; se omite la geocodificación.');
    return null;
  }

  const url =
    'https://maps.googleapis.com/maps/api/place/findplacefromtext/json' +
    `?input=${encodeURIComponent(query)}` +
    '&inputtype=textquery' +
    '&fields=geometry,name,formatted_address' +
    `&key=${apiKey}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await response.json();

  if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    return {
      lat: candidate.geometry.location.lat,
      lng: candidate.geometry.location.lng,
      matchedName: candidate.name,
      matchedAddress: candidate.formatted_address,
    };
  }

  return null; // Sin match real en Google (lugar inventado/genérico o nombre poco específico)
};

// Radio máximo (km) que aceptamos entre la coordenada aproximada que
// pusimos a mano en `samplePlaces` y el match que devuelve Google. Nombres
// genéricos ("Parque Juárez", "Zona de Pesca"...) existen en muchos pueblos
// de México; si Google matchea uno lejano, es casi seguro que es el lugar
// equivocado y NO queremos que eso mueva silenciosamente el punto fuera de
// la Sierra Norte (rompería las búsquedas $near de "Cerca de mí").
const MAX_MATCH_DISTANCE_KM = 15;

const haversineKm = ([lng1, lat1], [lng2, lat2]) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

/**
 * Recorre los lugares del catálogo (samplePlaces) que TODAVÍA no tengan
 * `locationVerified: true` y, cuando Google encuentra un match real para
 * "nombre + dirección/municipio", sobreescribe la coordenada estimada por
 * la coordenada real — pero solo si el match cae dentro de
 * MAX_MATCH_DISTANCE_KM de la coordenada aproximada original; si Google
 * matchea algo demasiado lejos, se descarta y se reporta para revisión
 * manual en vez de aplicarse a ciegas.
 *
 * Es idempotente: una vez que un lugar queda `locationVerified: true` (con
 * match aceptado) ya no se vuelve a consultar en corridas futuras, así no
 * se gasta cuota de más ni se arriesga a pisar una corrección manual hecha
 * directo en la base (para forzar una nueva verificación, hay que resetear
 * `locationVerified` a false a mano).
 */
const refineLocationsWithGoogle = async () => {
  let updated = 0;
  const unmatched = [];
  const rejectedByDistance = [];
  let skippedAlreadyVerified = 0;

  for (const place of samplePlaces) {
    const existing = await Place.findOne(
      { name: place.name, municipality: place.municipality },
      { locationVerified: 1 }
    );
    if (existing?.locationVerified) {
      skippedAlreadyVerified += 1;
      continue;
    }

    const query = `${place.name}, ${place.address || place.municipality + ', Puebla'}`;
    try {
      const match = await findRealCoordinates(query);
      if (match) {
        const distanceKm = haversineKm(place.location.coordinates, [match.lng, match.lat]);
        if (distanceKm > MAX_MATCH_DISTANCE_KM) {
          rejectedByDistance.push(
            `${place.name} (${place.municipality}) — match a ${distanceKm.toFixed(1)} km: "${match.matchedName}", ${match.matchedAddress}`
          );
        } else {
          await Place.updateOne(
            { name: place.name, municipality: place.municipality },
            {
              location: { type: 'Point', coordinates: [match.lng, match.lat] },
              locationVerified: true,
            }
          );
          updated += 1;
        }
      } else {
        unmatched.push(`${place.name} (${place.municipality})`);
      }
    } catch (geoError) {
      logger.warn(`No se pudo geocodificar "${place.name}": ${geoError.message}`);
      unmatched.push(`${place.name} (${place.municipality})`);
    }
    await sleep(200); // respetar límites de la API
  }

  logger.info(
    `📍 ${updated} coordenadas actualizadas con datos reales de Google Places, ${skippedAlreadyVerified} ya estaban verificadas y no se tocaron.`
  );
  if (rejectedByDistance.length > 0) {
    logger.warn(
      `⚠️  ${rejectedByDistance.length} matches de Google descartados por estar a más de ${MAX_MATCH_DISTANCE_KM} km (probable lugar equivocado, se dejó la coordenada aproximada):\n   - ${rejectedByDistance.join('\n   - ')}`
    );
  }
  if (unmatched.length > 0) {
    logger.info(
      `ℹ️  ${unmatched.length} lugares sin match real en Google (probablemente nombres genéricos o poco específicos), se dejó la coordenada aproximada:\n   - ${unmatched.join('\n   - ')}`
    );
  }
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Conectado a MongoDB para siembra de datos.');

    await upsertSamplePlaces();
    await refineLocationsWithGoogle();
    await backfillMissingImages();

    const totalPlaces = await Place.countDocuments({
      municipality: { $in: ['Xicotepec', 'Necaxa', 'Huauchinango', 'Tenango de las Flores'] },
    });
    logger.info(`📍 Total de lugares en la Sierra Norte después de correr el script: ${totalPlaces}`);
  } catch (error) {
    logger.error(`❌ Error al sembrar lugares: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
