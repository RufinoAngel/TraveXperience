import React, { useState } from 'react';

function HotelDetail() {
  // Estado para el cálculo interactivo del formulario de reserva
  const [roomType, setRoomType] = useState('Executive Suite');
  const [nights, setNights] = useState(3);
  const [guests, setGuests] = useState('2 adultos, 0 niños');
  
  // Estado para microinteracciones de UI
  const [isSaved, setIsSaved] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [showToast, setShowToast] = useState(false);

  // Precios configurados según el tipo de habitación
  const roomPrices = {
    'Deluxe Room': 450,
    'Executive Suite': 850,
    'Presidential Suite': 1800,
  };

  const pricePerNight = roomPrices[roomType] || 850;
  const totalPrice = pricePerNight * nights;

  const handleBooking = () => {
    setBookingStatus('loading');
    setTimeout(() => {
      setBookingStatus('success');
      setShowToast(true);
      
      // Ocultar el toast automáticamente después de 4 segundos
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }, 1500);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen selection:bg-secondary-container selection:text-on-secondary-container antialiased">
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-16 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline-lg text-xl md:text-2xl font-bold tracking-tighter text-primary">TraveXperience</span>
            <div className="hidden md:flex items-center gap-6">
              <a className="text-primary border-b-2 border-primary font-semibold pb-1 text-sm" href="#explore">Explorar</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium" href="#trips">Mis Viajes</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium" href="#saved">Guardados</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium" href="#community">Comunidad</a>
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

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-16">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-xs font-bold uppercase tracking-widest">Volver a Resultados</span>
          </button>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/60 bg-white hover:bg-surface-container-low transition-all cursor-pointer text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-sm">share</span>
              <span>Compartir</span>
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                isSaved 
                  ? 'bg-secondary-container border-secondary text-primary' 
                  : 'bg-white border-outline-variant/60 text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${isSaved ? 'fill-1 text-primary' : ''}`}>favorite</span>
              <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
            </button>
          </div>
        </div>

        {/* Bento Photo Gallery Grid */}
        <section className="w-full h-[350px] md:h-[500px] mb-12 rounded-3xl overflow-hidden relative group cursor-pointer shadow-md">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10 pointer-events-none"></div>
          <img 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Grand Alpine Resort exterior panoramic view" 
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80" 
          />
        </section>

        {/* Layout de Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Columna Izquierda: Información Detallada */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Título de Cabecera */}
            <header>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-secondary-fixed-dim">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm fill-1 text-secondary-container">star</span>
                  ))}
                </div>
                <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">5 Estrellas • Zermatt, Suiza</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black font-display-lg text-primary tracking-tight mb-4">
                Grand Alpine Resort & Spa
              </h1>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-2xl font-medium">
                Lujo alpino en el corazón de Zermatt. Disfrute de vistas exclusivas al Matterhorn, gastronomía de autor y un spa de clase mundial diseñado para el bienestar absoluto.
              </p>
            </header>

            {/* Servicios Destacados */}
            <section>
              <h2 className="text-lg font-bold text-primary tracking-tight mb-6">Servicios Destacados</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: 'wifi', label: 'Wi-Fi Premium' },
                  { icon: 'spa', label: 'Spa & Wellness' },
                  { icon: 'pool', label: 'Piscina Climatizada' },
                  { icon: 'restaurant', label: 'Alta Cocina' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-outline-variant/30" />

            {/* Inclusiones y Políticas */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-base font-bold text-primary tracking-tight mb-4">Lo que incluye</h3>
                <ul className="space-y-3 p-0 list-none">
                  {[
                    'Acceso ilimitado al Alpine Wellness Club',
                    'Traslado privado desde la estación de Zermatt',
                    'Minibar premium con selección local',
                    'Servicio de conserjería 24/7'
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-base mt-0.5 fill-1">check_circle</span>
                      <span className="text-xs font-semibold text-on-surface-variant">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-base font-bold text-primary tracking-tight mb-4">Política de cancelación</h3>
                <div className="p-4 rounded-xl border-l-4 border-error bg-error-container/10">
                  <p className="text-xs font-semibold text-on-surface-variant leading-relaxed m-0">
                    Cancelación gratuita hasta 48 horas antes de la llegada. Después de ese período, se cargará la primera noche de estancia de tus coordenadas estipuladas.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Tarjeta de Reserva Reactiva */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 md:p-8 shadow-md">
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-2xl md:text-3xl font-black font-display-lg text-primary tracking-tight">${pricePerNight}</span>
                  <span className="text-xs font-semibold text-on-surface-variant"> / noche</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant text-xs font-bold bg-surface-container px-2.5 py-1 rounded-md">
                  <span className="material-symbols-outlined text-base text-secondary-container fill-1">grade</span>
                  <span>4.9 (128 reseñas)</span>
                </div>
              </div>

              {/* Formulario de Reserva */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20">
                  <div className="p-3 border-r border-0 border-solid border-outline-variant/30">
                    <label className="block text-[10px] font-extrabold text-on-surface-variant mb-1 uppercase tracking-wider">ENTRADA</label>
                    <input className="w-full bg-transparent border-none p-0 font-bold text-xs text-primary outline-none" type="text" defaultValue="12 Jun 2026" />
                  </div>
                  <div className="p-3">
                    <label className="block text-[10px] font-extrabold text-on-surface-variant mb-1 uppercase tracking-wider">SALIDA</label>
                    <input className="w-full bg-transparent border-none p-0 font-bold text-xs text-primary outline-none" type="text" defaultValue="15 Jun 2026" />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <label className="block text-[10px] font-extrabold text-on-surface-variant mb-1 uppercase tracking-wider">HUESPEDES</label>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-transparent border-none p-0 font-bold text-xs text-primary outline-none cursor-pointer"
                  >
                    <option>2 adultos, 0 niños</option>
                    <option>1 adulto</option>
                    <option>2 adultos, 1 niño</option>
                    <option>3 adultos</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <label className="block text-[10px] font-extrabold text-on-surface-variant mb-1 uppercase tracking-wider">TIPO DE HABITACIÓN</label>
                  <select 
                    value={roomType} 
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-transparent border-none p-0 font-bold text-xs text-primary outline-none cursor-pointer"
                  >
                    <option value="Deluxe Room">Habitación Deluxe</option>
                    <option value="Executive Suite">Suite Ejecutiva</option>
                    <option value="Presidential Suite">Suite Presidencial</option>
                  </select>
                </div>
              </div>

              {/* desglose de tarifas */}
              <div className="flex justify-between items-center mb-6 pt-4 border-t border-0 border-solid border-outline-variant/20">
                <span className="text-xs font-bold text-on-surface-variant">Estancia Total ({nights} noches)</span>
                <span className="text-xl md:text-2xl font-black text-primary tracking-tight">${totalPrice.toLocaleString()}</span>
              </div>

              {/* Botón con Estado Cambiante */}
              <button 
                onClick={handleBooking}
                disabled={bookingStatus === 'loading'}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wide transition-all border-none cursor-pointer shadow-sm active:scale-[0.98] ${
                  bookingStatus === 'success' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-primary text-on-primary hover:opacity-95'
                }`}
              >
                {bookingStatus === 'idle' && 'Reservar Ahora'}
                {bookingStatus === 'loading' && (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando coordenadas...
                  </span>
                )}
                {bookingStatus === 'success' && '¡Habitación Reservada!'}
              </button>
              
              <p className="text-center mt-3 text-[10px] font-bold text-outline uppercase tracking-wider m-0">No se te cobrará nada todavía</p>
            </div>

            {/* Nota Colaborativa */}
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-surface-container-high/40 rounded-xl border border-outline-variant/20">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold text-xs shadow-sm">M</div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant m-0">
                <strong className="text-primary font-bold">Mateo</strong> está visualizando este resort alpino ahora mismo.
              </p>
            </div>
          </aside>
          
        </div>
      </main>

      {/* Footer corporativo */}
      <footer className="bg-white border-t border-solid border-outline-variant/30 py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-xl font-bold tracking-tighter text-primary">TraveXperience</span>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Redefiniendo el viaje de lujo mediante la precisión logística y el descubrimiento emocional.
            </p>
          </div>
          {['Compañía', 'Soporte', 'Legal'].map((title, idx) => (
            <div key={idx}>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">{title}</h4>
              <ul className="space-y-2.5 p-0 list-none text-xs font-semibold text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#link">Sobre Nosotros</a></li>
                <li><a className="hover:text-primary transition-colors" href="#link">Centro de Ayuda</a></li>
                <li><a className="hover:text-primary transition-colors" href="#link">Privacidad & Cookies</a></li>
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-solid border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-on-surface-variant">
          <p>© {new Date().getFullYear()} TraveXperience. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-primary">Español (ES)</span>
            <span className="cursor-pointer hover:text-primary">USD ($)</span>
          </div>
        </div>
      </footer>

      {/* Toast Feedback Micro-interaction */}
      <div className={`fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] transition-all duration-500 ease-out border border-solid border-white/10 ${
        showToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}>
        <span className="material-symbols-outlined text-green-400 text-2xl fill-1">check_circle</span>
        <div className="flex flex-col">
          <span className="text-xs font-bold leading-none text-white">Solicitud Procesada</span>
          <span className="text-[11px] font-medium opacity-80 mt-1">Tu itinerario de estancia ha sido guardado.</span>
        </div>
      </div>

    </div>
  );
}

export default HotelDetail;