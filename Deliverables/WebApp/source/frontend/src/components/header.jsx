import React from 'react';

function Header({ isLoggedIn = false, onNavigate, currentPage = 'landing', currentTab = 'Personal Info', onSignOut }) {
  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate(isLoggedIn ? 'inicio' : 'landing');
    }
  };

  const handleNavClick = (e, targetPage, params = {}) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(targetPage, params);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-primary/95 backdrop-blur-xl border-0 border-b border-solid border-white/10 z-50">
      <div className="flex justify-between items-center max-w-[1280px] mx-auto px-6 md:px-16 h-20">
        
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <span 
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer selection:bg-transparent"
          >
            <img 
              src="/src/assets/logo_transparente.png" 
              alt="TraveXperience" 
              className="h-12 w-12 object-contain"
            />
            <span className="font-display-lg text-2xl font-bold text-on-primary tracking-tighter">
              TraveXperience
            </span>
          </span>
          
          <nav className="hidden md:flex items-center gap-6">
            {!isLoggedIn ? (
              // Unauthenticated Links
              <>
                <a 
                  onClick={(e) => handleNavClick(e, 'landing')}
                  className={`font-sans text-sm font-semibold tracking-wide pb-1 transition-all ${
                    currentPage === 'landing' 
                      ? 'text-secondary-container border-0 border-b-2 border-solid border-secondary-container' 
                      : 'text-on-primary/70 hover:text-on-primary'
                  }`} 
                  href="#explore"
                >
                  Explorar
                </a>
                <a 
                  onClick={(e) => handleNavClick(e, 'landing')}
                  className="font-sans text-sm font-semibold tracking-wide text-on-primary/70 hover:text-on-primary transition-colors" 
                  href="#features"
                >
                  Features
                </a>
                <a 
                  onClick={(e) => handleNavClick(e, 'landing')}
                  className="font-sans text-sm font-semibold tracking-wide text-on-primary/70 hover:text-on-primary transition-colors" 
                  href="#community"
                >
                  Community
                </a>
                <a 
                  onClick={(e) => handleNavClick(e, 'landing')}
                  className="font-sans text-sm font-semibold tracking-wide text-on-primary/70 hover:text-on-primary transition-colors" 
                  href="#pricing"
                >
                  Pricing
                </a>
              </>
            ) : (
              // Authenticated Links
              <>
                <a 
                  onClick={(e) => handleNavClick(e, 'inicio')}
                  className={`font-sans text-sm font-semibold tracking-wide pb-1 transition-all ${
                    currentPage === 'inicio' 
                      ? 'text-secondary-container border-0 border-b-2 border-solid border-secondary-container' 
                      : 'text-on-primary/70 hover:text-on-primary'
                  }`} 
                  href="#explore"
                >
                  Explore
                </a>
                <a 
                  onClick={(e) => handleNavClick(e, 'mapa')}
                  className={`font-sans text-sm font-semibold tracking-wide pb-1 transition-all ${
                    currentPage === 'mapa' 
                      ? 'text-secondary-container border-0 border-b-2 border-solid border-secondary-container' 
                      : 'text-on-primary/70 hover:text-on-primary'
                  }`} 
                  href="#mapa"
                >
                  Mapa 
                </a>
                <a 
                  onClick={(e) => handleNavClick(e, 'itinerario')}
                  className={`font-sans text-sm font-semibold tracking-wide pb-1 transition-all ${
                    currentPage === 'itinerario' 
                      ? 'text-secondary-container border-0 border-b-2 border-solid border-secondary-container' 
                      : 'text-on-primary/70 hover:text-on-primary'
                  }`} 
                  href="#itinerario"
                >
                  Mis viajes
                </a>
                <a 
                  onClick={(e) => handleNavClick(e, 'settings', { tab: 'Favorites' })}
                  className={`font-sans text-sm font-semibold tracking-wide pb-1 transition-all ${
                    currentPage === 'settings' && currentTab === 'Favorites'
                      ? 'text-secondary-container border-0 border-b-2 border-solid border-secondary-container' 
                      : 'text-on-primary/70 hover:text-on-primary'
                  }`} 
                  href="#favorites"
                >
                  Favoritos
                </a>
              </>
            )}
          </nav>
        </div>

        {/* CTA or Utility Buttons */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            // Logged Out Actions
            <>
              <button 
                onClick={() => onNavigate('login')}
                className="hidden md:block text-on-primary font-sans text-sm font-semibold tracking-wide bg-transparent border-none cursor-pointer px-4 py-2 hover:bg-on-primary/10 rounded-lg transition-all"
              >
                Login
              </button>
              <button 
                onClick={() => onNavigate('register')}
                className="bg-secondary-container text-primary font-sans text-sm font-semibold tracking-wide border-none cursor-pointer px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Get Started
              </button>
            </>
          ) : (
            // Logged In Utilities
            <>
              <button 
                onClick={() => onNavigate('settings', { tab: 'Notifications' })}
                className={`p-2 text-on-primary hover:bg-on-primary/10 rounded-full transition-all bg-transparent border-none cursor-pointer material-symbols-outlined ${
                  currentPage === 'settings' && currentTab === 'Notifications' ? 'bg-on-primary/10' : ''
                }`}
                title="Notifications"
              >
                notifications
              </button>
              <button 
                onClick={() => onNavigate('settings', { tab: 'Personal Info' })}
                className={`p-2 text-on-primary hover:bg-on-primary/10 rounded-full transition-all bg-transparent border-none cursor-pointer material-symbols-outlined ${
                  currentPage === 'settings' && currentTab === 'Personal Info' ? 'bg-on-primary/10' : ''
                }`}
                title="Settings"
              >
                settings
              </button>
              <div 
                onClick={() => onNavigate('settings', { tab: 'Personal Info' })}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-solid border-on-primary/20 cursor-pointer hover:border-secondary-container transition-all"
                title="Profile Settings"
              >
                <img 
                  alt="User profile" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                />
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;