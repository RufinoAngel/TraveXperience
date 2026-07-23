/**
 * services/tokenService.js
 * -----------------------------------------------------------------------
 * Genera y verifica los JWT usados por las tres plataformas (Web, App
 * Móvil y Smartwatch) bajo una única cuenta de usuario compartida, tal
 * como define el Canvas ("Cuenta de usuario compartida: el inicio de
 * sesión con JWT conecta al usuario en las tres plataformas").
 *
 * Estrategia de dos tokens:
 *   - accessToken: vida corta (ej. 1 día), se envía en cada petición.
 *   - refreshToken: vida larga (ej. 7 días), se usa solo para renovar
 *     el accessToken sin pedir credenciales de nuevo. Su hash se guarda
 *     en el usuario (User.refreshTokenHash) para poder invalidarlo
 *     (logout / cambio de contraseña / robo de sesión).
 * -----------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const {
  JWT_SECRET,
  JWT_EXPIRES_IN = '1d',
  JWT_REFRESH_EXPIRES_IN = '7d',
} = process.env;

/**
 * Payload mínimo embebido en el access token. Se mantiene ligero a
 * propósito: el Smartwatch decodifica este mismo token y no necesita
 * cargar información adicional del usuario en cada sincronización.
 */
const buildPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  fullName: user.fullName,
});

const generateAccessToken = (user) =>
  jwt.sign(buildPayload(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

/**
 * Genera un hash SHA-256 del refresh token para almacenarlo en BD.
 * Nunca se guarda el token en texto plano.
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Genera ambos tokens y el hash listo para persistir en User.refreshTokenHash.
 */
const issueTokenPair = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken, refreshTokenHash: hashToken(refreshToken) };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  hashToken,
  issueTokenPair,
};
