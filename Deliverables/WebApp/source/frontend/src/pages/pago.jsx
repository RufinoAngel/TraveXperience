import React, { useState } from 'react';

function Checkout({ onNavigate, hotel }) {
  const [paymentMethod, setPaymentMethod] = useState('saved-card');
  const [billingSameAsTraveler, setBillingSameAsTraveler] = useState(true);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const handleCompleteBooking = () => {
    setStatus('loading');
    
    // Simulación del proceso de pago de lujo
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('payment-success');
        }
        setStatus('idle');
      }, 800);
    }, 1800);
  };

  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-secondary-container min-h-screen">

      {/* Main Container */}
      <main className="pt-24 pb-20 px-6 md:px-16 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Payment & Billing */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Section Header */}
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Checkout</h1>
              <p className="text-base text-on-surface-variant">Revisa los detalles de tu viaje y completa tu pago seguro.</p>
            </div>

            {/* Express Checkout */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/50 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-secondary">bolt</span>
                Pago Exprés
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined">apple</span>
                  Apple Pay
                </button>
                <button className="flex items-center justify-center gap-2 py-4 border border-outline rounded-lg font-semibold hover:bg-surface-container-low transition-colors bg-transparent">
                  <span className="material-symbols-outlined text-secondary">google</span>
                  Google Pay
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-primary">Método de Pago</h2>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Paso 2 de 3</span>
              </div>

              {/* Saved Cards */}
              <div className="space-y-4 mb-8">
                <label 
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'saved-card' 
                      ? 'border-secondary bg-secondary/5' 
                      : 'border-outline-variant/40 bg-transparent'
                  }`}
                  onClick={() => setPaymentMethod('saved-card')}
                >
                  <input 
                    checked={paymentMethod === 'saved-card'} 
                    onChange={() => setPaymentMethod('saved-card')}
                    className="text-secondary focus:ring-secondary mr-4" 
                    name="payment" 
                    type="radio"
                  />
                  <div className="flex items-center gap-4 flex-1">
                    <span className="material-symbols-outlined text-secondary text-[32px]">credit_card</span>
                    <div>
                      <p className="font-semibold text-primary">•••• •••• •••• 4242</p>
                      <p className="text-xs text-on-surface-variant">Visa | Expira 12/26</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* New Card Form */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-outline-variant/40 flex-1"></div>
                  <span className="text-xs font-bold text-on-surface-variant/70 px-4 tracking-wider">O PAGA CON OTRA TARJETA</span>
                  <div className="h-px bg-outline-variant/40 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2">Nombre del Titular</label>
                    <input className="w-full bg-surface p-4 rounded-lg border border-transparent focus:border-primary focus:bg-white transition-all outline-none" placeholder="Julian Casablancas" type="text" />
                  </div>
                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2">Número de Tarjeta</label>
                    <div className="relative">
                      <input className="w-full bg-surface p-4 rounded-lg border border-transparent focus:border-primary focus:bg-white transition-all pr-12 outline-none" placeholder="0000 0000 0000 0000" type="text" />
                      <span className="material-symbols-outlined absolute right-4 top-4 text-outline text-[20px]">lock</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2">Fecha de Expiración</label>
                    <input className="w-full bg-surface p-4 rounded-lg border border-transparent focus:border-primary focus:bg-white transition-all outline-none" placeholder="MM/YY" type="text" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2">CVC / CVV</label>
                    <input className="w-full bg-surface p-4 rounded-lg border border-transparent focus:border-primary focus:bg-white transition-all outline-none" placeholder="•••" type="text" />
                  </div>
                </div>
              </div>

              {/* Billing Details Toggle */}
              <div className="mt-8 pt-8 border-t border-outline-variant/30">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    checked={billingSameAsTraveler} 
                    onChange={(e) => setBillingSameAsTraveler(e.target.checked)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" 
                    type="checkbox"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    La dirección de facturación es la misma que la del viajero
                  </span>
                </label>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-between gap-6 py-4 px-2 opacity-60">
              <div className="flex items-center gap-6 text-sm font-semibold text-on-surface-variant">
                <span>🔒 Certificado SSL de 256 bits</span>
                <span>💳 Cumplimiento PCI-DSS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Trip Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                
                {/* Header / Hero Image */}
                <div className="h-40 bg-cover bg-center relative bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80')]">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <p className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-1">Viaje a París</p>
                    <h3 className="text-white font-bold text-lg">{hotel ? hotel.title : 'Verano en la Ciudad de la Luz'}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Resumen del Pedido</h4>
                    
                    {/* Service Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-primary">{hotel ? hotel.title : 'Le Meurice Luxury Suite'}</p>
                          <p className="text-xs text-on-surface-variant">5 noches, 2 huéspedes</p>
                        </div>
                        <p className="text-sm font-medium text-primary">$4,250.00</p>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-primary">Air France - Clase Ejecutiva</p>
                          <p className="text-xs text-on-surface-variant">NYC (JFK) ↔ París (CDG)</p>
                        </div>
                        <p className="text-sm font-medium text-primary">$2,840.00</p>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-primary">Experiencias Exclusivas</p>
                          <p className="text-xs text-on-surface-variant">Louvre Privado, Cena en Crucero</p>
                        </div>
                        <p className="text-sm font-medium text-primary">$1,150.00</p>
                      </div>
                    </div>

                    <div className="h-px bg-outline-variant/30 my-4"></div>

                    {/* Fees & Taxes */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Impuestos y tasas</span>
                        <span className="font-medium text-primary">$642.50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Tarifa de reserva</span>
                        <span className="font-bold text-secondary">Gratis</span>
                      </div>
                    </div>

                    <div className="bg-surface-container p-4 rounded-lg my-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">Total</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold block text-primary">
                            {hotel && hotel.price ? `$${hotel.price.toLocaleString()}` : '$8,882.50'}
                          </span>
                          <span className="text-xs text-on-surface-variant">Impuestos incluidos</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                      onClick={handleCompleteBooking}
                      disabled={status === 'loading'}
                      className="w-full bg-primary text-on-primary py-5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70"
                    >
                      {status === 'idle' && (
                        <>
                          Completar Reserva
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                      )}
                      {status === 'loading' && (
                        <>
                          <span className="animate-spin material-symbols-outlined">progress_activity</span>
                          Procesando Pago...
                        </>
                      )}
                      {status === 'success' && '¡Reserva Completada!'}
                    </button>

                    <p className="text-center text-[11px] text-on-surface-variant mt-4 leading-normal">
                      Al hacer clic, aceptas nuestros <a className="underline hover:text-primary" href="#">Términos de Servicio</a> y <a className="underline hover:text-primary" href="#">Política de Privacidad</a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Assistance Card */}
              <div className="bg-secondary-container text-primary p-6 rounded-xl relative overflow-hidden shadow-sm">
                <div className="relative z-10">
                  <h5 className="font-bold text-lg mb-2 text-primary">¿Necesitas Ayuda?</h5>
                  <p className="text-sm opacity-90 mb-4 max-w-[85%]">Nuestro servicio de Concierge está disponible 24/7 para asistirte con tu reserva.</p>
                  <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-xs hover:bg-opacity-90 transition-colors">
                    Contactar Soporte
                  </button>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-primary/5 text-[120px] select-none pointer-events-none">
                  support_agent
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Feedback Overlay */}
      {status === 'success' && (
        <div className="fixed inset-0 z-[60] bg-primary/40 backdrop-blur-md flex items-center justify-center transition-all duration-500 animate-fade-in">
          <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md mx-4 transform transition-transform duration-500 scale-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">¡Reserva Confirmada!</h2>
            <p className="text-on-surface-variant mb-8 text-sm">
              ¡Prepara tus maletas! Tu itinerario completo para París ha sido enviado a tu correo electrónico.
            </p>
            <button 
              className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold w-full transition-all active:scale-[0.98]" 
              onClick={() => setStatus('idle')}
            >
              Ir a Mis Viajes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;