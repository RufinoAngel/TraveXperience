import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
interface Route {
  id: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  date: string;
  price: string;
  seats: number;
  status: 'Confirmado' | 'Pendiente' | 'Cancelado';
}

/* ─── Datos ──────────────────────────────────────── */
const ROUTES: Route[] = [
  {
    id: 'r1',
    from: 'Madrid',
    fromCode: 'MAD',
    to: 'París',
    toCode: 'CDG',
    date: '15 jul 2024 • 10:30 AM',
    price: '€87/km',
    seats: 1,
    status: 'Confirmado',
  },
  {
    id: 'r2',
    from: 'París',
    fromCode: 'CDG',
    to: 'New York',
    toCode: 'JFK',
    date: '22 jul 2024 • 14:15 PM',
    price: '€442/km',
    seats: 1,
    status: 'Pendiente',
  },
  {
    id: 'r3',
    from: 'New York',
    fromCode: 'JFK',
    to: 'San José',
    toCode: 'SJO',
    date: '28 jul 2024 • 08:00 AM',
    price: '€560/km',
    seats: 2,
    status: 'Pendiente',
  },
];

const STATUS_STYLE: Record<Route['status'], { bg: string; text: string }> = {
  Confirmado: { bg: '#DCFCE7', text: '#16A34A' },
  Pendiente: { bg: '#FEF9C3', text: '#CA8A04' },
  Cancelado: { bg: '#FEE2E2', text: '#DC2626' },
};

/* ─── Pantalla ───────────────────────────────────── */
export default function GestionTransporte() {
  const router = useRouter();
  const [successModal, setSuccessModal] = useState(false);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Gestión de Transporte
        </Text>
        <TouchableOpacity hitSlop={10} className="w-10 items-end">
          <MaterialIcons name="add" size={24} color="#0F1B2D" />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
          <MaterialIcons name="search" size={18} color="#9CA3AF" />
          <Text className="text-sm text-gray-400 flex-1">Buscar vuelo o ruta...</Text>
        </View>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 8 }}
      >
        {['Todos', 'Vuelos', 'Trenes', 'Autos'].map((f, i) => (
          <TouchableOpacity
            key={f}
            className={`px-4 py-1.5 rounded-full border ${
              i === 0 ? 'bg-primary border-primary' : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                i === 0 ? 'text-white' : 'text-gray-500'
              }`}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
      >
        {ROUTES.map((route) => (
          <TouchableOpacity
            key={route.id}
            activeOpacity={0.85}
            className="bg-white border border-gray-100 rounded-2xl p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Cabecera: de → a */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">{route.fromCode}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">{route.from}</Text>
              </View>

              <View className="flex-1 mx-3 items-center">
                <View className="flex-row items-center gap-1 w-full">
                  <View className="flex-1 h-px bg-gray-200" />
                  <MaterialIcons name="flight" size={16} color="#0F1B2D" />
                  <View className="flex-1 h-px bg-gray-200" />
                </View>
              </View>

              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">{route.toCode}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">{route.to}</Text>
              </View>
            </View>

            {/* Detalles */}
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
              <View>
                <Text className="text-xs text-gray-400">{route.date}</Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <MaterialIcons name="person" size={11} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500">
                    {route.seats} pasajero{route.seats > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <View className="items-end gap-1.5">
                <Text className="text-base font-bold text-primary">{route.price}</Text>
                <View
                  style={{ backgroundColor: STATUS_STYLE[route.status].bg }}
                  className="px-2.5 py-0.5 rounded-full"
                >
                  <Text
                    style={{ color: STATUS_STYLE[route.status].text }}
                    className="text-[10px] font-semibold"
                  >
                    {route.status}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Reservar nuevo transporte */}
        <TouchableOpacity
          onPress={() => setSuccessModal(true)}
          className="bg-primary rounded-2xl py-4 items-center mt-2"
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-sm">+ Añadir transporte</Text>
        </TouchableOpacity>
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
            {/* Check */}
            <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4">
              <MaterialIcons name="check" size={40} color="#0F1B2D" />
            </View>

            <Text className="text-2xl font-bold text-primary text-center mb-2">
              ¡Pago Exitoso!
            </Text>
            <Text className="text-sm text-gray-500 text-center leading-relaxed mb-5">
              Tu transporte ha sido reservado correctamente.
            </Text>

            {/* Número de referencia */}
            <View className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 mb-5">
              <Text className="text-xs text-gray-400 text-center mb-1">
                Número de referencia
              </Text>
              <Text className="text-lg font-bold text-primary text-center tracking-widest">
                JTX 785310
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSuccessModal(false)}
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
