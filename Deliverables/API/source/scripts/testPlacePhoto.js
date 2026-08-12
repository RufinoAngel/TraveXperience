require('dotenv').config();
const googleMapsService = require('../src/services/googleMapsService');

const queries = [
  'Cascada de Patla, Xicotepec, Puebla',
  'Parroquia de San Juan Bautista, Xicotepec, Puebla',
  'Mirador de la Sierra Norte, Xicotepec, Puebla',
];

(async () => {
  try {
    console.log('GOOGLE_MAPS_API_KEY=', !!process.env.GOOGLE_MAPS_API_KEY);
    for (const q of queries) {
      const ref = await googleMapsService.findPlacePhotoReference(q);
      console.log(`${q} => ${ref}`);
    }
  } catch (err) {
    console.error('Error al consultar Google Places:', err.message);
    process.exit(1);
  }
  process.exit(0);
})();
