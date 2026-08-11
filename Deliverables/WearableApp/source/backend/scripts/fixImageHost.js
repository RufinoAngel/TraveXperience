/**
 * scripts/fixImageHost.js
 * -----------------------------------------------------------------------
 * Reconstruye `images`/`mainImage` de Place y Hotel usando el
 * `photoReference` que YA está guardado, pero armando la URL con el host
 * público correcto (API_PUBLIC_URL). No vuelve a llamar a Google Places
 * (no gasta cuota) — solo corrige el host de la URL que ya teníamos.
 *
 * Úsalo cuando las imágenes se guardaron alguna vez con "localhost" (o
 * cualquier otro host viejo) y por eso no cargan desde el celular.
 *
 * Ajusta API_PUBLIC_URL en tu .env a tu IP LAN actual ANTES de correr esto.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../src/models/mongodb/Place');
const Hotel = require('../src/models/mongodb/Hotel');
const googleMapsService = require('../src/services/googleMapsService');

const API_PUBLIC_URL = process.env.API_PUBLIC_URL || 'http://10.91.20.6:4000/api/v1';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB.');
  console.log('Host que se va a usar para reconstruir las URLs:', API_PUBLIC_URL);

  // ── Places ──────────────────────────────────────────────────────────
  const places = await Place.find({ photoReference: { $exists: true, $ne: null } });
  let placesFixed = 0;
  for (const place of places) {
    const newUrl = googleMapsService.buildPhotoProxyUrl(API_PUBLIC_URL, place.photoReference);
    if (place.images?.[0] !== newUrl) {
      await Place.updateOne({ _id: place._id }, { images: [newUrl] });
      placesFixed += 1;
    }
  }
  console.log(`Places: ${placesFixed}/${places.length} URLs reconstruidas.`);

  // ── Hotels ──────────────────────────────────────────────────────────
  const hotels = await Hotel.find({ photoReference: { $exists: true, $ne: null } });
  let hotelsFixed = 0;
  for (const hotel of hotels) {
    const newUrl = googleMapsService.buildPhotoProxyUrl(API_PUBLIC_URL, hotel.photoReference);
    if (hotel.mainImage !== newUrl) {
      await Hotel.updateOne({ _id: hotel._id }, { mainImage: newUrl, images: [newUrl] });
      hotelsFixed += 1;
    }
  }
  console.log(`Hotels: ${hotelsFixed}/${hotels.length} URLs reconstruidas.`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
