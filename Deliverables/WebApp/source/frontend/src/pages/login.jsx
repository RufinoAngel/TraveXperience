import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login({ onNavigate, onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'El correo electrónico es obligatorio.';
        if (!EMAIL_REGEX.test(value.trim())) return 'Introduce un correo electrónico válido.';
        return '';
      case 'password':
        if (!value) return 'La contraseña es obligatoria.';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
        return '';
      default:
        return '';
    }
  };

  const validateAll = (data) => {
    const newErrors = {};
    Object.keys(data).forEach((key) => {
      const error = validateField(key, data[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Si el campo ya fue tocado, revalidar en vivo mientras el usuario escribe
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateAll(formData);
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setStatus('loading');

    // Simulación del proceso de login
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 600);
    }, 1500);
  };

  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-secondary-container min-h-screen flex flex-col justify-between">
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-[480px] space-y-8 animate-fade-in-up">
          
          {/* Welcome Title */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold text-primary">Te extrañamos</h1>
            <p className="text-base text-on-surface-variant">Inicia sesión para continuar planificando.</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            
            {/* Input Fields */}
            <div className="space-y-4">
              
              {/* Email */}
              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-on-surface-variant uppercase group-focus-within:text-primary transition-colors block" htmlFor="email">
                  Correo Electrónico
                </label>
                <input 
                  className={`w-full bg-transparent border-b py-3 px-1 text-base focus:outline-none transition-colors placeholder:text-outline/40 ${
                    errors.email && touched.email
                      ? 'border-error focus:border-error'
                      : 'border-outline-variant focus:border-primary'
                  }`}
                  id="email"
                  name="email"
                  placeholder="nombre@ejemplo.com" 
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(errors.email && touched.email)}
                  aria-describedby="email-error"
                />
                {errors.email && touched.email && (
                  <p id="email-error" className="text-xs text-error font-medium flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1 group">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase group-focus-within:text-primary transition-colors block" htmlFor="password">
                    Contraseña
                  </label>
                  <a 
                    onClick={(e) => {
                      e.preventDefault();
                      if (onNavigate) onNavigate('forgot-password');
                    }}
                    className="text-xs text-on-surface-variant/80 hover:text-primary underline underline-offset-2 cursor-pointer" 
                    href="#forgot-password"
                  >
                    ¿La olvidaste?
                  </a>
                </div>
                <div className="relative">
                  <input 
                    className={`w-full bg-transparent border-b py-3 px-1 text-base focus:outline-none transition-colors placeholder:text-outline/40 ${
                      errors.password && touched.password
                        ? 'border-error focus:border-error'
                        : 'border-outline-variant focus:border-primary'
                    }`}
                    id="password" 
                    name="password"
                    placeholder="Introduce tu contraseña" 
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!(errors.password && touched.password)}
                    aria-describedby="password-error"
                  />
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors bg-transparent border-none cursor-pointer" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p id="password-error" className="text-xs text-error font-medium flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* CTA and Action Button */}
            <div className="pt-4 space-y-6">
              <button 
                className={`w-full py-4 rounded-full text-lg font-bold transition-all duration-300 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed ${
                  status === 'success'
                    ? 'bg-secondary-container text-primary'
                    : 'bg-primary text-on-primary hover:bg-opacity-90'
                }`} 
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'idle' && 'Ingresar'}
                {status === 'loading' && (
                  <>
                    <span className="animate-spin material-symbols-outlined">progress_activity</span>
                    Verificando...
                  </>
                )}
                {status === 'success' && (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    ¡Bienvenido de vuelta!
                  </>
                )}
              </button>

              <div className="text-center">
                <a 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('register');
                  }}
                  className="text-base text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4 decoration-outline-variant cursor-pointer" 
                  href="#register"
                >
                  ¿No tienes una cuenta? Regístrate
                </a>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;