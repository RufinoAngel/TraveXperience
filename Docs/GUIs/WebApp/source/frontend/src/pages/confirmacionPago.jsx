import React, { useEffect, useRef } from 'react';

function BookingConfirmed({ onNavigate }) {
  const successContainerRef = useRef(null);
  const bookingRefCell = useRef(null);

  // Efecto micro-interactivo para los confetis de celebración al cargar la página
  useEffect(() => {
    const container = successContainerRef.current;
    if (!container) return;

    const colors = ['#4648d4', '#6063ee', '#c0c1ff'];
    const confettiElements = [];
    
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rounded-full opacity-0 pointer-events-none';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = (Math.random() * 50 + 20) + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(confetti);
      confettiElements.push(confetti);

      const duration = Math.random() * 2 + 1;
      const delay = Math.random() * 0.5;

      confetti.animate([
        { transform: 'translateY(0) scale(0)', opacity: 0 },
        { transform: `translateY(-${Math.random() * 100 + 50}px) translateX(${(Math.random() - 0.5) * 100}px) scale(1)`, opacity: 0.6, offset: 0.3 },
        { transform: `translateY(${Math.random() * 100}px) translateX(${(Math.random() - 0.5) * 200}px) scale(0)`, opacity: 0 }
      ], {
        duration: duration * 1000,
        delay: delay * 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        fill: 'forwards'
      });
    }

    // Limpieza de nodos al desmontar el componente
    return () => {
      confettiElements.forEach(el => el.remove());
    };
  }, []);

  // Función para auto-seleccionar y copiar el código de reserva
  const handleCopyCode = () => {
    if (bookingRefCell.current) {
      const range = document.createRange();
      range.selectNode(bookingRefCell.current);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      
      // Feedback visual rápido usando clases nativas de Tailwind
      bookingRefCell.current.classList.add('bg-secondary-container/30');
      setTimeout(() => {
        if (bookingRefCell.current) {
          bookingRefCell.current.classList.remove('bg-secondary-container/30');
        }
      }, 500);
    }
  };

  return (
    <div className="bg-background text-on-background font-sans selection:bg-secondary-container min-h-screen flex flex-col antialiased">
      
      {/* Estilos CSS Inline necesarios únicamente para las animaciones del SVG Checkbox */}
      <style>{`
        .success-check-animate {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: dash-check 0.8s ease-in-out forwards;
        }
        @keyframes dash-check {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Contenedor Principal */}
      <main className="flex-grow w-full max-w-[800px] mx-auto px-6 md:px-0 pt-24 pb-12 flex flex-col items-center">
        
        {/* Celebratory State Section */}
        <div ref={successContainerRef} className="relative text-center mb-12 w-full pt-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-surface border border-outline-variant/30 shadow-[0px_8px_30px_rgba(0,0,0,0.04)] mb-8">
            <svg fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
              <circle className="success-check-animate" cx="24" cy="24" r="23" stroke="#4648d4" strokeWidth="2"></circle>
              <path className="success-check-animate" d="M15 24.5L21 30.5L33 18.5" stroke="#4648d4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" style={{ animationDelay: '0.2s' }}></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">¡Pago Exitoso!</h1>
          <p className="text-base text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Tu escapada a la Sierra Norte de Puebla ya está reservada. Tu recorrido por Xicotepec de Juárez comienza ahora.
          </p>
        </div>

        {/* Bento Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
          
          {/* Main Booking Details */}
          <div className="bg-surface border border-outline-variant p-6 md:p-8 rounded-xl flex flex-col justify-between shadow-[0px_8px_30px_rgba(0,0,0,0.04)] md:col-span-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-outline-variant/30 pb-8">
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Destino</span>
                <h2 className="text-xl font-bold text-primary">Posada del Café Xicotepec</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
                  <span className="text-sm text-on-surface-variant">Xicotepec de Juárez, Puebla</span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Fechas</span>
                <p className="text-base font-semibold text-primary">12 Dic — 15 Dic, 2026</p>
                <p className="text-xs text-on-surface-variant mt-1">3 Noches • 2 Adultos</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Referencia de Reserva</span>
                <span 
                  ref={bookingRefCell}
                  onClick={handleCopyCode}
                  className="font-mono text-sm font-semibold text-primary px-3 py-1.5 bg-surface-container rounded border border-outline-variant/30 select-all cursor-pointer transition-colors block text-center md:inline-block"
                >
                  TX-8829-XIC-2026
                </span>
              </div>
              <div className="text-left md:text-right w-full md:w-auto">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Monto Total Pagado</span>
                <div className="text-3xl font-bold text-primary">$2,850.00</div>
                <div className="flex items-center md:justify-end gap-1 text-secondary mt-1">
                  <span className="material-symbols-outlined text-[16px] fill-1">verified</span>
                  <span className="text-xs font-semibold">Protegido con Visa ···· 4242</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Card */}
          <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              ¿Qué sigue?
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold">01</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">Revisa tu correo para ver el comprobante de confirmación y tu recibo digital.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold">02</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">Sincroniza tu itinerario con tu calendario personal o Google Maps.</p>
              </li>
            </ul>
          </div>

          {/* Visual Travel Tip Card */}
          <div className="relative overflow-hidden border border-outline-variant rounded-xl group min-h-[160px]">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80')` }}
            />
            <div className="absolute bottom-4 left-4 z-20">
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Tip de Viaje</p>
              <p className="text-sm text-white font-medium mt-0.5">Lleva ropa abrigadora; hay neblina y clima templado-húmedo casi todo el año.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <button 
            onClick={() => { if (onNavigate) onNavigate('itinerario'); }}
            className="flex-1 bg-primary text-on-primary font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-outlined">event_note</span>
            Ver Itinerario
          </button>
          <button className="flex-1 bg-surface border border-outline text-primary font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-low active:scale-[0.98] transition-all cursor-pointer">
            <span className="material-symbols-outlined">download</span>
            Descargar Recibo
          </button>
          <button 
            onClick={() => { if (onNavigate) onNavigate('inicio'); }}
            className="flex-1 bg-transparent text-on-surface-variant font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container transition-colors active:scale-[0.98] transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Volver al Inicio
          </button>
        </div>
      </main>

    </div>
  );
}

export default BookingConfirmed;