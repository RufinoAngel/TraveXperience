import React, { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() !== '') {
      // Aquí iría la lógica de tu API para enviar el correo
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container antialiased min-h-screen flex flex-col justify-between">
      
      {/* TopNavBar Simplificado */}
      <header className="bg-primary/95 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 md:px-16 h-20 max-w-7xl mx-auto">
          <div className="font-headline-md text-xl md:text-2xl font-bold text-on-primary tracking-tight cursor-pointer">
            TraveXperience
          </div>
          <a href="#login" className="text-on-primary/80 hover:text-on-primary text-xs font-bold transition-colors">
            Iniciar Sesión
          </a>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-16 w-full max-w-md mx-auto">
        <div className="w-full bg-surface border border-outline-variant/40 rounded-2xl p-8 shadow-[0px_12px_40px_rgba(0,0,0,0.03)]">
          
          {!isSubmitted ? (
            /* Estado 1: Formulario de solicitud */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-primary-container text-inverse-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[24px]">lock_reset</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold font-headline-lg text-primary tracking-tight mb-1">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  Introduce tu correo electrónico de viajero y te enviaremos las coordenadas para restablecer tu acceso.
                </p>
              </div>

              {/* Input de Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="ejemplo@travexperience.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all text-sm text-on-surface"
                  />
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 px-5 rounded-xl text-xs font-bold hover:opacity-95 transition-all border-none cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <span>Enviar enlace de recuperación</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              {/* Regresar */}
              <div className="text-center pt-2">
                <a href="#login" className="inline-flex items-center gap-1 text-xs font-bold text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Volver al inicio de sesión
                </a>
              </div>
            </form>
          ) : (
            /* Estado 2: Confirmación de envío exitoso */
            <div className="text-center space-y-6 py-4 animate-fadeIn">
              <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span className="material-symbols-outlined text-[24px] fill-1">mark_email_read</span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold font-headline-lg text-primary tracking-tight">
                  Verifica tu bandeja de entrada
                </h2>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  Hemos enviado un enlace de recuperación seguro a <br />
                  <strong className="text-primary font-semibold">{email}</strong>. El enlace expirará en 60 minutos.
                </p>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-[11px] text-on-surface-variant font-medium leading-normal">
                ¿No recibiste el correo? Revisa tu carpeta de spam o correo no deseado.
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-surface-container-high text-primary py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container-highest transition-all border-none cursor-pointer"
                >
                  Intentar con otro correo
                </button>
                
                <a href="#login" className="text-xs font-bold text-outline hover:text-primary transition-colors block pt-2">
                  Volver al inicio de sesión
                </a>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="py-6 border-t border-outline-variant/30 text-center text-[11px] text-on-surface-variant/60 font-medium bg-surface-bright">
        &copy; {new Date().getFullYear()} TraveXperience. Away From Home S.A.
      </footer>

    </div>
  );
}

export default ForgotPassword;