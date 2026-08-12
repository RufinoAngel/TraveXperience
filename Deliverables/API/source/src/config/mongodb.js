/**
 * config/mongodb.js
 * -----------------------------------------------------------------------
 * Configura la conexión a MongoDB mediante Mongoose (ODM).
 * MongoDB almacena datos no estructurados y de alto volumen:
 * Reseñas, logs de actividad y metadatos para entrenamiento de IA.
 * -----------------------------------------------------------------------
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const { MONGO_URI } = process.env;

mongoose.set('strictQuery', true);

/**
 * Establece la conexión con MongoDB y registra los listeners de eventos
 * para monitorear el estado de la conexión durante el ciclo de vida de la app.
 */
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // Mongoose 8 ya no requiere useNewUrlParser / useUnifiedTopology,
      // se dejan documentadas las opciones más comunes por si se requiere ajustar el pool.
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info('✅ Conexión a MongoDB establecida correctamente.');
  } catch (error) {
    logger.error(`❌ Error al conectar con MongoDB: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB se ha desconectado.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ Error en la conexión de MongoDB: ${err.message}`);
  });
};

module.exports = { connectMongoDB, mongoose };
