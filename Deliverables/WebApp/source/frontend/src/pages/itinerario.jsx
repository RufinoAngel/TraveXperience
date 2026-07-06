import React, { useState } from 'react';

const destinations = [
  {
    id: 1,
    title: 'Cascada de Tlaxcalantongo',
    desc: 'Cascada rodeada de vegetación, a 25 km del centro.',
    size: 'col-span-2 row-span-1',
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Cerro del Tabacal',
    desc: 'Mirador con la Virgen de Guadalupe monumental.',
    size: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    title: 'Centro Ceremonial Xochipila',
    desc: 'Peña sagrada y punto de rituales prehispánicos.',
    size: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 4,
    title: 'Museo Casa Carranza',
    desc: 'Historia viva de la Revolución Mexicana.',
    size: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1584285405429-136bf988e786?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 5,
    title: 'Ruta del Café',
    desc: 'Cafetales, tueste artesanal y degustación local.',
    size: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=500&q=80',
  },
];

const filters = ['#Naturaleza', '#Cultura', '#Aventura', '#Café', '#Sierra'];

const itineraryDays = [
  {
    day: 'Día 1',
    title: 'Llegada y Centro Histórico',
    active: true,
    events: [
      {
        time: '09:30 AM',
        title: 'Llegada a Xicotepec de Juárez',
        desc: 'Traslado privado desde la terminal de autobuses al hospedaje.',
        category: 'Traslado',
        icon: 'directions_bus',
        img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80',
      },
      {
        time: '01:00 PM',
        title: 'Comida en Restaurante Las Acamayas',
        desc: 'Acamayas al mojo de ajo y molotes de tinga en los portales del zócalo.',
        category: 'Comida',
        icon: 'restaurant',
        img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=200&q=80',
      },
      {
        time: '04:00 PM',
        title: 'Check-in en Posada del Café Xicotepec',
        desc: 'Habitación con vista a la sierra y aroma a café recién tostado.',
        category: 'Hospedaje',
        icon: 'hotel',
        img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80',
      },
    ],
  },
  {
    day: 'Día 2',
    title: 'Cascada de Tlaxcalantongo',
    active: false,
    events: [],
  },
  {
    day: 'Día 3',
    title: 'Ruta del Café y Xochipila',
    active: false,
    events: [],
  },
];

const categoryColors = {
  Traslado: 'bg-blue-100 text-blue-700',
  Comida: 'bg-amber-100 text-amber-700',
  Hospedaje: 'bg-emerald-100 text-emerald-700',
  Actividad: 'bg-purple-100 text-purple-700',
};

function AwayFromHomePlanner({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('#Luxury');
  const [activeDay, setActiveDay] = useState(0);

  const filteredDests = destinations.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col">

      {/* ── Page Hero ── */}
      <section className="relative pt-28 pb-10 px-6 md:px-16 bg-primary overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-secondary-container opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-container opacity-20 blur-2xl pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-secondary-container mb-4">
            <span className="material-symbols-outlined text-[14px]">explore</span>
            Tus Recorridos
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-on-primary mb-3 tracking-tight">
            Xicotepec de Juárez
          </h1>
          <p className="text-on-primary/60 text-base max-w-xl">
            Descubre los atractivos del Pueblo Mágico y arma tu itinerario perfecto en un solo lugar.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="flex-1 max-w-[1280px] w-full mx-auto px-6 md:px-16 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── LEFT: Destination Explorer ── */}
        <aside className="lg:col-span-5 flex flex-col gap-6">

          {/* Search */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">search</span>
            <input
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-2xl outline-none transition-all text-sm text-on-surface placeholder:text-outline"
              placeholder="¿A dónde quieres ir en Xicotepec?"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 gap-3 auto-rows-[180px]">
            {filteredDests.map((dest) => (
              <div
                key={dest.id}
                className={`${dest.size} group cursor-pointer relative overflow-hidden rounded-2xl shadow-md border border-outline-variant/20 hover:-translate-y-1 transition-transform duration-300`}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={dest.title}
                  src={dest.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-on-primary pr-4">
                  <h3 className="text-sm font-bold leading-tight">{dest.title}</h3>
                  <p className="text-xs opacity-70 mt-0.5 line-clamp-1">{dest.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add trip CTA */}
          <button
            onClick={() => { if (onNavigate) onNavigate('mapa'); }}
            className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-outline-variant/60 rounded-2xl text-on-surface-variant text-sm font-semibold hover:border-primary hover:text-primary transition-all cursor-pointer bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
            Agregar Nuevo Destino
          </button>
        </aside>

        {/* ── RIGHT: Itinerary Builder ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Trip Header Card */}
          <div className="bg-primary-container rounded-2xl p-6 flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-on-primary-container/60 uppercase tracking-widest mb-1 block">Viaje Actual</span>
              <h2 className="text-2xl font-bold text-on-primary-container tracking-tight">Escapada Serrana</h2>
              <div className="flex items-center gap-4 mt-3 text-xs text-on-primary-container/70 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  12 – 15 Dic, 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">group</span>
                  2 Viajeros
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">payments</span>
                  $2,850 MXN presupuesto
                </span>
              </div>
            </div>
            <button
              onClick={() => { if (onNavigate) onNavigate('checkout'); }}
              className="flex-shrink-0 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              Reservar Ahora
            </button>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {itineraryDays.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeDay === i
                    ? 'bg-secondary-container text-on-secondary-container border-secondary-container shadow-sm'
                    : 'bg-surface-container border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {d.day}: {d.title}
              </button>
            ))}
            <button className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border border-dashed border-outline-variant/60 text-outline hover:border-primary hover:text-primary transition-all cursor-pointer bg-transparent">
              + Agregar Día
            </button>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-4">
            {itineraryDays[activeDay].events.length > 0 ? (
              <div className="relative pl-6 ml-2 border-l-2 border-primary/15 space-y-4">
                {itineraryDays[activeDay].events.map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* dot */}
                    <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-primary border-4 border-surface z-10" />
                    {/* card */}
                    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex gap-4 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img className="w-full h-full object-cover" alt={event.title} src={event.img} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-outline">{event.time}</span>
                          <button className="material-symbols-outlined text-outline hover:text-primary transition-colors text-[18px] border-none bg-transparent cursor-pointer p-0">more_horiz</button>
                        </div>
                        <h5 className="text-sm font-bold text-primary leading-snug">{event.title}</h5>
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{event.desc}</p>
                        <span className={`inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${categoryColors[event.category] || 'bg-surface-container text-on-surface'}`}>
                          <span className="material-symbols-outlined text-[11px]">{event.icon}</span>
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Add event button */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full bg-outline-variant border-4 border-surface z-10" />
                  <button
                    onClick={() => { if (onNavigate) onNavigate('mapa'); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-surface-container border-2 border-dashed border-outline-variant/60 rounded-2xl text-on-surface-variant text-sm font-semibold hover:border-primary hover:text-primary transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Agregar evento a este día
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container rounded-2xl border border-outline-variant/40 p-12 flex flex-col items-center justify-center text-center gap-3">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">event_note</span>
                <p className="font-bold text-on-surface-variant">Aún no hay eventos planeados</p>
                <p className="text-sm text-outline">Comienza a agregar actividades, restaurantes y hospedajes para {itineraryDays[activeDay].title}</p>
                <button
                  onClick={() => { if (onNavigate) onNavigate('mapa'); }}
                  className="mt-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all cursor-pointer"
                >
                  Explorar en el Mapa
                </button>
              </div>
            )}
          </div>

          {/* Budget Summary */}
          <div className="bg-primary rounded-2xl p-5 flex items-center justify-between mt-2">
            <div>
              <span className="text-on-primary/50 text-[10px] font-bold uppercase tracking-wider block mb-1">Presupuesto Estimado</span>
              <div className="text-3xl font-bold text-on-primary">$2,850.00 MXN</div>
              <div className="flex gap-4 mt-2 text-xs text-on-primary/60 font-medium">
                <span>Transporte · $600</span>
                <span>Hospedaje · $1,500</span>
                <span>Actividades · $750</span>
              </div>
            </div>
            <button
              onClick={() => { if (onNavigate) onNavigate('settings', { tab: 'Payments' }); }}
              className="bg-secondary-container text-on-secondary-container h-12 w-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform border-none cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined">payments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AwayFromHomePlanner;