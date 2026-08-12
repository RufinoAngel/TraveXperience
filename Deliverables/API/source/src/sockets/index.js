/**
 * sockets/index.js
 * -----------------------------------------------------------------------
 * Configuración principal de Socket.IO.
 *
 * Reutiliza el mismo JWT emitido por src/services/tokenService.js para
 * autenticar el handshake (login compartido Web / App Móvil / Smartwatch,
 * igual que en src/middlewares/authMiddleware.js pero para sockets).
 *
 * Cada socket autenticado entra automáticamente a una room personal
 * `user:<id>`, lo que permite emitir eventos dirigidos a un usuario
 * concreto desde cualquier parte del backend (controladores, servicios,
 * cron jobs) sin tener que llevar registro manual de sockets:
 *
 *   const { getIO } = require('../sockets');
 *   getIO().to(`user:${userId}`).emit('alert:new', payload);
 *
 * -----------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const registerLocationHandler = require('./handlers/locationHandler');
const registerItineraryHandler = require('./handlers/itineraryHandler');
const { startWeatherBroadcast } = require('./handlers/weatherHandler');

// Referencia al servidor de sockets, accesible desde fuera (controladores,
// servicios) sin tener que pasarlo como parámetro por toda la app.
let ioInstance = null;

/**
 * Middleware de autenticación del handshake.
 * El cliente debe conectarse así:
 *   io("http://host", { auth: { token: "<accessToken>" } })
 */
const authenticateSocket = (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('No se proporcionó un token de autenticación.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, email, role, fullName, iat, exp }
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new Error('El token ha expirado. Inicia sesión nuevamente.'));
    }
    return next(new Error('Token inválido.'));
  }
};

/**
 * Inicializa Socket.IO sobre el servidor HTTP ya creado en index.js.
 * @param {import('socket.io').Server} io
 */
const initSockets = (io) => {
  ioInstance = io;

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket conectado: usuario ${socket.user.id} (${socket.id})`);

    // Room personal: permite hacer io.to(`user:<id>`).emit(...) desde
    // cualquier controlador o servicio sin conocer el socket.id concreto.
    socket.join(`user:${socket.user.id}`);

    // Handlers por módulo (cada uno registra sus propios eventos "on")
    registerLocationHandler(io, socket);
    registerItineraryHandler(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket desconectado: usuario ${socket.user.id} (${reason})`);
    });

    socket.on('error', (err) => {
      logger.error(`Error en socket de usuario ${socket.user.id}: ${err.message}`);
    });
  });

  // Broadcast periódico de clima para itinerarios activos (cron interno,
  // no depende de que haya un socket abierto para disparar la consulta).
  startWeatherBroadcast(io);

  logger.info('✅ Socket.IO inicializado.');
};

/**
 * Devuelve la instancia activa de Socket.IO. Útil para emitir eventos
 * desde controladores REST (ej. confirmar un pago vía webhook de Stripe
 * y notificar al usuario en tiempo real sin que tenga que refrescar).
 */
const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO no ha sido inicializado todavía.');
  }
  return ioInstance;
};

module.exports = { initSockets, getIO };
