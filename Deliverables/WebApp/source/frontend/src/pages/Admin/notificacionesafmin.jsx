import React, { useState } from 'react';
import AdminLayout from '../../components/adminLayout.jsx';

const NOTIFICATIONS = [
  {
    id: 1,
    icon: 'dns',
    tone: 'error',
    title: 'API Latency Detected',
    message: 'El motor de reservas de hotel (Proveedor X) está respondiendo lentamente (>2s).',
    time: 'Hace 4 min',
    read: false,
  },
  {
    id: 2,
    icon: 'person_add',
    tone: 'primary',
    title: 'Nuevo Socio Verificado',
    message: '"Azure Resorts & Spa" completó el proceso de verificación de calidad.',
    time: 'Hace 2 horas',
    read: false,
  },
  {
    id: 3,
    icon: 'database',
    tone: 'secondary',
    title: 'Respaldo Programado Pendiente',
    message: 'La tarea de replicación de base de datos n.° 402 está retrasada.',
    time: 'Hace 22 min',
    read: false,
  },
  {
    id: 4,
    icon: 'shopping_cart',
    tone: 'secondary',
    title: 'Reserva Confirmada',
    message: 'Booking #TRX-9921 confirmado para Tokyo Tour.',
    time: 'Hace 5 horas',
    read: true,
  },
  {
    id: 5,
    icon: 'edit_note',
    tone: 'primary',
    title: 'Política Actualizada',
    message: 'La ventana de reembolso se extendió a 48h por Admin: Sarah J.',
    time: 'Ayer',
    read: true,
  },
  {
    id: 6,
    icon: 'flag',
    tone: 'error',
    title: 'Servicio Marcado',
    message: '"Amalfi Private Yacht Charter" fue marcado por mantenimiento pendiente.',
    time: 'Hace 2 días',
    read: true,
  },
];

const TONE_STYLES = {
  error: 'bg-error/10 text-error',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary-container/30 text-secondary',
};

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors border-none cursor-pointer shrink-0 ${
        checked ? 'bg-primary' : 'bg-surface-container-high'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function NotificacionesAdmin({ onNavigate }) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('Todas'); // Todas | No leídas
  const [prefs, setPrefs] = useState({
    systemAlerts: true,
    bookingUpdates: true,
    partnerActivity: false,
    weeklySummary: true,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = filter === 'No leídas' ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const togglePref = (key) => () => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <AdminLayout activePage="admin-notificaciones" onNavigate={onNavigate}>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Notificaciones</h1>
          <p className="text-sm text-on-surface-variant">
            {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer.` : 'Estás al día con todas las notificaciones.'}
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 px-5 py-2.5 border border-solid border-outline rounded-lg text-xs font-bold text-primary bg-transparent hover:bg-surface-container-low transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[16px]">done_all</span>
          Marcar todas como leídas
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Lista de notificaciones */}
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-0 border-b border-solid border-outline-variant/40">
            {['Todas', 'No leídas'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border-none cursor-pointer transition-all ${
                  filter === f ? 'bg-primary text-on-primary' : 'bg-transparent text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="divide-y divide-outline-variant/30">
            {filtered.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-10">No hay notificaciones para mostrar.</p>
            )}
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`flex gap-4 px-6 py-4 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${TONE_STYLES[n.tone]}`}>
                  <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-primary leading-snug">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-on-surface-variant/60 font-medium">{n.time}</span>
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-[11px] font-bold text-secondary bg-transparent border-none cursor-pointer hover:text-primary transition-colors"
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferencias de notificación */}
        <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 h-fit">
          <h3 className="text-base font-bold text-primary mb-5">Preferencias</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Alertas del Sistema</p>
                <p className="text-xs text-on-surface-variant">Latencia, errores y estado del servidor.</p>
              </div>
              <Toggle checked={prefs.systemAlerts} onChange={togglePref('systemAlerts')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Reservas y Pagos</p>
                <p className="text-xs text-on-surface-variant">Nuevas reservas, cancelaciones y reembolsos.</p>
              </div>
              <Toggle checked={prefs.bookingUpdates} onChange={togglePref('bookingUpdates')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Actividad de Socios</p>
                <p className="text-xs text-on-surface-variant">Nuevos registros y cambios de estado.</p>
              </div>
              <Toggle checked={prefs.partnerActivity} onChange={togglePref('partnerActivity')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Resumen Semanal</p>
                <p className="text-xs text-on-surface-variant">Un correo con métricas clave cada lunes.</p>
              </div>
              <Toggle checked={prefs.weeklySummary} onChange={togglePref('weeklySummary')} />
            </div>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}

export default NotificacionesAdmin;