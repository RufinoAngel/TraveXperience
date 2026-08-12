import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

const onlyDigits = (value) => value.replace(/\D/g, '');
const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;
const DELETE_CONFIRM_WORD = 'ELIMINAR';

function PrivacySecurity({ onNavigate, isSettingsTab = false }) {
  // Estados para controlar los interruptores de privacidad de forma reactiva
  const [insightsEnabled, setInsightsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  // --- Sesiones activas (estado local para poder "cerrar" una) ---
  const [sessions, setSessions] = useState([
    {
      id: 'session-current',
      device: 'MacBook Pro 16" — Xicotepec de Juárez, Puebla',
      detail: 'Sesión actual • Chrome',
      icon: 'laptop_mac',
      isCurrent: true,
    },
    {
      id: 'session-mobile',
      device: 'iPhone 15 Pro — Poza Rica, Veracruz',
      detail: 'Última actividad: hace 2 horas • Safari',
      icon: 'smartphone',
      isCurrent: false,
    },
  ]);
  const [sessionPendingClose, setSessionPendingClose] = useState(null); // session object | null

  const confirmCloseSession = () => {
    if (!sessionPendingClose) return;
    setSessions((prev) => prev.filter((s) => s.id !== sessionPendingClose.id));
    setSessionPendingClose(null);
  };

  // --- 2FA: flujo de dos pasos (teléfono -> código) ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState('phone'); // 'phone' | 'code'
  const [twoFAPhone, setTwoFAPhone] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAErrors, setTwoFAErrors] = useState({ phone: '', code: '' });
  const [twoFATouched, setTwoFATouched] = useState({ phone: false, code: false });
  const [isSending2FA, setIsSending2FA] = useState(false);

  const validatePhone = (value) => {
    const trimmed = value.trim();
    const digitCount = onlyDigits(trimmed).length;
    if (!trimmed) return 'Ingresa un número de teléfono.';
    if (!PHONE_REGEX.test(trimmed) || digitCount < 10 || digitCount > 15) {
      return 'Ingresa un número de teléfono válido, con lada incluida.';
    }
    return '';
  };

  const validateCode = (value) => {
    const digits = onlyDigits(value);
    if (!digits) return 'Ingresa el código de verificación.';
    if (digits.length !== 6) return 'El código debe tener 6 dígitos.';
    return '';
  };

  const openTwoFAModal = () => {
    setTwoFAStep('phone');
    setTwoFAPhone('');
    setTwoFACode('');
    setTwoFAErrors({ phone: '', code: '' });
    setTwoFATouched({ phone: false, code: false });
    setShow2FAModal(true);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setTwoFAPhone(value);
    if (twoFATouched.phone) {
      setTwoFAErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
    }
  };

  const handlePhoneBlur = () => {
    setTwoFATouched((prev) => ({ ...prev, phone: true }));
    setTwoFAErrors((prev) => ({ ...prev, phone: validatePhone(twoFAPhone) }));
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    const phoneError = validatePhone(twoFAPhone);
    setTwoFAErrors((prev) => ({ ...prev, phone: phoneError }));
    setTwoFATouched((prev) => ({ ...prev, phone: true }));
    if (phoneError) return;

    setIsSending2FA(true);
    setTimeout(() => {
      setIsSending2FA(false);
      setTwoFAStep('code');
    }, 900);
  };

  const handleCodeChange = (e) => {
    const value = onlyDigits(e.target.value).slice(0, 6);
    setTwoFACode(value);
    if (twoFATouched.code) {
      setTwoFAErrors((prev) => ({ ...prev, code: validateCode(value) }));
    }
  };

  const handleCodeBlur = () => {
    setTwoFATouched((prev) => ({ ...prev, code: true }));
    setTwoFAErrors((prev) => ({ ...prev, code: validateCode(twoFACode) }));
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    const codeError = validateCode(twoFACode);
    setTwoFAErrors((prev) => ({ ...prev, code: codeError }));
    setTwoFATouched((prev) => ({ ...prev, code: true }));
    if (codeError) return;

    setIs2FAEnabled(true);
    setShow2FAModal(false);
  };

  // --- Eliminar cuenta: requiere escribir la palabra de confirmación ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteTouched, setDeleteTouched] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const deleteConfirmError =
    deleteTouched && deleteConfirmText.trim().toUpperCase() !== DELETE_CONFIRM_WORD
      ? `Escribe "${DELETE_CONFIRM_WORD}" exactamente como se muestra para confirmar.`
      : '';

  const openDeleteModal = () => {
    setDeleteConfirmText('');
    setDeleteTouched(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = (e) => {
    e.preventDefault();
    setDeleteTouched(true);
    if (deleteConfirmText.trim().toUpperCase() !== DELETE_CONFIRM_WORD) return;

    setIsDeletingAccount(true);
    setTimeout(() => {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
      if (onNavigate) onNavigate('login');
    }, 1200);
  };

  const content = (
    <main className="flex-grow max-w-4xl mx-auto px-6 md:px-12 py-12 w-full">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Privacidad y Seguridad</h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Gestiona tus preferencias de datos y la seguridad de tu cuenta. Utilizamos un diseño minimalista de alta utilidad para garantizar que tu control sea intuitivo y absoluto.
        </p>
      </header>

      <div className="space-y-12">
        
        {/* Section: Privacy Controls */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-primary border-b border-solid border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[22px]">visibility_off</span>
            <h2 className="text-lg font-bold">Controles de Privacidad</h2>
          </div>
          <div className="grid gap-4">
            
            {/* Toggle Card 1 */}
            <div className={`bg-surface-container-lowest border border-solid p-6 rounded-xl flex justify-between items-center transition-all ${insightsEnabled ? 'border-primary' : 'border-outline-variant/40 hover:border-outline-variant'}`}>
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-bold text-primary mb-1">Análisis de Viajes Personalizado</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Permítenos analizar tu historial de visitas para sugerir rutas e itinerarios optimizados dentro de Xicotepec de Juárez.</p>
              </div>
              <button 
                type="button"
                onClick={() => setInsightsEnabled(!insightsEnabled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative outline-none border-none cursor-pointer ${insightsEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${insightsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Toggle Card 2 */}
            <div className={`bg-surface-container-lowest border border-solid p-6 rounded-xl flex justify-between items-center transition-all ${marketingEnabled ? 'border-primary' : 'border-outline-variant/40 hover:border-outline-variant'}`}>
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-bold text-primary mb-1">Preferencias de Marketing</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Recibe actualizaciones exclusivas sobre experiencias en la Sierra Norte de Puebla y funciones especiales de Xicotepec Xperience.</p>
              </div>
              <button 
                type="button"
                onClick={() => setMarketingEnabled(!marketingEnabled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative outline-none border-none cursor-pointer ${marketingEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${marketingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Cookie Card */}
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl flex justify-between items-center transition-all hover:border-primary">
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-bold text-primary mb-1">Cookies y Seguimiento de Sesión</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Las cookies funcionales son esenciales, pero puedes desactivar las cookies analíticas opcionales aquí.</p>
              </div>
              <button type="button" className="px-4 py-2 text-xs font-bold text-primary border border-solid border-outline rounded-xl bg-transparent hover:bg-surface-container transition-colors shrink-0 cursor-pointer">
                Gestionar Cookies
              </button>
            </div>
          </div>
        </section>

        {/* Section: Account Security */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-primary border-b border-solid border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[22px]">shield</span>
            <h2 className="text-lg font-bold">Seguridad de la Cuenta</h2>
          </div>
          <div className="space-y-4">
            
            {/* 2FA Card */}
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold text-primary mb-1">Autenticación de Dos Factores (2FA)</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Protege tus itinerarios y datos de presupuesto agregando una capa adicional de seguridad.</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border border-solid ${
                  is2FAEnabled
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-tertiary-fixed text-primary border-outline-variant/30'
                }`}>
                  {is2FAEnabled ? 'Activado' : 'Recomendado'}
                </span>
              </div>
              <button
                type="button"
                onClick={openTwoFAModal}
                disabled={is2FAEnabled}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {is2FAEnabled ? '2FA Activado' : 'Activar 2FA'}
              </button>
            </div>

            {/* Active Sessions */}
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl">
              <h3 className="text-sm font-bold text-primary mb-4">Sesiones Activas</h3>
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between ${
                      index < sessions.length - 1 ? 'pb-4 border-b border-solid border-outline-variant/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-on-surface-variant">{session.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-primary">{session.device}</p>
                        <p className="text-[11px] text-on-surface-variant">{session.detail}</p>
                      </div>
                    </div>
                    {session.isCurrent ? (
                      <span className="text-xs text-secondary font-bold whitespace-nowrap">Este Dispositivo</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSessionPendingClose(session)}
                        className="text-error text-xs font-bold hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Cerrar Sesión
                      </button>
                    )}
                  </div>
                ))}
                {sessions.length === 1 && (
                  <p className="text-xs text-on-surface-variant/70">No hay otras sesiones activas.</p>
                )}
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-primary mb-1">Contraseña</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Último cambio hace 4 meses.</p>
              </div>
              <button
                type="button"
                onClick={() => { if (onNavigate) onNavigate('settings', { tab: 'Privacy' }); }}
                className="px-4 py-2 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
              >
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </section>

        {/* Section: Data Management */}
        <section className="pb-12">
          <div className="flex items-center gap-2 mb-6 text-primary border-b border-solid border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[22px]">database</span>
            <h2 className="text-lg font-bold">Gestión de Datos</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl group hover:border-primary transition-all">
              <h3 className="text-sm font-bold text-primary mb-2">Descargar tus Datos</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Exporta todos tus itinerarios de viaje, registros de gastos y configuraciones en formato JSON o CSV.</p>
              <button type="button" className="flex items-center gap-2 text-primary font-bold text-xs bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined text-sm">download</span>
                Solicitar Exportación
              </button>
            </div>
            <div className="bg-surface-container-lowest border border-solid border-outline-variant/40 p-6 rounded-xl group hover:border-error transition-all">
              <h3 className="text-sm font-bold text-primary mb-2">Eliminar Cuenta</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Remueve permanentemente todo tu historial de viajes e información personal de nuestros servidores de forma segura.</p>
              <button
                type="button"
                onClick={openDeleteModal}
                className="flex items-center gap-2 text-error font-bold text-xs bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                Cerrar Cuenta
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* --- Modal: Cerrar sesión activa --- */}
      {sessionPendingClose && (
        <div className="fixed inset-0 z-[70] bg-primary/40 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-14 h-14 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[28px]">logout</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">¿Cerrar esta sesión?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Se cerrará la sesión en <span className="font-semibold text-primary">{sessionPendingClose.device}</span>. Ese dispositivo necesitará iniciar sesión de nuevo.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSessionPendingClose(null)}
                className="px-5 py-2.5 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmCloseSession}
                className="px-6 py-2.5 bg-error text-white font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none"
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal: Activar 2FA (teléfono -> código) --- */}
      {show2FAModal && (
        <div className="fixed inset-0 z-[70] bg-primary/40 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary">Activar 2FA</h3>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="text-on-surface-variant hover:text-primary bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {twoFAStep === 'phone' ? (
              <form onSubmit={handleSendCode} className="space-y-4" noValidate>
                <p className="text-sm text-on-surface-variant">
                  Ingresa el número de teléfono donde quieres recibir tus códigos de verificación.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="twofa-phone">
                    Número de Teléfono
                  </label>
                  <input
                    id="twofa-phone"
                    type="tel"
                    placeholder="+52 776 123 4567"
                    value={twoFAPhone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    className={`w-full px-4 py-2.5 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors ${
                      twoFAErrors.phone && twoFATouched.phone
                        ? 'border-error focus:border-error'
                        : 'border-outline-variant focus:border-primary'
                    }`}
                  />
                  {twoFAErrors.phone && twoFATouched.phone && (
                    <p className="text-xs text-error pt-1">{twoFAErrors.phone}</p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShow2FAModal(false)}
                    className="px-5 py-2.5 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSending2FA}
                    className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50"
                  >
                    {isSending2FA ? 'Enviando...' : 'Enviar Código'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4" noValidate>
                <p className="text-sm text-on-surface-variant">
                  Enviamos un código de 6 dígitos a <span className="font-semibold text-primary">{twoFAPhone}</span>.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="twofa-code">
                    Código de Verificación
                  </label>
                  <input
                    id="twofa-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={twoFACode}
                    onChange={handleCodeChange}
                    onBlur={handleCodeBlur}
                    className={`w-full px-4 py-2.5 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors tracking-[0.3em] ${
                      twoFAErrors.code && twoFATouched.code
                        ? 'border-error focus:border-error'
                        : 'border-outline-variant focus:border-primary'
                    }`}
                  />
                  {twoFAErrors.code && twoFATouched.code && (
                    <p className="text-xs text-error pt-1">{twoFAErrors.code}</p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setTwoFAStep('phone')}
                    className="text-xs font-bold text-on-surface-variant hover:text-primary bg-transparent border-none cursor-pointer"
                  >
                    Cambiar número
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShow2FAModal(false)}
                      className="px-5 py-2.5 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none"
                    >
                      Verificar
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- Modal: Eliminar cuenta (requiere escribir palabra de confirmación) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] bg-primary/40 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
            <div className="w-14 h-14 bg-error-container text-error rounded-full flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Eliminar tu cuenta</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Esta acción es <span className="font-bold text-error">permanente</span> y eliminará todo tu historial de viajes, reservas y datos personales. No se puede deshacer.
            </p>

            <form onSubmit={handleConfirmDelete} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="delete-confirm">
                  Escribe <span className="font-mono font-bold text-primary">{DELETE_CONFIRM_WORD}</span> para confirmar
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  onBlur={() => setDeleteTouched(true)}
                  placeholder={DELETE_CONFIRM_WORD}
                  className={`w-full px-4 py-2.5 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors ${
                    deleteConfirmError ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {deleteConfirmError && <p className="text-xs text-error pt-1">{deleteConfirmError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount || deleteConfirmText.trim().toUpperCase() !== DELETE_CONFIRM_WORD}
                  className="px-6 py-2.5 bg-error text-white font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeletingAccount ? 'Eliminando...' : 'Eliminar Cuenta Permanentemente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );

  if (isSettingsTab) {
    return content;
  }

  return (
    <div className="bg-background text-on-background font-sans selection:bg-secondary-container min-h-screen flex flex-col antialiased">
      <Header />
      <div className="flex pt-16 flex-1">
        {content}
      </div>
      <Footer />
    </div>
  );
}

export default PrivacySecurity;