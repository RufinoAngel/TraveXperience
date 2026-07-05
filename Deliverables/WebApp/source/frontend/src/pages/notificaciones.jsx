import React, { useState } from 'react';

function UserNotifications({ onNavigate, isSettingsTab = false }) {
  // Estado para los interruptores de notificaciones
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Notificaciones simuladas
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '¡Reserva Confirmada!',
      desc: 'Tu estancia en Grand Alpine Resort & Spa en Zermatt está confirmada. Referencia: TX-8829-ALP-2026.',
      time: 'Hace 1 hora',
      icon: 'verified',
      iconBg: 'bg-green-500/10 text-green-600',
      unread: true
    },
    {
      id: 2,
      title: 'Invitación a Colaborar',
      desc: 'Sophia Martinez te ha invitado a editar el itinerario "Verano en París".',
      time: 'Hace 1 día',
      icon: 'group_add',
      iconBg: 'bg-primary-container text-primary',
      unread: false
    },
    {
      id: 3,
      title: 'Gasto Registrado',
      desc: 'Sophia Martinez agregó un gasto de €45.00 por "Entradas Louvre" a la billetera compartida.',
      time: 'Hace 2 días',
      icon: 'payments',
      iconBg: 'bg-secondary-container text-primary',
      unread: false
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const content = (
    <main className="max-w-4xl mx-auto px-6 md:px-12 py-12 w-full flex-grow">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Notificaciones</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Mantente al día con las alertas de tus itinerarios compartidos, pagos y actividades de viaje.
          </p>
        </div>
        {notifications.some(n => n.unread) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-primary hover:text-secondary bg-transparent border-none cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">done_all</span>
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Historial de Alertas (Columna Izquierda, 7 cols) */}
        <section className="lg:col-span-8 space-y-4">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Alertas Recientes</h2>
          
          {notifications.length === 0 ? (
            <div className="bg-surface border border-dashed border-outline-variant/60 rounded-2xl p-12 text-center shadow-[0px_8px_30px_rgba(0,0,0,0.01)]">
              <span className="material-symbols-outlined text-outline-variant text-4xl mb-3">notifications_off</span>
              <p className="text-sm font-bold text-primary">No tienes notificaciones</p>
              <p className="text-xs text-on-surface-variant mt-1">Te avisaremos cuando ocurra algo importante en tus itinerarios.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`bg-surface border border-solid p-5 rounded-2xl flex gap-4 transition-all hover:shadow-md relative group ${
                  notif.unread ? 'border-primary' : 'border-outline-variant/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                  <span className="material-symbols-outlined text-lg">{notif.icon}</span>
                </div>
                
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-center pr-6">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                      {notif.title}
                      {notif.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                      )}
                    </h3>
                    <span className="text-[10px] text-on-surface-variant/80 font-semibold">{notif.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{notif.desc}</p>
                </div>

                <button 
                  onClick={() => clearNotification(notif.id)}
                  className="absolute top-4 right-4 text-on-surface-variant/40 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
                  title="Eliminar notificación"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))
          )}
        </section>

        {/* Canales y Preferencias (Columna Derecha, 4 cols) */}
        <section className="lg:col-span-4 bg-white border border-solid border-outline-variant/40 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-primary mb-1">Canales de Alerta</h2>
            <p className="text-[11px] text-on-surface-variant font-medium">Elige por qué medios deseas recibir actualizaciones.</p>
          </div>

          <div className="divide-y divide-solid divide-outline-variant/20 space-y-4">
            
            {/* Email Channel */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <div>
                  <h3 className="text-xs font-bold text-primary">Correo</h3>
                  <p className="text-[9px] text-on-surface-variant">Recibos e itinerarios</p>
                </div>
              </div>
              <button 
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors relative outline-none border-none cursor-pointer ${emailAlerts ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Push Channel */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">notifications_active</span>
                <div>
                  <h3 className="text-xs font-bold text-primary">Push Alerts</h3>
                  <p className="text-[9px] text-on-surface-variant">Gastos y chats de grupo</p>
                </div>
              </div>
              <button 
                onClick={() => setPushAlerts(!pushAlerts)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors relative outline-none border-none cursor-pointer ${pushAlerts ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${pushAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* SMS Channel */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">sms</span>
                <div>
                  <h3 className="text-xs font-bold text-primary">Mensajes SMS</h3>
                  <p className="text-[9px] text-on-surface-variant">Alertas de urgencia en viaje</p>
                </div>
              </div>
              <button 
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors relative outline-none border-none cursor-pointer ${smsAlerts ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${smsAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </section>

      </div>
    </main>
  );

  if (isSettingsTab) {
    return content;
  }

  return (
    <div className="bg-background text-on-background font-sans selection:bg-secondary-container min-h-screen flex flex-col pt-16">
      {content}
    </div>
  );
}

export default UserNotifications;
