/**
 * models/mongodb/SystemSetting.js
 * -----------------------------------------------------------------------
 * Configuración global de la plataforma, administrada desde el panel de
 * Admin (pantalla "Configuraciones"). Se modela como un documento
 * SINGLETON dentro de la colección `system_settings`: siempre existe un
 * único documento con `key: 'global'`, que se crea de forma perezosa la
 * primera vez que se consulta (ver adminService.getSettings).
 *
 * Se usa Mongo (en vez de una tabla MySQL) porque es configuración de
 * escritura poco frecuente y forma flexible, consistente con el resto de
 * colecciones "de catálogo/administración" del proyecto.
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const systemSettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },
    // --- General ---
    platformName: {
      type: String,
      trim: true,
      default: 'TraveXperience',
    },
    supportEmail: {
      type: String,
      trim: true,
      default: 'soporte@travexperience.com',
    },
    currency: {
      // ISO 4217 (ej. MXN, USD)
      type: String,
      trim: true,
      uppercase: true,
      default: 'MXN',
    },
    language: {
      // ISO 639-1 (ej. es, en)
      type: String,
      trim: true,
      lowercase: true,
      default: 'es',
    },
    // --- Finanzas ---
    bookingCommissionPct: {
      // % de comisión que la plataforma retiene por cada reserva pagada
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },
    refundWindowDays: {
      // Días posteriores a la reserva en los que se acepta solicitud de reembolso
      type: Number,
      min: 0,
      default: 7,
    },
    // --- Socios / Proveedores ---
    autoApprovePartners: {
      // Si true, hoteles/rutas nuevas creadas por socios se activan automáticamente
      type: Boolean,
      default: false,
    },
    // --- Notificaciones ---
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    // --- Seguridad ---
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    // Puente lógico al id numérico de users (MySQL) del último admin que editó
    updatedBy: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true, collection: 'system_settings' }
);

module.exports = model('SystemSetting', systemSettingSchema);
