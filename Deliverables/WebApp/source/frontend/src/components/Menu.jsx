{/* Side Navigation Shell */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/30 z-40 hidden md:flex flex-col gap-2 p-4">
        <div className="mb-8 px-4">
          <h1 className="text-xl font-bold text-primary">TraveXperience</h1>
          <div className="flex items-center gap-3 mt-6 p-2 rounded-xl bg-surface-container">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-outline-variant/50">
              <img 
                className="w-full h-full object-cover" 
                alt="Trip Organizer" 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Verano en París</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Viaje Activo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          <a className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors text-sm font-semibold" href="#">
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors text-sm font-semibold" href="#">
            <span className="material-symbols-outlined text-[22px]">event_note</span>
            <span>Itinerario</span>
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors text-sm font-semibold" href="#">
            <span className="material-symbols-outlined text-[22px]">hotel</span>
            <span>Alojamientos</span>
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors text-sm font-semibold" href="#">
            <span className="material-symbols-outlined text-[22px]">directions_bus</span>
            <span>Transporte</span>
          </a>
          <a className="flex items-center gap-3 bg-secondary-container text-primary rounded-xl px-4 py-3 text-sm font-bold" href="#">
            <span className="material-symbols-outlined text-[22px]">payments</span>
            <span>Gastos</span>
          </a>
        </nav>

        <button className="mt-auto bg-primary text-on-primary rounded-xl py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-[18px]">group_add</span>
          Invitar Colaboradores
        </button>
      </aside>