{/* TopNavBar */}
      <header className="bg-primary/95 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 md:px-16 h-20 max-w-7xl mx-auto">
          <div className="font-headline-md text-xl md:text-2xl font-bold text-on-primary tracking-tight">TraveXperience</div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-secondary-container border-b-2 border-secondary-container pb-1 text-sm font-semibold" href="#explore">Explore</a>
            <a className="text-on-primary/70 hover:text-on-primary transition-colors text-sm font-semibold" href="#trips">My Trips</a>
            <a className="text-on-primary/70 hover:text-on-primary transition-colors text-sm font-semibold" href="#saved">Saved</a>
            <a className="text-on-primary/70 hover:text-on-primary transition-colors text-sm font-semibold" href="#community">Community</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-primary hover:bg-on-primary/10 rounded-full transition-all material-symbols-outlined border-none bg-transparent cursor-pointer">notifications</button>
            <button className="p-2 text-on-primary hover:bg-on-primary/10 rounded-full transition-all material-symbols-outlined border-none bg-transparent cursor-pointer">settings</button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-on-primary/20 cursor-pointer">
              <img alt="User profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" />
            </div>
          </div>
        </div>
      </header>