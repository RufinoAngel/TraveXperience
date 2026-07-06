import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

function SavedTrips({ onNavigate, isSettingsTab = false }) {
  // Estado inicial con las tarjetas guardadas por el usuario
  const [savedItems, setSavedItems] = useState([
    {
      id: 1,
      title: 'Cascada de Tlaxcalantongo',
      category: 'Naturaleza • Cascada',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
      desc: 'Refugio natural entre exuberante vegetación, a 25 km del centro de Xicotepec.'
    },
    {
      id: 2,
      title: 'Centro Ceremonial Xochipila',
      category: 'Cultural • Ceremonial',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80',
      desc: 'Peña sagrada en pleno centro, sitio de rituales prehispánicos y sincretismo vivo.'
    },
    {
      id: 3,
      title: 'Virgen de Guadalupe, Cerro El Tabacal',
      category: 'Mirador • Panorámica',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
      desc: 'Escultura de 20 metros de altura con la vista más completa del Pueblo Mágico.'
    }
  ]);

  // Función para alternar/quitar de favoritos
  const handleRemoveFavorite = (id) => {
    setSavedItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const content = (
    <main className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-12">
      
      {/* Encabezado de la Sección */}
      <section className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight font-headline-lg mb-1">Mis Guardados</h1>
          <p className="text-on-surface-variant text-sm font-medium">
            Tus lugares favoritos de Xicotepec de Juárez listos para planificar.
          </p>
        </div>
        
        <div className="bg-surface-container border border-solid border-outline-variant/40 rounded-xl px-4 py-2.5 flex items-center gap-3 w-max">
          <span className="material-symbols-outlined text-secondary text-[20px] fill-1">bookmark</span>
          <span className="text-xs font-bold text-primary">{savedItems.length} Destinos totales</span>
        </div>
      </section>

      {/* Estado Vacío (Si el usuario quita todos los favoritos) */}
      {savedItems.length === 0 ? (
        <div className="bg-surface border border-dashed border-outline-variant rounded-2xl p-16 text-center max-w-md mx-auto mt-12 shadow-[0px_8px_30px_rgba(0,0,0,0.02)]">
          <span className="material-symbols-outlined text-outline-variant text-[56px] mb-4">folder_open</span>
          <h3 className="text-base font-bold text-primary mb-1">No hay elementos guardados</h3>
          <p className="text-xs text-on-surface-variant font-medium mb-6 leading-relaxed">
            Explora nuevos destinos y presiona el ícono del corazón para agregarlos aquí de forma permanente.
          </p>
          <button 
            onClick={() => { if (onNavigate) onNavigate('mapa'); }}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all border-none cursor-pointer"
          >
            Explorar Destinos
          </button>
        </div>
      ) : (
        /* Grid de Favoritos en Formato Bento */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-surface border border-solid border-outline-variant/50 rounded-2xl overflow-hidden shadow-[0px_8px_24px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:border-outline-variant group flex flex-col justify-between"
            >
              {/* Contenedor de Imagen y Botón de Favorito */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  alt={item.title} 
                  src={item.image} 
                />
                {/* Gradiente sutil para contrastar botones superiores */}
                <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/40 to-transparent"></div>
                
                {/* Badge de Puntuación */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-sm fill-1">star</span>
                  <span className="text-xs font-bold text-primary">{item.rating}</span>
                </div>

                {/* Botón Flotante de Corazón Activo */}
                <button 
                  onClick={() => handleRemoveFavorite(item.id)}
                  className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-2 rounded-full flex items-center justify-center shadow-sm text-error transition-all duration-200 hover:scale-110 active:scale-90 border-none cursor-pointer group/fav"
                  title="Quitar de favoritos"
                >
                  <span className="material-symbols-outlined text-[20px] fill-1 transition-transform group-hover/fav:scale-105">
                    favorite
                  </span>
                </button>
              </div>

              {/* Detalles de la Tarjeta */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-primary mb-1.5 group-hover:text-secondary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed line-clamp-2 mb-4">
                    {item.desc}
                  </p>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="pt-3 border-t border-solid border-outline-variant/30 flex items-center justify-between">
                  <button 
                    onClick={() => { if (onNavigate) onNavigate('hotel-detail'); }}
                    className="text-primary font-bold text-xs bg-transparent border-none p-0 flex items-center gap-1 hover:text-secondary transition-colors cursor-pointer"
                  >
                    <span>Ver detalles</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                  
                  <button 
                    onClick={() => { if (onNavigate) onNavigate('itinerario'); }}
                    className="bg-primary text-on-primary px-3.5 py-2 rounded-lg text-[11px] font-bold hover:opacity-90 transition-all border-none cursor-pointer"
                  >
                    Planificar viaje
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );

  if (isSettingsTab) {
    return content;
  }

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container antialiased min-h-screen flex flex-col pt-16">
      <Header />
      {content}
      <Footer />
    </div>
  );
}

export default SavedTrips;