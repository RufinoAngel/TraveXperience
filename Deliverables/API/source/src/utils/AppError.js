/**
 * utils/AppError.js
 * -----------------------------------------------------------------------
 * Error personalizado y "operacional" (esperado) de la aplicación.
 * Permite diferenciar errores controlados (ej. "usuario no encontrado")
 * de errores de programación inesperados dentro del middleware global.
 * -----------------------------------------------------------------------
 */

class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
