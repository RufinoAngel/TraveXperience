import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
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

const ADD_OPTIONS: { icon: IconName; label: string }[] = [
  { icon: 'credit-card', label: 'Tarjeta de crédito / débito' },
  { icon: 'account-balance-wallet', label: 'PayPal' },
  { icon: 'account-balance', label: 'Transferencia bancaria' },
];

/* ─── Pantalla ───────────────────────────────────── */
export default function MetodosPago() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);
  const [addModal, setAddModal] = useState(false);

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

  const handleAddOption = (label: string) => {
    setAddModal(false);
    const newMethod: PaymentMethod = {
      id: `m${Date.now()}`,
      icon: label.includes('PayPal')
        ? 'account-balance-wallet'
        : label.includes('Transferencia')
        ? 'account-balance'
        : 'credit-card',
      label,
      sublabel: 'Pendiente de verificación',
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newMethod]);
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
        onRequestClose={() => setAddModal(false)}
      >
        <Pressable className="flex-1 bg-black/40" onPress={() => setAddModal(false)} />
        <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
          <View className="p-6">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />
            <Text className="text-lg font-bold text-primary mb-4">
              Agregar método de pago
            </Text>
            {ADD_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => handleAddOption(opt.label)}
                className="flex-row items-center gap-3 py-4 border-b border-gray-100"
              >
                <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
                  <MaterialIcons name={opt.icon} size={20} color="#0F1B2D" />
                </View>
                <Text className="text-sm font-semibold text-primary flex-1">{opt.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}