/**
 * models/mongodb/AdminActivityLog.js
 * -----------------------------------------------------------------------
 * Bitácora de acciones realizadas por administradores desde el panel
 * (cambios de configuración, alta/baja de métodos de pago, incidencias
 * registradas manualmente, etc.). Complementa a `ActivityLog` (que
 * registra comportamiento de usuarios finales) para alimentar el feed de
 * "Actividad reciente" y las "Alertas del sistema" del Dashboard, sin
 * mezclar ambos tipos de evento en la misma colección.
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const ACTIONS = [
  'update_settings',
  'create_payment_method',
  'delete_payment_method',
  'system_incident',
];

const SEVERITIES = ['info', 'warning', 'critical'];

const adminActivityLogSchema = new Schema(
  {
    // Puente lógico al id numérico de users (MySQL) del admin que ejecutó la acción
    adminId: {
      type: Number,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ACTIONS,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 300,
    },
    severity: {
      type: String,
      enum: SEVERITIES,
      default: 'info',
    },
    // true mientras la incidencia (action: 'system_incident') siga sin resolverse
    resolved: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, collection: 'admin_activity_logs' }
);

adminActivityLogSchema.index({ createdAt: -1 });

const AdminActivityLogModel = model('AdminActivityLog', adminActivityLogSchema);
AdminActivityLogModel.ACTIONS = ACTIONS;
AdminActivityLogModel.SEVERITIES = SEVERITIES;

module.exports = AdminActivityLogModel;
