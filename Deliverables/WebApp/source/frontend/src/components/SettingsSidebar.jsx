import React from 'react';

function SettingsSidebar({ currentTab = 'Personal Info', onTabChange, onSignOut }) {
  // Configuración de los elementos del menú (Icono de Material Symbols + Texto)
  const menuItems = [
    { name: 'Personal Info', icon: 'person' },
    { name: 'Security', icon: 'security' },
    { name: 'Notifications', icon: 'notifications' },
    { name: 'Favorites', icon: 'favorite' },
    { name: 'Payments', icon: 'payments' },
    { name: 'Privacy', icon: 'privacy_tip' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-80px)] w-64 fixed left-0 top-20 border-0 border-r border-solid border-outline-variant bg-surface p-6 z-40">
      
      {/* Título del menú */}
      <div className="flex flex-col gap-1 mb-6">
        <span className="font-display-lg text-xl font-bold text-primary tracking-tight">
          Settings
        </span>
        <span className="font-sans text-xs font-medium text-on-surface-variant">
          Manage your account
        </span>
      </div>

      {/* Enlaces de Navegación */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = currentTab === item.name;
          return (
            <a
              key={item.name}
              href={`#${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={(e) => {
                if (onTabChange) {
                  e.preventDefault();
                  onTabChange(item.name);
                }
              }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 font-sans text-sm font-semibold tracking-wide transition-all border-none cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* Botón de Cierre de Sesión en la parte inferior */}
      <div className="mt-auto">
        <button 
          onClick={() => {
            if (onSignOut) {
              onSignOut();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-3 border border-solid border-outline rounded-lg font-sans text-sm font-semibold tracking-wide text-on-surface-variant bg-transparent hover:bg-surface-container-low transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}

export default SettingsSidebar;