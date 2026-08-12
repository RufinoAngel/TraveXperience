import React, { useState } from 'react';
import AdminLayout from '../../components/adminLayout.jsx';

const AMENITIES = [
  { key: 'pool', label: 'Piscina', icon: 'pool' },
  { key: 'gym', label: 'Gimnasio', icon: 'fitness_center' },
  { key: 'wifi', label: 'WiFi Gratis', icon: 'wifi' },
  { key: 'spa', label: 'Spa & Wellness', icon: 'spa' },
  { key: 'restaurant', label: 'Restaurante', icon: 'restaurant' },
  { key: 'parking', label: 'Parking', icon: 'local_parking' },
];

// ---- Validaciones ----
function validateHotelField(field, value) {
  switch (field) {
    case 'nombre': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'El nombre del hotel es obligatorio.';
      if (trimmed.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      return '';
    }
    case 'categoria': {
      if (!value || value === 'Seleccione nivel') return 'Selecciona una categoría.';
      return '';
    }
    case 'precio': {
      if (value === '' || value === null || value === undefined) return 'El precio base es obligatorio.';
      const num = Number(value);
      if (Number.isNaN(num) || num <= 0) return 'Ingresa un precio válido mayor a 0.';
      return '';
    }
    case 'ubicacion': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'La ubicación / dirección es obligatoria.';
      if (trimmed.length < 8) return 'Ingresa una dirección más completa.';
      return '';
    }
    default:
      return '';
  }
}

function AdminHoteles({ onNavigate }) {
  const [selectedAmenities, setSelectedAmenities] = useState({});
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Habitación Estándar', details: 'Cama Queen, Vistas a la ciudad, 25m²', price: '€180/noche' },
    { id: 2, name: 'Suite Ejecutiva', details: 'Cama King, Terraza privada, 55m²', price: '€450/noche' },
  ]);
  const [mainImage, setMainImage] = useState(null);

  const [values, setValues] = useState({ nombre: '', categoria: '', precio: '', ubicacion: '' });
  const [errors, setErrors] = useState({ nombre: '', categoria: '', precio: '', ubicacion: '' });
  const [touched, setTouched] = useState({ nombre: false, categoria: false, precio: false, ubicacion: false });
  const [roomsError, setRoomsError] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | success

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateHotelField(field, value) }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateHotelField(field, values[field]) }));
  };

  const toggleAmenity = (key) => {
    setSelectedAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const removeRoom = (id) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const inputClasses = (field) =>
    `w-full px-4 py-3 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors ${
      errors[field] && touched[field] ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
    }`;

  const handleRegister = () => {
    const newErrors = {
      nombre: validateHotelField('nombre', values.nombre),
      categoria: validateHotelField('categoria', values.categoria),
      precio: validateHotelField('precio', values.precio),
      ubicacion: validateHotelField('ubicacion', values.ubicacion),
    };
    setErrors(newErrors);
    setTouched({ nombre: true, categoria: true, precio: true, ubicacion: true });

    const roomsMsg = rooms.length === 0 ? 'Agrega al menos un tipo de habitación.' : '';
    setRoomsError(roomsMsg);

    const hasErrors = Object.values(newErrors).some((e) => e !== '') || !!roomsMsg;
    if (hasErrors) {
      setSubmitStatus('idle');
      return;
    }

    // Aquí iría la llamada real a tu API para registrar el hotel
    setSubmitStatus('success');
    setTimeout(() => setSubmitStatus('idle'), 3000);
  };

  return (
    <AdminLayout activePage="admin-hoteles" onNavigate={onNavigate}>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Registrar Nuevo Hotel</h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Introduzca los detalles de la nueva propiedad de lujo para su inclusión en el catálogo de TraveXperience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* Columna principal */}
        <div className="space-y-6">

          {/* Información Básica */}
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">info</span>
              <h2 className="text-lg font-bold">Información Básica</h2>
            </div>
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre del Hotel</label>
                <input
                  type="text"
                  placeholder="Ej. Grand Hyatt Barcelona"
                  className={inputClasses('nombre')}
                  value={values.nombre}
                  onChange={handleChange('nombre')}
                  onBlur={handleBlur('nombre')}
                />
                {errors.nombre && touched.nombre && (
                  <p className="text-xs text-error">{errors.nombre}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Categoría (Estrellas)</label>
                  <select
                    className={inputClasses('categoria')}
                    value={values.categoria}
                    onChange={handleChange('categoria')}
                    onBlur={handleBlur('categoria')}
                  >
                    <option value="">Seleccione nivel</option>
                    <option>3 estrellas</option>
                    <option>4 estrellas</option>
                    <option>5 estrellas</option>
                  </select>
                  {errors.categoria && touched.categoria && (
                    <p className="text-xs text-error">{errors.categoria}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Precio base por noche (EUR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">€</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={`${inputClasses('precio')} pl-8`}
                      value={values.precio}
                      onChange={handleChange('precio')}
                      onBlur={handleBlur('precio')}
                    />
                  </div>
                  {errors.precio && touched.precio && (
                    <p className="text-xs text-error">{errors.precio}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ubicación / Dirección Completa</label>
                <input
                  type="text"
                  placeholder="Calle, número, ciudad, código postal..."
                  className={inputClasses('ubicacion')}
                  value={values.ubicacion}
                  onChange={handleChange('ubicacion')}
                  onBlur={handleBlur('ubicacion')}
                />
                {errors.ubicacion && touched.ubicacion && (
                  <p className="text-xs text-error">{errors.ubicacion}</p>
                )}
              </div>
            </div>
          </div>

          {/* Servicios y Amenidades */}
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">room_service</span>
              <h2 className="text-lg font-bold">Servicios y Amenidades</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AMENITIES.map((a) => (
                <label
                  key={a.key}
                  className={`flex items-center gap-2.5 px-4 py-3 border border-solid rounded-xl cursor-pointer transition-all ${
                    selectedAmenities[a.key] ? 'border-secondary bg-secondary-container/10' : 'border-outline-variant hover:border-outline'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedAmenities[a.key]}
                    onChange={() => toggleAmenity(a.key)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="material-symbols-outlined text-[18px] text-primary">{a.icon}</span>
                  <span className="text-sm font-semibold text-primary">{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tipos de Habitaciones */}
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between text-primary mb-6 border-0 border-b border-solid border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">bed</span>
                <h2 className="text-lg font-bold">Tipos de Habitaciones</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRooms((prev) => [...prev, { id: Date.now(), name: 'Nueva Habitación', details: 'Describe la habitación...', price: '€0/noche' }]);
                  setRoomsError('');
                }}
                className="flex items-center gap-1 text-xs font-bold text-secondary bg-transparent border-none cursor-pointer hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Añadir Tipo
              </button>
            </div>
            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex justify-between items-center gap-4 p-4 border border-solid border-outline-variant/40 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-secondary mb-0.5">{room.name}</p>
                    <p className="text-xs text-on-surface-variant">{room.details}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-primary whitespace-nowrap">{room.price}</span>
                    <button
                      onClick={() => removeRoom(room.id)}
                      className="text-error bg-transparent border-none cursor-pointer material-symbols-outlined text-[18px]"
                      title="Eliminar habitación"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
              {rooms.length === 0 && (
                <p className="text-xs text-on-surface-variant italic">No hay habitaciones agregadas todavía.</p>
              )}
            </div>
            {roomsError && <p className="text-xs text-error mt-3">{roomsError}</p>}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
            <h3 className="text-base font-bold text-primary mb-4">Galería de Imágenes</h3>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-secondary/50 rounded-xl py-8 px-4 text-center cursor-pointer hover:bg-secondary-container/5 transition-colors mb-3">
              <span className="material-symbols-outlined text-secondary text-3xl">cloud_upload</span>
              <span className="text-sm font-semibold text-primary">
                {mainImage ? mainImage.name : (<>Arrastre o haga clic para subir<br />la imagen principal</>)}
              </span>
              <span className="text-[11px] text-on-surface-variant">Soporta JPG, PNG (Max 5MB)</span>
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={(e) => setMainImage(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <label key={i} className="aspect-square flex items-center justify-center border border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-secondary transition-colors">
                  <span className="material-symbols-outlined text-outline-variant">add_photo_alternate</span>
                  <input type="file" className="hidden" accept="image/png, image/jpeg" />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-solid border-outline-variant/40 rounded-2xl p-6">
            <h3 className="text-base font-bold text-primary mb-4">Vista Previa Mapa</h3>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-high mb-3">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
                alt="Vista previa del mapa"
                className="w-full h-full object-cover opacity-80"
              />
              <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-primary text-4xl fill-1 drop-shadow-md">
                location_on
              </span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">place</span>
              Coordenadas: 41.3851° N, 2.1734° E
            </p>
          </div>

          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-secondary-container text-primary font-bold py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer flex items-center justify-center gap-2"
          >
            {submitStatus === 'success' ? (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                Hotel Registrado
              </>
            ) : (
              'Register Hotel'
            )}
          </button>
          <button className="w-full bg-transparent border border-solid border-outline text-primary font-bold py-3.5 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer">
            Guardar como Borrador
          </button>

          <div className="bg-primary-container/30 border-0 border-l-4 border-solid border-primary rounded-r-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">verified_user</span>
            <div>
              <p className="text-sm font-bold text-primary mb-0.5">Verificación de Calidad</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Todas las propiedades nuevas pasan por un proceso de revisión de 48h antes de publicarse.
              </p>
            </div>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}

export default AdminHoteles;