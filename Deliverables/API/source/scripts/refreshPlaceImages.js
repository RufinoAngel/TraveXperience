require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../src/models/mongodb/Place');
const googleMapsService = require('../src/services/googleMapsService');
const logger = require('../src/utils/logger');

// Igual que en seedPlaces.js: la URL pública desde la que el cliente
// (app móvil / web) consumirá el proxy GET /maps/photo. Ajusta
// API_PUBLIC_URL en .env si tu backend corre en otra IP/puerto.
const API_PUBLIC_URL = process.env.API_PUBLIC_URL || 'http://192.168.90.11:4000/api/v1';

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

const isFallbackImage = (url) => typeof url === 'string' && url.startsWith('data:image/svg+xml');

/**
 * Actualiza las imágenes de los lugares de la Sierra Norte, buscando la
 * foto REAL en Google Places primero. Solo usa el SVG de respaldo cuando
 * Google de verdad no tiene ninguna foto para ese lugar (o la API falla).
 *
 * Es no-destructivo con las fotos reales: si un lugar ya tiene una imagen
 * que no es el placeholder SVG, se deja tal cual y no se vuelve a llamar
 * a Google por él (evita gastar cuota/tiempo de más). Para forzar que se
 * vuelva a buscar TODO desde cero, correr con --force.
 */
(async () => {
  const force = process.argv.includes('--force');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const places = await Place.find({ municipality: { $in: ['Xicotepec', 'Necaxa', 'Huauchinango', 'Tenango de las Flores'] } });

    let withRealPhoto = 0;
    let withFallback = 0;
    let skipped = 0;

    for (const place of places) {
      const alreadyHasRealImage =
        Array.isArray(place.images) && place.images.length > 0 && !isFallbackImage(place.images[0]);

      if (alreadyHasRealImage && !force) {
        skipped += 1;
        continue;
      }

      try {
        const photoReference = await googleMapsService.findPlacePhotoReference(
          `${place.name}, ${place.address || place.municipality}, Puebla`
        );

        if (photoReference) {
          const photoUrl = googleMapsService.buildPhotoProxyUrl(API_PUBLIC_URL, photoReference);
          await Place.updateOne({ _id: place._id }, { photoReference, images: [photoUrl] });
          withRealPhoto += 1;
        } else {
          const fallback = googleMapsService.buildFallbackImageUrl(
            `${place.name} ${place.municipality} Puebla turismo`
          );
          await Place.updateOne({ _id: place._id }, { images: [fallback] });
          withFallback += 1;
        }
      } catch (photoError) {
        logger.warn(`Sin foto automática para "${place.name}": ${photoError.message}. Usando fallback.`);
        const fallback = googleMapsService.buildFallbackImageUrl(
          `${place.name} ${place.municipality} Puebla turismo`
        );
        await Place.updateOne({ _id: place._id }, { images: [fallback] });
        withFallback += 1;
      }

      await sleep(200); // respetar límites de la API de Google Places
    }

    console.log(
      `Listo. ${withRealPhoto} con foto real de Google, ${withFallback} con imagen de respaldo, ${skipped} ya tenían foto real y se dejaron sin tocar (${places.length} en total).`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
