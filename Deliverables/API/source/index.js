/**
 * index.js
 * -----------------------------------------------------------------------
 * Punto de entrada de la aplicación TraveXperience Backend.
 *
 * Orden de arranque:
 *   1. Carga de variables de entorno (dotenv).
 *   2. Conexión a MySQL (Sequelize) — datos relacionales.
 *   3. Conexión a MongoDB (Mongoose) — datos no estructurados / IA.
 *   4. Carga de modelos TensorFlow.js en memoria.
 *   5. Arranque del servidor HTTP Express.
 *
 * Cualquier fallo crítico en los pasos 2-3 detiene el proceso (fail-fast),
 * ya que el backend no puede operar de forma consistente sin ambas BDs.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();

const app = require('./src/app');
const { connectMySQL } = require('./src/config/mysql');
const { connectMongoDB } = require('./src/config/mongodb');
const aiService = require('./src/services/aiService');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Bases de datos (en paralelo, ambas son independientes entre sí)
    await Promise.all([connectMySQL(), connectMongoDB()]);

    // 2. Modelos de IA (no bloqueante: se registra advertencia si faltan)
    await aiService.loadModels();

    // 3. Servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info(`🚀 TraveXperience API corriendo en el puerto ${PORT} (${process.env.NODE_ENV})`);
    });

    // Manejo de cierre elegante (graceful shutdown)
    const shutdown = (signal) => {
      logger.warn(`${signal} recibido. Cerrando servidor...`);
      server.close(() => {
        logger.info('Servidor HTTP cerrado correctamente.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Captura de errores no manejados para evitar caídas silenciosas
    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
    });
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.stack}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error(`❌ Error fatal al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
