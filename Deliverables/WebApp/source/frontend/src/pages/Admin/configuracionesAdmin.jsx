import React, { useState } from 'react';
import AdminLayout from '../../components/adminLayout.jsx';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors border-none cursor-pointer shrink-0 ${
        checked ? 'bg-primary' : 'bg-surface-container-high'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function validateGeneral(field, value) {
  switch (field) {
    case 'siteName': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'El nombre de la plataforma es obligatorio.';
      if (trimmed.length < 3) return 'Ingresa un nombre más descriptivo.';
      return '';
    }
    case 'supportEmail': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'El correo de soporte es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Ingresa un correo electrónico válido.';
      return '';
    }
    case 'commission': {
      if (value === '' || value === null) return 'La comisión es obligatoria.';
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 100) return 'Ingresa un valor entre 0 y 100.';
      return '';
    }
    case 'refundWindow': {
      if (value === '' || value === null) return 'La ventana de reembolso es obligatoria.';
      const num = Number(value);
      if (Number.isNaN(num) || num < 0) return 'Ingresa un número de horas válido.';
      return '';
    }
    default:
      return '';
  }
}

function ConfiguracionesAdmin({ onNavigate }) {
  const [values, setValues] = useState({
    siteName: 'TraveXperience',
    supportEmail: 'soporte@travexperience.com',
    commission: '12',
    refundWindow: '48',
    currency: 'EUR',
    language: 'Español',
  });
  const [errors, setErrors] = useState({ siteName: '', supportEmail: '', commission: '', refundWindow: '' });
  const [touched, setTouched] = useState({ siteName: false, supportEmail: false, commission: false, refundWindow: false });

  const [toggles, setToggles] = useState({
    maintenanceMode: false,
    autoApprovePartners: false,
    emailNotifications: true,
    smsAlerts: false,
    twoFactorRequired: true,
  });

  const [saveStatus, setSaveStatus] = useState('idle'); // idle | success

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateGeneral(field, value) }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateGeneral(field, values[field]) }));
  };

  const inputClasses = (field) =>
    `w-full px-4 py-3 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors ${
      errors[field] && touched[field] ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
    }`;

  const toggleField = (key) => () => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    const fields = ['siteName', 'supportEmail', 'commission', 'refundWindow'];
    const newErrors = {};
    fields.forEach((f) => {
      newErrors[f] = validateGeneral(f, values[f]);
    });
    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    const hasErrors = Object.values(newErrors).some((e) => e !== '');
    if (hasErrors) {
      setSaveStatus('idle');
      return;
    }

    // Aquí iría la llamada real a tu API para guardar la configuración
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <AdminLayout activePage="admin-configuraciones" onNavigate={onNavigate}>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Configuraciones del Sistema</h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Administra los parámetros generales, comisiones y preferencias de la plataforma TraveXperience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* General */}
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined">settings</span>
            <h2 className="text-lg font-bold">General</h2>
          </div>
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre de la Plataforma</label>
              <input
                type="text"
                className={inputClasses('siteName')}
                value={values.siteName}
                onChange={handleChange('siteName')}
                onBlur={handleBlur('siteName')}
              />
              {errors.siteName && touched.siteName && <p className="text-xs text-error">{errors.siteName}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo de Soporte</label>
              <input
                type="email"
                className={inputClasses('supportEmail')}
                value={values.supportEmail}
                onChange={handleChange('supportEmail')}
                onBlur={handleBlur('supportEmail')}
              />
              {errors.supportEmail && touched.supportEmail && <p className="text-xs text-error">{errors.supportEmail}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Moneda Predeterminada</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
                  value={values.currency}
                  onChange={(e) => setValues((prev) => ({ ...prev, currency: e.target.value }))}
                >
                  <option>EUR</option>
                  <option>USD</option>
                  <option>GBP</option>
                  <option>MXN</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Idioma</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
                  value={values.language}
                  onChange={(e) => setValues((prev) => ({ ...prev, language: e.target.value }))}
                >
                  <option>Español</option>
                  <option>English</option>
                  <option>Français</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Finanzas y Políticas */}
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined">payments</span>
            <h2 className="text-lg font-bold">Finanzas y Políticas</h2>
          </div>
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Comisión por Reserva (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={inputClasses('commission')}
                value={values.commission}
                onChange={handleChange('commission')}
                onBlur={handleBlur('commission')}
              />
              {errors.commission && touched.commission && <p className="text-xs text-error">{errors.commission}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ventana de Reembolso (horas)</label>
              <input
                type="number"
                min="0"
                className={inputClasses('refundWindow')}
                value={values.refundWindow}
                onChange={handleChange('refundWindow')}
                onBlur={handleBlur('refundWindow')}
              />
              {errors.refundWindow && touched.refundWindow && <p className="text-xs text-error">{errors.refundWindow}</p>}
            </div>
            <div className="flex items-center justify-between bg-surface-container-lowest rounded-xl p-4">
              <div>
                <p className="text-sm font-bold text-primary">Aprobar Socios Automáticamente</p>
                <p className="text-xs text-on-surface-variant">Publica nuevos listados sin revisión manual.</p>
              </div>
              <Toggle checked={toggles.autoApprovePartners} onChange={toggleField('autoApprovePartners')} />
            </div>
          </div>
        </div>

        {/* Notificaciones del sistema */}
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined">notifications</span>
            <h2 className="text-lg font-bold">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Notificaciones por Correo</p>
                <p className="text-xs text-on-surface-variant">Recibe alertas de nuevas reservas y pagos.</p>
              </div>
              <Toggle checked={toggles.emailNotifications} onChange={toggleField('emailNotifications')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Alertas por SMS</p>
                <p className="text-xs text-on-surface-variant">Alertas críticas del sistema vía mensaje de texto.</p>
              </div>
              <Toggle checked={toggles.smsAlerts} onChange={toggleField('smsAlerts')} />
            </div>
          </div>
        </div>

        {/* Seguridad y mantenimiento */}
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined">security</span>
            <h2 className="text-lg font-bold">Seguridad y Mantenimiento</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Autenticación de Dos Factores Obligatoria</p>
                <p className="text-xs text-on-surface-variant">Requiere 2FA para todas las cuentas de administrador.</p>
              </div>
              <Toggle checked={toggles.twoFactorRequired} onChange={toggleField('twoFactorRequired')} />
            </div>
            <div className="flex items-center justify-between bg-error/5 border border-solid border-error/20 rounded-xl p-4">
              <div>
                <p className="text-sm font-bold text-error">Modo Mantenimiento</p>
                <p className="text-xs text-on-surface-variant">Bloquea el acceso público mientras se realizan cambios.</p>
              </div>
              <Toggle checked={toggles.maintenanceMode} onChange={toggleField('maintenanceMode')} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="px-6 py-3 border border-solid border-outline rounded-xl text-sm font-bold text-primary bg-transparent hover:bg-surface-container-low transition-all cursor-pointer">
          Descartar Cambios
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer flex items-center gap-2"
        >
          {saveStatus === 'success' && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
          {saveStatus === 'success' ? 'Configuración Guardada' : 'Guardar Configuración'}
        </button>
      </div>

    </AdminLayout>
  );
}

export default ConfiguracionesAdmin;