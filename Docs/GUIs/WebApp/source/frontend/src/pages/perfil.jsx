import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

// --- Reglas de validación ---
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,60}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Acepta números telefónicos con espacios, guiones, paréntesis y un + opcional al inicio (7 a 15 dígitos)
const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;
const BIO_MAX_LENGTH = 300;

function validateProfileField(field, value) {
  switch (field) {
    case 'fullName': {
      const trimmed = value.trim();
      if (!trimmed) return 'El nombre completo es obligatorio.';
      if (!NAME_REGEX.test(trimmed)) {
        return 'Ingresa un nombre válido (mínimo 3 letras, solo letras y espacios).';
      }
      return '';
    }
    case 'email': {
      const trimmed = value.trim();
      if (!trimmed) return 'El correo electrónico es obligatorio.';
      if (!EMAIL_REGEX.test(trimmed)) return 'Ingresa un correo electrónico válido.';
      return '';
    }
    case 'phone': {
      const trimmed = value.trim();
      if (!trimmed) return ''; // el teléfono es opcional
      const digitCount = trimmed.replace(/\D/g, '').length;
      if (!PHONE_REGEX.test(trimmed) || digitCount < 7 || digitCount > 15) {
        return 'Ingresa un número de teléfono válido.';
      }
      return '';
    }
    case 'location': {
      const trimmed = value.trim();
      if (trimmed && trimmed.length < 2) return 'La ubicación es demasiado corta.';
      return '';
    }
    case 'bio': {
      if (value.length > BIO_MAX_LENGTH) {
        return `La biografía no puede superar los ${BIO_MAX_LENGTH} caracteres.`;
      }
      return '';
    }
    default:
      return '';
  }
}

function UserProfile({ onNavigate, isSettingsTab = false }) {
  const [formData, setFormData] = useState({
    fullName: 'Sofía Martínez',
    email: 'sofia.martinez@example.com',
    phone: '+52 776 123 4567',
    location: 'Xicotepec de Juárez, Puebla',
    bio: 'Amante del café de la Sierra Norte de Puebla, la fotografía de paisajes y la exploración gastronómica de Xicotepec y sus alrededores.',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    location: false,
    bio: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateProfileField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateProfileField(name, value) }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      newErrors[field] = validateProfileField(field, formData[field]);
    });
    setErrors(newErrors);
    setTouched({ fullName: true, email: true, phone: true, location: true, bio: true });
    return Object.values(newErrors).every((err) => !err);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return; // hay errores, no se guarda
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('¡Perfil actualizado correctamente!');
    }, 1000);
  };

  const inputClasses = (field) =>
    `w-full px-4 py-2.5 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors ${
      errors[field] && touched[field] ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
    }`;

  return (
    <>
      {!isSettingsTab && <Header />}
    <form
      onSubmit={handleSubmit}
      className={`space-y-8 ${isSettingsTab ? 'flex flex-col min-h-full' : ''}`}
      noValidate
    >
      <main className="flex-grow max-w-4xl mx-auto px-6 md:px-12 py-12 w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Mi Perfil</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Modifica tu información pública, datos de contacto y presentación personal para
            personalizar tus itinerarios en Xicotepec de Juárez.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Avatar & Mini-Insight */}
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[0px_8px_30px_rgba(0,0,0,0.03)] h-fit">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-solid border-primary shadow-inner mb-4 group">
              <img
                className="w-full h-full object-cover"
                alt="User Profile"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
              </div>
            </div>
            <h3 className="text-base font-bold text-primary">{formData.fullName}</h3>
            <p className="text-xs text-on-surface-variant mt-1">Miembro Premium desde 2024</p>
            <div className="mt-6 w-full pt-4 border-t border-solid border-outline-variant/30 flex justify-around text-center">
              <div>
                <div className="text-sm font-bold text-primary">12</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Viajes</div>
              </div>
              <div>
                <div className="text-sm font-bold text-primary">4.9</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Score</div>
              </div>
            </div>
          </div>

          {/* Card 2: Información Personal */}
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 md:p-8 space-y-6 md:col-span-2 shadow-[0px_8px_30px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 text-primary border-b border-solid border-outline-variant/20 pb-3">
              <span className="material-symbols-outlined text-[22px]">badge</span>
              <h2 className="text-base font-bold">Información Personal</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="fullName">
                  Nombre Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClasses('fullName')}
                  aria-invalid={!!(errors.fullName && touched.fullName)}
                  required
                />
                {errors.fullName && touched.fullName && (
                  <p className="text-xs text-error">{errors.fullName}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="location">
                  Ubicación base
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClasses('location')}
                  aria-invalid={!!(errors.location && touched.location)}
                />
                {errors.location && touched.location && (
                  <p className="text-xs text-error">{errors.location}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClasses('email')}
                  aria-invalid={!!(errors.email && touched.email)}
                  required
                />
                {errors.email && touched.email && (
                  <p className="text-xs text-error">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="phone">
                  Teléfono de Contacto
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClasses('phone')}
                  aria-invalid={!!(errors.phone && touched.phone)}
                />
                {errors.phone && touched.phone && (
                  <p className="text-xs text-error">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="bio">
                  Biografía del viajero
                </label>
                <span
                  className={`text-[10px] font-medium ${
                    formData.bio.length > BIO_MAX_LENGTH ? 'text-error' : 'text-on-surface-variant/60'
                  }`}
                >
                  {formData.bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputClasses('bio')} resize-none leading-relaxed`}
                aria-invalid={!!(errors.bio && touched.bio)}
              />
              {errors.bio && touched.bio && (
                <p className="text-xs text-error">{errors.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Acciones Finales */}
        <div className="flex items-center justify-end gap-4 border-t border-solid border-outline-variant/30 pt-6 mt-6">
          <button
            type="button"
            className="px-5 py-3 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-on-primary font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 border-none"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </main>
    </form>
      {!isSettingsTab && <Footer />}
    </>
  );
}

export default UserProfile;