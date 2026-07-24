/**
 * utils/logger.js
 * -----------------------------------------------------------------------
 * Logger centralizado. Se puede sustituir fácilmente por Winston o Pino
 * en un entorno productivo sin afectar al resto del código, ya que todos
 * los módulos importan este archivo como única fuente de logging.
 * -----------------------------------------------------------------------
 */

const levels = {
  info: '\x1b[36m[INFO]\x1b[0m',
  warn: '\x1b[33m[WARN]\x1b[0m',
  error: '\x1b[31m[ERROR]\x1b[0m',
  debug: '\x1b[90m[DEBUG]\x1b[0m',
};

const timestamp = () => new Date().toISOString();

const logger = {
  info: (msg) => console.log(`${levels.info} ${timestamp()} - ${msg}`),
  warn: (msg) => console.warn(`${levels.warn} ${timestamp()} - ${msg}`),
  error: (msg) => console.error(`${levels.error} ${timestamp()} - ${msg}`),
  debug: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${levels.debug} ${timestamp()} - ${msg}`);
    }
  },
};

module.exports = logger;
