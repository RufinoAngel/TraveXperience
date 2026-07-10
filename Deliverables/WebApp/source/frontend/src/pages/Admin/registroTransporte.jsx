import React, { useState } from 'react';
import AdminLayout from '../../components/adminLayout.jsx';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const PRICE_TIERS = [
  { name: 'Turista / Standard', price: '€45.00', pct: 75, note: '75% de ocupación proyectada' },
  { name: 'Business / Premium', price: '€120.00', pct: 25, note: '25% de ocupación proyectada' },
  { name: 'First Class', price: '€280.00', pct: 8, note: '8% de ocupación proyectada' },
];

function validateTransportField(field, value, allValues) {
  switch (field) {
    case 'compania': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'El nombre de la compañía es obligatorio.';
      if (trimmed.length < 2) return 'Ingresa un nombre de compañía válido.';
      return '';
    }
    case 'origen': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'El origen es obligatorio.';
      if (allValues && trimmed.toLowerCase() === (allValues.destino || '').trim().toLowerCase() && trimmed !== '') {
        return 'El origen y el destino no pueden ser iguales.';
      }
      return '';
    }
    case 'destino': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'El destino es obligatorio.';
      if (allValues && trimmed.toLowerCase() === (allValues.origen || '').trim().toLowerCase() && trimmed !== '') {
        return 'El origen y el destino no pueden ser iguales.';
      }
      return '';
    }
    case 'horaSalida': {
      if (!value) return 'La hora de salida es obligatoria.';
      return '';
    }
    case 'horaLlegada': {
      if (!value) return 'La hora de llegada es obligatoria.';
      if (allValues && allValues.horaSalida && value === allValues.horaSalida) {
        return 'La hora de llegada debe ser distinta a la de salida.';
      }
      return '';
    }
    case 'capacidad': {
      if (value === '' || value === null || value === undefined) return 'La capacidad total es obligatoria.';
      const num = Number(value);
      if (Number.isNaN(num) || num <= 0) return 'Ingresa una capacidad válida mayor a 0.';
      return '';
    }
    default:
      return '';
  }
}

function AdminTransporte({ onNavigate }) {
  const [selectedDays, setSelectedDays] = useState({ L: true, M: true, X: true, J: true, V: true, S: false, D: false });

  const [values, setValues] = useState({
    compania: '',
    origen: '',
    destino: '',
    horaSalida: '',
    horaLlegada: '',
    capacidad: '',
  });
  const [errors, setErrors] = useState({
    compania: '', origen: '', destino: '', horaSalida: '', horaLlegada: '', capacidad: '',
  });
  const [touched, setTouched] = useState({
    compania: false, origen: false, destino: false, horaSalida: false, horaLlegada: false, capacidad: false,
  });
  const [daysError, setDaysError] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | success

  const toggleDay = (day) => {
    setSelectedDays((prev) => {
      const next = { ...prev, [day]: !prev[day] };
      if (Object.values(next).some(Boolean)) setDaysError('');
      return next;
    });
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateTransportField(field, value, nextValues) }));
    }
    // Si cambia origen/destino/horaSalida y ya se validó el campo relacionado, revalidarlo también
    if (field === 'origen' && touched.destino) {
      setErrors((prev) => ({ ...prev, destino: validateTransportField('destino', nextValues.destino, nextValues) }));
    }
    if (field === 'destino' && touched.origen) {
      setErrors((prev) => ({ ...prev, origen: validateTransportField('origen', nextValues.origen, nextValues) }));
    }
    if (field === 'horaSalida' && touched.horaLlegada) {
      setErrors((prev) => ({ ...prev, horaLlegada: validateTransportField('horaLlegada', nextValues.horaLlegada, nextValues) }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateTransportField(field, values[field], values) }));
  };

  const inputClasses = (field) =>
    `w-full px-4 py-3 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors ${
      errors[field] && touched[field] ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
    }`;

  const handleRegister = () => {
    const fields = ['compania', 'origen', 'destino', 'horaSalida', 'horaLlegada', 'capacidad'];
    const newErrors = {};
    fields.forEach((f) => {
      newErrors[f] = validateTransportField(f, values[f], values);
    });
    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    const daysMsg = Object.values(selectedDays).some(Boolean) ? '' : 'Selecciona al menos un día de operación.';
    setDaysError(daysMsg);

    const hasErrors = Object.values(newErrors).some((e) => e !== '') || !!daysMsg;
    if (hasErrors) {
      setSubmitStatus('idle');
      return;
    }

    // Aquí iría la llamada real a tu API para registrar el transporte
    setSubmitStatus('success');
    setTimeout(() => setSubmitStatus('idle'), 3000);
  };

  return (
    <AdminLayout activePage="admin-transporte" onNavigate={onNavigate}>

      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-primary">Registrar Nueva Opción de Transporte</h1>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => onNavigate && onNavigate('admin-inventario')}
            className="px-5 py-2.5 border border-solid border-error text-error font-bold text-sm rounded-lg bg-transparent hover:bg-error/5 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRegister}
            className="px-5 py-2.5 bg-secondary-container text-primary font-bold text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer flex items-center gap-2"
          >
            {submitStatus === 'success' && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
            {submitStatus === 'success' ? 'Transporte Registrado' : 'Registrar Transporte'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Columna principal */}
        <div className="space-y-6">

          {/* Información Básica */}
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 text-secondary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">info</span>
              <h2 className="text-lg font-bold text-primary">Información Básica</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipo de Transporte</label>
                <select className="w-full px-4 py-3 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors">
                  <option>Vuelo Comercial</option>
                  <option>Tren</option>
                  <option>Autobús</option>
                  <option>Alquiler de Auto</option>
                  <option>Ferry</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre de la Compañía</label>
                <input
                  type="text"
                  placeholder="Ej. Iberia, Renfe, Hertz..."
                  className={inputClasses('compania')}
                  value={values.compania}
                  onChange={handleChange('compania')}
                  onBlur={handleBlur('compania')}
                />
                {errors.compania && touched.compania && <p className="text-xs text-error">{errors.compania}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Origen</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">location_on</span>
                  <input
                    type="text"
                    placeholder="Ciudad o Aeropuerto"
                    className={`${inputClasses('origen')} pl-10`}
                    value={values.origen}
                    onChange={handleChange('origen')}
                    onBlur={handleBlur('origen')}
                  />
                </div>
                {errors.origen && touched.origen && <p className="text-xs text-error">{errors.origen}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Destino</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">location_on</span>
                  <input
                    type="text"
                    placeholder="Ciudad o Aeropuerto"
                    className={`${inputClasses('destino')} pl-10`}
                    value={values.destino}
                    onChange={handleChange('destino')}
                    onBlur={handleBlur('destino')}
                  />
                </div>
                {errors.destino && touched.destino && <p className="text-xs text-error">{errors.destino}</p>}
              </div>
            </div>
          </div>

          {/* Horarios y Frecuencia */}
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 text-secondary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">schedule</span>
              <h2 className="text-lg font-bold text-primary">Horarios y Frecuencia</h2>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 mb-5">
              <p className="text-sm font-bold text-primary mb-0.5">Días de Operación</p>
              <p className="text-xs text-on-surface-variant mb-4">Seleccione los días disponibles para esta ruta</p>
              <div className="flex gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-none cursor-pointer transition-all ${
                      selectedDays[day] ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {daysError && <p className="text-xs text-error mt-3">{daysError}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hora de Salida</label>
                <input
                  type="time"
                  className={inputClasses('horaSalida')}
                  value={values.horaSalida}
                  onChange={handleChange('horaSalida')}
                  onBlur={handleBlur('horaSalida')}
                />
                {errors.horaSalida && touched.horaSalida && <p className="text-xs text-error">{errors.horaSalida}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hora de Llegada</label>
                <input
                  type="time"
                  className={inputClasses('horaLlegada')}
                  value={values.horaLlegada}
                  onChange={handleChange('horaLlegada')}
                  onBlur={handleBlur('horaLlegada')}
                />
                {errors.horaLlegada && touched.horaLlegada && <p className="text-xs text-error">{errors.horaLlegada}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Duración Estimada</label>
                <input
                  type="text"
                  placeholder="Ej. 2h 30m"
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Vista Previa de Ruta */}
          <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-surface-container-high">
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=60')` }}
            />
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-primary mb-2">Vista Previa de Ruta</h3>
              <p className="text-xs text-on-surface-variant mb-6 max-w-lg leading-relaxed">
                Confirme que los nodos de conexión son correctos para asegurar la integración con el generador de itinerarios inteligente.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-surface px-4 py-2 rounded-full text-xs font-bold text-primary flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary" /> {values.origen ? values.origen : 'MAD - Madrid-Barajas'}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                <span className="bg-surface px-4 py-2 rounded-full text-xs font-bold text-primary flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary-container" /> {values.destino ? values.destino : 'BCN - Barcelona El Prat'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          <div className="bg-primary rounded-2xl p-6">
            <div className="flex items-center gap-2 text-on-primary mb-5">
              <span className="material-symbols-outlined">bar_chart</span>
              <h3 className="text-base font-bold">Capacidad y Disponibilidad</h3>
            </div>
            <div className="mb-2">
              <label className="text-xs font-semibold text-on-primary/70 block mb-1.5">Capacidad Total (Pax)</label>
              <input
                type="number"
                min="0"
                placeholder="000"
                className="w-full px-4 py-3 bg-on-primary/10 border border-solid border-on-primary/20 rounded-xl text-sm font-bold text-on-primary placeholder:text-on-primary/40 outline-none focus:border-on-primary/50 transition-colors"
                value={values.capacidad}
                onChange={handleChange('capacidad')}
                onBlur={handleBlur('capacidad')}
              />
            </div>
            {errors.capacidad && touched.capacidad && (
              <p className="text-xs text-secondary-container mb-3">{errors.capacidad}</p>
            )}
            <div className="mb-5 mt-3">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-on-primary/70">Bloqueo Mínimo de Reservas</label>
                <span className="text-xs font-bold text-secondary-container">12%</span>
              </div>
              <div className="w-full h-1.5 bg-on-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary-container">
              <span className="w-2 h-2 rounded-full bg-secondary-container" />
              Estado de Salud del Inventario: Óptimo
            </div>
          </div>

          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-primary mb-5">
              <span className="material-symbols-outlined">payments</span>
              <h3 className="text-base font-bold">Niveles de Precios</h3>
            </div>
            <div className="space-y-4">
              {PRICE_TIERS.map((tier) => (
                <div key={tier.name} className="bg-surface-container-lowest rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-primary">{tier.name}</span>
                    <span className="text-sm font-bold text-primary">{tier.price}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-secondary-container rounded-full" style={{ width: `${tier.pct}%` }} />
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{tier.note}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 border border-dashed border-outline rounded-xl text-xs font-bold text-primary bg-transparent hover:bg-surface-container-low transition-all cursor-pointer flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Añadir Categoría
            </button>
          </div>
        </div>
      </div>

      {/* Footer de resumen */}
      <div className="mt-6 bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-10">
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Revenue Proyectado</p>
            <p className="text-2xl font-bold text-primary">€14,250.00 <span className="text-sm font-medium text-on-surface-variant">/mes</span></p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Confianza Logística</p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container rounded-full" style={{ width: '92%' }} />
              </div>
              <span className="text-sm font-bold text-primary">92%</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRegister}
          className="flex items-center gap-2 bg-secondary-container text-primary font-bold px-8 py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined">verified</span>
          Finalizar Registro
        </button>
      </div>

    </AdminLayout>
  );
}

export default AdminTransporte;