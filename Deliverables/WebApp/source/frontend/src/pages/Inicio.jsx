import React, { useState, useRef } from 'react';

function NearMeHome() {
  // Estado para los filtros de categorías cercanos
  const [activeFilter, setActiveFilter] = useState('All Nearby');
  
  // Estado para manejar favoritos de forma interactiva
  const [favorites, setFavorites] = useState({});

  // Lista enriquecida de experiencias cercanas (Ubicación: Londres / South Kensington)
  const [places, setPlaces] = useState([
    {
      id: 'gilded-ivy',
      title: 'The Gilded Ivy',
      type: 'Restaurant',
      icon: 'restaurant',
      pinColor: 'bg-error text-white',
      distance: '0.4 km',
      rating: '4.9',
      reviews: '1.2k',
      tags: ['#Michelin', '#FineDining'],
      desc: 'Exquisite modern European cuisine set in a stunning botanical-themed conservatory. Famous for their white truffle risotto.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      coords: { top: '40%', left: '30%' }
    },
    {
      id: 'victoria-albert',
      title: 'Victoria & Albert',
      type: 'Museum',
      icon: 'museum',
      pinColor: 'bg-secondary-container text-primary',
      distance: '0.8 km',
      rating: '4.8',
      reviews: '3.5k',
      tags: ['#Art', '#Design'],
      desc: "World's leading museum of art and design, housing a permanent collection of over 2.3 million objects.",
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      coords: { top: '35%', left: '55%' }
    },
    {
      id: 'jazz-lounge',
      title: 'The Jazz Lounge',
      type: 'Entertainment',
      icon: 'theater_comedy',
      pinColor: 'bg-secondary text-white',
      distance: '1.2 km',
      rating: '4.7',
      reviews: '850',
      tags: ['#Jazz', '#Nightlife'],
      desc: 'An intimate basement venue hosting world-renowned jazz artists every night. Handcrafted cocktails and smooth rhythms.',
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80',
      coords: { top: '50%', left: '75%' }
    }
  ]);

  const scrollRef = useRef(null);

  // Alternar el estado de favorito
  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrar lugares según selección
  const filteredPlaces = activeFilter === 'All Nearby' 
    ? places 
    : places.filter(place => place.type.toLowerCase() === activeFilter.toLowerCase() || (activeFilter === 'Events' && place.type === 'Event'));

  // Hacer scroll automático a la tarjeta cuando se presiona un pin del mapa
  const scrollToCard = (id) => {
    const cardElement = document.getElementById(`card-${id}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const categories = [
    { name: 'All Nearby', icon: 'explore' },
    { name: 'Restaurants', icon: 'restaurant' },
    { name: 'Museums', icon: 'museum' },
    { name: 'Events', icon: 'event' },
    { name: 'Entertainment', icon: 'theater_comedy' }
  ];

  return (
    <div className="bg-background text-on-background font-body-md overflow-hidden h-screen flex flex-col antialiased">
      
      {/* Top Navigation Bar */}
      <header className="bg-primary backdrop-blur-xl bg-primary/95 top-0 z-50 w-full border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 md:px-16 h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline-md text-xl md:text-2xl font-bold text-on-primary tracking-tight">TraveXperience</span>
            <nav className="hidden md:flex items-center gap-6">
              <a className="font-label-md text-sm text-secondary-container border-b-2 border-secondary-container pb-1 font-semibold" href="#explore">Explore</a>
              <a className="font-label-md text-sm text-on-primary/70 hover:text-on-primary transition-colors font-semibold" href="#trips">My Trips</a>
              <a className="font-label-md text-sm text-on-primary/70 hover:text-on-primary transition-colors font-semibold" href="#saved">Saved</a>
              <a className="font-label-md text-sm text-on-primary/70 hover:text-on-primary transition-colors font-semibold" href="#community">Community</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-primary hover:bg-on-primary/10 rounded-full transition-all bg-transparent border-none cursor-pointer material-symbols-outlined">notifications</button>
            <button className="p-2 text-on-primary hover:bg-on-primary/10 rounded-full transition-all bg-transparent border-none cursor-pointer material-symbols-outlined">settings</button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-on-primary/20 cursor-pointer">
              <img alt="User profile settings" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Area: Interactive Map Background Layout */}
      <main className="relative flex-grow overflow-hidden flex flex-col">
        
        {/* Map Background Canvas Component */}
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-90 select-none pointer-events-none" 
            alt="London Map Blueprint" 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1920&q=80" 
          />
          {/* Capa de degradados premium */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-background pointer-events-none"></div>
          
          {/* Renderizado de pines dinámicos en base al filtro seleccionado */}
          {filteredPlaces.map((place) => (
            <div 
              key={place.id}
              className="absolute transition-all duration-300 transform hover:scale-110 active:scale-95" 
              style={{ top: place.coords.top, left: place.coords.left }}
            >
              <button 
                onClick={() => scrollToCard(place.id)}
                className={`w-9 h-9 ${place.pinColor} rounded-full flex items-center justify-center shadow-xl border-2 border-white cursor-pointer transition-transform`}
                title={`Ver ${place.title}`}
              >
                <span className="material-symbols-outlined text-sm font-light">{place.icon}</span>
              </button>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap opacity-0 hover:opacity-100 md:opacity-100 md:bg-white/90 md:text-primary backdrop-blur-sm transition-opacity pointer-events-none">
                {place.title}
              </div>
            </div>
          ))}
        </div>

        {/* Capas superiores de Contenido */}
        <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
          
          {/* Quick Filter Bar Container */}
          <section className="w-full mt-6 px-6 md:px-16 pointer-events-auto">
            <div className="max-w-7xl mx-auto flex items-center gap-3 py-2 overflow-x-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveFilter(cat.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all border border-transparent cursor-pointer active:scale-95 ${
                    activeFilter === cat.name
                      ? 'bg-secondary-container text-on-secondary-container font-extrabold'
                      : 'backdrop-blur-md bg-white/80 border-outline-variant/60 text-primary hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  <span>{cat.name === 'All Nearby' ? 'All Nearby' : cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Title Hero Section */}
          <section className="px-6 md:px-16 mt-4 flex-grow flex flex-col justify-center">
            <div className="max-w-7xl w-full mx-auto">
              <h1 className="text-4xl md:text-5xl font-black font-display-lg text-primary tracking-tight">
                Discover <span className="text-secondary-fixed-dim border-b-4 border-secondary-container">London</span>
              </h1>
              <p className="text-sm md:text-base text-on-surface-variant max-w-md mt-3 font-medium leading-relaxed drop-shadow-sm">
                Find curated experiences within 2km of your current location in South Kensington.
              </p>
            </div>
          </section>

          {/* Horizontal Scroll Experience Cards */}
          <section className="w-full pb-24 md:pb-12 px-6 md:px-16 pointer-events-auto">
            <div className="max-w-7xl mx-auto">
              <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-none"
              >
                {filteredPlaces.map((place) => (
                  <div 
                    key={place.id}
                    id={`card-${place.id}`}
                    className="snap-center min-w-[290px] sm:min-w-[340px] md:min-w-[400px] max-w-[400px] group flex-shrink-0"
                  >
                    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/50 hover:border-outline-variant shadow-lg hover:shadow-2xl transition-all duration-300">
                      
                      {/* Cabecera de Imagen */}
                      <div className="relative h-44 overflow-hidden bg-surface-container-high">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={place.title} src={place.image} />
                        
                        {/* Botón de favoritos conectado al estado */}
                        <div className="absolute top-3 right-3">
                          <button 
                            onClick={() => toggleFavorite(place.id)}
                            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all border-none cursor-pointer shadow-sm active:scale-90 ${
                              favorites[place.id] ? 'bg-white text-error' : 'bg-white/80 text-primary hover:text-error hover:bg-white'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-lg ${favorites[place.id] ? 'fill-1' : ''}`}>
                              favorite
                            </span>
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-3 bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-sm">
                          {place.rating} ★ ({place.reviews})
                        </div>
                      </div>

                      {/* Cuerpo de la tarjeta */}
                      <div className="p-5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{place.type}</span>
                            <h3 className="text-base font-bold text-primary mt-0.5 tracking-tight">{place.title}</h3>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className="text-xs font-bold text-on-surface-variant bg-surface-container shadow-inner px-2 py-0.5 rounded-md">{place.distance}</span>
                          </div>
                        </div>
                        
                        <p className="mt-2 text-xs text-on-surface-variant font-medium leading-relaxed line-clamp-2">{place.desc}</p>
                        
                        {/* Footer de Tarjeta */}
                        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                          <div className="flex gap-1.5">
                            {place.tags.map(tag => (
                              <span key={tag} className="bg-surface-container px-2 py-0.5 rounded-md text-[10px] font-semibold text-on-surface-variant">{tag}</span>
                            ))}
                          </div>
                          <button className="text-xs font-bold text-primary bg-transparent border-none p-0 flex items-center gap-0.5 hover:text-secondary transition-colors cursor-pointer group/btn">
                            <span>Details</span>
                            <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-0.5 transition-transform">arrow_forward</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}

                {/* Mensaje si no hay resultados en el filtro */}
                {filteredPlaces.length === 0 && (
                  <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-8 text-center border border-dashed border-outline-variant/60">
                    <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">location_away</span>
                    <h4 className="text-sm font-bold text-primary">No experiences found</h4>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">Try selecting another filter category above.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Floating Action Recenter Button */}
        <div className="fixed bottom-24 md:bottom-8 right-6 z-20 pointer-events-auto">
          <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border-none cursor-pointer font-bold text-xs tracking-wide">
            <span className="material-symbols-outlined text-base">my_location</span>
            <span>Recenter Map</span>
          </button>
        </div>
      </main>

      {/* Bottom Navigation Menu Footer (Mobile view) */}
      <footer className="md:hidden bg-surface-container-lowest border-t border-outline-variant/40 py-2 px-4 fixed bottom-0 left-0 w-full z-50 shadow-lg">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center gap-0.5 text-secondary-container bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined text-[22px] fill-1">explore</span>
            <span className="text-[10px] font-bold">Explore</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-on-surface-variant/70 hover:text-primary bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">map</span>
            <span className="text-[10px] font-medium">Trips</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-on-surface-variant/70 hover:text-primary bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">favorite</span>
            <span className="text-[10px] font-medium">Saved</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-on-surface-variant/70 hover:text-primary bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">account_circle</span>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </footer>

    </div>
  );
}

export default NearMeHome;