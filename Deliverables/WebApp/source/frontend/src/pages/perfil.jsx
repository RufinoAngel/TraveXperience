import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

function UserProfile({ onNavigate, isSettingsTab = false }) {
  const [formData, setFormData] = useState({
    fullName: 'Sophia Martinez',
    email: 'sophia.martinez@example.com',
    phone: '+44 7700 900077',
    location: 'Londres, Reino Unido',
    bio: 'Amante de los viajes de lujo, la fotografía de paisajes y la exploración gastronómica en cada rincón del mundo.',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('¡Perfil actualizado correctamente!');
    }, 1000);
  };

  return (
    <>
      <Header />
    <form
      onSubmit={handleSubmit}
      className={`space-y-8 ${isSettingsTab ? 'flex flex-col min-h-full' : ''}`}
    >
      <main className="flex-grow max-w-4xl mx-auto px-6 md:px-12 py-12 w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Mi Perfil</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Modifica tu información pública, datos de contacto y presentación personal para
            personalizar tus itinerarios premium.
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
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Ubicación base
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Biografía del viajero
              </label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-solid border-outline-variant rounded-xl text-sm font-medium text-primary outline-none focus:border-primary transition-colors resize-none leading-relaxed"
              />
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
      <Footer />
    </>
  );
}

export default UserProfile;