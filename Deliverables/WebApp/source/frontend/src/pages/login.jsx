import React, { useState } from 'react';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulación del proceso de login
    setTimeout(() => {
      setStatus('success');
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Input Fields */}
            <div className="space-y-4">
              
              {/* Email */}
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

              {/* Password */}
              <div className="space-y-1 group">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase group-focus-within:text-primary transition-colors block" htmlFor="password">
                    Contraseña
                  </label>
                  <a className="text-xs text-on-surface-variant/80 hover:text-primary underline underline-offset-2" href="#">
                    ¿La olvidaste?
                  </a>
                </div>
                <div className="relative">
                  <input 
                    className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-base focus:outline-none focus:border-primary transition-colors placeholder:text-outline/40" 
                    id="password" 
                    placeholder="Introduce tu contraseña" 
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
                className={`w-full py-4 rounded-full text-lg font-bold transition-all duration-300 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 ${
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
                <a className="text-base text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4 decoration-outline-variant" href="#">
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