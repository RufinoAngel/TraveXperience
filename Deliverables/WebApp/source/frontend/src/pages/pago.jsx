import React, { useState } from 'react';
import Layout from '../components/Layout.jsx';

// --- Helpers de formato ---
const onlyDigits = (value) => value.replace(/\D/g, '');

function formatCardNumber(value) {
  const digits = onlyDigits(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// Algoritmo de Luhn para validar el número de tarjeta
function luhnCheck(numberStr) {
  const digits = onlyDigits(numberStr);
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return digits.length > 0 && sum % 10 === 0;
}

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,60}$/;

function validateCardField(field, value) {
  switch (field) {
    case 'cardholderName': {
      const trimmed = value.trim();
      if (!trimmed) return 'El nombre del titular es obligatorio.';
      if (!NAME_REGEX.test(trimmed)) return 'Ingresa el nombre tal como aparece en la tarjeta.';
      return '';
    }
    case 'cardNumber': {
      const digits = onlyDigits(value);
      if (!digits) return 'El número de tarjeta es obligatorio.';
      if (digits.length < 13 || digits.length > 19) return 'El número de tarjeta no es válido.';
      if (!luhnCheck(digits)) return 'El número de tarjeta ingresado no es válido.';
      return '';
    }
    case 'expiry': {
      if (!value) return 'La fecha de expiración es obligatoria.';
      const match = /^(\d{2})\/(\d{2})$/.exec(value);
      if (!match) return 'Usa el formato MM/AA.';
      const month = parseInt(match[1], 10);
      const year = parseInt(`20${match[2]}`, 10);
      if (month < 1 || month > 12) return 'El mes ingresado no es válido.';
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return 'Esta tarjeta ya expiró.';
      }
      return '';
    }
    case 'cvc': {
      const digits = onlyDigits(value);
      if (!digits) return 'El CVC es obligatorio.';
      if (digits.length < 3 || digits.length > 4) return 'El CVC debe tener 3 o 4 dígitos.';
      return '';
    }
    default:
      return '';
  }
}

function Checkout({ onNavigate, hotel }) {
  const [paymentMethod, setPaymentMethod] = useState('saved-card'); // 'saved-card' | 'new-card'
  const [billingSameAsTraveler, setBillingSameAsTraveler] = useState(true);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const [cardValues, setCardValues] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [cardErrors, setCardErrors] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [cardTouched, setCardTouched] = useState({
    cardholderName: false,
    cardNumber: false,
    expiry: false,
    cvc: false,
  });

  const handleCardChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'cardNumber') value = formatCardNumber(value);
    if (field === 'expiry') value = formatExpiry(value);
    if (field === 'cvc') value = onlyDigits(value).slice(0, 4);

    setCardValues((prev) => ({ ...prev, [field]: value }));
    if (cardTouched[field]) {
      setCardErrors((prev) => ({ ...prev, [field]: validateCardField(field, value) }));
    }
  };

  const handleCardBlur = (field) => () => {
    setCardTouched((prev) => ({ ...prev, [field]: true }));
    setCardErrors((prev) => ({ ...prev, [field]: validateCardField(field, cardValues[field]) }));
  };

  const validateNewCard = () => {
    const newErrors = {
      cardholderName: validateCardField('cardholderName', cardValues.cardholderName),
      cardNumber: validateCardField('cardNumber', cardValues.cardNumber),
      expiry: validateCardField('expiry', cardValues.expiry),
      cvc: validateCardField('cvc', cardValues.cvc),
    };
    setCardErrors(newErrors);
    setCardTouched({ cardholderName: true, cardNumber: true, expiry: true, cvc: true });
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleCompleteBooking = () => {
    // Solo validamos los campos de tarjeta nueva si el usuario eligió esa opción.
    // Si eligió la tarjeta guardada, no hay nada que validar en el formulario.
    if (paymentMethod === 'new-card' && !validateNewCard()) {
      return;
    }

    setStatus('loading');
    
    // Simulación del proceso de pago de lujo
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('payment-success');
        }
        setStatus('idle');
      }, 800);
    }, 1800);
  };

  const cardInputClasses = (field) =>
    `w-full bg-surface p-4 rounded-lg border transition-all outline-none ${
      cardErrors[field] && cardTouched[field]
        ? 'border-error focus:border-error'
        : 'border-transparent focus:border-primary focus:bg-white'
    }`;

  return (
    <Layout>
      {/* Main Container */}
      <main className="pt-24 pb-20 px-6 md:px-16 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Payment & Billing */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Section Header */}
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Checkout</h1>
              <p className="text-base text-on-surface-variant">Revisa los detalles de tu viaje y completa tu pago seguro.</p>
            </div>

            {/* Express Checkout */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/50 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-secondary">bolt</span>
                Pago Exprés
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Apple Pay — botón oficial: fondo negro, logotipo blanco */}
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  aria-label="Pagar con Apple Pay"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                      d="M16.365 1.43c0 1.14-.462 2.06-1.155 2.75-.75.75-1.98 1.32-2.985 1.24-.135-1.11.435-2.28 1.11-3 .75-.81 2.04-1.41 3.03-1.44.015.15.015.3.015.45zM20.4 17.19c-.555 1.29-.825 1.86-1.53 3-.99 1.575-2.385 3.54-4.11 3.555-1.53.015-1.92-1.005-3.99-.99-2.07.015-2.505 1.005-4.035.99-1.725-.015-3.045-1.785-4.035-3.36C-.06 17.19-.855 13.2.615 10.5c1.02-1.875 2.85-3.06 4.83-3.075 1.635-.015 2.895 1.11 3.99 1.11 1.08 0 2.7-1.365 4.53-1.17.75.03 2.865.3 4.29 2.31-.105.07-2.565 1.5-2.535 4.47.03 3.57 3.12 4.755 3.15 4.77-.03.09-.5 1.68-1.47 3.275z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-sm">Apple Pay</span>
                </button>

                {/* Google Pay — botón oficial: fondo blanco, borde gris, "G" multicolor */}
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3.5 border border-outline rounded-lg font-semibold hover:bg-surface-container-low transition-colors bg-white text-[#3c4043]"
                  aria-label="Pagar con Google Pay"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.99.66-2.25 1.06-3.73 1.06-2.87 0-5.3-1.94-6.17-4.53H2.18v2.85A11 11 0 0 0 12 23z" fill="#34A853"/>
                    <path d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.65-2.85z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.99 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.65 2.85C6.7 7.32 9.13 5.38 12 5.38z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm">Google Pay</span>
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-primary">Método de Pago</h2>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Paso 2 de 3</span>
              </div>

              {/* Saved Cards */}
              <div className="space-y-4 mb-8">
                <label 
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'saved-card' 
                      ? 'border-secondary bg-secondary/5' 
                      : 'border-outline-variant/40 bg-transparent'
                  }`}
                >
                  <input 
                    checked={paymentMethod === 'saved-card'} 
                    onChange={() => setPaymentMethod('saved-card')}
                    className="text-secondary focus:ring-secondary mr-4" 
                    name="payment" 
                    type="radio"
                  />
                  <div className="flex items-center gap-4 flex-1">
                    <span className="material-symbols-outlined text-secondary text-[32px]">credit_card</span>
                    <div>
                      <p className="font-semibold text-primary">•••• •••• •••• 4242</p>
                      <p className="text-xs text-on-surface-variant">Visa | Expira 12/26</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* New Card Form */}
              <div className="space-y-6">
                <label
                  className={`flex items-center gap-2 mb-4 cursor-pointer transition-colors ${
                    paymentMethod === 'new-card' ? 'text-primary' : 'text-on-surface-variant/70'
                  }`}
                >
                  <input
                    checked={paymentMethod === 'new-card'}
                    onChange={() => setPaymentMethod('new-card')}
                    className="text-secondary focus:ring-secondary mr-1"
                    name="payment"
                    type="radio"
                  />
                  <div className="h-px bg-outline-variant/40 flex-1"></div>
                  <span className="text-xs font-bold px-2 tracking-wider">O PAGA CON OTRA TARJETA</span>
                  <div className="h-px bg-outline-variant/40 flex-1"></div>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="cardholderName">
                      Nombre del Titular
                    </label>
                    <input
                      id="cardholderName"
                      className={cardInputClasses('cardholderName')}
                      placeholder="Julian Casablancas"
                      type="text"
                      value={cardValues.cardholderName}
                      onChange={handleCardChange('cardholderName')}
                      onFocus={() => setPaymentMethod('new-card')}
                      onBlur={handleCardBlur('cardholderName')}
                      aria-invalid={!!(cardErrors.cardholderName && cardTouched.cardholderName)}
                    />
                    {cardErrors.cardholderName && cardTouched.cardholderName && (
                      <p className="text-xs text-error pt-1">{cardErrors.cardholderName}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="cardNumber">
                      Número de Tarjeta
                    </label>
                    <div className="relative">
                      <input
                        id="cardNumber"
                        className={`${cardInputClasses('cardNumber')} pr-12`}
                        placeholder="0000 0000 0000 0000"
                        type="text"
                        inputMode="numeric"
                        value={cardValues.cardNumber}
                        onChange={handleCardChange('cardNumber')}
                        onFocus={() => setPaymentMethod('new-card')}
                        onBlur={handleCardBlur('cardNumber')}
                        aria-invalid={!!(cardErrors.cardNumber && cardTouched.cardNumber)}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-4 text-outline text-[20px]">lock</span>
                    </div>
                    {cardErrors.cardNumber && cardTouched.cardNumber && (
                      <p className="text-xs text-error pt-1">{cardErrors.cardNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="expiry">
                      Fecha de Expiración
                    </label>
                    <input
                      id="expiry"
                      className={cardInputClasses('expiry')}
                      placeholder="MM/YY"
                      type="text"
                      inputMode="numeric"
                      value={cardValues.expiry}
                      onChange={handleCardChange('expiry')}
                      onFocus={() => setPaymentMethod('new-card')}
                      onBlur={handleCardBlur('expiry')}
                      aria-invalid={!!(cardErrors.expiry && cardTouched.expiry)}
                    />
                    {cardErrors.expiry && cardTouched.expiry && (
                      <p className="text-xs text-error pt-1">{cardErrors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="cvc">
                      CVC / CVV
                    </label>
                    <input
                      id="cvc"
                      className={cardInputClasses('cvc')}
                      placeholder="•••"
                      type="text"
                      inputMode="numeric"
                      value={cardValues.cvc}
                      onChange={handleCardChange('cvc')}
                      onFocus={() => setPaymentMethod('new-card')}
                      onBlur={handleCardBlur('cvc')}
                      aria-invalid={!!(cardErrors.cvc && cardTouched.cvc)}
                    />
                    {cardErrors.cvc && cardTouched.cvc && (
                      <p className="text-xs text-error pt-1">{cardErrors.cvc}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Details Toggle */}
              <div className="mt-8 pt-8 border-t border-outline-variant/30">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    checked={billingSameAsTraveler} 
                    onChange={(e) => setBillingSameAsTraveler(e.target.checked)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" 
                    type="checkbox"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    La dirección de facturación es la misma que la del viajero
                  </span>
                </label>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-between gap-6 py-4 px-2 opacity-60">
              <div className="flex items-center gap-6 text-sm font-semibold text-on-surface-variant">
                <span>🔒 Certificado SSL de 256 bits</span>
                <span>💳 Cumplimiento PCI-DSS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Trip Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                
                {/* Header / Hero Image */}
                <div className="h-40 bg-cover bg-center relative bg-[url('https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80')]">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <p className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-1">Viaje a Xicotepec de Juárez</p>
                    <h3 className="text-white font-bold text-lg">{hotel ? hotel.title : 'Escapada al Pueblo Mágico del Café'}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Resumen del Pedido</h4>
                    
                    {/* Service Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-primary">{hotel ? hotel.title : 'Posada del Café Xicotepec'}</p>
                          <p className="text-xs text-on-surface-variant">3 noches, 2 huéspedes</p>
                        </div>
                        <p className="text-sm font-medium text-primary">$1,850.00</p>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-primary">ADO - Autobús Ejecutivo</p>
                          <p className="text-xs text-on-surface-variant">CDMX ↔ Xicotepec de Juárez</p>
                        </div>
                        <p className="text-sm font-medium text-primary">$780.00</p>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-primary">Experiencias Locales</p>
                          <p className="text-xs text-on-surface-variant">Ruta del Café, Cena en Las Acamayas</p>
                        </div>
                        <p className="text-sm font-medium text-primary">$620.00</p>
                      </div>
                    </div>

                    <div className="h-px bg-outline-variant/30 my-4"></div>

                    {/* Fees & Taxes */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Impuestos y cuotas</span>
                        <span className="font-medium text-primary">$180.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Tarifa de reserva</span>
                        <span className="font-bold text-secondary">Gratis</span>
                      </div>
                    </div>

                    <div className="bg-surface-container p-4 rounded-lg my-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">Total</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold block text-primary">
                            {hotel && hotel.price ? `$${hotel.price.toLocaleString()} MXN` : '$3,430.00 MXN'}
                          </span>
                          <span className="text-xs text-on-surface-variant">Impuestos incluidos</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                      onClick={handleCompleteBooking}
                      disabled={status === 'loading'}
                      className="w-full bg-primary text-on-primary py-5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70"
                    >
                      {status === 'idle' && (
                        <>
                          Completar Reserva
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                      )}
                      {status === 'loading' && (
                        <>
                          <span className="animate-spin material-symbols-outlined">progress_activity</span>
                          Procesando Pago...
                        </>
                      )}
                      {status === 'success' && '¡Reserva Completada!'}
                    </button>

                    <p className="text-center text-[11px] text-on-surface-variant mt-4 leading-normal">
                      Al hacer clic, aceptas nuestros <a className="underline hover:text-primary" href="#">Términos de Servicio</a> y <a className="underline hover:text-primary" href="#">Política de Privacidad</a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Assistance Card */}
              <div className="bg-secondary-container text-primary p-6 rounded-xl relative overflow-hidden shadow-sm">
                <div className="relative z-10">
                  <h5 className="font-bold text-lg mb-2 text-primary">¿Necesitas Ayuda?</h5>
                  <p className="text-sm opacity-90 mb-4 max-w-[85%]">Nuestro servicio de Concierge está disponible 24/7 para asistirte con tu reserva.</p>
                  <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-xs hover:bg-opacity-90 transition-colors">
                    Contactar Soporte
                  </button>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-primary/5 text-[120px] select-none pointer-events-none">
                  support_agent
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Feedback Overlay */}
      {status === 'success' && (
        <div className="fixed inset-0 z-[60] bg-primary/40 backdrop-blur-md flex items-center justify-center transition-all duration-500 animate-fade-in">
          <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md mx-4 transform transition-transform duration-500 scale-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">¡Reserva Confirmada!</h2>
            <p className="text-on-surface-variant mb-8 text-sm">
              ¡Prepara tus maletas! Tu itinerario completo para Xicotepec de Juárez ha sido enviado a tu correo electrónico.
            </p>
            <button 
              className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold w-full transition-all active:scale-[0.98]" 
              onClick={() => setStatus('idle')}
            >
              Ir a Mis Viajes
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Checkout;