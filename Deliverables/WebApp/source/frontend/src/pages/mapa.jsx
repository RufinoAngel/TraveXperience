import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Footer from '../components/footer';

// Fix leaflet default icon (broken in bundled environments)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored marker factory
function createIcon(color = '#041627') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
      <filter id="drop" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
      <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 30 18 30S36 31.5 36 18C36 8.059 27.941 0 18 0z"
            fill="${color}" filter="url(#drop)"/>
      <circle cx="18" cy="18" r="8" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -50],
  });
}

const iconPrimary   = createIcon('#041627');
const iconSecondary = createIcon('#775a00');
const iconTertiary  = createIcon('#38260b');

const places = [
  {
    id: 1,
    title: 'Restaurante Las Acamayas',
    type: 'Cocina Regional',
    distance: '0.2 km',
    rating: '4.9',
    icon: 'restaurant',
    latlng: [20.2820, -97.9495],
    markerIcon: iconSecondary,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80',
    desc: 'Acamayas al mojo de ajo y molotes de tinga en pleno centro de Xicotepec.',
    category: 'Comida',
  },
  {
    id: 2,
    title: 'Museo Casa Carranza',
    type: 'Cultura',
    distance: '1.1 km',
    rating: '4.7',
    icon: 'museum',
    latlng: [20.2812, -97.9483],
    markerIcon: iconPrimary,
    image: 'https://images.unsplash.com/photo-1584285405429-136bf988e786?auto=format&fit=crop&w=400&q=80',
    desc: 'Casa donde fue velado Venustiano Carranza tras su asesinato en 1920.',
    category: 'Cultura',
  },
  {
    id: 3,
    title: 'La Cantina del Portal',
    type: 'Vida Nocturna',
    distance: '0.8 km',
    rating: '4.6',
    icon: 'local_bar',
    latlng: [20.2828, -97.9502],
    markerIcon: iconTertiary,
    image: 'https://images.unsplash.com/photo-1536489885071-87983c3e2859?auto=format&fit=crop&w=400&q=80',
    desc: 'Cantina tradicional con bebidas artesanales de la región y ambiente local.',
    category: 'Vida Nocturna',
  },
  {
    id: 4,
    title: 'Virgen de Guadalupe, Cerro El Tabacal',
    type: 'Mirador',
    distance: '2.4 km',
    rating: '4.9',
    icon: 'church',
    latlng: [20.2775, -97.9525],
    markerIcon: iconPrimary,
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80',
    desc: 'Escultura de 20 metros de altura con la vista más completa del Pueblo Mágico.',
    category: 'Mirador',
  },
  {
    id: 5,
    title: 'Portal del Café',
    type: 'Cafetería',
    distance: '0.1 km',
    rating: '4.6',
    icon: 'local_cafe',
    latlng: [20.2823, -97.9498],
    markerIcon: iconSecondary,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80',
    desc: 'Los históricos portales del zócalo donde se sirve el reconocido café de Xicotepec.',
    category: 'Café',
  },
];

const categoryIcons = {
  Comida: 'restaurant',
  Cultura: 'museum',
  'Vida Nocturna': 'local_bar',
  Mirador: 'account_balance',
  Café: 'local_cafe',
};

const categoryColors = {
  Comida: 'bg-amber-100 text-amber-700',
  Cultura: 'bg-blue-100 text-blue-700',
  'Vida Nocturna': 'bg-purple-100 text-purple-700',
  Mirador: 'bg-emerald-100 text-emerald-700',
  Café: 'bg-orange-100 text-orange-700',
};

// Component that flies the map to a selected place
function FlyToMarker({ place }) {
  const map = useMap();
  useEffect(() => {
    if (place) {
      map.flyTo(place.latlng, 16, { duration: 1.2 });
    }
  }, [place, map]);
  return null;
}

function InteractiveMap({ onNavigate }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todo');
  const [mapStyle, setMapStyle] = useState('streets');

  const filters = ['Todo', 'Comida', 'Cultura', 'Vida Nocturna', 'Mirador', 'Café'];

  const filteredPlaces = places.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'Todo' || p.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const tileLayers = {
    streets: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics',
    },
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col">

      {/* Área del mapa: ocupa la altura visible bajo el header fijo (20 = h-20 del Header) */}
      <div className="flex h-[calc(100vh-5rem)] pt-20 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <aside className="w-80 bg-surface/95 backdrop-blur-xl border-r border-outline-variant/40 flex flex-col shadow-lg z-30 flex-shrink-0">

          {/* Sidebar Header */}
          <div className="p-5 border-b border-outline-variant/30 bg-primary">
            <h1 className="text-lg font-bold text-on-primary">Explorar Xicotepec de Juárez</h1>
            <p className="text-xs text-on-primary/60 flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              {filteredPlaces.length} experiencias curadas
            </p>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Buscar lugares..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                  activeFilter === f
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Place list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                  selectedPlace?.id === place.id
                    ? 'border-primary shadow-md ring-2 ring-primary/20'
                    : 'border-outline-variant/40 bg-surface'
                }`}
              >
                <div className="relative h-32">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={place.title} src={place.image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-[13px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="text-xs font-bold text-primary">{place.rating}</span>
                  </div>
                  <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${categoryColors[place.category]}`}>
                    {place.category}
                  </span>
                </div>
                <div className="p-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-primary">{place.title}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{place.type} · {place.distance}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (onNavigate) onNavigate('hotel-detail', { hotel: place }); }}
                    className="flex-shrink-0 bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-90 cursor-pointer border-none"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Map ── */}
        <main className="flex-1 relative">
          {/* Map style switcher */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-white/50">
            {Object.keys(tileLayers).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer border-none ${
                  mapStyle === style
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {style === 'streets' ? 'Calles' : style === 'dark' ? 'Oscuro' : 'Satélite'}
              </button>
            ))}
          </div>

          <MapContainer
            center={[20.2822, -97.9497]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              key={mapStyle}
              url={tileLayers[mapStyle].url}
              attribution={tileLayers[mapStyle].attribution}
              maxZoom={20}
            />

            {selectedPlace && <FlyToMarker place={selectedPlace} />}

            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                position={place.latlng}
                icon={place.markerIcon}
                eventHandlers={{ click: () => setSelectedPlace(place) }}
              >
                <Popup>
                  <div className="font-sans" style={{ minWidth: 160 }}>
                    <img src={place.image} alt={place.title} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    <strong style={{ fontSize: 13, color: '#041627' }}>{place.title}</strong>
                    <p style={{ fontSize: 11, color: '#44474c', marginTop: 2 }}>{place.type} · {place.distance}</p>
                    <p style={{ fontSize: 11, color: '#44474c', marginTop: 4 }}>{place.desc}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Zoom controls */}
          <div className="absolute right-5 bottom-24 flex flex-col gap-2 z-[999]">
            <button
              onClick={() => document.querySelector('.leaflet-control-zoom-in')?.click()}
              className="w-10 h-10 bg-white text-primary rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/20"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <button
              onClick={() => document.querySelector('.leaflet-control-zoom-out')?.click()}
              className="w-10 h-10 bg-white text-primary rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/20"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>

          {/* Selected place bottom card */}
          <div
            className={`absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-md z-[999] transition-all duration-300 px-4 ${
              selectedPlace ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-8 opacity-0 pointer-events-none'
            }`}
          >
            {selectedPlace && (
              <div className="bg-primary text-on-primary rounded-2xl shadow-2xl p-4 flex items-center gap-4 border border-white/10 relative">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" alt={selectedPlace.title} src={selectedPlace.image} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-on-primary truncate">{selectedPlace.title}</h4>
                  <p className="text-xs text-on-primary/60 mt-0.5 line-clamp-2">{selectedPlace.desc}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="material-symbols-outlined text-secondary-container text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="text-xs font-bold text-on-primary/80">{selectedPlace.rating}</span>
                    <span className="text-xs text-on-primary/40">·</span>
                    <span className="text-xs text-on-primary/60">{selectedPlace.distance}</span>
                  </div>
                </div>
                <button
                  onClick={() => { if (onNavigate) onNavigate('hotel-detail', { hotel: selectedPlace }); }}
                  className="flex-shrink-0 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer border-none"
                >
                  Explorar
                </button>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white text-primary rounded-full shadow-lg flex items-center justify-center border-none cursor-pointer hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default InteractiveMap;