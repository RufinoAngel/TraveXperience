import React, { useState } from 'react';
import AdminLayout from '../../components/adminLayout.jsx';

// Datos simulados para el gráfico de tendencias de reservas, por rango de fecha
const TREND_DATASETS = {
  '7d': {
    label: 'Últimos 7 días',
    points: [30, 34, 31, 28, 33, 45, 42],
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  },
  '30d': {
    label: 'Últimos 30 días',
    points: [12, 18, 22, 30, 34, 31, 28, 33, 45, 42],
    labels: ['01 May', '08 May', '15 May', '22 May', '31 May'],
  },
  '90d': {
    label: 'Últimos 90 días',
    points: [8, 14, 12, 20, 18, 25, 22, 30, 28, 34, 31, 38, 33, 45, 42],
    labels: ['Mar', 'Abr', 'May'],
  },
  '1y': {
    label: 'Este año',
    points: [10, 14, 16, 20, 24, 22, 28, 34, 31, 38, 42, 45],
    labels: ['Ene', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
  },
};

function TrendChart({ points }) {
  const width = 800;
  const height = 260;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = width / (points.length - 1);

  const norm = (val) => {
    if (max === min) return height / 2;
    return height - ((val - min) / (max - min)) * (height - 40) - 20;
  };

  const chartPoints = points.map((val, i) => [i * step, norm(val)]);

  const linePath = chartPoints
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(' ');

  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  // Marca un par de puntos destacados (aprox. a 1/3 y 2/3 del recorrido)
  const highlightIdx = new Set([
    Math.round(chartPoints.length * 0.3),
    Math.round(chartPoints.length * 0.7),
  ]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-secondary-container)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-secondary-container)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#trendGradient)" />
      <path d={linePath} fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" />
      {chartPoints.map(([x, y], i) => (
        highlightIdx.has(i) && (
          <circle key={i} cx={x} cy={y} r="4" fill="var(--color-secondary)" />
        )
      ))}
    </svg>
  );
}

const DESTINOS = [
  { name: 'Santorini,', country: 'Greece', pct: 42, img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=150&q=80' },
  { name: 'Kyoto, Japan', country: '', pct: 28, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Amalfi Coast,', country: 'Italy', pct: 18, img: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Sahara,', country: 'Morocco', pct: 12, img: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=150&q=80' },
];

function AdminDashboard({ onNavigate }) {
  const [range, setRange] = useState('30d');
  const [rangeMenuOpen, setRangeMenuOpen] = useState(false);
  const dataset = TREND_DATASETS[range];

  const selectRange = (key) => {
    setRange(key);
    setRangeMenuOpen(false);
  };

  return (
    <AdminLayout activePage="admin-dashboard" onNavigate={onNavigate}>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">group</span>
            </div>
            <span className="text-sm font-bold text-green-600 flex items-center gap-0.5">
              +12% <span className="material-symbols-outlined text-[16px]">trending_up</span>
            </span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Active Users</p>
          <p className="text-3xl font-bold text-primary">24.8k</p>
        </div>

        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
            </div>
            <span className="text-sm font-bold text-green-600 flex items-center gap-0.5">
              +8.4% <span className="material-symbols-outlined text-[16px]">trending_up</span>
            </span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">$1.24M</p>
        </div>

        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
            </div>
            <span className="text-sm font-bold text-error flex items-center gap-0.5">
              -2.1% <span className="material-symbols-outlined text-[16px]">trending_down</span>
            </span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Bookings</p>
          <p className="text-3xl font-bold text-primary">1,482</p>
        </div>

        <div className="bg-primary rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-on-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary-container text-[20px]">stars</span>
            </div>
            <span className="text-xs font-semibold text-on-primary/70">Goal: 95%</span>
          </div>
          <p className="text-xs font-bold text-on-primary/70 uppercase tracking-wider mb-1">Satisfacción</p>
          <p className="text-3xl font-bold text-secondary-container">98.2%</p>
        </div>
      </div>

      {/* Chart + Destinos */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 mb-6">
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-primary mb-1">Booking Trends</h3>
              <p className="text-xs text-on-surface-variant">Métricas de rendimiento de {dataset.label.toLowerCase()}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setRangeMenuOpen((prev) => !prev)}
                className="px-4 py-2 bg-surface-container-low rounded-lg text-xs font-bold text-primary border-none cursor-pointer flex items-center gap-1.5"
              >
                {dataset.label}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              {rangeMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-surface border border-solid border-outline-variant/40 rounded-xl shadow-lg overflow-hidden z-10">
                  {Object.entries(TREND_DATASETS).map(([key, d]) => (
                    <button
                      key={key}
                      onClick={() => selectRange(key)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold border-none cursor-pointer transition-colors ${
                        key === range ? 'bg-primary/10 text-primary' : 'bg-transparent text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <TrendChart points={dataset.points} />
          <div className="flex justify-between mt-2 px-1">
            {dataset.labels.map((label) => (
              <span key={label} className="text-[11px] text-on-surface-variant font-medium">{label}</span>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-primary mb-5">Destinos Populares</h3>
          <div className="space-y-5">
            {DESTINOS.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <img src={d.img} alt={d.name} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-bold text-primary truncate">{d.name} {d.country}</span>
                    <span className="text-sm font-bold text-primary ml-2 shrink-0">{d.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-container rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas + Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-error">warning</span>
              <h3 className="text-lg font-bold">Alertas del Sistema</h3>
            </div>
            <span className="bg-error/10 text-error text-xs font-bold px-3 py-1 rounded-full">2 críticos</span>
          </div>
          <div className="space-y-3">
            <div className="bg-error/5 border border-solid border-error/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5 text-error">
                <span className="material-symbols-outlined text-[18px]">dns</span>
                <h4 className="text-sm font-bold">API Latency Detected</h4>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                El motor de reservas de hotel (Proveedor X) está respondiendo lentamente (&gt;2 s). Monitorización en curso.
              </p>
              <p className="text-[11px] text-on-surface-variant/60 font-medium">Detectado hace 4 min</p>
            </div>
            <div className="bg-secondary-fixed/10 border border-solid border-secondary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5 text-secondary">
                <span className="material-symbols-outlined text-[18px]">database</span>
                <h4 className="text-sm font-bold text-primary">Scheduled Backup Pending</h4>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                La tarea de replicación de base de datos n.° 402 está retrasada. El sistema permanece operativo.
              </p>
              <p className="text-[11px] text-on-surface-variant/60 font-medium">Detectado hace 22 min</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-5">Actividad Reciente</h3>
          <div className="space-y-5">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
              </div>
              <div>
                <p className="text-sm font-bold text-primary leading-snug">New Partner verified: "Azure Resorts &amp; Spa"</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">2 hours ago • Onboarding Dept.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary-container text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              </div>
              <div>
                <p className="text-sm font-bold text-primary leading-snug">Booking #TRX-9921 confirmed for Tokyo Tour</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">5 hours ago • System</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
              </div>
              <div>
                <p className="text-sm font-bold text-primary leading-snug">Policy update: Refund Window extended to 48h</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Yesterday • Admin: Sarah J.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;