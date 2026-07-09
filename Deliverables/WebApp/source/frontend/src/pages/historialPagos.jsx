import React, { useState } from 'react';

// --- Helpers de formato y validación (mismas reglas que en Checkout) ---
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

function detectBrand(digits) {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Tarjeta';
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
      if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
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

const EMPTY_CARD_FORM = { cardholderName: '', cardNumber: '', expiry: '', cvc: '' };

function PaymentsBilling({ onNavigate, isSettingsTab = false }) {
  const [searchTerm, setSearchTerm] = useState('');

  // --- Tarjetas guardadas (estado local, sin backend por ahora) ---
  const [cards, setCards] = useState([
    {
      id: 'card-1',
      brand: 'Visa Signature',
      last4: '4242',
      holder: 'JONATHAN HERNANDEZ',
      expiry: '12/26',
      isDefault: false,
      variant: 'primary',
    },
    {
      id: 'card-2',
      brand: 'Mastercard Gold',
      last4: '8819',
      holder: 'JONATHAN HERNANDEZ',
      expiry: '08/25',
      isDefault: true,
      variant: 'secondary',
    },
  ]);

  const [cardPendingDelete, setCardPendingDelete] = useState(null); // card object | null

  // --- Modal para agregar tarjeta ---
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
  const [cardFormErrors, setCardFormErrors] = useState(EMPTY_CARD_FORM);
  const [cardFormTouched, setCardFormTouched] = useState({
    cardholderName: false,
    cardNumber: false,
    expiry: false,
    cvc: false,
  });

  const openAddCardModal = () => {
    setCardForm(EMPTY_CARD_FORM);
    setCardFormErrors(EMPTY_CARD_FORM);
    setCardFormTouched({ cardholderName: false, cardNumber: false, expiry: false, cvc: false });
    setShowAddCard(true);
  };

  const handleCardFormChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'cardNumber') value = formatCardNumber(value);
    if (field === 'expiry') value = formatExpiry(value);
    if (field === 'cvc') value = onlyDigits(value).slice(0, 4);

    setCardForm((prev) => ({ ...prev, [field]: value }));
    if (cardFormTouched[field]) {
      setCardFormErrors((prev) => ({ ...prev, [field]: validateCardField(field, value) }));
    }
  };

  const handleCardFormBlur = (field) => () => {
    setCardFormTouched((prev) => ({ ...prev, [field]: true }));
    setCardFormErrors((prev) => ({ ...prev, [field]: validateCardField(field, cardForm[field]) }));
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      cardholderName: validateCardField('cardholderName', cardForm.cardholderName),
      cardNumber: validateCardField('cardNumber', cardForm.cardNumber),
      expiry: validateCardField('expiry', cardForm.expiry),
      cvc: validateCardField('cvc', cardForm.cvc),
    };
    setCardFormErrors(newErrors);
    setCardFormTouched({ cardholderName: true, cardNumber: true, expiry: true, cvc: true });
    if (!Object.values(newErrors).every((err) => !err)) return;

    const digits = onlyDigits(cardForm.cardNumber);
    const newCard = {
      id: `card-${Date.now()}`,
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      holder: cardForm.cardholderName.trim().toUpperCase(),
      expiry: cardForm.expiry,
      isDefault: cards.length === 0,
      variant: cards.length % 2 === 0 ? 'primary' : 'secondary',
    };
    setCards((prev) => [...prev, newCard]);
    setShowAddCard(false);
  };

  const confirmDeleteCard = () => {
    if (!cardPendingDelete) return;
    setCards((prev) => prev.filter((c) => c.id !== cardPendingDelete.id));
    setCardPendingDelete(null);
  };

  // --- Historial de transacciones (estado local para poder eliminar) ---
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '24 Oct, 2026',
      description: 'ADO - CDMX a Xicotepec de Juárez',
      category: 'directions_bus',
      categoryBg: 'bg-secondary-container/20 text-secondary',
      method: 'Visa terminación 4242',
      amount: '$680.00',
      status: 'Completado',
      statusClass: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 2,
      date: '22 Oct, 2026',
      description: 'Posada del Café Xicotepec - 3 Noches',
      category: 'hotel',
      categoryBg: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      method: 'Visa terminación 4242',
      amount: '$5,400.00',
      status: 'Procesando',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 3,
      date: '18 Oct, 2026',
      description: 'Restaurante Las Acamayas - Cena',
      category: 'restaurant',
      categoryBg: 'bg-primary-fixed text-primary',
      method: 'Mastercard terminación 8819',
      amount: '$620.00',
      status: 'Completado',
      statusClass: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 4,
      date: '15 Oct, 2026',
      description: 'Tour Ruta del Café - Museo Casa Carranza',
      category: 'close',
      categoryBg: 'bg-error-container text-error',
      method: 'Visa terminación 4242',
      amount: '-$450.00',
      status: 'Reembolsado',
      statusClass: 'bg-red-50 text-red-700 border-red-200',
      lineThrough: true
    }
  ]);

  const [txPendingDelete, setTxPendingDelete] = useState(null); // transaction object | null

  const confirmDeleteTransaction = () => {
    if (!txPendingDelete) return;
    setTransactions((prev) => prev.filter((t) => t.id !== txPendingDelete.id));
    setTxPendingDelete(null);
  };

  // Filtro básico en tiempo real para la tabla (recorta espacios extra en la búsqueda)
  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const cardFormInputClasses = (field) =>
    `w-full px-4 py-2.5 bg-surface-container-lowest border border-solid rounded-xl text-sm font-medium text-primary outline-none transition-colors ${
      cardFormErrors[field] && cardFormTouched[field]
        ? 'border-error focus:border-error'
        : 'border-outline-variant focus:border-primary'
    }`;

  const content = (
    <main className="min-h-screen px-6 md:px-12 py-10 max-w-[1280px] mx-auto w-full">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tighter">Pagos y Facturación</h2>
          <p className="text-sm text-on-surface-variant">Administra tus métodos de pago y haz el seguimiento de tus gastos de viaje.</p>
        </div>
        <button 
          type="button"
          onClick={openAddCardModal}
          className="bg-primary text-on-primary px-6 py-3 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Agregar Método de Pago
        </button>
      </header>

      {/* Saved Cards Section */}
      <section className="mb-12">
        <h3 className="text-lg font-bold text-primary mb-6">Métodos de Pago Guardados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {cards.map((card) =>
            card.variant === 'primary' ? (
              <div
                key={card.id}
                className="relative overflow-hidden p-6 rounded-2xl bg-primary text-white flex flex-col justify-between h-48 border border-white/10 group transition-all duration-300 hover:-translate-y-1 shadow-md"
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] opacity-60 uppercase tracking-widest font-semibold">
                      {card.isDefault ? 'Predeterminada' : 'Tarjeta Activa'}
                    </span>
                    <span className="text-base font-bold mt-1">{card.brand}</span>
                  </div>
                  <span className="material-symbols-outlined text-3xl">credit_card</span>
                </div>
                <div className="relative z-10">
                  <p className="font-mono text-lg tracking-[0.2em]">•••• •••• •••• {card.last4}</p>
                  <div className="flex justify-between items-end mt-4">
                    <p className="text-xs opacity-80 font-semibold tracking-wider">{card.holder}</p>
                    <p className="text-xs opacity-80 font-semibold">{card.expiry}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                  <button type="button" className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:scale-110 transition-transform shadow border-none cursor-pointer" title="Editar tarjeta">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardPendingDelete(card)}
                    className="w-10 h-10 rounded-full bg-white text-error flex items-center justify-center hover:scale-110 transition-transform shadow border-none cursor-pointer"
                    title="Eliminar tarjeta"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={card.id}
                className="relative overflow-hidden p-6 rounded-2xl bg-surface-container-lowest border border-solid border-outline-variant/30 flex flex-col justify-between h-48 group transition-all duration-300 hover:-translate-y-1 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    {card.isDefault && (
                      <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest w-fit mb-1">
                        Predeterminada
                      </span>
                    )}
                    <span className="text-base font-bold text-primary">{card.brand}</span>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-primary">payments</span>
                </div>
                <div>
                  <p className="font-mono text-lg tracking-[0.2em] text-primary">•••• •••• •••• {card.last4}</p>
                  <div className="flex justify-between items-end mt-4">
                    <p className="text-xs text-on-surface-variant font-semibold tracking-wider">{card.holder}</p>
                    <p className="text-xs text-on-surface-variant font-semibold">{card.expiry}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                  <button type="button" className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-110 transition-transform shadow border-none cursor-pointer" title="Editar tarjeta">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardPendingDelete(card)}
                    className="w-10 h-10 rounded-full bg-surface-container-high text-error flex items-center justify-center hover:scale-110 transition-transform shadow border-none cursor-pointer"
                    title="Eliminar tarjeta"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            )
          )}

          {/* Add New Placeholder */}
          <button 
            type="button"
            onClick={openAddCardModal}
            className="border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center h-48 hover:border-primary/40 hover:bg-surface-container-lowest transition-all group bg-transparent cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined">add</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Nueva Tarjeta</span>
          </button>
        </div>
      </section>

      {/* Transactions Section */}
      <section className="bg-surface-container-lowest border border-solid border-outline-variant/40 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-lg font-bold text-primary">Historial de Transacciones</h3>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:flex-initial">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant text-[20px]">search</span>
              <input 
                className="w-full md:w-64 bg-surface py-2.5 pl-10 pr-4 rounded-xl border border-solid border-outline-variant/60 focus:outline-none focus:border-primary text-sm font-medium" 
                placeholder="Buscar por concepto..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxLength={100}
              />
            </div>
            <button type="button" className="p-2 bg-surface rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors border border-solid border-transparent cursor-pointer">
              <span className="material-symbols-outlined text-[22px]">filter_list</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-0 border-b border-solid border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="text-left py-4 px-4">Fecha</th>
                <th className="text-left py-4 px-4">Descripción</th>
                <th className="text-left py-4 px-4">Método de Pago</th>
                <th className="text-right py-4 px-4">Monto</th>
                <th className="text-center py-4 px-4">Estado</th>
                <th className="text-right py-4 px-4">Factura</th>
                <th className="text-right py-4 px-4">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-solid divide-outline-variant/20">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-surface transition-colors">
                  <td className="py-5 px-4 font-mono text-sm text-primary">{transaction.date}</td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.categoryBg}`}>
                        <span className="material-symbols-outlined text-[18px]">{transaction.category}</span>
                      </div>
                      <span className={`text-sm font-semibold text-primary ${transaction.lineThrough ? 'line-through opacity-50' : ''}`}>
                        {transaction.description}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm opacity-50">credit_card</span>
                      <span className="text-xs text-on-surface-variant font-medium">{transaction.method}</span>
                    </div>
                  </td>
                  <td className={`py-5 px-4 text-right font-mono font-bold ${transaction.lineThrough ? 'text-error' : 'text-primary'}`}>
                    {transaction.amount}
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-solid text-[10px] font-bold uppercase tracking-wider ${transaction.statusClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${transaction.status === 'Procesando' ? 'bg-amber-500 animate-pulse' : transaction.status === 'Reembolsado' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <button 
                      type="button"
                      className={`p-1 transition-colors bg-transparent border-none ${transaction.status === 'Procesando' ? 'text-outline-variant cursor-not-allowed' : 'text-primary hover:text-secondary'}`}
                      disabled={transaction.status === 'Procesando'}
                      title="Descargar PDF"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {transaction.status === 'Reembolsado' ? 'receipt_long' : 'download'}
                      </span>
                    </button>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setTxPendingDelete(transaction)}
                      className="p-1 text-error hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer"
                      title="Eliminar transacción"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-sm text-on-surface-variant font-medium">
                    No se encontraron transacciones con esos criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-between items-center border-0 border-t border-solid border-outline-variant/20 pt-6">
          <p className="text-xs text-on-surface-variant font-medium">Mostrando 1 a {filteredTransactions.length} de {filteredTransactions.length} transacciones</p>
          <div className="flex items-center gap-1.5">
            <button type="button" className="w-9 h-9 rounded-xl border border-solid border-outline-variant/40 flex items-center justify-center hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed bg-transparent" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button type="button" className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center text-xs font-bold border-none cursor-pointer">1</button>
            <button type="button" className="w-9 h-9 rounded-xl border border-solid border-outline-variant/40 flex items-center justify-center hover:bg-surface text-xs font-semibold bg-transparent cursor-pointer">2</button>
            <button type="button" className="w-9 h-9 rounded-xl border border-solid border-outline-variant/40 flex items-center justify-center hover:bg-surface bg-transparent cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Budget Health Floating Pulse */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-surface-container-lowest/90 backdrop-blur border border-solid border-outline-variant/30 px-4 py-2.5 rounded-full shadow-lg z-30">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Estado del Presupuesto: Excelente</span>
      </div>

      {/* --- Modal: Agregar tarjeta --- */}
      {showAddCard && (
        <div className="fixed inset-0 z-[70] bg-primary/40 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary">Agregar Método de Pago</h3>
              <button
                type="button"
                onClick={() => setShowAddCard(false)}
                className="text-on-surface-variant hover:text-primary bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="new-cardholderName">
                  Nombre del Titular
                </label>
                <input
                  id="new-cardholderName"
                  type="text"
                  placeholder="Julian Casablancas"
                  value={cardForm.cardholderName}
                  onChange={handleCardFormChange('cardholderName')}
                  onBlur={handleCardFormBlur('cardholderName')}
                  className={cardFormInputClasses('cardholderName')}
                />
                {cardFormErrors.cardholderName && cardFormTouched.cardholderName && (
                  <p className="text-xs text-error pt-1">{cardFormErrors.cardholderName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="new-cardNumber">
                  Número de Tarjeta
                </label>
                <input
                  id="new-cardNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardForm.cardNumber}
                  onChange={handleCardFormChange('cardNumber')}
                  onBlur={handleCardFormBlur('cardNumber')}
                  className={cardFormInputClasses('cardNumber')}
                />
                {cardFormErrors.cardNumber && cardFormTouched.cardNumber && (
                  <p className="text-xs text-error pt-1">{cardFormErrors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="new-expiry">
                    Expiración
                  </label>
                  <input
                    id="new-expiry"
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={cardForm.expiry}
                    onChange={handleCardFormChange('expiry')}
                    onBlur={handleCardFormBlur('expiry')}
                    className={cardFormInputClasses('expiry')}
                  />
                  {cardFormErrors.expiry && cardFormTouched.expiry && (
                    <p className="text-xs text-error pt-1">{cardFormErrors.expiry}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2" htmlFor="new-cvc">
                    CVC
                  </label>
                  <input
                    id="new-cvc"
                    type="text"
                    inputMode="numeric"
                    placeholder="•••"
                    value={cardForm.cvc}
                    onChange={handleCardFormChange('cvc')}
                    onBlur={handleCardFormBlur('cvc')}
                    className={cardFormInputClasses('cvc')}
                  />
                  {cardFormErrors.cvc && cardFormTouched.cvc && (
                    <p className="text-xs text-error pt-1">{cardFormErrors.cvc}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="px-5 py-2.5 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none"
                >
                  Guardar Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Confirmar eliminación de tarjeta --- */}
      {cardPendingDelete && (
        <div className="fixed inset-0 z-[70] bg-primary/40 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-14 h-14 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">¿Eliminar esta tarjeta?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Se eliminará <span className="font-semibold text-primary">{cardPendingDelete.brand} terminación {cardPendingDelete.last4}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCardPendingDelete(null)}
                className="px-5 py-2.5 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteCard}
                className="px-6 py-2.5 bg-error text-white font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal: Confirmar eliminación de transacción --- */}
      {txPendingDelete && (
        <div className="fixed inset-0 z-[70] bg-primary/40 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-14 h-14 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">¿Eliminar esta transacción?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Se eliminará <span className="font-semibold text-primary">{txPendingDelete.description}</span> del historial. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTxPendingDelete(null)}
                className="px-5 py-2.5 border border-solid border-outline rounded-xl text-primary text-xs font-bold bg-transparent hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteTransaction}
                className="px-6 py-2.5 bg-error text-white font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  if (isSettingsTab) {
    return content;
  }

  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-secondary-container min-h-screen pt-16">
      {content}
    </div>
  );
}

export default PaymentsBilling;