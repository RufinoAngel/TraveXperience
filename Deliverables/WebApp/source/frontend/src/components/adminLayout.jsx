import React from 'react';

const NAV_ITEMS = [
  { key: 'admin-dashboard', label: 'Dashboard', icon: 'grid_view' },
  { key: 'admin-inventario', label: 'Inventario', icon: 'inventory_2' },
  { key: 'admin-hoteles', label: 'Hoteles', icon: 'bed' },
  { key: 'admin-transporte', label: 'Transporte', icon: 'directions_bus' },
  { key: 'admin-pagos', label: 'Pagos', icon: 'payments' },
];

function AdminSidebar({ activePage, onNavigate }) {
  return (
    <aside className="hidden md:flex flex-col fixed top-20 left-0 bottom-0 w-64 bg-surface border-0 border-r border-solid border-outline-variant/40 pt-8 px-4 z-40">
      <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-3 mb-4">
        Consola de Administrador
      </h2>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate && onNavigate(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all border-none cursor-pointer text-left ${
                isActive
                  ? 'bg-secondary-container text-primary'
                  : 'bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function AdminHeader({ onNavigate }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-primary z-50 flex items-center justify-between px-6 md:px-10">
      <span
        onClick={() => onNavigate && onNavigate('admin-dashboard')}
        className="text-2xl font-bold text-on-primary tracking-tight cursor-pointer"
      >
        TraveXperience
      </span>
      <div className="flex items-center gap-2">
        <button
          className="p-2.5 text-on-primary hover:bg-on-primary/10 rounded-full transition-all bg-transparent border-none cursor-pointer material-symbols-outlined"
          title="Notificaciones"
        >
          notifications
        </button>
        <button
          className="p-2.5 text-on-primary hover:bg-on-primary/10 rounded-full transition-all bg-transparent border-none cursor-pointer material-symbols-outlined"
          title="Configuración"
        >
          settings
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-solid border-on-primary/20 cursor-pointer ml-1">
          <img
            alt="Admin profile"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
          />
        </div>
      </div>
    </header>
  );
}

function AdminLayout({ activePage, onNavigate, children }) {
  return (
    <div className="min-h-screen bg-background text-on-background font-sans antialiased">
      <AdminHeader onNavigate={onNavigate} />
      <AdminSidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="pt-20 md:pl-64 min-h-screen">
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;