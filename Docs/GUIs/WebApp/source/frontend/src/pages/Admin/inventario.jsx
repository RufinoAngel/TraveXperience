import React, { useState } from 'react';
import AdminLayout from '../../components/adminLayout.jsx';

const SERVICES = [
  {
    id: 1,
    name: 'Astraea Boutique Hotel',
    location: 'Oia, Greece',
    category: 'Hotel',
    status: 'Approved',
    price: '€450',
    priceUnit: '/night',
    availability: '85% Booked',
    availabilityPct: 85,
    img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 2,
    name: 'Kyoto Culinary Masterclass',
    location: 'Kyoto, Japan',
    category: 'Experience',
    status: 'Pending',
    price: '¥22,000',
    priceUnit: '/person',
    availability: 'Limited Slots',
    availabilityPct: 20,
    img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 3,
    name: 'Amalfi Private Yacht Charter',
    location: 'Positano, Italy',
    category: 'Transport',
    status: 'Flagged',
    price: '€1,200',
    priceUnit: '/day',
    availability: 'Maintenance',
    availabilityPct: 0,
    img: 'https://images.unsplash.com/photo-1533254095007-56b53e3ba8ba?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 4,
    name: 'White Peak Alpine Lodge',
    location: 'Zermatt, Switzerland',
    category: 'Hotel',
    status: 'Approved',
    price: 'CHF 680',
    priceUnit: '/night',
    availability: 'Fully Booked',
    availabilityPct: 100,
    img: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=150&q=80',
  },
];

const STATUS_STYLES = {
  Approved: 'bg-green-500/10 text-green-700',
  Pending: 'bg-secondary-container/30 text-secondary',
  Flagged: 'bg-error/10 text-error',
};

function AdminInventario({ onNavigate }) {
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = statusFilter === 'All'
    ? SERVICES
    : SERVICES.filter((s) => s.status === statusFilter);

  return (
    <AdminLayout activePage="admin-inventario" onNavigate={onNavigate}>

      {/* Hero + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mb-6">
        <div className="bg-primary rounded-2xl p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-on-primary mb-3">Estado del inventario</h1>
          <p className="text-sm text-on-primary-container leading-relaxed max-w-xl">
            Tus listados de servicios están optimizados en un 94%. Hay 12 nuevas aprobaciones pendientes de revisión por parte de socios locales en Tokio y París.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onNavigate && onNavigate('admin-hoteles')}
            className="flex-1 bg-secondary-container text-primary font-bold rounded-2xl px-6 flex items-center justify-between hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              Agregar un nuevo servicio
            </span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-5">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Pendiente de aprobación</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-primary">12</span>
              <span className="text-xs font-bold text-secondary mb-1">+3 hoy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
        <div className="flex-1 min-w-[160px]">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Category</label>
          <select className="w-full bg-surface-container-lowest border border-solid border-outline-variant rounded-lg px-3 py-2.5 text-sm font-semibold text-primary outline-none focus:border-primary">
            <option>All Services</option>
            <option>Hotel</option>
            <option>Experience</option>
            <option>Transport</option>
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Location</label>
          <select className="w-full bg-surface-container-lowest border border-solid border-outline-variant rounded-lg px-3 py-2.5 text-sm font-semibold text-primary outline-none focus:border-primary">
            <option>Global</option>
            <option>Europe</option>
            <option>Asia</option>
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Status</label>
          <div className="flex gap-2">
            {['All', 'Approved', 'Pending'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border border-solid transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-transparent text-primary border-outline hover:bg-surface-container-low'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-solid border-outline rounded-lg text-xs font-bold text-primary bg-transparent hover:bg-surface-container-low transition-all cursor-pointer shrink-0">
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-0 border-b border-solid border-outline-variant/40 bg-surface-container-lowest">
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Detalles</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Disponibilidad</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-0 border-b border-solid border-outline-variant/30 last:border-0 hover:bg-surface-container-lowest/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={s.img} alt={s.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-primary leading-snug">{s.name}</p>
                        <p className="text-xs text-on-surface-variant">{s.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-semibold text-primary whitespace-nowrap">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_STYLES[s.status]}`}>
                      • {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-primary">{s.price}</span>
                    <span className="text-xs text-on-surface-variant">{s.priceUnit}</span>
                  </td>
                  <td className="px-6 py-4 min-w-[140px]">
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${s.status === 'Flagged' ? 'bg-error/40' : 'bg-secondary-container'}`}
                        style={{ width: `${s.availabilityPct}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-semibold ${s.status === 'Flagged' ? 'text-error' : 'text-on-surface-variant'}`}>
                      {s.availability}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-on-surface-variant hover:text-primary bg-transparent border-none cursor-pointer material-symbols-outlined text-[18px]">
                      more_vert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-0 border-t border-solid border-outline-variant/40">
          <p className="text-xs text-on-surface-variant font-medium">Showing 1–4 of 1,248 services</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-solid border-outline-variant text-on-surface-variant bg-transparent cursor-pointer material-symbols-outlined text-[16px]">
              chevron_left
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary text-xs font-bold border-none cursor-pointer">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-solid border-outline-variant text-primary text-xs font-bold bg-transparent cursor-pointer">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-solid border-outline-variant text-primary text-xs font-bold bg-transparent cursor-pointer">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-solid border-outline-variant text-on-surface-variant bg-transparent cursor-pointer material-symbols-outlined text-[16px]">
              chevron_right
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => onNavigate && onNavigate('admin-hoteles')}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border-none cursor-pointer z-30"
      >
        <span className="material-symbols-outlined">add</span>
      </button>

    </AdminLayout>
  );
}

export default AdminInventario;