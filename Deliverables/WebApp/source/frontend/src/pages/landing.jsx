import React from 'react';

function LandingPage({ onNavigate }) {
  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-secondary-container min-h-screen flex flex-col">
      <main className="pt-20 flex-grow flex flex-col">
        
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center scale-105 animate-[pulse_10s_infinite_alternate]" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1920&q=80')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-[1280px] mx-auto px-16 w-full">
            <div className="max-w-2xl text-on-primary">
              <h1 className="text-6xl font-bold mb-3 animate-fade-in-up leading-tight">
                Descubre Xicotepec, <span className="text-secondary-container">a tu Manera.</span>
              </h1>
              <p className="text-lg mb-12 text-on-primary-container leading-relaxed">
                La plataforma integral para descubrir el Pueblo Mágico de Xicotepec de Juárez, planificar tu recorrido y organizar tus gastos sin complicaciones. Vive la Sierra Norte de Puebla sin la fricción logística.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => onNavigate('register')}
                  className="bg-secondary-container text-primary font-semibold px-8 py-4 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer border-none"
                >
                  Comienza tu Viaje
                </button>
                <button 
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 border border-solid border-on-primary/30 text-on-primary font-semibold px-8 py-4 rounded-lg hover:bg-white/10 glass-effect active:scale-95 transition-all cursor-pointer bg-transparent"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Ver Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-12 bg-surface">
          <div className="max-w-[1280px] mx-auto px-16">
            <div className="text-center mb-12">
              <span className="text-secondary font-bold uppercase tracking-widest text-sm">Núcleo de la Plataforma</span>
              <h2 className="text-4xl font-bold mt-2">Diseñado para Exploradores</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="bg-surface-container-low p-6 rounded-xl border border-solid border-outline-variant/30 hover:border-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-6 group-hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-on-primary-fixed group-hover:text-primary">explore</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Descubrimiento Inteligente</h3>
                <p className="text-sm text-on-surface-variant">Encuentra los rincones escondidos de Xicotepec con recomendaciones adaptadas a tu estilo: cascadas, miradores, cafetales y rutas culturales cerca de ti.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-low p-6 rounded-xl border border-solid border-outline-variant/30 hover:border-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-6 group-hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-on-primary-fixed group-hover:text-primary">group</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Itinerarios Colaborativos</h3>
                <p className="text-sm text-on-surface-variant">Planifica con tus amigos o familia en tiempo real. Organiza traslados, hospedaje y actividades por el municipio en una sola línea de tiempo compartida.</p>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container-low p-6 rounded-xl border border-solid border-outline-variant/30 hover:border-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-6 group-hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-on-primary-fixed group-hover:text-primary">account_balance_wallet</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Billetera Inteligente</h3>
                <p className="text-sm text-on-surface-variant">Registra tus gastos en pesos mexicanos, divide cuentas y administra tu presupuesto sin esfuerzo. Liquidaciones instantáneas para viajes en grupo por la sierra.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-12 bg-surface-container-lowest">
          <div className="max-w-[1280px] mx-auto px-16">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="w-full lg:w-1/2 order-2 lg:order-1">
                <span className="text-secondary font-bold uppercase tracking-widest text-sm">La Experiencia</span>
                <h2 className="text-4xl font-bold mt-2 mb-6 leading-tight">Descubrimiento Visual con Planificación de Precisión</h2>
                <p className="text-lg text-on-surface-variant mb-6">
                  Nuestro mapa interactivo de Xicotepec de Juárez no es solo una vista; es un lienzo de planificación dinámico. Localiza cascadas, miradores y restaurantes, calcula tiempos de traslado y observa cómo tu itinerario cobra vida por el municipio.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-base">Alertas de clima y neblina para una ruta óptima por la sierra</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-base">Reservas integradas de hospedaje y transporte local</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-base">Mapas sin conexión para las zonas de senderismo más remotas</span>
                  </li>
                </ul>
                <button 
                  onClick={() => onNavigate('login')}
                  className="border-0 border-b-2 border-solid border-primary text-primary font-bold pb-1 hover:text-secondary hover:border-secondary transition-all bg-transparent cursor-pointer"
                >
                  Explora la Experiencia del Mapa
                </button>
              </div>
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                  <div 
                    className="aspect-video bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80')` }}
                  ></div>
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Community */}
        <section className="py-12 bg-surface">
          <div className="max-w-[1280px] mx-auto px-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-y border-solid border-outline-variant/30 py-6">
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold mb-1">25k+</p>
                <p className="text-xs text-on-surface-variant">Viajeros en Xicotepec</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">30+</p>
                <p className="text-xs text-on-surface-variant">Atractivos del Municipio</p>
              </div>
              <div className="text-center md:text-right">
                <div className="flex justify-center md:justify-end gap-1 text-secondary mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant">Planificador Mejor Valorado del Pueblo Mágico</p>
              </div>
            </div>

            {/* Marquee Slider */}
            <div className="mt-12 overflow-hidden relative w-full">
              <div className="flex gap-8 w-max animate-[marquee_20s_linear_infinite]">
                {['Cascada de Tlaxcalantongo', 'Cerro del Tabacal', 'Centro Ceremonial Xochipila', 'Museo Casa Carranza', 'Mirador Cruz Celestial'].map((dest, i) => (
                  <div key={i} className="flex items-center gap-4 bg-surface-container-high px-6 py-3 rounded-full">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    <span className="font-semibold text-sm">{dest}</span>
                  </div>
                ))}
                {/* Duplicado para el loop */}
                {['Cascada de Tlaxcalantongo', 'Cerro del Tabacal', 'Centro Ceremonial Xochipila', 'Museo Casa Carranza', 'Mirador Cruz Celestial'].map((dest, i) => (
                  <div key={`dup-${i}`} className="flex items-center gap-4 bg-surface-container-high px-6 py-3 rounded-full">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    <span className="font-semibold text-sm">{dest}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12">
          <div className="max-w-[1280px] mx-auto px-16">
            <div className="bg-primary rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container rounded-full blur-[100px]"></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-5xl font-bold text-on-primary mb-3">¿Listo para tu próxima aventura?</h2>
                <p className="text-base text-on-primary-container max-w-xl mx-auto mb-12">
                  Únete a miles de viajeros que ya están planificando de forma más inteligente, ahorrando más y explorando más profundo. Tu viaje comienza con un solo clic.
                </p>
                <button 
                  onClick={() => onNavigate('register')}
                  className="bg-secondary-container text-primary font-bold px-10 py-5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-xl cursor-pointer border-none"
                >
                  Comienza Gratis
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;