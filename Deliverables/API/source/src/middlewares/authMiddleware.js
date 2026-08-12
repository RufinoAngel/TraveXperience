/**
 * middlewares/authMiddleware.js
 * -----------------------------------------------------------------------
 * Middleware de autenticación basado en JSON Web Tokens (JWT).
 * Protege rutas privadas verificando el header:
 *   Authorization: Bearer <token>
 *
 * Adjunta el payload decodificado en req.user para su uso posterior
 * en controladores (ej. req.user.id, req.user.role).
 * -----------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No se proporcionó un token de autenticación.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role, email, iat, exp }
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('El token ha expirado. Inicia sesión nuevamente.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido.', 401));
    }
    return next(error);
  }
};

/**
 * Middleware de autenticación OPCIONAL. Si viene un token válido, adjunta
 * req.user (igual que protect); si no viene token, o es inválido/expirado,
 * simplemente continúa sin req.user en vez de responder 401.
 *
 * Útil para rutas de exploración pública (ej. "Cerca de Mí") que no deben
 * exigir login, pero que sí quieren personalizar/registrar actividad
 * cuando el usuario SÍ está logueado.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Token inválido/expirado: se ignora, la ruta sigue siendo accesible sin sesión.
  }
  return next();
};

/**
 * Middleware de autorización por rol.
 * Uso: authorize('administrador', 'usuario')
 */
const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para acceder a este recurso.', 403));
    }
    return next();
  };

module.exports = { protect, optionalAuth, authorize };
