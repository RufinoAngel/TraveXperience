/**
 * routes/index.js
 * -----------------------------------------------------------------------
 * Punto central de montaje de todas las rutas de la API.
 * Mantiene app.js limpio y facilita agregar nuevos módulos.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const localTourismRoutes = require('./localTourismRoutes');
const itineraryRoutes = require('./itineraryRoutes');
const reviewRoutes = require('./reviewRoutes');
const wearableRoutes = require('./wearableRoutes');
const weatherRoutes = require('./weatherRoutes');
const paymentRoutes = require('./paymentRoutes');
const mapsRoutes = require('./mapsRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const hotelRoutes = require('./hotelRoutes'); // se monta 2 veces: pública en /hotels, alias en /admin/hotels
const transportRoutes = require('./transportRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
const presenceRoutes = require('./presenceRoutes');
const aiRoutes = require('./aiRoutes');

router.use('/auth', authRoutes); // Módulo 1: Autenticación y Perfiles
router.use('/local', localTourismRoutes); // Módulo 2: Turismo Local ("Cerca de Mí")
router.use('/itineraries', itineraryRoutes); // Módulo 3: Turismo Foráneo (CRUD)
router.use('/reviews', reviewRoutes); // Módulo 4: Sistema de Reseñas
router.use('/wearable', wearableRoutes); // Módulo 5: Interconexión Wearable
router.use('/weather', weatherRoutes); // Módulo 6: Clima (OpenWeatherMap)
router.use('/payments', paymentRoutes); // Módulo 7: Pagos (Stripe)
router.use('/maps', mapsRoutes); // Módulo 8: Google Maps Platform (Geocoding)
router.use('/favorites', favoriteRoutes); // Módulo 9: Favoritos
router.use('/hotels', hotelRoutes); // Módulo 10: Hoteles (Admin)
router.use('/transport-routes', transportRoutes); // Módulo 11: Transporte (Admin)
router.use('/users', userRoutes); // Administración de usuarios (Admin)
router.use('/admin', adminRoutes); // Módulo 12: Panel de Administración (Dashboard, Config, Finanzas)
// Alias: el panel de Admin de hoteles pega a /admin/hotels; reutiliza el
// mismo router (mismo controller, mismas validaciones) que /hotels, sin
// duplicar código. Las mutaciones (POST/PUT/DELETE) ya exigen
// protect+authorize('administrador') dentro de hotelRoutes.js.
router.use('/admin/hotels', hotelRoutes);
router.use('/presence', presenceRoutes); // "N personas viendo esto ahora mismo" (heartbeat + polling)
router.use('/ai', aiRoutes); // Presupuesto + Tipo de viajero mediante IA

// Health check general de la API
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TraveXperience API operativa.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
