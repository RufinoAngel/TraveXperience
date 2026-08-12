/**
 * models/mysql/index.js
 * -----------------------------------------------------------------------
 * Registro centralizado de todos los modelos Sequelize.
 *
 * Este archivo importa cada modelo una única vez para que Sequelize los
 * registre correctamente antes de ejecutar sequelize.sync().
 *
 * También garantiza que las asociaciones (belongsTo, hasMany, etc.)
 * definidas dentro de cada modelo se ejecuten durante el arranque.
 * -----------------------------------------------------------------------
 */

// Modelos principales
require('./User');
require('./Itinerary');
require('./TransportRoute');
require('./TransportFareClass');
require('./SavedCard');
require('./Transaction');
require('./WearablePairingCode');
require('./WearableDevice');

// Si en el futuro agregas más modelos MySQL,
// simplemente impórtalos aquí.
// Ejemplo:
// require('./Notification');
// require('./Reservation');