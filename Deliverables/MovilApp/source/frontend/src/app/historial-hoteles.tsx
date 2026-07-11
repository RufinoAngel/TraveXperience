import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Datos ──────────────────────────────────────── */
interface HotelRecord {
  id: string;
  name: string;
  location: string;
  checkin: string;
  checkout: string;
  nights: number;
  amount: string;
  rating: number;
  img: string;
  status: 'Completado' | 'Cancelado';
}

const HOTELS: HotelRecord[] = [
  {
    id: 'h1',
    name: 'Hotel Ritz',
    location: 'Madrid, España',
    checkin: '10 ene 2024',
    checkout: '14 ene 2024',
    nights: 4,
    amount: '€1.260,00',
    rating: 4.9,
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    status: 'Completado',
  },
  {
    id: 'h2',
    name: 'Marriott Bogotá',
    location: 'Bogotá, Colombia',
    checkin: '3 dic 2023',
    checkout: '7 dic 2023',
    nights: 4,
    amount: '€800,00',
    rating: 4.7,
    img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
    status: 'Completado',
  },
  {
    id: 'h3',
    name: 'Luft Hotel & Spa',
    location: 'Barcelona, España',
    checkin: '18 nov 2023',
    checkout: '22 nov 2023',
    nights: 4,
    amount: '€1.288,00',
    rating: 4.8,
    img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80',
    status: 'Completado',
  },
  {
    id: 'h4',
    name: 'Boutique Artisaní',
    location: 'San José, Costa Rica',
    checkin: '5 oct 2023',
    checkout: '8 oct 2023',
    nights: 3,
    amount: '€643,00',
    rating: 4.6,
    img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    status: 'Completado',
  },
];

/* ─── Pantalla ───────────────────────────────────── */
export default function HistorialHoteles() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Historial de Hoteles
        </Text>
        <TouchableOpacity hitSlop={10} className="w-10 items-end">
          <MaterialIcons name="search" size={24} color="#0F1B2D" />
        </TouchableOpacity>
      </View>

      {/* Subtítulo */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-xs text-gray-400">
          Revisa todos tus alojamientos anteriores
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
      >
        {HOTELS.map((h) => (
          <TouchableOpacity
            key={h.id}
            activeOpacity={0.85}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Imagen */}
            <Image source={{ uri: h.img }} className="w-full h-40" />

            {/* Badge status */}
            <View className="absolute top-3 right-3 bg-white/90 px-2.5 py-1 rounded-full flex-row items-center gap-1">
              <View
                className={`w-1.5 h-1.5 rounded-full ${
                  h.status === 'Completado' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <Text className="text-[10px] font-bold text-primary">
                {h.status}
              </Text>
            </View>

            {/* Info */}
            <View className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-base font-bold text-primary" numberOfLines={1}>
                    {h.name}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <MaterialIcons name="place" size={12} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500">{h.location}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-0.5 ml-2">
                  <MaterialIcons name="star" size={14} color="#F4B400" />
                  <Text className="text-sm font-bold text-primary">{h.rating}</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="calendar-today" size={12} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500">
                    {h.checkin} → {h.checkout}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-400 text-right">{h.nights} noches</Text>
                  <Text className="text-sm font-bold text-primary">{h.amount}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
