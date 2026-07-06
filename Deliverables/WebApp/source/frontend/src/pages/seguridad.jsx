import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

function PrivacySecurity({ onNavigate, isSettingsTab = false }) {
  // Estados para controlar los interruptores de privacidad de forma reactiva
  const [insightsEnabled, setInsightsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const content = (
    <main className="flex-grow max-w-4xl mx-auto px-6 md:px-12 py-12 w-full">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Privacidad y Seguridad</h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Gestiona tus preferencias de datos y la seguridad de tu cuenta. Utilizamos un diseño minimalista de alta utilidad para garantizar que tu control sea intuitivo y absoluto.
        </p>
      </header>

      <div className="space-y-12">
        
        {/* Section: Privacy Controls */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-primary border-b border-solid border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[22px]">visibility_off</span>
            <h2 className="text-lg font-bold">Controles de Privacidad</h2>
          </div>
          <div className="grid gap-4">
            
            {/* Toggle Card 1 */}
            <div className={`bg-surface-container-lowest border border-solid p-6 rounded-xl flex justify-between items-center transition-all ${insightsEnabled ? 'border-primary' : 'border-outline-variant/40 hover:border-outline-variant'}`}>
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-bold text-primary mb-1">Análisis de Viajes Personalizado</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Permítenos analizar tu historial de visitas para sugerir rutas e itinerarios optimizados dentro de Xicotepec de Juárez.</p>
              </div>
              <button 
                type="button"
                onClick={() => setInsightsEnabled(!insightsEnabled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative outline-none border-none cursor-pointer ${insightsEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${insightsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Toggle Card 2 */}
            <div className={`bg-surface-container-lowest border border-solid p-6 rounded-xl flex justify-between items-center transition-all ${marketingEnabled ? 'border-primary' : 'border-outline-variant/40 hover:border-outline-variant'}`}>
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-bold text-primary mb-1">Preferencias de Marketing</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Recibe actualizaciones exclusivas sobre experiencias en la Sierra Norte de Puebla y funciones especiales de Xicotepec Xperience.</p>
              </div>
              <button 
                type="button"
                onClick={() => setMarketingEnabled(!marketingEnabled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative outline-none border-none cursor-pointer ${marketingEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${marketingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Cookie Card */}
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl flex justify-between items-center transition-all hover:border-primary">
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-bold text-primary mb-1">Cookies y Seguimiento de Sesión</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Las cookies funcionales son esenciales, pero puedes desactivar las cookies analíticas opcionales aquí.</p>
              </div>
              <button type="button" className="px-4 py-2 text-xs font-bold text-primary border border-solid border-outline rounded-xl bg-transparent hover:bg-surface-container transition-colors shrink-0 cursor-pointer">
                Gestionar Cookies
              </button>
            </div>
          </div>
        </section>

        {/* Section: Account Security */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-primary border-b border-solid border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[22px]">shield</span>
            <h2 className="text-lg font-bold">Seguridad de la Cuenta</h2>
          </div>
          <div className="space-y-4">
            
            {/* 2FA Card */}
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold text-primary mb-1">Autenticación de Dos Factores (2FA)</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Protege tus itinerarios y datos de presupuesto agregando una capa adicional de seguridad.</p>
                </div>
                <span className="bg-tertiary-fixed text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border border-solid border-outline-variant/30">
                  Recomendado
                </span>
              </div>
              <button type="button" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity border-none cursor-pointer">
                Activar 2FA
              </button>
            </div>

            {/* Active Sessions */}
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl">
              <h3 className="text-sm font-bold text-primary mb-4">Sesiones Activas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-solid border-outline-variant/30">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">laptop_mac</span>
                    <div>
                      <p className="text-xs font-bold text-primary">MacBook Pro 16" — Xicotepec de Juárez, Puebla</p>
                      <p className="text-[11px] text-on-surface-variant">Sesión actual • Chrome</p>
                    </div>
                  </div>
                  <span className="text-xs text-secondary font-bold whitespace-nowrap">Este Dispositivo</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">smartphone</span>
                    <div>
                      <p className="text-xs font-bold text-primary">iPhone 15 Pro — Poza Rica, Veracruz</p>
                      <p className="text-[11px] text-on-surface-variant">Última actividad: hace 2 horas • Safari</p>
                    </div>
                  </div>
                  <button type="button" className="text-error text-xs font-bold hover:underline bg-transparent border-none cursor-pointer">
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-primary mb-1">Contraseña</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Último cambio hace 4 meses.</p>
              </div>
              <button type="button" className="px-4 py-2 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors shrink-0 cursor-pointer">
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </section>

        {/* Section: Data Management */}
        <section className="pb-12">
          <div className="flex items-center gap-2 mb-6 text-primary border-b border-solid border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[22px]">database</span>
            <h2 className="text-lg font-bold">Gestión de Datos</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl group hover:border-primary transition-all">
              <h3 className="text-sm font-bold text-primary mb-2">Descargar tus Datos</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Exporta todos tus itinerarios de viaje, registros de gastos y configuraciones en formato JSON o CSV.</p>
              <button type="button" className="flex items-center gap-2 text-primary font-bold text-xs bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined text-sm">download</span>
                Solicitar Exportación
              </button>
            </div>
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl group hover:border-error transition-all">
              <h3 className="text-sm font-bold text-primary mb-2">Eliminar Cuenta</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Remueve permanentemente todo tu historial de viajes e información personal de nuestros servidores de forma segura.</p>
              <button type="button" className="flex items-center gap-2 text-error font-bold text-xs bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                Cerrar Cuenta
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );

  if (isSettingsTab) {
    return content;
  }

  return (
    <div className="bg-background text-on-background font-sans selection:bg-secondary-container min-h-screen flex flex-col antialiased">
      <Header />
      <div className="flex pt-16 flex-1">
        {content}
      </div>
      <Footer />
    </div>
  );
}

export default PrivacySecurity;