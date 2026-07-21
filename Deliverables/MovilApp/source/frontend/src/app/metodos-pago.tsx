import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface PaymentMethod {
  id: string;
  icon: IconName;
  label: string;
  sublabel: string;
  isDefault: boolean;
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

interface PaypalFormErrors {
  email?: string;
}

/* ─── Datos ──────────────────────────────────────── */
const INITIAL_METHODS: PaymentMethod[] = [
  {
    id: 'm1',
    icon: 'credit-card',
    label: 'Tarjeta Mastercard',
    sublabel: '•••• •••• •••• 4821 · Vence 12/26',
    isDefault: true,
  },
  {
    id: 'm2',
    icon: 'account-balance-wallet',
    label: 'PayPal',
    sublabel: 'julian@mail.com',
    isDefault: false,
  },
];

const ADD_OPTIONS: { icon: IconName; label: string; key: 'card' | 'paypal' | 'transfer' }[] = [
  { icon: 'credit-card', label: 'Tarjeta de crédito / débito', key: 'card' },
  { icon: 'account-balance-wallet', label: 'PayPal', key: 'paypal' },
  { icon: 'account-balance', label: 'Transferencia bancaria', key: 'transfer' },
];

/* ─── Validadores ────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Algoritmo de Luhn para validar números de tarjeta
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

/* ─── Pantalla ───────────────────────────────────── */
export default function MetodosPago() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);
  const [addModal, setAddModal] = useState(false);
  const [step, setStep] = useState<AddStep>('options');

  // Estado del formulario de tarjeta
  const [cardForm, setCardForm] = useState<CardFormState>({ number: '', holder: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState<CardFormErrors>({});
  const [cardTouched, setCardTouched] = useState<Record<string, boolean>>({});

  // Estado del formulario de PayPal
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalErrors, setPaypalErrors] = useState<PaypalFormErrors>({});
  const [paypalTouched, setPaypalTouched] = useState(false);

  const resetModal = () => {
    setAddModal(false);
    setStep('options');
    setCardForm({ number: '', holder: '', expiry: '', cvv: '' });
    setCardErrors({});
    setCardTouched({});
    setPaypalEmail('');
    setPaypalErrors({});
    setPaypalTouched(false);
  };

  const handleSetDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleDelete = (id: string) => {
    const method = methods.find((m) => m.id === id);
    Alert.alert(
      'Eliminar método de pago',
      `¿Seguro que quieres eliminar "${method?.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => setMethods((prev) => prev.filter((m) => m.id !== id)),
        },
      ]
    );
  };

  const handleSelectOption = (key: 'card' | 'paypal' | 'transfer') => {
    if (key === 'card') {
      setStep('card-form');
    } else if (key === 'paypal') {
      setStep('paypal-form');
    } else {
      // Transferencia bancaria: no requiere datos sensibles ingresados por el usuario aquí
      const newMethod: PaymentMethod = {
        id: `m${Date.now()}`,
        icon: 'account-balance',
        label: 'Transferencia bancaria',
        sublabel: 'Pendiente de verificación',
        isDefault: methods.length === 0,
      };
      setMethods((prev) => [...prev, newMethod]);
      resetModal();
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

  const validateCardField = (field: keyof CardFormState, value: string): string | undefined => {
    switch (field) {
      case 'number': return validateCardNumber(value);
      case 'holder': return validateHolder(value);
      case 'expiry': return validateExpiry(value);
      case 'cvv': return validateCvv(value);
      default: return undefined;
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
    const newMethod: PaymentMethod = {
      id: `m${Date.now()}`,
      icon: 'credit-card',
      label: `Tarjeta ${cardForm.holder.split(' ')[0]}`,
      sublabel: `•••• •••• •••• ${last4} · Vence ${cardForm.expiry}`,
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newMethod]);
    resetModal();
  };

  const handleSubmitPaypal = () => {
    const error = validatePaypalEmail(paypalEmail);
    setPaypalErrors({ email: error });
    setPaypalTouched(true);
    if (error) return;

    const newMethod: PaymentMethod = {
      id: `m${Date.now()}`,
      icon: 'account-balance-wallet',
      label: 'PayPal',
      sublabel: paypalEmail.trim(),
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newMethod]);
    resetModal();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Métodos de Pago
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Subtítulo */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-xs text-gray-400">
            Administra tus tarjetas y formas de pago guardadas
          </Text>
        </View>

        {/* Lista de métodos */}
        <View className="px-5 mt-2 gap-3">
          {methods.length === 0 ? (
            <View className="items-center py-16">
              <MaterialIcons name="credit-card-off" size={40} color="#D1D5DB" />
              <Text className="text-sm text-gray-400 mt-3">
                No tienes métodos de pago guardados
              </Text>
            </View>
          ) : (
            methods.map((m) => (
              <View
                key={m.id}
                className={`rounded-2xl border p-4 ${
                  m.isDefault ? 'border-secondary bg-secondary/10' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center ${
                      m.isDefault ? 'bg-secondary' : 'bg-gray-200'
                    }`}
                  >
                    <MaterialIcons
                      name={m.icon}
                      size={22}
                      color={m.isDefault ? '#0F1B2D' : '#6B7280'}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-bold text-primary">{m.label}</Text>
                      {m.isDefault && (
                        <View className="bg-secondary px-2 py-0.5 rounded-full">
                          <Text className="text-[10px] font-bold text-primary">Principal</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-gray-500 mt-0.5">{m.sublabel}</Text>
                  </View>
                </View>

                {/* Acciones */}
                <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-gray-200/60">
                  {!m.isDefault && (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(m.id)}
                      className="flex-1 bg-white border border-gray-200 rounded-xl py-2 items-center"
                    >
                      <Text className="text-xs font-bold text-primary">Usar como principal</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleDelete(m.id)}
                    className={`${m.isDefault ? 'flex-1' : ''} bg-white border border-red-100 rounded-xl py-2 px-4 items-center flex-row justify-center gap-1.5`}
                  >
                    <MaterialIcons name="delete-outline" size={14} color="#EF4444" />
                    <Text className="text-xs font-bold text-red-500">Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Agregar método */}
        <View className="px-5 mt-5">
          <TouchableOpacity
            onPress={() => setAddModal(true)}
            activeOpacity={0.85}
            className="border-2 border-dashed border-gray-200 rounded-2xl py-4 items-center flex-row justify-center gap-2"
          >
            <MaterialIcons name="add" size={18} color="#0F1B2D" />
            <Text className="text-sm font-bold text-primary">Agregar método de pago</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Agregar Método */}
      <Modal
        visible={addModal}
        transparent
        animationType="slide"
        onRequestClose={resetModal}
      >
        <Pressable className="flex-1 bg-black/40" onPress={resetModal} />
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
                    <Text className="text-sm font-semibold text-primary flex-1">{opt.label}</Text>
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
                      if (paypalTouched) setPaypalErrors({ email: validatePaypalEmail(t) });
                    }}
                    onBlur={() => {
                      setPaypalTouched(true);
                      setPaypalErrors({ email: validatePaypalEmail(paypalEmail) });
                    }}
                    placeholder="tucorreo@paypal.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`bg-gray-50 border rounded-2xl px-5 py-3.5 text-primary font-semibold ${
                      paypalErrors.email && paypalTouched ? 'border-red-400' : 'border-gray-100'
                    }`}
                  />
                  {paypalErrors.email && paypalTouched ? (
                    <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">{paypalErrors.email}</Text>
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
    </SafeAreaView>
  );
}