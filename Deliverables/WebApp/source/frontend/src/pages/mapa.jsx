import React, { useState } from 'react';
import MapSidebar from '../components/MapSidebar.jsx';

function InteractiveMap({ onNavigate }) {
  const [activeMapTool, setActiveMapTool] = useState('Capas');
  // Estado para el Toast informativo inferior
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Lugares reales mapeados con coordenadas relativas listas para renderizar de manera interactiva
  const places = [
    {
      id: 1,
      title: 'Le Jules Verne',
      type: 'Fine Dining',
      distance: '0.2 km',
      rating: '4.9',
      icon: 'restaurant',
      top: '35%',
      left: '42%',
      bgClass: 'bg-secondary-container text-on-secondary-container',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      desc: 'Alta cocina parisina con vistas a la Torre Eiffel.'
    },
    {
      id: 2,
      title: 'Louvre Museum',
      type: 'Culture',
      distance: '1.1 km',
      rating: '4.7',
      icon: 'museum',
      top: '48%',
      left: '62%',
      bgClass: 'bg-primary text-white',
      image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=400&q=80',
      desc: 'El museo de arte más grande e icónico del mundo.'
    },
    {
      id: 3,
      title: 'Skyline Lounge',
      type: 'Nightlife',
      distance: '0.8 km',
      rating: '4.8',
      icon: 'local_bar',
      top: '25%',
      left: '52%',
      bgClass: 'bg-tertiary-fixed-dim text-on-tertiary-fixed',
      image: 'https://images.unsplash.com/photo-1536489885071-87983c3e2859?auto=format&fit=crop&w=400&q=80',
      desc: 'Cócteles artesanales y vistas espectaculares del horizonte.'
    }
  ];

  const filteredPlaces = places.filter(place =>
    place.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background text-on-background font-sans selection:bg-secondary-container h-screen overflow-hidden flex flex-col antialiased">
      

      {/* Contenedor del Explorador */}
      <div className="flex flex-1 pt-20 relative overflow-hidden">
        
        {/* Map Sidebar */}
        <MapSidebar currentTab={activeMapTool} onTabChange={setActiveMapTool} />

        {/* Sidebar Lateral */}
        <aside className="w-80 md:ml-64 bg-white/95 backdrop-blur-md border-r border-outline-variant/50 h-full z-30 flex flex-col shadow-lg transition-transform duration-300">
          <div className="p-6 border-b border-outline-variant/30">
            <h1 className="text-xl font-bold text-primary mb-1">París, Francia</h1>
            <p className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">location_on</span> 124 experiencias curadas
            </p>
          </div>

          {/* Barra de búsqueda interactiva */}
          <div className="p-4 px-6">
            <div className="relative">
              <input 
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                placeholder="Buscar destinos..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            </div>
          </div>

          {/* Lista de lugares (Tarjetas Bento reactivas al clic) */}
          <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 scrollbar-thin scrollbar-thumb-gray-300">
            <h2 className="text-[10px] font-bold text-primary tracking-wider uppercase pt-2">Lugares destacados</h2>
            
            {filteredPlaces.map((place) => (
              <div 
                key={place.id} 
                onClick={() => setSelectedPlace(place)}
                className="group cursor-pointer bg-surface border border-outline-variant/40 rounded-xl p-3 transition-all hover:shadow-md hover:border-outline"
              >
                <div className="relative h-36 rounded-lg overflow-hidden mb-3">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={place.title} src={place.image}/>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-secondary text-sm fill-1">star</span>
                    <span className="text-xs font-bold text-primary">{place.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">{place.title}</h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">{place.type} • {place.distance}</p>
                  </div>
                  <button className="flex items-center gap-0.5 text-secondary hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer font-bold text-xs">
                    <span className="material-symbols-outlined text-[14px]">navigation</span>
                    <span>Ir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas del Mapa Real (Capa Interactiva SVG Vectorial Limpia) */}
        <main className="flex-1 relative h-full bg-surface-container overflow-hidden">
          
          {/* El contenedor simula una red de calles reales escalable y estilizada */}
          <div className="absolute inset-0 w-full h-full bg-[#f4f5f6] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">
            
            {/* Líneas de cuadrícula/ríos vectoriales reales que componen el esqueleto urbano premium */}
            <svg className="absolute w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,300 Q300,250 600,400 T1200,350" fill="none" stroke="#b1cbe3" strokeWidth="40" strokeLinecap="round" />
              <line x1="10%" y1="0" x2="90%" y2="100%" stroke="#e0e3e6" strokeWidth="4" />
              <line x1="80%" y1="0" x2="20%" y2="100%" stroke="#e0e3e6" strokeWidth="3" />
              <line x1="0" y1="70%" x2="100%" y2="40%" stroke="#e0e3e6" strokeWidth="5" />
            </svg>

            {/* Marcadores/Pines Interactivos sobre el Mapa Vectorial */}
            {filteredPlaces.map((place) => (
              <div 
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                style={{ top: place.top, left: place.left }}
                className="absolute map-pin cursor-pointer group z-20"
              >
                <div className={`${place.bgClass} p-3 rounded-full shadow-xl border-2 border-white flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95`}>
                  <span className="material-symbols-outlined text-xl">{place.icon}</span>
                </div>
                {/* Tooltip flotante */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                  {place.title}
                </div>
              </div>
            ))}
          </div>

          {/* Filtros Flotantes Superiores */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-white/50 z-10">
            <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border-none cursor-pointer">
              <span className="material-symbols-outlined text-sm">auto_awesome</span> Todo
            </button>
            <button className="hover:bg-surface-container-high text-primary px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border-none bg-transparent cursor-pointer">
              <span className="material-symbols-outlined text-sm">restaurant</span> Comida
            </button>
            <button className="hover:bg-surface-container-high text-primary px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border-none bg-transparent cursor-pointer">
              <span className="material-symbols-outlined text-sm">museum</span> Cultura
            </button>
            <div className="w-px h-5 bg-outline-variant/40 mx-1"></div>
            <button className="hover:bg-surface-container-high text-primary p-2 rounded-full transition-all border-none bg-transparent cursor-pointer flex items-center">
              <span className="material-symbols-outlined text-base">tune</span>
            </button>
          </div>

          {/* Controles del Mapa (Zoom e Info) */}
          <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-10">
            <button className="w-11 h-11 bg-white text-primary rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container-high transition-colors active:scale-95 border-none cursor-pointer">
              <span className="material-symbols-outlined font-bold">add</span>
            </button>
            <button className="w-11 h-11 bg-white text-primary rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container-high transition-colors active:scale-95 border-none cursor-pointer">
              <span className="material-symbols-outlined font-bold">remove</span>
            </button>
            <button className="w-11 h-11 bg-primary text-white rounded-xl shadow-md flex items-center justify-center mt-1 hover:opacity-90 transition-opacity active:scale-95 border-none cursor-pointer">
              <span className="material-symbols-outlined text-base">my_location</span>
            </button>
          </div>

          {/* Ventana Deslizable Inferior (Toast de Detalles Reactivo) */}
          <div 
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg bg-primary text-white p-5 rounded-2xl shadow-2xl flex items-center justify-between z-40 transition-all duration-300 ease-out border border-white/10 ${
              selectedPlace ? 'transform translate-y-0 opacity-100' : 'transform translate-y-[150%] opacity-0'
            }`}
          >
            {selectedPlace && (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                    <img className="w-full h-full object-cover" alt={selectedPlace.title} src={selectedPlace.image}/>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{selectedPlace.title}</h4>
                    <p className="text-xs text-on-primary/70 mt-0.5 font-medium">{selectedPlace.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { if (onNavigate) onNavigate('hotel-detail', { hotel: selectedPlace }); }}
                  className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap ml-4 border-none cursor-pointer"
                >
                  Explorar
                </button>
                <button 
                  className="absolute -top-2 -right-2 w-7 h-7 bg-white text-primary rounded-full shadow-lg flex items-center justify-center border-none cursor-pointer"
                  onClick={() => setSelectedPlace(null)}
                >
                  <span className="material-symbols-outlined text-sm font-bold">close</span>
                </button>
              </>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default InteractiveMap;