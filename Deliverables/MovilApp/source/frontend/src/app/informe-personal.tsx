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

  const handleChange = (id: string, text: string) => {
    setEdited(true);
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: text } : f))
    );
  };

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
          {fields.map((field) => (
            <View key={field.id}>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                {field.label}
              </Text>
              <View className="flex-row items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5">
                <MaterialIcons name={field.icon} size={18} color="#9CA3AF" />
                <TextInput
                  value={field.value}
                  onChangeText={(t) => handleChange(field.id, t)}
                  keyboardType={field.keyboardType ?? 'default'}
                  className="flex-1 text-sm font-semibold text-primary"
                  placeholderTextColor="#9CA3AF"
                />
                <MaterialIcons name="edit" size={16} color="#D1D5DB" />
              </View>
            </View>
          ))}
        </View>

        {/* Botón guardar */}
        <View className="px-5 mt-8">
          <TouchableOpacity
            onPress={() => {
              setEdited(false);
            }}
            className={`rounded-2xl py-4 items-center ${
              edited ? 'bg-primary' : 'bg-gray-200'
            }`}
            activeOpacity={0.85}
          >
            <Text
              className={`text-sm font-bold ${
                edited ? 'text-white' : 'text-gray-400'
              }`}
            >
              Guardar Cambios
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
