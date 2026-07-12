import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAYMENT_METHODS = [
  { id: 'card', icon: 'credit-card' as const, label: 'Tarjeta Mastercard ••4821' },
  { id: 'paypal', icon: 'account-balance-wallet' as const, label: 'PayPal — julian@mail.com' },
  { id: 'transfer', icon: 'account-balance' as const, label: 'Transferencia bancaria' },
];

export default function Reservar() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    img?: string;
    price?: string;
    category?: string;
  }>();

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [successModal, setSuccessModal] = useState(false);

  const name = params.name ?? 'Reserva';
  const img = params.img;
  const price = params.price ?? 'Consultar precio';
  const category = params.category ?? '';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Confirmar y Pagar
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Resumen de la reserva */}
        <View className="mx-5 mt-5 bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {img ? (
            <Image source={{ uri: img }} className="w-full h-40" />
          ) : (
            <View className="w-full h-16 bg-gray-100" />
          )}
          <View className="p-4">
            {category ? (
              <Text className="text-[10px] font-bold text-secondary uppercase tracking-wide mb-1">
                {category}
              </Text>
            ) : null}
            <Text className="text-lg font-bold text-primary">{name}</Text>
          </View>
        </View>

        {/* Detalle del cargo */}
        <View className="mx-5 mt-5 bg-gray-50 border border-gray-100 rounded-2xl p-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Detalle del pago
          </Text>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-500">Costo</Text>
            <Text className="text-sm font-semibold text-primary">{price}</Text>
          </View>
          <View className="flex-row items-center justify-between pt-2 border-t border-gray-200 mt-1">
            <Text className="text-sm font-bold text-primary">Total a pagar</Text>
            <Text className="text-base font-bold text-primary">{price}</Text>
          </View>
        </View>

        {/* Métodos de pago */}
        <View className="mx-5 mt-6">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Método de pago
          </Text>
          {PAYMENT_METHODS.map((m) => {
            const active = selectedMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedMethod(m.id)}
                activeOpacity={0.8}
                className={`flex-row items-center gap-3 p-3.5 rounded-2xl mb-2.5 border ${
                  active ? 'border-secondary bg-secondary/10' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    active ? 'bg-secondary' : 'bg-gray-200'
                  }`}
                >
                  <MaterialIcons name={m.icon} size={20} color={active ? '#0F1B2D' : '#6B7280'} />
                </View>
                <Text
                  className={`flex-1 text-sm font-semibold ${
                    active ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {m.label}
                </Text>
                <MaterialIcons
                  name={active ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={20}
                  color={active ? '#F4B400' : '#D1D5DB'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón confirmar */}
        <View className="mx-5 mt-6">
          <TouchableOpacity
            onPress={() => setSuccessModal(true)}
            activeOpacity={0.85}
            className="bg-primary rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-bold text-sm">Confirmar pago</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Pago Exitoso */}
      <Modal
        visible={successModal}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-8"
          onPress={() => setSuccessModal(false)}
        >
          <View className="bg-white rounded-3xl p-8 w-full items-center">
            <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4">
              <MaterialIcons name="check" size={40} color="#0F1B2D" />
            </View>
            <Text className="text-2xl font-bold text-primary text-center mb-2">
              ¡Pago Exitoso!
            </Text>
            <Text className="text-sm text-gray-500 text-center leading-relaxed mb-5">
              Tu reserva de {name} ha sido confirmada correctamente.
            </Text>
            <View className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 mb-5">
              <Text className="text-xs text-gray-400 text-center mb-1">
                Número de referencia
              </Text>
              <Text className="text-lg font-bold text-primary text-center tracking-widest">
                JTX {Math.floor(100000 + Math.random() * 900000)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSuccessModal(false);
                router.push('/tabs/itinerario' as any);
              }}
              className="bg-primary rounded-2xl py-3.5 w-full items-center"
            >
              <Text className="text-white font-bold text-sm">Ver Itinerario</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}