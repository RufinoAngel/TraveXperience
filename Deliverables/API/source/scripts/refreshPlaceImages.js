require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../src/models/mongodb/Place');
const googleMapsService = require('../src/services/googleMapsService');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const places = await Place.find({ municipality: { $in: ['Xicotepec', 'Necaxa', 'Huauchinango'] } });
    for (const place of places) {
      const fallback = googleMapsService.buildFallbackImageUrl(`${place.name} ${place.municipality} Puebla turismo`);
      await Place.updateOne({ _id: place._id }, { images: [fallback] });
    }
    console.log(`updated ${places.length}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
