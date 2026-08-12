import React, { useState } from 'react';
import AdminLayout from '../../components/adminLayout.jsx';

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,60}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s()-]{7,20}$/;
// Regla de admin: mínimo 10 caracteres, mayúscula, minúscula, número y carácter especial
const ADMIN_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

function validateField(field, value, allValues) {
  switch (field) {
    case 'fullName': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'El nombre completo es obligatorio.';
      if (!NAME_REGEX.test(trimmed)) return 'Ingresa un nombre válido (mínimo 3 letras, solo letras y espacios).';
      return '';
    }
    case 'email': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'El correo electrónico es obligatorio.';
      if (!EMAIL_REGEX.test(trimmed)) return 'Ingresa un correo electrónico válido.';
      return '';
    }
    case 'phone': {
      const trimmed = (value || '').trim();
      if (!trimmed) return ''; // opcional
      if (!PHONE_REGEX.test(trimmed)) return 'Ingresa un teléfono válido.';
      return '';
    }
    case 'currentPassword': {
      const wantsChange = allValues && (allValues.newPassword || allValues.confirmPassword);
      if (wantsChange && !value) return 'Ingresa tu contraseña actual para confirmar el cambio.';
      return '';
    }
    case 'newPassword': {
      if (!value) return '';
      if (!ADMIN_PASSWORD_REGEX.test(value)) {
        return 'Mínimo 10 caracteres, con mayúscula, minúscula, número y carácter especial.';
      }
      return '';
    }
    case 'confirmPassword': {
      if (!allValues || !allValues.newPassword) return '';
      if (value !== allValues.newPassword) return 'Las contraseñas no coinciden.';
      return '';
    }
    default:
      return '';
  }
}

function AdminPerfil({ onNavigate }) {
  const [values, setValues] = useState({
    fullName: 'Sarah Jenkins',
    email: 'sarah.jenkins@travexperience.com',
    phone: '+34 600 123 456',
    role: 'Super Administrador',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    fullName: '', email: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    fullName: false, email: false, phone: false, currentPassword: false, newPassword: false, confirmPassword: false,
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | success

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value, nextValues) }));
    }
    if (field === 'newPassword' && touched.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateField('confirmPassword', nextValues.confirmPassword, nextValues) }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field], values) }));
  };

  const inputClasses = (field) =>
    `w-full px-4 py-3 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors ${
      errors[field] && touched[field] ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
    }`;

  const handleSave = () => {
    const fields = ['fullName', 'email', 'phone', 'currentPassword', 'newPassword', 'confirmPassword'];
    const newErrors = {};
    fields.forEach((f) => {
      newErrors[f] = validateField(f, values[f], values);
    });
    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    const hasErrors = Object.values(newErrors).some((e) => e !== '');
    if (hasErrors) {
      setSaveStatus('idle');
      return;
    }

    // Aquí iría la llamada real a tu API para guardar el perfil
    setSaveStatus('success');
    setValues((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    setTouched((prev) => ({ ...prev, currentPassword: false, newPassword: false, confirmPassword: false }));
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <AdminLayout activePage="admin-perfil" onNavigate={onNavigate}>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Mi Perfil</h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Gestiona tu información personal y las credenciales de acceso al panel de administración.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* Tarjeta de resumen */}
        <div className="space-y-6">
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                alt="Foto de perfil"
                className="w-24 h-24 rounded-full object-cover border-4 border-solid border-surface shadow-md"
              />
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center cursor-pointer border-2 border-solid border-surface">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <input type="file" className="hidden" accept="image/png, image/jpeg" />
              </label>
            </div>
            <h3 className="text-lg font-bold text-primary">{values.fullName}</h3>
            <p className="text-xs text-on-surface-variant mb-3">{values.email}</p>
            <span className="inline-flex items-center gap-1 bg-secondary-container/30 text-secondary text-xs font-bold px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              {values.role}
            </span>
          </div>

          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-5">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Actividad de la cuenta</p>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-on-surface-variant">Último acceso</span>
              <span className="font-semibold text-primary">Hoy, 09:24</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Miembro desde</span>
              <span className="font-semibold text-primary">Mar 2023</span>
            </div>
          </div>
        </div>

        {/* Formularios */}
        <div className="space-y-6">

          {/* Información Personal */}
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">badge</span>
              <h2 className="text-lg font-bold">Información Personal</h2>
            </div>
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  className={inputClasses('fullName')}
                  value={values.fullName}
                  onChange={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                />
                {errors.fullName && touched.fullName && <p className="text-xs text-error">{errors.fullName}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    className={inputClasses('email')}
                    value={values.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                  {errors.email && touched.email && <p className="text-xs text-error">{errors.email}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+34 600 000 000"
                    className={inputClasses('phone')}
                    value={values.phone}
                    onChange={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                  />
                  {errors.phone && touched.phone && <p className="text-xs text-error">{errors.phone}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Rol</label>
                <input
                  type="text"
                  disabled
                  value={values.role}
                  className="w-full px-4 py-3 bg-surface-container-high border border-solid border-outline-variant rounded-xl text-sm font-medium text-on-surface-variant outline-none cursor-not-allowed"
                />
                <p className="text-[11px] text-on-surface-variant/70">El rol solo puede ser modificado por un super administrador.</p>
              </div>
            </div>
          </div>

          {/* Seguridad / Contraseña */}
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">lock</span>
                <h2 className="text-lg font-bold">Seguridad</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                className="flex items-center gap-1 text-xs font-bold text-secondary bg-transparent border-none cursor-pointer hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">{showPasswords ? 'visibility_off' : 'visibility'}</span>
                {showPasswords ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contraseña Actual</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className={inputClasses('currentPassword')}
                  value={values.currentPassword}
                  onChange={handleChange('currentPassword')}
                  onBlur={handleBlur('currentPassword')}
                />
                {errors.currentPassword && touched.currentPassword && <p className="text-xs text-error">{errors.currentPassword}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nueva Contraseña</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Mínimo 10 caracteres"
                    className={inputClasses('newPassword')}
                    value={values.newPassword}
                    onChange={handleChange('newPassword')}
                    onBlur={handleBlur('newPassword')}
                  />
                  {errors.newPassword && touched.newPassword ? (
                    <p className="text-xs text-error">{errors.newPassword}</p>
                  ) : (
                    <p className="text-[11px] text-on-surface-variant/70">Mayúscula, minúscula, número y carácter especial.</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirmar Contraseña</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Repite la nueva contraseña"
                    className={inputClasses('confirmPassword')}
                    value={values.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                  />
                  {errors.confirmPassword && touched.confirmPassword && <p className="text-xs text-error">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-6 py-3 border border-solid border-outline rounded-xl text-sm font-bold text-primary bg-transparent hover:bg-surface-container-low transition-all cursor-pointer">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer flex items-center gap-2"
            >
              {saveStatus === 'success' && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
              {saveStatus === 'success' ? 'Cambios Guardados' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}

export default AdminPerfil;