import React, { useState } from 'react';

function AccountSettings() {
  // Estado para controlar la pestaña lateral activa
  const [activeTab, setActiveTab] = useState('privacidad');
  
  // Estado para el interruptor de Perfil Privado
  const [isPrivateProfile, setIsPrivateProfile] = useState(true);

  // Estados para simular el cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen selection:bg-secondary-container selection:text-on-secondary-container antialiased">
      
      {/* Barra de Navegación Superior */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-16 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline-lg text-xl md:text-2xl font-bold tracking-tighter text-primary">TraveXperience</span>
            <div className="hidden md:flex items-center gap-6">
              <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium" href="#explore">Explore</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium" href="#trips">My Trips</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium" href="#saved">Saved</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium" href="#where-to">Where to?</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-container-high/50 rounded-lg transition-all duration-200 cursor-pointer bg-transparent border-none">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <div className="h-10 w-10 rounded-full bg-surface-variant border border-outline-variant/30 overflow-hidden cursor-pointer">
              <img className="w-full h-full object-cover" alt="User Avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" />
            </div>
          </div>
        </div>
      </nav>

      {/* Contenedor Principal */}
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-16">
        
        {/* Encabezado de la página */}
        <header className="mb-10">
          <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Settings</span>
          <h1 className="text-3xl md:text-4xl font-black font-display-lg text-primary tracking-tight mt-1 mb-3">
            Manage your account
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-3xl font-medium">
            Perfecciona tu perfil, ajusta la configuración de seguridad y personaliza cómo quieres vivir tu próximo viaje.
          </p>
        </header>

        {/* Layout en columnas (Sidebar + Panel de contenido) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Menú de Navegación Lateral (Sidebar) */}
          <aside className="lg:col-span-3 space-y-1">
            {[
              { id: 'personal', icon: 'person', label: 'Personal Info' },
              { id: 'seguridad', icon: 'lock', label: 'Seguridad' },
              { id: 'privacidad', icon: 'shield', label: 'Privacidad' },
              { id: 'pagos', icon: 'payments', label: 'Pagos' },
              { id: 'favoritos', icon: 'favorite', label: 'Favoritos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs border-none cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-0 border-solid border-outline-variant/20">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs border-none cursor-pointer text-error bg-error-container/10 hover:bg-error-container/20 transition-all">
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Panel de Contenido Principal Dinámico */}
          <section className="lg:col-span-9 bg-white border border-outline-variant/40 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
            
            {/* Sección: Visibilidad del Perfil */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <span className="material-symbols-outlined text-lg">visibility</span>
                <h2 className="text-base font-bold tracking-tight m-0">Visibilidad del Perfil</h2>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant mb-4">
                Elige cómo se muestra tu perfil e itinerarios ante la comunidad global de TraveXperience.
              </p>

              {/* Caja de Toggle de Perfil Privado */}
              <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                <div className="max-w-[80%]">
                  <h3 className="text-xs font-bold text-primary m-0 mb-1">Perfil Privado</h3>
                  <p className="text-[11px] font-semibold text-on-surface-variant m-0 leading-relaxed">
                    Solo las personas que tú apruebes pueden ver tus viajes y los detalles de tu perfil.
                  </p>
                </div>
                
                {/* Switch interactivo */}
                <button 
                  onClick={() => setIsPrivateProfile(!isPrivateProfile)}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors border-none cursor-pointer outline-none ${
                    isPrivateProfile ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                    isPrivateProfile ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <hr className="border-outline-variant/20 m-0" />

            {/* Sección: Contraseña y Seguridad */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <span className="material-symbols-outlined text-lg">lock_reset</span>
                <h2 className="text-base font-bold tracking-tight m-0">Contraseña y Seguridad</h2>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant mb-4">
                Mantén protegidas tus credenciales y accesos de seguridad avanzados.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Contraseña Actual */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <label className="block text-[10px] font-extrabold text-on-surface-variant mb-1 uppercase tracking-wider">CONTRASEÑA ACTUAL</label>
                  <input 
                    className="w-full bg-transparent border-none p-0 font-bold text-xs text-primary outline-none" 
                    type="password" 
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                {/* Campo Nueva Contraseña */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <label className="block text-[10px] font-extrabold text-on-surface-variant mb-1 uppercase tracking-wider font-sans">NUEVA CONTRASEÑA</label>
                  <input 
                    className="w-full bg-transparent border-none p-0 font-bold text-xs text-primary outline-none" 
                    type="password" 
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-95 text-on-primary font-bold text-xs tracking-wide border-none cursor-pointer shadow-sm transition-all">
                  <span className="material-symbols-outlined text-sm">vpn_key</span>
                  <span>Cambiar password</span>
                </button>
              </div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mt-2 m-0">Actualiza tus credenciales frecuentemente</p>
            </div>

            <hr className="border-outline-variant/20 m-0" />

            {/* Sección: Autenticación de Dos Factores (2FA) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20">
              <div>
                <div className="flex items-center gap-2 mb-1 text-primary">
                  <span className="material-symbols-outlined text-lg">gpp_good</span>
                  <h3 className="text-xs font-bold m-0">Two-Factor Authentication</h3>
                </div>
                <p className="text-[11px] font-semibold text-on-surface-variant m-0 mb-2 sm:mb-0">
                  Añade una capa extra de seguridad para evitar accesos no autorizados a tu perfil.
                </p>
                <div className="inline-flex items-center gap-1.5 bg-error-container/10 border border-solid border-error/20 px-2 py-0.5 rounded-md mt-1">
                  <div className="w-1.5 h-1.5 bg-error rounded-full"></div>
                  <span className="text-[10px] font-bold text-error uppercase tracking-wider">Status: Disabled</span>
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-solid border-outline-variant/50 bg-white text-primary hover:bg-surface-container-high font-bold text-xs border-none cursor-pointer shadow-sm transition-all h-fit self-end sm:self-center">
                <span className="material-symbols-outlined text-sm">settings_applications</span>
                <span>Manage 2FA</span>
              </button>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}

export default AccountSettings;