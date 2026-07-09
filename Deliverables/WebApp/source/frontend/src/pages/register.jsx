import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';


const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,60}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password: distinta exigencia según el rol.
// user  -> mínimo 8 caracteres, al menos 1 letra y 1 número
// admin -> mínimo 10 caracteres, mayúscula, minúscula, número y carácter especial
const PASSWORD_RULES = {
  user: {
    minLength: 8,
    regex: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
    message: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.',
  },
  admin: {
    minLength: 10,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/,
    message: 'Como administrador, tu contraseña debe tener al menos 10 caracteres, con mayúsculas, minúsculas, números y un carácter especial.',
  },
};

function validateField(field, value, role) {
  switch (field) {
    case 'fullName': {
      const trimmed = value.trim();
      if (!trimmed) return 'El nombre completo es obligatorio.';
      if (!NAME_REGEX.test(trimmed)) {
        return 'Ingresa un nombre válido (mínimo 3 letras, solo letras y espacios).';
      }
      return '';
    }
    case 'email': {
      const trimmed = value.trim();
      if (!trimmed) return 'El correo electrónico es obligatorio.';
      if (!EMAIL_REGEX.test(trimmed)) return 'Ingresa un correo electrónico válido.';
      return '';
    }
    case 'password': {
      if (!value) return 'La contraseña es obligatoria.';
      const rule = PASSWORD_RULES[role] || PASSWORD_RULES.user;
      if (!rule.regex.test(value)) return rule.message;
      return '';
    }
    default:
      return '';
  }
}

function Register({ onNavigate, onRegisterSuccess }) {
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const [values, setValues] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({ fullName: '', email: '', password: '' });
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false });

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    // Si el campo ya fue tocado, validamos en vivo para dar feedback inmediato
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value, role) }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field], role) }));
  };

  // Al cambiar de rol, re-validamos la contraseña porque sus reglas dependen del rol
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validateField('password', values.password, newRole) }));
    }
  };

  const validateAll = () => {
    const newErrors = {
      fullName: validateField('fullName', values.fullName, role),
      email: validateField('email', values.email, role),
      password: validateField('password', values.password, role),
    };
    setErrors(newErrors);
    setTouched({ fullName: true, email: true, password: true });
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return; // hay errores, no se envía el formulario
    }

    setStatus('loading');

    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      }, 600);
    }, 1500);
  };

  const inputClasses = (field) =>
    `w-full bg-transparent border-b py-3 px-1 text-base focus:outline-none transition-colors placeholder:text-outline/40 ${
      errors[field] && touched[field]
        ? 'border-error focus:border-error'
        : 'border-outline-variant focus:border-primary'
    }`;

  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-secondary-container min-h-screen flex flex-col justify-between">
    
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-[480px] space-y-8 animate-fade-in-up">
          
          {/* Welcome Title */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold text-primary">Crea tu cuenta</h1>
            <p className="text-base text-on-surface-variant">Únete a la nueva era del turismo inteligente.</p>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-on-surface-variant uppercase block">
                Selecciona tu perfil
              </label>
              <div className="grid grid-cols-2 gap-4">
                
                {/* User Role */}
                <label className="cursor-pointer group">
                  <input 
                    className="hidden" 
                    name="role" 
                    type="radio" 
                    value="user"
                    checked={role === 'user'}
                    onChange={() => handleRoleChange('user')}
                  />
                  <div className={`h-full p-5 border rounded-xl transition-all duration-300 active:scale-[0.98] ${
                    role === 'user' 
                      ? 'border-primary bg-surface-container-lowest shadow-lg shadow-primary/5' 
                      : 'border-outline-variant/50 bg-surface-container-low hover:border-primary'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${
                      role === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                    }`}>
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <h3 className="text-lg font-bold block">Usuario</h3>
                    <p className="text-[11px] leading-tight text-on-surface-variant mt-1">Planea viajes y descubre destinos.</p>
                  </div>
                </label>

                {/* Admin Role */}
                <label className="cursor-pointer group">
                  <input 
                    className="hidden" 
                    name="role" 
                    type="radio" 
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => handleRoleChange('admin')}
                  />
                  <div className={`h-full p-5 border rounded-xl transition-all duration-300 active:scale-[0.98] ${
                    role === 'admin' 
                      ? 'border-primary bg-surface-container-lowest shadow-lg shadow-primary/5' 
                      : 'border-outline-variant/50 bg-surface-container-low hover:border-primary'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${
                      role === 'admin' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                    }`}>
                      <span className="material-symbols-outlined">admin_panel_settings</span>
                    </div>
                    <h3 className="text-lg font-bold block">Administrador</h3>
                    <p className="text-[11px] leading-tight text-on-surface-variant mt-1">Gestiona itinerarios y colaboraciones.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-on-surface-variant uppercase group-focus-within:text-primary transition-colors block" htmlFor="full_name">
                  Nombre Completo
                </label>
                <input 
                  className={inputClasses('fullName')}
                  id="full_name" 
                  placeholder="Ej: Julian Casablancas" 
                  type="text"
                  value={values.fullName}
                  onChange={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  aria-invalid={!!(errors.fullName && touched.fullName)}
                  aria-describedby="full_name_error"
                  required
                />
                {errors.fullName && touched.fullName && (
                  <p id="full_name_error" className="text-xs text-error pt-1">{errors.fullName}</p>
                )}
              </div>
              
              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-on-surface-variant uppercase group-focus-within:text-primary transition-colors block" htmlFor="email">
                  Correo Electrónico
                </label>
                <input 
                  className={inputClasses('email')}
                  id="email" 
                  placeholder="nombre@ejemplo.com" 
                  type="email"
                  value={values.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  aria-invalid={!!(errors.email && touched.email)}
                  aria-describedby="email_error"
                  required
                />
                {errors.email && touched.email && (
                  <p id="email_error" className="text-xs text-error pt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-on-surface-variant uppercase group-focus-within:text-primary transition-colors block" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <input 
                    className={inputClasses('password')}
                    id="password" 
                    placeholder={role === 'admin' ? 'Mínimo 10 caracteres' : 'Mínimo 8 caracteres'} 
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    aria-invalid={!!(errors.password && touched.password)}
                    aria-describedby="password_error"
                    required
                  />
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && touched.password ? (
                  <p id="password_error" className="text-xs text-error pt-1">{errors.password}</p>
                ) : (
                  <p className="text-[11px] text-on-surface-variant/70 pt-1">
                    {role === 'admin'
                      ? 'Mayúscula, minúscula, número y carácter especial.'
                      : 'Al menos una letra y un número.'}
                  </p>
                )}
              </div>
            </div>

            {/* CTA and Action Button */}
            <div className="pt-4 space-y-6">
              <button 
                className={`w-full py-4 rounded-full text-lg font-bold transition-all duration-300 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none ${
                  status === 'success'
                    ? 'bg-secondary-container text-primary'
                    : 'bg-primary text-on-primary hover:bg-opacity-90'
                }`} 
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'idle' && 'Crear Cuenta'}
                {status === 'loading' && (
                  <>
                    <span className="animate-spin material-symbols-outlined">progress_activity</span>
                    Procesando...
                  </>
                )}
                {status === 'success' && (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Cuenta Creada
                  </>
                )}
              </button>

              <div className="text-center">
                <a 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('login');
                  }}
                  className="text-base text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4 decoration-outline-variant cursor-pointer" 
                  href="#login"
                >
                  Ya tengo cuenta, Iniciar sesión
                </a>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Register;