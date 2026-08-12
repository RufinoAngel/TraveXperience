/**
 * config/mysql.js
 * -----------------------------------------------------------------------
 * Configura la conexión a MySQL mediante Sequelize (ORM).
 * MySQL almacena las entidades relacionales estructuradas del proyecto:
 * Usuarios, Perfiles, Preferencias e Itinerarios.
 * -----------------------------------------------------------------------
 */

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_DATABASE,
  MYSQL_USER,
  MYSQL_PASSWORD,
  NODE_ENV,
} = process.env;

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  port: MYSQL_PORT || 3306,
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true, // usa snake_case en las columnas generadas
    timestamps: true, // agrega created_at / updated_at automáticamente
  },
});

/**
 * Verifica la conexión a MySQL y sincroniza los modelos.
 * En producción se recomienda usar migraciones en lugar de sync().
 */
const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexión a MySQL establecida correctamente.');

    // Registrar todos los modelos y asociaciones
    require('../models/mysql');

    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('🔄 Modelos MySQL sincronizados.');
    }
  } catch (error) {
    logger.error(`❌ Error al conectar con MySQL: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectMySQL };
