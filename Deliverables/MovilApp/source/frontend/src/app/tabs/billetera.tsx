import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Fab from '../../components/Fab';

/* ─── Tipos ─────────────────────────────────────── */
interface Transaction {
  id: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  amount: string;
  positive: boolean;
  status: 'completado' | 'pendiente' | 'cancelado';
}

interface SavedMethod {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  active: boolean;
}

type AddStep = 'options' | 'card-form' | 'paypal-form';

interface CardFormState {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

interface CardFormErrors {
  number?: string;
  holder?: string;
  expiry?: string;
  cvv?: string;
}

/* ─── Datos de ejemplo ───────────────────────────── */
const TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    icon: 'flight',
    title: 'Vuelos Iberia',
    subtitle: 'Madrid → París',
    amount: '-€348,00',
    positive: false,
    status: 'completado',
  },
  {
    id: 't2',
    icon: 'bed',
    title: 'Hôtel Plaza Athénée',
    subtitle: 'París, Francia',
    amount: '-€1.240,00',
    positive: false,
    status: 'completado',
  },
  {
    id: 't3',
    icon: 'restaurant',
    title: 'Producción del Bistrot',
    subtitle: 'París, Francia',
    amount: '-€94,50',
    positive: false,
    status: 'completado',
  },
  {
    id: 't4',
    icon: 'account-balance-wallet',
    title: 'Reembolso Hotel',
    subtitle: 'Cancelación Trip #382',
    amount: '+€210,00',
    positive: true,
    status: 'completado',
  },
];

const INITIAL_METHODS: SavedMethod[] = [
  { id: 'm1', label: 'Tarjeta Mastercard ••4821', icon: 'credit-card', active: true },
  { id: 'm2', label: 'PayPal — julian@mail.com', icon: 'account-balance-wallet', active: false },
];

const ADD_OPTIONS: { icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string; key: 'card' | 'paypal' | 'transfer' }[] = [
  { icon: 'credit-card', label: 'Tarjeta de crédito / débito', key: 'card' },
  { icon: 'account-balance-wallet', label: 'PayPal', key: 'paypal' },
  { icon: 'account-balance', label: 'Transferencia bancaria', key: 'transfer' },
];

const STATUS_COLOR: Record<string, string> = {
  completado: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  cancelado: 'bg-red-100 text-red-700',
};

/* ─── Validadores (mismos que en metodos-pago.tsx) ─── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, '');
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
  return sum % 10 === 0;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validateCardNumber(value: string): string | undefined {
  const digits = value.replace(/\s/g, '');
  if (!digits) return 'El número de tarjeta es obligatorio.';
  if (digits.length < 13 || digits.length > 16) return 'El número de tarjeta no es válido.';
  if (!luhnCheck(digits)) return 'El número de tarjeta no es válido.';
  return undefined;
}

function validateHolder(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'El nombre del titular es obligatorio.';
  if (trimmed.length < 3) return 'Ingresa el nombre completo del titular.';
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)) return 'Solo se permiten letras y espacios.';
  return undefined;
}

function validateExpiry(value: string): string | undefined {
  if (!value) return 'La fecha de vencimiento es obligatoria.';
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return 'Usa el formato MM/AA.';
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return 'El mes no es válido.';
  const now = new Date();
  const expiryDate = new Date(year, month, 0);
  if (expiryDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
    return 'La tarjeta ya está vencida.';
  }
  return undefined;
}

function validateCvv(value: string): string | undefined {
  if (!value) return 'El CVV es obligatorio.';
  if (!/^\d{3,4}$/.test(value)) return 'El CVV debe tener 3 o 4 dígitos.';
  return undefined;
}

function validatePaypalEmail(value: string): string | undefined {
  if (!value.trim()) return 'El correo de PayPal es obligatorio.';
  if (!EMAIL_REGEX.test(value.trim())) return 'Ingresa un correo válido.';
  return undefined;
}

/* ─── Componente tarjeta de crédito ─────────────── */
function CreditCard() {
  return (
    <View
      className="mx-5 rounded-3xl overflow-hidden"
      style={{
        height: 190,
        backgroundColor: '#0F1B2D',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      {/* Círculos decorativos */}
      <View
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: '#F4B400',
          opacity: 0.15,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -50,
          left: -20,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: '#F4B400',
          opacity: 0.08,
        }}
      />

      {/* Contenido */}
      <View className="flex-1 p-6 justify-between">
        {/* Top row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-white/60 text-xs font-semibold tracking-widest">
            TARJETA DE DÉBITO
          </Text>
          <View className="flex-row items-center gap-1">
            <View className="w-7 h-7 rounded-full bg-secondary opacity-90" />
            <View
              className="w-7 h-7 rounded-full opacity-70"
              style={{
                backgroundColor: '#FF5F00',
                marginLeft: -10,
              }}
            />
          </View>
        </View>

        {/* Número */}
        <Text
          className="text-white text-xl font-bold tracking-widest"
          style={{ letterSpacing: 4 }}
        >
          •••• •••• •••• 4821
        </Text>

        {/* Bottom row */}
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
              Titular
            </Text>
            <Text className="text-white text-sm font-bold">Julián Thomás</Text>
          </View>
          <View className="items-end">
            <Text className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
              Válida hasta
            </Text>
            <Text className="text-white text-sm font-bold">12/26</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ─── Componente fila de transacción ─────────────── */
function TransactionRow({ item }: { item: Transaction }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-3.5 border-b border-gray-50"
    >
      {/* Ícono */}
      <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center">
        <MaterialIcons name={item.icon} size={20} color="#0F1B2D" />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-bold text-primary" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">{item.subtitle}</Text>
      </View>

      {/* Monto + estado */}
      <View className="items-end gap-1">
        <Text
          className={`text-sm font-bold ${item.positive ? 'text-green-600' : 'text-primary'}`}
        >
          {item.amount}
        </Text>
        <View
          className={`px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status].split(' ')[0]}`}
        >
          <Text
            className={`text-[10px] font-semibold ${STATUS_COLOR[item.status].split(' ')[1]}`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Pantalla principal ─────────────────────────── */
export default function Billetera() {
  const router = useRouter();
  const [addModal, setAddModal] = useState(false);
  const [step, setStep] = useState<AddStep>('options');

  // Métodos guardados (ahora sí en estado, para reflejar lo que se agrega)
  const [methods, setMethods] = useState<SavedMethod[]>(INITIAL_METHODS);

  // Formulario de tarjeta
  const [cardForm, setCardForm] = useState<CardFormState>({ number: '', holder: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState<CardFormErrors>({});
  const [cardTouched, setCardTouched] = useState<Record<string, boolean>>({});

  // Formulario de PayPal
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalError, setPaypalError] = useState<string | undefined>();
  const [paypalTouched, setPaypalTouched] = useState(false);

  const resetModal = () => {
    setAddModal(false);
    setStep('options');
    setCardForm({ number: '', holder: '', expiry: '', cvv: '' });
    setCardErrors({});
    setCardTouched({});
    setPaypalEmail('');
    setPaypalError(undefined);
    setPaypalTouched(false);
  };

  const handleSelectOption = (key: 'card' | 'paypal' | 'transfer') => {
    if (key === 'card') {
      setStep('card-form');
    } else if (key === 'paypal') {
      setStep('paypal-form');
    } else {
      setMethods((prev) => [
        ...prev,
        { id: `m${Date.now()}`, label: 'Transferencia bancaria (pendiente)', icon: 'account-balance', active: false },
      ]);
      resetModal();
    }
  };

  const validateCardField = (field: keyof CardFormState, value: string): string | undefined => {
    switch (field) {
      case 'number': return validateCardNumber(value);
      case 'holder': return validateHolder(value);
      case 'expiry': return validateExpiry(value);
      case 'cvv': return validateCvv(value);
      default: return undefined;
    }
  };

  const handleCardFieldChange = (field: keyof CardFormState, rawValue: string) => {
    let value = rawValue;
    if (field === 'number') value = formatCardNumber(rawValue);
    if (field === 'expiry') value = formatExpiry(rawValue);
    if (field === 'cvv') value = rawValue.replace(/\D/g, '').slice(0, 4);

    setCardForm((prev) => ({ ...prev, [field]: value }));

    if (cardTouched[field]) {
      setCardErrors((prev) => ({ ...prev, [field]: validateCardField(field, value) }));
    }
  };

  const handleCardFieldBlur = (field: keyof CardFormState) => {
    setCardTouched((prev) => ({ ...prev, [field]: true }));
    setCardErrors((prev) => ({ ...prev, [field]: validateCardField(field, cardForm[field]) }));
  };

  const handleSubmitCard = () => {
    const newErrors: CardFormErrors = {
      number: validateCardNumber(cardForm.number),
      holder: validateHolder(cardForm.holder),
      expiry: validateExpiry(cardForm.expiry),
      cvv: validateCvv(cardForm.cvv),
    };
    setCardErrors(newErrors);
    setCardTouched({ number: true, holder: true, expiry: true, cvv: true });

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    const last4 = cardForm.number.replace(/\s/g, '').slice(-4);
    setMethods((prev) => [
      ...prev,
      { id: `m${Date.now()}`, label: `Tarjeta •••• ${last4}`, icon: 'credit-card', active: prev.length === 0 },
    ]);
    resetModal();
  };

  const handleSubmitPaypal = () => {
    const error = validatePaypalEmail(paypalEmail);
    setPaypalError(error);
    setPaypalTouched(true);
    if (error) return;

    setMethods((prev) => [
      ...prev,
      { id: `m${Date.now()}`, label: `PayPal — ${paypalEmail.trim()}`, icon: 'account-balance-wallet', active: prev.length === 0 },
    ]);
    resetModal();
  };

  return (
    <View className="flex-1 bg-white">
      <Header variant="logo" title="TraveXperience" onBellPress={() => {}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Balance total */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Saldo disponible
          </Text>
          <Text className="text-4xl font-bold text-primary mt-1">
            €3.842<Text className="text-2xl text-gray-400">,50</Text>
          </Text>
        </View>

        {/* Tarjeta */}
        <CreditCard />

        {/* Métodos de pago guardados */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-primary">
              Métodos de pago
            </Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.push('/metodos-pago' as any)}>
                <Text className="text-xs font-bold text-secondary">Ver todos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAddModal(true)}
                className="flex-row items-center gap-1"
              >
                <MaterialIcons name="add" size={16} color="#F4B400" />
                <Text className="text-xs font-bold text-secondary">Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Métodos guardados */}
          {methods.map((m) => (
            <TouchableOpacity
              key={m.id}
              className={`flex-row items-center gap-3 p-3.5 rounded-2xl mb-2.5 border ${
                m.active
                  ? 'border-secondary bg-secondary/10'
                  : 'border-gray-100 bg-gray-50'
              }`}
              activeOpacity={0.8}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  m.active ? 'bg-secondary' : 'bg-gray-200'
                }`}
              >
                <MaterialIcons
                  name={m.icon}
                  size={20}
                  color={m.active ? '#0F1B2D' : '#6B7280'}
                />
              </View>
              <Text
                className={`flex-1 text-sm font-semibold ${
                  m.active ? 'text-primary' : 'text-gray-500'
                }`}
              >
                {m.label}
              </Text>
              {m.active && (
                <View className="bg-secondary px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-bold text-primary">
                    Principal
                  </Text>
                </View>
              )}
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Transacciones recientes */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-bold text-primary">
              Transacciones recientes
            </Text>
            <TouchableOpacity>
              <Text className="text-xs font-bold text-secondary">Ver todas</Text>
            </TouchableOpacity>
          </View>
          {TRANSACTIONS.map((t) => (
            <TransactionRow key={t.id} item={t} />
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <Fab icon="qr-code-scanner" onPress={() => {}} />

      {/* Modal Agregar Método */}
      <Modal
        visible={addModal}
        transparent
        animationType="slide"
        onRequestClose={resetModal}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={resetModal}
        />
        <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
          <View className="p-6">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            {/* Paso 1: Elegir tipo */}
            {step === 'options' && (
              <>
                <Text className="text-lg font-bold text-primary mb-4">
                  Agregar método de pago
                </Text>
                {ADD_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.label}
                    onPress={() => handleSelectOption(opt.key)}
                    className="flex-row items-center gap-3 py-4 border-b border-gray-100"
                  >
                    <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
                      <MaterialIcons name={opt.icon} size={20} color="#0F1B2D" />
                    </View>
                    <Text className="text-sm font-semibold text-primary flex-1">
                      {opt.label}
                    </Text>
                    <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Paso 2a: Formulario de tarjeta */}
            {step === 'card-form' && (
              <>
                <View className="flex-row items-center gap-2 mb-5">
                  <TouchableOpacity onPress={() => setStep('options')} hitSlop={10}>
                    <MaterialIcons name="arrow-back" size={20} color="#0F1B2D" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold text-primary">Nueva tarjeta</Text>
                </View>

                <View className="gap-4">
                  <View>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      Número de tarjeta
                    </Text>
                    <TextInput
                      value={cardForm.number}
                      onChangeText={(t) => handleCardFieldChange('number', t)}
                      onBlur={() => handleCardFieldBlur('number')}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className={`bg-gray-50 border rounded-2xl px-5 py-3.5 text-primary font-semibold ${
                        cardErrors.number && cardTouched.number ? 'border-red-400' : 'border-gray-100'
                      }`}
                    />
                    {cardErrors.number && cardTouched.number ? (
                      <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">{cardErrors.number}</Text>
                    ) : null}
                  </View>

                  <View>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      Nombre del titular
                    </Text>
                    <TextInput
                      value={cardForm.holder}
                      onChangeText={(t) => handleCardFieldChange('holder', t)}
                      onBlur={() => handleCardFieldBlur('holder')}
                      placeholder="Como aparece en la tarjeta"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                      className={`bg-gray-50 border rounded-2xl px-5 py-3.5 text-primary font-semibold ${
                        cardErrors.holder && cardTouched.holder ? 'border-red-400' : 'border-gray-100'
                      }`}
                    />
                    {cardErrors.holder && cardTouched.holder ? (
                      <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">{cardErrors.holder}</Text>
                    ) : null}
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                        Vencimiento
                      </Text>
                      <TextInput
                        value={cardForm.expiry}
                        onChangeText={(t) => handleCardFieldChange('expiry', t)}
                        onBlur={() => handleCardFieldBlur('expiry')}
                        placeholder="MM/AA"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        maxLength={5}
                        className={`bg-gray-50 border rounded-2xl px-5 py-3.5 text-primary font-semibold ${
                          cardErrors.expiry && cardTouched.expiry ? 'border-red-400' : 'border-gray-100'
                        }`}
                      />
                      {cardErrors.expiry && cardTouched.expiry ? (
                        <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">{cardErrors.expiry}</Text>
                      ) : null}
                    </View>

                    <View className="flex-1">
                      <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                        CVV
                      </Text>
                      <TextInput
                        value={cardForm.cvv}
                        onChangeText={(t) => handleCardFieldChange('cvv', t)}
                        onBlur={() => handleCardFieldBlur('cvv')}
                        placeholder="123"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        secureTextEntry
                        maxLength={4}
                        className={`bg-gray-50 border rounded-2xl px-5 py-3.5 text-primary font-semibold ${
                          cardErrors.cvv && cardTouched.cvv ? 'border-red-400' : 'border-gray-100'
                        }`}
                      />
                      {cardErrors.cvv && cardTouched.cvv ? (
                        <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">{cardErrors.cvv}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmitCard}
                  activeOpacity={0.85}
                  className="bg-primary rounded-2xl py-4 items-center mt-6"
                >
                  <Text className="text-white font-bold text-sm">Guardar tarjeta</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Paso 2b: Formulario de PayPal */}
            {step === 'paypal-form' && (
              <>
                <View className="flex-row items-center gap-2 mb-5">
                  <TouchableOpacity onPress={() => setStep('options')} hitSlop={10}>
                    <MaterialIcons name="arrow-back" size={20} color="#0F1B2D" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold text-primary">Conectar PayPal</Text>
                </View>

                <View>
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Correo de PayPal
                  </Text>
                  <TextInput
                    value={paypalEmail}
                    onChangeText={(t) => {
                      setPaypalEmail(t);
                      if (paypalTouched) setPaypalError(validatePaypalEmail(t));
                    }}
                    onBlur={() => {
                      setPaypalTouched(true);
                      setPaypalError(validatePaypalEmail(paypalEmail));
                    }}
                    placeholder="tucorreo@paypal.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`bg-gray-50 border rounded-2xl px-5 py-3.5 text-primary font-semibold ${
                      paypalError && paypalTouched ? 'border-red-400' : 'border-gray-100'
                    }`}
                  />
                  {paypalError && paypalTouched ? (
                    <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">{paypalError}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={handleSubmitPaypal}
                  activeOpacity={0.85}
                  className="bg-primary rounded-2xl py-4 items-center mt-6"
                >
                  <Text className="text-white font-bold text-sm">Conectar cuenta</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}