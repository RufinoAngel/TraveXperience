/**
 * src/app.js
 * -----------------------------------------------------------------------
 * Configuración principal de la aplicación Express: middlewares globales,
 * seguridad, logging HTTP, montaje de rutas y manejo de errores.
 *
 * Este archivo NO inicia el servidor ni conecta las bases de datos;
 * esa responsabilidad pertenece a index.js, para mantener app.js
 * fácilmente testeable (se puede importar en tests con supertest sin
 * levantar un puerto real).
 * -----------------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();

// --- Seguridad y utilidades base -----------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors()); // Habilita CORS (ajustar origin en producción)
app.use(compression()); // Comprime las respuestas (clave para el consumo del wearable)

// El webhook de Stripe necesita el body CRUDO (sin parsear) para poder
// verificar la firma con stripe.webhooks.constructEvent(). Por eso este
// middleware se monta ANTES del express.json() global y solo aplica a
// esa ruta específica; el resto de la API sigue usando JSON normal.
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '2mb' })); // Parseo de JSON en el body
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Logging HTTP ----------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: { write: (msg) => logger.debug(msg.trim()) } }));
} else {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// --- Rutas principales de la API -------------------------------------------
app.use('/api/v1', apiRoutes);

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenido a la API de TraveXperience 🌍',
    docs: '/api/v1/health',
  });
});

// --- Manejo de errores (SIEMPRE al final) -----------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
