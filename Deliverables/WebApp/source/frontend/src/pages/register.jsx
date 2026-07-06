import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
function Register({ onNavigate, onRegisterSuccess }) {
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
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

  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-secondary-container min-h-screen flex flex-col justify-between">
      <Header />
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-[480px] space-y-8 animate-fade-in-up">
          
          {/* Welcome Title */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold text-primary">Crea tu cuenta</h1>
            <p className="text-base text-on-surface-variant">Únete a la nueva era del turismo inteligente.</p>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
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
                    onChange={() => setRole('user')}
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
                    <p className="text-[11px] leading-tight text-on-surface-variant mt-1">Planea viajes and descubre destinos.</p>
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
                    onChange={() => setRole('admin')}
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
                  className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-base focus:outline-none focus:border-primary transition-colors placeholder:text-outline/40" 
                  id="full_name" 
                  placeholder="Ej: Julian Casablancas" 
                  type="text"
                  required
                />
              </div>
              
              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-on-surface-variant uppercase group-focus-within:text-primary transition-colors block" htmlFor="email">
                  Correo Electrónico
                </label>
                <input 
                  className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-base focus:outline-none focus:border-primary transition-colors placeholder:text-outline/40" 
                  id="email" 
                  placeholder="nombre@ejemplo.com" 
                  type="email"
                  required
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-on-surface-variant uppercase group-focus-within:text-primary transition-colors block" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <input 
                    className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-base focus:outline-none focus:border-primary transition-colors placeholder:text-outline/40" 
                    id="password" 
                    placeholder="Mínimo 8 caracteres" 
                    type={showPassword ? 'text' : 'password'}
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
      <Footer />
    </div>
  );
}

export default Register;