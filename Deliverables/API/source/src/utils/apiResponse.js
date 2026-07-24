/**
 * utils/apiResponse.js
 * -----------------------------------------------------------------------
 * Estandariza el formato de todas las respuestas de la API (éxito y error)
 * para que el frontend web, admin y la app de Smartwatch (Kotlin) consuman
 * un contrato de datos consistente y predecible.
 * -----------------------------------------------------------------------
 */

class ApiResponse {
  /**
   * Respuesta exitosa.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {any} data
   */
  static success(res, statusCode = 200, message = 'OK', data = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Respuesta de error controlada.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {any} errors
   */
  static error(res, statusCode = 500, message = 'Error interno del servidor', errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

module.exports = ApiResponse;
