import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
interface Accommodation {
  id: string;
  name: string;
  location: string;
  price: string;
  priceUnit: string;
  rating: number;
  reviews: number;
  img: string;
  tag?: string;
  saved: boolean;
}

/* ─── Datos ──────────────────────────────────────── */
const ACCOMMODATIONS: Accommodation[] = [
  {
    id: 'a1',
    name: 'Hotel Ritz Carlton',
    location: 'Madrid, España',
    price: '€320',
    priceUnit: '/noche',
    rating: 4.9,
    reviews: 412,
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    tag: 'LUJO',
    saved: true,
  },
  {
    id: 'a2',
    name: 'Sunset Paradise',
    location: 'Santorini, Grecia',
    price: '€285',
    priceUnit: '/noche',
    rating: 4.8,
    reviews: 387,
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
    tag: 'VISTA AL MAR',
    saved: true,
  },
  {
    id: 'a3',
    name: 'Jungla de Bali',
    location: 'Bali, Indonesia',
    price: '€195',
    priceUnit: '/noche',
    rating: 4.7,
    reviews: 298,
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    tag: 'AVENTURA',
    saved: true,
  },
  {
    id: 'a4',
    name: 'Atelier del Café',
    location: 'Barcelona, España',
    price: '€120',
    priceUnit: '/noche',
    rating: 4.6,
    reviews: 213,
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    saved: true,
  },
];

/* ─── Pantalla ───────────────────────────────────── */
export default function MisAlojamientos() {
  const router = useRouter();
  const [saved, setSaved] = useState<Record<string, boolean>>(
    Object.fromEntries(ACCOMMODATIONS.map((a) => [a.id, a.saved]))
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Mis Alojamientos
        </Text>
        <TouchableOpacity hitSlop={10} className="w-10 items-end">
          <MaterialIcons name="search" size={24} color="#0F1B2D" />
        </TouchableOpacity>
      </View>

      {/* Contador */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-sm text-gray-500">
          <Text className="font-bold text-primary">{ACCOMMODATIONS.length}</Text> alojamientos guardados
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
      >
        {ACCOMMODATIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            {/* Imagen */}
            <View>
              <Image source={{ uri: item.img }} className="w-full h-44" />

              {/* Tag */}
              {item.tag && (
                <View className="absolute top-3 left-3 bg-secondary px-2.5 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-primary">
                    {item.tag}
                  </Text>
                </View>
              )}

              {/* Heart */}
              <TouchableOpacity
                onPress={() =>
                  setSaved((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 items-center justify-center"
              >
                <MaterialIcons
                  name={saved[item.id] ? 'favorite' : 'favorite-border'}
                  size={18}
                  color={saved[item.id] ? '#EF4444' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text
                    className="text-base font-bold text-primary"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <MaterialIcons name="place" size={12} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500">{item.location}</Text>
                  </View>
                </View>
                <View className="items-end ml-2">
                  <Text className="text-base font-bold text-primary">
                    {item.price}
                    <Text className="text-xs text-gray-400 font-normal">
                      {item.priceUnit}
                    </Text>
                  </Text>
                  <View className="flex-row items-center gap-0.5 mt-0.5">
                    <MaterialIcons name="star" size={12} color="#F4B400" />
                    <Text className="text-xs font-bold text-primary">
                      {item.rating}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      ({item.reviews})
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity className="mt-3 bg-primary rounded-xl py-2.5 items-center">
                <Text className="text-white text-sm font-bold">Reservar ahora</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
