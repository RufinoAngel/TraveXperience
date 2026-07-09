import React from 'react';
import AdminLayout from '../../components/adminLayout.jsx';

const CATEGORIES = [
  { name: 'Alojamiento', pct: 45 },
  { name: 'Vuelos & Transporte', pct: 30 },
  { name: 'Gastronomía', pct: 15 },
  { name: 'Experiencias', pct: 10 },
];

const TRANSACTIONS = [
  { id: 1, concept: 'Hôtel Lutetia, Paris', icon: 'hotel', category: 'Alojamiento', date: '14 Oct, 2023', status: 'Completado', amount: '$1,240.00' },
  { id: 2, concept: 'Air France – AF1029', icon: 'flight', category: 'Transporte', date: '12 Oct, 2023', status: 'Pendiente', amount: '$840.00' },
  { id: 3, concept: 'Le Jules Verne', icon: 'restaurant', category: 'Gastronomía', date: '11 Oct, 2023', status: 'Completado', amount: '$350.00' },
  { id: 4, concept: 'Tour Privado Mont Saint-Michel', icon: 'hiking', category: 'Experiencias', date: '09 Oct, 2023', status: 'Reembolsado', amount: '-$150.00' },
  { id: 5, concept: 'Uber Paris', icon: 'local_taxi', category: 'Transporte', date: '08 Oct, 2023', status: 'Completado', amount: '$45.00' },
];

const STATUS_STYLES = {
  Completado: 'bg-green-500/10 text-green-700',
  Pendiente: 'bg-secondary-container/30 text-secondary',
  Reembolsado: 'bg-error/10 text-error',
};

function AdminPagos({ onNavigate }) {
  return (
    <AdminLayout activePage="admin-pagos" onNavigate={onNavigate}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Finanzas y Pagos</span>
          <h1 className="text-4xl font-bold text-primary mt-1">Panel de Control</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-solid border-outline rounded-lg text-xs font-bold text-primary bg-transparent hover:bg-surface-container-low transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Descargar Estado
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-solid border-outline rounded-lg text-xs font-bold text-primary bg-transparent hover:bg-surface-container-low transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            Transferir Fondos
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all border-none cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            Disputar Pago
          </button>
        </div>
      </div>

      {/* Stat cards + Gastos por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1.2fr] gap-5 mb-6">
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="w-9 h-9 rounded-lg bg-secondary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[18px]">account_balance_wallet</span>
            </div>
            <span className="text-[11px] font-bold text-green-700">+12% vs mes pasado</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Gastado</p>
          <p className="text-2xl font-bold text-primary">$12,450.00</p>
        </div>

        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="w-9 h-9 rounded-lg bg-primary-container/30 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-[18px]">credit_card</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Presupuesto</p>
            <span className="text-xs font-bold text-secondary">65%</span>
          </div>
          <p className="text-2xl font-bold text-primary mb-2">$3,550.00</p>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-green-700 text-[18px]">savings</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ahorros Recientes</p>
          <p className="text-2xl font-bold text-primary mb-1">$840.50</p>
          <p className="text-[11px] text-on-surface-variant italic">Basado en descuentos de fidelidad</p>
        </div>

        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-primary">Gastos por Categoría</h3>
            <button className="text-on-surface-variant bg-transparent border-none cursor-pointer material-symbols-outlined text-[18px]">more_horiz</button>
          </div>
          <div className="space-y-3">
            {CATEGORIES.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                  <span>{c.name}</span>
                  <span className="text-primary">{c.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="text-xs font-bold text-secondary underline underline-offset-2 mt-4 bg-transparent border-none cursor-pointer p-0">
            Ver Análisis Detallado
          </button>
        </div>
      </div>

      {/* Métodos de pago + Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary">Métodos de Pago</h3>
            <button className="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center text-primary bg-transparent border-none cursor-pointer material-symbols-outlined text-[16px]">add</button>
          </div>

          <div className="bg-primary rounded-2xl p-5 text-on-primary relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <span className="material-symbols-outlined text-[22px]">credit_card</span>
              <span className="text-[10px] font-bold bg-on-primary/10 px-2 py-0.5 rounded-full">PREDETERMINADA</span>
            </div>
            <p className="text-lg font-mono tracking-widest mb-4">•••• •••• •••• 4290</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-primary/70">EXPIRES 08/26</span>
              <span className="font-bold">VISA</span>
            </div>
          </div>

          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-8">
              <span className="material-symbols-outlined text-primary text-[22px]">credit_card</span>
            </div>
            <p className="text-lg font-mono tracking-widest text-primary mb-4">•••• •••• •••• 8812</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">EXPIRES 12/24</span>
              <span className="font-bold text-primary">MASTERCARD</span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-secondary-container rounded-2xl p-5">
            <span className="material-symbols-outlined absolute -bottom-3 -right-3 text-primary/10 text-8xl">shield</span>
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-primary mb-1">Seguro de Viaje Pro</h4>
              <p className="text-xs text-primary/80 leading-relaxed mb-4">
                Cubre todos tus pagos con protección antifraude global.
              </p>
              <button className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all border-none cursor-pointer">
                Activar Ahora
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-0 border-b border-solid border-outline-variant/40">
            <h3 className="text-lg font-bold text-primary">Historial de Transacciones</h3>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-solid border-outline rounded-lg text-xs font-bold text-primary bg-transparent hover:bg-surface-container-low transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Últimos 30 días
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-lowest">
                  <th className="px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Concepto</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((t) => (
                  <tr key={t.id} className="border-0 border-b border-solid border-outline-variant/30 last:border-0 hover:bg-surface-container-lowest/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-[18px]">{t.icon}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{t.concept}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">{t.category}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">{t.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${STATUS_STYLES[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.amount.startsWith('-') ? 'text-error' : 'text-primary'}`}>
                      {t.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center py-4 border-0 border-t border-solid border-outline-variant/40">
            <button className="text-xs font-bold text-primary bg-transparent border-none cursor-pointer flex items-center gap-1 mx-auto">
              Cargar más transacciones
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-8 pt-6 border-0 border-t border-solid border-outline-variant/30 text-[11px] text-on-surface-variant font-medium">
        <span>© {new Date().getFullYear()} TraveXperience Payments System. Todos los derechos reservados.</span>
        <div className="flex gap-6">
          <a href="#privacy" className="hover:text-primary transition-colors">Privacidad</a>
          <a href="#terms" className="hover:text-primary transition-colors">Términos de Servicio</a>
          <a href="#support" className="hover:text-primary transition-colors">Soporte</a>
        </div>
      </div>

    </AdminLayout>
  );
}

export default AdminPagos;