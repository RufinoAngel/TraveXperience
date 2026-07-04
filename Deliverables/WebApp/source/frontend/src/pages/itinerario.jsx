import React, { useState } from 'react';

function AwayFromHomePlanner() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('#Luxury');

  // Datos mockeados de destinos siguiendo la estética bento
  const destinations = [
    {
      id: 1,
      title: 'Amalfi Coast, Italy',
      desc: 'Dramatic cliffs and coastal elegance.',
      size: 'col-span-2 aspect-[16/9]',
      image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'Kyoto, Japan',
      desc: 'Tradition and serene autumn landscapes.',
      size: 'col-span-1 aspect-square',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 3,
      title: 'Santorini, Greece',
      desc: 'Minimal architecture and deep blue seas.',
      size: 'col-span-1 aspect-square',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=500&q=80'
    }
  ];

  const filters = ['#Luxury', '#Beach', '#Adventure', '#Cultural', '#Mountains'];

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container antialiased min-h-screen flex flex-col">

      {/* Main Ecosistema */}
      <main className="pt-20 flex flex-1 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Section: Destination Search & Filters */}
        <section className="w-full md:w-1/2 bg-surface flex flex-col border-r border-outline-variant/60 h-full overflow-hidden">
          <div className="p-8 pb-4">
            <h1 className="text-3xl font-bold font-headline-lg text-primary mb-2 tracking-tight">Away From Home</h1>
            <p className="text-on-surface-variant text-sm mb-6 font-medium">Discover your next escape with curated luxury destinations.</p>
            
            {/* Search Component */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
              <input 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all text-sm text-on-surface" 
                placeholder="Where do you want to go?" 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar scrollbar-none">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border-none cursor-pointer ${
                    activeFilter === filter 
                      ? 'bg-secondary-container text-on-secondary-container shadow-sm' 
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Results - Bento Grid */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              {destinations
                .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((dest) => (
                  <div key={dest.id} className={`${dest.size} group cursor-pointer relative overflow-hidden rounded-2xl shadow-sm border border-outline-variant/20`}>
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={dest.title} src={dest.image} />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
                    <div className="absolute bottom-5 left-5 text-on-primary pr-4">
                      <h3 className="text-lg font-bold font-headline-md">{dest.title}</h3>
                      {dest.desc && <p className="text-xs opacity-80 font-medium mt-0.5 line-clamp-1">{dest.desc}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Right Section: Itinerary Builder */}
        <section className="hidden md:flex flex-col w-1/2 bg-surface-container-low h-full overflow-hidden">
          <div className="p-8 flex justify-between items-end border-b border-outline-variant/50 bg-surface-bright">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Your Journey</span>
              <h2 className="text-2xl font-bold font-headline-lg text-primary tracking-tight">Mediterranean Dream</h2>
            </div>
            <button className="bg-secondary-container text-on-secondary-container px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 border-none cursor-pointer shadow-sm active:scale-[0.98]">
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Event</span>
            </button>
          </div>

          {/* Timeline View */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            
            {/* Day 1 */}
            <div className="relative itinerary-line pl-6 border-l-2 border-primary/10 ml-2 space-y-4">
              <div className="flex items-center gap-3 mb-4 -ml-[31px]">
                <div className="w-4 h-4 rounded-full bg-primary border-4 border-surface-container-low z-10"></div>
                <h4 className="text-base font-bold font-headline-md text-primary">Day 1: Arrival & Coastal Wander</h4>
              </div>

              {/* Itinerary Card 1 */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60 hover:shadow-md transition-all flex gap-4 group hover:-translate-y-0.5 duration-300 cursor-pointer">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                  <img className="w-full h-full object-cover" alt="Flight" src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-xs font-semibold text-outline">09:30 AM</span>
                    <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors text-[18px]">more_horiz</span>
                  </div>
                  <h5 className="text-sm font-bold text-primary">Landing at Naples International</h5>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">Private transfer arranged to Positano villa.</p>
                </div>
              </div>

              {/* Itinerary Card 2 */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60 hover:shadow-md transition-all flex gap-4 group hover:-translate-y-0.5 duration-300 cursor-pointer">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                  <img className="w-full h-full object-cover" alt="Dining" src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-xs font-semibold text-outline">01:00 PM</span>
                    <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors text-[18px]">more_horiz</span>
                  </div>
                  <h5 className="text-sm font-bold text-primary">Lunch at Da Adolfo</h5>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">Classic seafood pasta by the private beach.</p>
                  <div className="mt-2.5">
                    <span className="bg-surface-container-high px-2.5 py-1 rounded-md text-[10px] font-bold text-primary flex items-center gap-1 w-max">
                      <span className="material-symbols-outlined text-[12px]">restaurant</span> Dining
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Day 2 */}
            <div className="relative pl-6 border-l-2 border-primary/10 ml-2 opacity-60">
              <div className="flex items-center gap-3 mb-4 -ml-[31px]">
                <div className="w-4 h-4 rounded-full bg-outline border-4 border-surface-container-low z-10"></div>
                <h4 className="text-base font-bold font-headline-md text-on-surface-variant">Day 2: Capri Boat Excursion</h4>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-surface-container-high animate-pulse"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-1/4 bg-surface-container-high rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-surface-container-high rounded animate-pulse"></div>
                  <div className="h-3 w-3/4 bg-surface-container-high rounded animate-pulse"></div>
                </div>
              </div>
            </div>

          </div>

          {/* Total Budget Summary Sticky Barra */}
          <div className="p-6 bg-primary text-on-primary border-t border-white/5">
            <div className="flex justify-between items-center max-w-md ml-auto">
              <div>
                <span className="text-on-primary/60 text-xs font-bold uppercase tracking-wider">Estimated Budget</span>
                <div className="text-2xl font-bold font-headline-md mt-0.5">€4,250.00</div>
              </div>
              <button className="bg-secondary-container text-on-secondary-container h-12 w-12 rounded-full flex items-center justify-center hover:scale-105 transition-transform border-none cursor-pointer shadow-md">
                <span className="material-symbols-outlined text-xl">payments</span>
              </button>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

export default AwayFromHomePlanner;