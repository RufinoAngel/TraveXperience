import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface Field {
  id: string;
  label: string;
  icon: IconName;
  value: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  editable?: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

/* ─── Validadores por campo ──────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

function validateField(id: string, value: string): string | undefined {
  const trimmed = value.trim();

  switch (id) {
    case 'nombre':
      if (!trimmed) return 'El nombre es obligatorio.';
      if (trimmed.length < 3) return 'Ingresa al menos 3 caracteres.';
      if (!NAME_REGEX.test(trimmed)) return 'Solo se permiten letras y espacios.';
      return undefined;

    case 'email':
      if (!trimmed) return 'El correo es obligatorio.';
      if (!EMAIL_REGEX.test(trimmed)) return 'Ingresa un correo válido.';
      return undefined;

    case 'telefono': {
      if (!trimmed) return 'El teléfono es obligatorio.';
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 10) return 'Ingresa un teléfono válido (mínimo 10 dígitos).';
      return undefined;
    }

    case 'documento': {
      if (!trimmed) return 'El número de documento es obligatorio.';
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 6) return 'El documento debe tener al menos 6 dígitos.';
      return undefined;
    }

    case 'nacimiento': {
      if (!trimmed) return 'La fecha de nacimiento es obligatoria.';
      if (!DATE_REGEX.test(trimmed)) return 'Usa el formato DD/MM/AAAA.';
      const [day, month, year] = trimmed.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const isValidDate =
        date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
      if (!isValidDate) return 'La fecha no es válida.';
      const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) return 'Debes ser mayor de 18 años.';
      if (age > 120) return 'Verifica la fecha ingresada.';
      return undefined;
    }

    case 'direccion':
      if (!trimmed) return 'La dirección es obligatoria.';
      if (trimmed.length < 8) return 'Ingresa una dirección más completa.';
      return undefined;

    default:
      return undefined;
  }
}

/* ─── Campos del formulario ─────────────────────── */
const INITIAL_FIELDS: Field[] = [
  { id: 'nombre', label: 'Nombre completo', icon: 'person-outline', value: 'Julián Thomás' },
  { id: 'email', label: 'Correo electrónico', icon: 'email', value: 'julian@travex.com', keyboardType: 'email-address' },
  { id: 'telefono', label: 'Teléfono', icon: 'phone', value: '+1 (312) 456-7890', keyboardType: 'phone-pad' },
  { id: 'documento', label: 'N.º de documento', icon: 'badge', value: '4 - 0182 - 0927', keyboardType: 'numeric' },
  { id: 'nacimiento', label: 'Fecha de nacimiento', icon: 'calendar-today', value: '14/11/1992' },
  { id: 'direccion', label: 'Dirección', icon: 'home', value: 'Calle de Serrano, 15, 28001 Madrid, España' },
];

/* ─── Pantalla ───────────────────────────────────── */
export default function InformePersonal() {
  const router = useRouter();
  const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
  const [edited, setEdited] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (id: string, text: string) => {
    setEdited(true);
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: text } : f))
    );

    // Revalidar en vivo si el campo ya fue tocado
    if (touched[id]) {
      setErrors((prev) => ({ ...prev, [id]: validateField(id, text) }));
    }
  };

  const handleBlur = (id: string, value: string) => {
    setTouched((prev) => ({ ...prev, [id]: true }));
    setErrors((prev) => ({ ...prev, [id]: validateField(id, value) }));
  };

  const handleSave = () => {
    // Validar todos los campos antes de guardar
    const newErrors: FormErrors = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach((f) => {
      newTouched[f.id] = true;
      const error = validateField(f.id, f.value);
      if (error) newErrors[f.id] = error;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    // Todo válido: guardar
    setEdited(false);
  };

  const hasAnyError = Object.values(errors).some(Boolean);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Informe de Personal
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View className="items-center pt-6 pb-5">
          <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center">
            <MaterialIcons name="person" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold text-primary mt-3">
            Julián Thomás
          </Text>
          <TouchableOpacity className="mt-1">
            <Text className="text-xs font-semibold text-secondary">
              Cambiar foto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Campos */}
        <View className="px-5 gap-4">
          {fields.map((field) => {
            const fieldError = touched[field.id] ? errors[field.id] : undefined;
            return (
              <View key={field.id}>
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                  {field.label}
                </Text>
                <View
                  className={`flex-row items-center gap-3 bg-gray-50 border rounded-2xl px-4 py-3.5 ${
                    fieldError ? 'border-red-400' : 'border-gray-100'
                  }`}
                >
                  <MaterialIcons
                    name={field.icon}
                    size={18}
                    color={fieldError ? '#EF4444' : '#9CA3AF'}
                  />
                  <TextInput
                    value={field.value}
                    onChangeText={(t) => handleChange(field.id, t)}
                    onBlur={() => handleBlur(field.id, field.value)}
                    keyboardType={field.keyboardType ?? 'default'}
                    className="flex-1 text-sm font-semibold text-primary"
                    placeholderTextColor="#9CA3AF"
                  />
                  <MaterialIcons name="edit" size={16} color="#D1D5DB" />
                </View>
                {fieldError ? (
                  <View className="flex-row items-center gap-1 mt-1.5 ml-1">
                    <MaterialIcons name="error-outline" size={12} color="#EF4444" />
                    <Text className="text-xs text-red-500 font-semibold">
                      {fieldError}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Botón guardar */}
        <View className="px-5 mt-8">
          <TouchableOpacity
            onPress={handleSave}
            className={`rounded-2xl py-4 items-center ${
              edited && !hasAnyError ? 'bg-primary' : 'bg-gray-200'
            }`}
            activeOpacity={0.85}
          >
            <Text
              className={`text-sm font-bold ${
                edited && !hasAnyError ? 'text-white' : 'text-gray-400'
              }`}
            >
              Guardar Cambios
            </Text>
          </TouchableOpacity>
          {hasAnyError && (
            <Text className="text-xs text-red-500 font-semibold text-center mt-2">
              Revisa los campos marcados en rojo antes de guardar.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}