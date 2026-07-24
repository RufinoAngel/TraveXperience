/**
 * middlewares/errorHandler.js
 * -----------------------------------------------------------------------
 * Middleware global de manejo de errores. Debe registrarse SIEMPRE al
 * final de la cadena de middlewares en app.js (después de las rutas).
 * Captura tanto errores operacionales (AppError) como errores inesperados
 * (bugs, fallos de librerías, etc.) y normaliza la respuesta al cliente.
 * -----------------------------------------------------------------------
 */

const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware para rutas no encontradas (404).
 * Se coloca justo antes del errorHandler.
 */
const notFound = (req, res, next) => {
  const message = `Ruta no encontrada: ${req.method} ${req.originalUrl}`;
  const error = new Error(message);
  error.statusCode = 404;
  next(error);
};

/**
 * Manejador global de errores.
 * Express identifica este middleware por tener 4 argumentos (err, req, res, next).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode && err.statusCode >= 100 ? err.statusCode : 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    // Error inesperado: se registra con stack trace completo para depuración.
    logger.error(`Error no operacional: ${err.message}\n${err.stack}`);
  } else {
    logger.warn(`Error operacional: ${err.message}`);
  }

  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message;

  return ApiResponse.error(res, statusCode, message, err.errors || null);
};

module.exports = { notFound, errorHandler };
