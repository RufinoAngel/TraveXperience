/**
 * scripts/debugOnePhoto.js
 * -----------------------------------------------------------------------
 * Script temporal de un solo uso: imprime un lugar real con su
 * photoReference/images guardados, para poder probar /maps/photo a mano.
 * Bórralo cuando ya no lo necesites.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../src/models/mongodb/Place');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB.');

  const place = await Place.findOne(
    { photoReference: { $exists: true, $ne: null } },
    { name: 1, photoReference: 1, images: 1 }
  );

  if (!place) {
    console.log('No encontré ningún lugar con photoReference guardado.');
  } else {
    console.log('--- Lugar de prueba ---');
    console.log('Nombre:', place.name);
    console.log('photoReference:', place.photoReference);
    console.log('images[0]:', place.images?.[0]);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
