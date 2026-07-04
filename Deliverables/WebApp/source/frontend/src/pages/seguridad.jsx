import React, { useState } from 'react';

function PrivacySecurity() {
  // Estados para controlar los interruptores de privacidad de forma reactiva
  const [insightsEnabled, setInsightsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  return (
    <div className="bg-background text-on-background font-sans selection:bg-secondary-container min-h-screen flex flex-col antialiased">

      <div className="flex pt-16 flex-1">

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl mx-auto px-6 md:px-12 py-12">
          <header className="mb-12">
            <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Privacidad y Seguridad</h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Gestiona tus preferencias de datos y la seguridad de tu cuenta. Utilizamos un diseño minimalista de alta utilidad para garantizar que tu control sea intuitivo y absoluto.
            </p>
          </header>

          <div className="space-y-12">
            
            {/* Section: Privacy Controls */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-[22px]">visibility_off</span>
                <h2 className="text-lg font-bold">Controles de Privacidad</h2>
              </div>
              <div className="grid gap-4">
                
                {/* Toggle Card 1 */}
                <div className={`bg-surface-container-lowest border p-6 rounded-xl flex justify-between items-center transition-all ${insightsEnabled ? 'border-primary' : 'border-outline-variant/40 hover:border-outline-variant'}`}>
                  <div className="flex-1 pr-6">
                    <h3 className="text-sm font-bold text-primary mb-1">Análisis de Viajes Personalizado</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Permítenos analizar tu historial de viajes para sugerir destinos premium e itinerarios optimizados a tu medida.</p>
                  </div>
                  <button 
                    onClick={() => setInsightsEnabled(!insightsEnabled)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors relative outline-none ${insightsEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${insightsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Toggle Card 2 */}
                <div className={`bg-surface-container-lowest border p-6 rounded-xl flex justify-between items-center transition-all ${marketingEnabled ? 'border-primary' : 'border-outline-variant/40 hover:border-outline-variant'}`}>
                  <div className="flex-1 pr-6">
                    <h3 className="text-sm font-bold text-primary mb-1">Preferencias de Marketing</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Recibe actualizaciones exclusivas sobre experiencias de viaje de lujo y funciones especiales de TraveXperience.</p>
                  </div>
                  <button 
                    onClick={() => setMarketingEnabled(!marketingEnabled)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors relative outline-none ${marketingEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${marketingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Cookie Card */}
                <div className="bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-xl flex justify-between items-center transition-all hover:border-primary">
                  <div className="flex-1 pr-6">
                    <h3 className="text-sm font-bold text-primary mb-1">Cookies y Seguimiento de Sesión</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Las cookies funcionales son esenciales, pero puedes desactivar las cookies analíticas opcionales aquí.</p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold text-primary border border-outline rounded-xl bg-transparent hover:bg-surface-container transition-colors shrink-0">
                    Gestionar Cookies
                  </button>
                </div>
              </div>
            </section>

            {/* Section: Account Security */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-[22px]">shield</span>
                <h2 className="text-lg font-bold">Seguridad de la Cuenta</h2>
              </div>
              <div className="space-y-4">
                
                {/* 2FA Card */}
                <div className="bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-primary mb-1">Autenticación de Dos Factores (2FA)</h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">Protege tus itinerarios y datos de presupuesto agregando una capa adicional de seguridad.</p>
                    </div>
                    <span className="bg-tertiary-fixed text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border border-outline-variant/30">
                      Recomendado
                    </span>
                  </div>
                  <button className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
                    Activar 2FA
                  </button>
                </div>

                {/* Active Sessions */}
                <div className="bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-xl">
                  <h3 className="text-sm font-bold text-primary mb-4">Sesiones Activas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-on-surface-variant">laptop_mac</span>
                        <div>
                          <p className="text-xs font-bold text-primary">MacBook Pro 16" — Londres, Reino Unido</p>
                          <p className="text-[11px] text-on-surface-variant">Sesión actual • Chrome</p>
                        </div>
                      </div>
                      <span className="text-xs text-secondary font-bold whitespace-nowrap">Este Dispositivo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-on-surface-variant">smartphone</span>
                        <div>
                          <p className="text-xs font-bold text-primary">iPhone 15 Pro — París, Francia</p>
                          <p className="text-[11px] text-on-surface-variant">Última actividad: hace 2 horas • Safari</p>
                        </div>
                      </div>
                      <button className="text-error text-xs font-bold hover:underline bg-transparent">
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-1">Contraseña</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Último cambio hace 4 meses.</p>
                  </div>
                  <button className="px-4 py-2 border border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors shrink-0">
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </section>

            {/* Section: Data Management */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-[22px]">database</span>
                <h2 className="text-lg font-bold">Gestión de Datos</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-xl group hover:border-primary transition-all">
                  <h3 className="text-sm font-bold text-primary mb-2">Descargar tus Datos</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Exporta todos tus itinerarios de viaje, registros de gastos y configuraciones en formato JSON o CSV.</p>
                  <button className="flex items-center gap-2 text-primary font-bold text-xs bg-transparent">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Solicitar Exportación
                  </button>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-xl group hover:border-error transition-all">
                  <h3 className="text-sm font-bold text-primary mb-2">Eliminar Cuenta</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Remueve permanentemente todo tu historial de viajes e información personal de nuestros servidores de forma segura.</p>
                  <button className="flex items-center gap-2 text-error font-bold text-xs bg-transparent[">
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                    Cerrar Cuenta
                  </button>
                </div>
              </div>
            </section>

            {/* Legal Footer Within Content */}
            <section className="pt-8 border-t border-outline-variant/30">
              <div className="bg-surface-container-low rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-sm font-bold text-primary mb-1">La Transparencia nos Importa</h3>
                  <p className="text-xs text-on-surface-variant">Conoce nuestros marcos regulatorios legales para la protección estricta de tu información.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
                  <a className="text-primary underline hover:opacity-80" href="#">Política de Privacidad</a>
                  <a className="text-primary underline hover:opacity-80" href="#">Términos de Servicio</a>
                  <a className="text-primary underline hover:opacity-80" href="#">Estándares Globales</a>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant/40 w-full px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4 mt-16">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-center md:text-left">
          <div className="text-base font-bold text-primary">TraveXperience</div>
          <p className="text-xs text-on-surface-variant font-medium">© 2026 TraveXperience. Minimalismo de Alta Utilidad.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-on-surface-variant font-semibold">
          <a className="hover:text-primary transition-colors" href="#">Privacidad</a>
          <a className="hover:text-primary transition-colors" href="#">Términos</a>
          <a className="hover:text-primary transition-colors" href="#">Cookies</a>
          <a className="hover:text-primary transition-colors" href="#">Seguridad Global</a>
        </div>
      </footer>

      {/* Budget Health / Secure Session Floating Pulse */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur border border-outline-variant/30 px-4 py-2 rounded-full shadow-md z-30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
        </span>
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Conexión Segura</span>
      </div>

    </div>
  );
}

export default PrivacySecurity;