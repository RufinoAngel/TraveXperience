import React, { useState } from 'react';

const destinations = [
  {
    id: 1,
    title: 'Amalfi Coast, Italy',
    desc: 'Dramatic cliffs and coastal elegance.',
    size: 'col-span-2 row-span-1',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Kyoto, Japan',
    desc: 'Tradition and serene autumn landscapes.',
    size: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    title: 'Santorini, Greece',
    desc: 'Minimal architecture and deep blue seas.',
    size: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 4,
    title: 'Patagonia, Argentina',
    desc: 'Wild landscapes and untouched wilderness.',
    size: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 5,
    title: 'Maldives',
    desc: 'Crystal lagoons and overwater luxury.',
    size: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=500&q=80',
  },
];

const filters = ['#Luxury', '#Beach', '#Adventure', '#Cultural', '#Mountains'];

const itineraryDays = [
  {
    day: 'Day 1',
    title: 'Arrival & Coastal Wander',
    active: true,
    events: [
      {
        time: '09:30 AM',
        title: 'Landing at Naples International',
        desc: 'Private transfer arranged to Positano villa.',
        category: 'Transport',
        icon: 'flight_land',
        img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80',
      },
      {
        time: '01:00 PM',
        title: 'Lunch at Da Adolfo',
        desc: 'Classic seafood pasta by the private beach.',
        category: 'Dining',
        icon: 'restaurant',
        img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
      },
      {
        time: '04:00 PM',
        title: 'Check-in at Le Sirenuse',
        desc: 'Breathtaking cliffside suite overlooking the Tyrrhenian Sea.',
        category: 'Hotel',
        icon: 'hotel',
        img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80',
      },
    ],
  },
  {
    day: 'Day 2',
    title: 'Capri Boat Excursion',
    active: false,
    events: [],
  },
  {
    day: 'Day 3',
    title: 'Ravello & Wine Tasting',
    active: false,
    events: [],
  },
];

const categoryColors = {
  Transport: 'bg-blue-100 text-blue-700',
  Dining: 'bg-amber-100 text-amber-700',
  Hotel: 'bg-emerald-100 text-emerald-700',
  Activity: 'bg-purple-100 text-purple-700',
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
            Your Journeys
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-on-primary mb-3 tracking-tight">
            Away From Home
          </h1>
          <p className="text-on-primary/60 text-base max-w-xl">
            Discover curated luxury destinations and build your perfect itinerary in one place.
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
              placeholder="Where do you want to go?"
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
            Add New Destination
          </button>
        </aside>

        {/* ── RIGHT: Itinerary Builder ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Trip Header Card */}
          <div className="bg-primary-container rounded-2xl p-6 flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-on-primary-container/60 uppercase tracking-widest mb-1 block">Current Trip</span>
              <h2 className="text-2xl font-bold text-on-primary-container tracking-tight">Mediterranean Dream</h2>
              <div className="flex items-center gap-4 mt-3 text-xs text-on-primary-container/70 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  Jul 14 – Jul 21, 2025
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">group</span>
                  2 Travelers
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">payments</span>
                  €4,250 budget
                </span>
              </div>
            </div>
            <button
              onClick={() => { if (onNavigate) onNavigate('checkout'); }}
              className="flex-shrink-0 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              Book Now
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
              + Add Day
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
                    Add event to this day
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container rounded-2xl border border-outline-variant/40 p-12 flex flex-col items-center justify-center text-center gap-3">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">event_note</span>
                <p className="font-bold text-on-surface-variant">No events planned yet</p>
                <p className="text-sm text-outline">Start adding activities, restaurants, and hotels for {itineraryDays[activeDay].title}</p>
                <button
                  onClick={() => { if (onNavigate) onNavigate('mapa'); }}
                  className="mt-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all cursor-pointer"
                >
                  Explore on Map
                </button>
              </div>
            )}
          </div>

          {/* Budget Summary */}
          <div className="bg-primary rounded-2xl p-5 flex items-center justify-between mt-2">
            <div>
              <span className="text-on-primary/50 text-[10px] font-bold uppercase tracking-wider block mb-1">Estimated Budget</span>
              <div className="text-3xl font-bold text-on-primary">€4,250.00</div>
              <div className="flex gap-4 mt-2 text-xs text-on-primary/60 font-medium">
                <span>Flights · €1,200</span>
                <span>Hotels · €2,100</span>
                <span>Activities · €950</span>
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