import React from 'react';

function App() {
  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-secondary-container min-h-screen">

      <main className="pt-20">
        
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center scale-105 animate-[pulse_10s_infinite_alternate]" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-[1280px] mx-auto px-16 w-full">
            <div className="max-w-2xl text-on-primary">
              <h1 className="text-6xl font-bold mb-3 animate-fade-in-up leading-tight">
                Travel Smarter, <span class="text-secondary-container">Together.</span>
              </h1>
              <p className="text-lg mb-12 text-on-primary-container leading-relaxed">
                The all-in-one platform for intelligent discovery, collaborative planning, and seamless expense management. Experience the world without the logistics friction.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-secondary-container text-primary font-semibold px-8 py-4 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Start Your Journey
                </button>
                <button className="flex items-center gap-2 border border-on-primary/30 text-on-primary font-semibold px-8 py-4 rounded-lg hover:bg-white/10 glass-effect active:scale-95 transition-all">
                  <span className="material-symbols-outlined">play_circle</span>
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-12 bg-surface">
          <div className="max-w-[1280px] mx-auto px-16">
            <div className="text-center mb-12">
              <span className="text-secondary font-bold uppercase tracking-widest text-sm">Platform Core</span>
              <h2 className="text-4xl font-bold mt-2">Engineered for Explorers</h2>
            </div>
            <div className="magazine-grid">
              
              {/* Card 1 */}
              <div className="col-span-12 md:col-span-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 hover:border-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-6 group-hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-on-primary-fixed group-hover:text-primary">explore</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Discovery</h3>
                <p className="text-sm text-on-surface-variant">Find hidden gems with AI-powered recommendations tailored to your style. Our engine learns your preferences to suggest off-beat paths and local favorites.</p>
              </div>

              {/* Card 2 */}
              <div className="col-span-12 md:col-span-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 hover:border-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-6 group-hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-on-primary-fixed group-hover:text-primary">group</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Collaborative Itineraries</h3>
                <p className="text-sm text-on-surface-variant">Plan with friends in real-time. Sync flights, stays, and activities in one shared timeline that keeps everyone on the same page, literally.</p>
              </div>

              {/* Card 3 */}
              <div className="col-span-12 md:col-span-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 hover:border-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-6 group-hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-on-primary-fixed group-hover:text-primary">account_balance_wallet</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Wallet</h3>
                <p className="text-sm text-on-surface-variant">Track expenses, split bills, and manage your travel budget effortlessly. Automated currency conversion and instant settling for group trips.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-12 bg-surface-container-lowest">
          <div className="max-w-[1280px] mx-auto px-16">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="w-full lg:w-1/2 order-2 lg:order-1">
                <span className="text-secondary font-bold uppercase tracking-widest text-sm">The Experience</span>
                <h2 className="text-4xl font-bold mt-2 mb-6 leading-tight">Visual Discovery Meets Precision Planning</h2>
                <p className="text-lg text-on-surface-variant mb-6">
                  Our interactive map isn't just a view; it's a dynamic planning canvas. Drag and drop destinations, visualize travel times, and see your itinerary come to life geographically. 
                </p>
                <ul className="space-y-4 mb-8">
                  <li class="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-base">Live weather overlays for optimal routing</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-base">Integrated booking for stays and transport</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-base">Offline map sync for remote adventures</span>
                  </li>
                </ul>
                <button className="border-b-2 border-primary text-primary font-bold pb-1 hover:text-secondary hover:border-secondary transition-all">
                  Explore the Map Experience
                </button>
              </div>
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                  <div 
                    className="aspect-video bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80')` }}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-y border-outline-variant/30 py-6">
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold mb-1">500k+</p>
                <p className="text-xs text-on-surface-variant">Global Travelers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">120+</p>
                <p className="text-xs text-on-surface-variant">Countries Explored</p>
              </div>
              <div className="text-center md:text-right">
                <div className="flex justify-center md:justify-end gap-1 text-secondary mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant">Top Rated Planner</p>
              </div>
            </div>

            {/* Marquee Slider */}
            <div className="mt-12 overflow-hidden relative w-full">
              <div className="flex gap-8 w-max animate-horizontal-scroll">
                {['Santorini, Greece', 'Kyoto, Japan', 'Reykjavik, Iceland', 'Amalfi Coast, Italy', 'Patagonia, Chile'].map((dest, i) => (
                  <div key={i} className="flex items-center gap-4 bg-surface-container-high px-6 py-3 rounded-full">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    <span className="font-semibold text-sm">{dest}</span>
                  </div>
                ))}
                {/* Duplicados para ciclo infinito suave */}
                {['Santorini, Greece', 'Kyoto, Japan', 'Reykjavik, Iceland', 'Amalfi Coast, Italy', 'Patagonia, Chile'].map((dest, i) => (
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
                <h2 className="text-5xl font-bold text-on-primary mb-3">Ready for your next adventure?</h2>
                <p className="text-base text-on-primary-container max-w-xl mx-auto mb-12">
                  Join thousands of travelers who are already planning smarter, saving more, and exploring deeper. Your journey begins with a single click.
                </p>
                <button className="bg-secondary-container text-primary font-bold px-10 py-5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-xl">
                  Get Started for Free
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;