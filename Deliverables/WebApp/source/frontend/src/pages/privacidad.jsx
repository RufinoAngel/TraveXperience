import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

function AccountSettings({ onNavigate, isSettingsTab = false }) {
  // Estado para el interruptor de Perfil Privado
  const [isPrivateProfile, setIsPrivateProfile] = useState(true);

  // Estados para simular el cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      alert('¡Contraseña actualizada correctamente!');
    }, 1200);
  };

  const panelContent = (
    <div className="space-y-8 w-full max-w-4xl mx-auto px-6 md:px-12 py-12">
      {/* Sección: Visibilidad del Perfil */}
      <div className="bg-white border border-solid border-outline-variant/40 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <span className="material-symbols-outlined text-lg">visibility</span>
          <h2 className="text-base font-bold tracking-tight m-0">Visibilidad del Perfil</h2>
        </div>
        <p className="text-xs font-semibold text-on-surface-variant mb-4">
          Elige cómo se muestra tu perfil e itinerarios ante la comunidad de viajeros de Xicotepec Xperience.
        </p>

        <div className={`p-5 rounded-2xl border border-solid flex justify-between items-center transition-all ${isPrivateProfile ? 'border-primary bg-primary/[0.02]' : 'border-outline-variant/40 bg-transparent'}`}>
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-bold text-primary mb-1">Perfil de Viajero Privado</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Al activar esta opción, tus itinerarios, guardados e historial de viajes solo serán visibles para ti y para los colaboradores que invites explícitamente.
            </p>
          </div>
          
          <button 
            type="button"
            onClick={() => setIsPrivateProfile(!isPrivateProfile)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out relative border-none cursor-pointer ${isPrivateProfile ? 'bg-primary' : 'bg-surface-container-highest'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${isPrivateProfile ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Sección: Seguridad de Acceso / Cambio de Contraseña */}
      <div className="bg-white border border-solid border-outline-variant/40 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary border-b border-solid border-outline-variant/20 pb-3">
          <span className="material-symbols-outlined text-lg">key</span>
          <h2 className="text-base font-bold tracking-tight m-0">Actualizar Contraseña</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contraseña Actual</label>
            <input 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nueva Contraseña</label>
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={isChangingPassword}
            className="mt-2 bg-primary text-on-primary px-6 py-3 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer disabled:opacity-50"
          >
            {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>

      {/* Sección: Integración de Terceros */}
      <div className="bg-white border border-solid border-outline-variant/40 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <span className="material-symbols-outlined text-lg">sync_alt</span>
          <h2 className="text-base font-bold tracking-tight m-0">Servicios Conectados</h2>
        </div>
        <p className="text-xs font-semibold text-on-surface-variant mb-6">
          Vincula cuentas externas para automatizar tus reservas y sincronizar vuelos de manera inteligente.
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border border-solid border-outline-variant/30 rounded-2xl">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-2xl text-[#ea4335]">google</span>
              <div>
                <p className="text-sm font-bold text-primary">Cuenta Google</p>
                <p className="text-xs text-on-surface-variant">Sincroniza tus itinerarios con Google Calendar</p>
              </div>
            </div>
            <button type="button" className="px-4 py-2 bg-surface hover:bg-surface-container-high rounded-xl text-xs font-bold text-primary border border-solid border-outline transition-colors cursor-pointer">
              Conectar
            </button>
          </div>

          <div className="flex justify-between items-center p-4 border border-solid border-outline-variant/30 rounded-2xl">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-2xl text-primary">apple</span>
              <div>
                <p className="text-sm font-bold text-primary">Apple iCloud</p>
                <p className="text-xs text-on-surface-variant">Sincroniza tus reservas con tu Apple Wallet</p>
              </div>
            </div>
            <button type="button" className="px-4 py-2 bg-surface hover:bg-surface-container-high rounded-xl text-xs font-bold text-primary border border-solid border-outline transition-colors cursor-pointer">
              Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isSettingsTab) {
    return panelContent;
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen selection:bg-secondary-container selection:text-on-secondary-container antialiased flex flex-col">
      <Header />

      {/* Contenedor Principal */}
      <main className="pt-16 pb-20 max-w-7xl mx-auto px-6 md:px-16 flex flex-1">
        {panelContent}
      </main>

      <Footer />
    </div>
  );
}

export default AccountSettings;