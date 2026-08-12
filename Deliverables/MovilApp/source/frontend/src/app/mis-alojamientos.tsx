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
import PlaceDetailModal, { PlaceDetail } from '../components/PlaceDetailModal';

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
  horario: string;
  description: string;
}

/* ─── Datos ──────────────────────────────────────── */
const ACCOMMODATIONS: Accommodation[] = [
  {
    id: 'a1',
    name: 'Hotel Casablanca Xicotepec',
    location: 'Xicotepec de Juárez, Puebla',
    price: '$1,200',
    priceUnit: '/noche',
    rating: 4.5,
    reviews: 688,
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZNAacpVw3Gs9c95WGNFPKfML0csS41l-LGzQ_Zoy8uu41ywHpWIYIf3orNCfeYvuvJEQooHGmjJc7mc4_v-SOL_aCv-Wi7psoaJorKdQhZqWR_FBE1rOUHlQOm7wTTMaOd0-w_gW27gV_2jyg=s4800-w800-h600',
    tag: 'ALBERCA Y TEMASCAL',
    saved: true,
    horario: 'Recepción abierta 24 horas',
    description: 'Hotel moderno con alberca, temascal y gimnasio pequeño. Ubicado a un lado de un supermercado, fuera del bullicio del centro.',
  },
  {
    id: 'a2',
    name: 'Hotel Mi Ranchito',
    location: 'Xicotepec de Juárez, Puebla',
    price: '$950',
    priceUnit: '/noche',
    rating: 4.5,
    reviews: 1099,
    img: 'https://lh3.googleusercontent.com/place-photos/AG9NLjDZhBmu1McOVmIKhWEZbhzuH0TRky9Uqd8J56EIiec70kios2bNPSOylzuQT01ahK6VxAtoQW3m9Rt364GnwNiItu8l9uCNOZDIteO3aKUZp3Ww7qeuA41zWg1IwK1V9D9N6ygzfGf9LAWN1Ek=s4800-w800-h600',
    tag: 'AMBIENTE CAMPESTRE',
    saved: true,
    horario: 'Consultar disponibilidad',
    description: 'Terrenos hermosos y ambiente campestre. Su restaurante es muy recomendado para desayunar.',
  },
  {
    id: 'a3',
    name: 'Hotel El Cafetalero',
    location: 'Xicotepec de Juárez, Puebla',
    price: '$1,050',
    priceUnit: '/noche',
    rating: 4.4,
    reviews: 768,
    img: 'https://lh3.googleusercontent.com/place-photos/AG9NLjBFo383EO3OEUZbwDA3XT51Q6EOySuQrEnB-ec7ah75XisayBhgOUNFI7IcNdyLnmFi6Dulw5P20l9ZLdGMcnPHnUF6yEZDT02GGxNKGGtr0CYH5_-oxbbMLOiKzXJRgEoxaW15-1amJm9d=s4800-w800-h600',
    tag: 'CAFÉ DE LA CASA',
    saved: true,
    horario: 'Recepción abierta 24 horas',
    description: 'Habitaciones limpias y cómodas, con el café de la casa muy bien valorado por los huéspedes.',
  },
  {
    id: 'a4',
    name: 'Hotel Plaza San Carlos',
    location: 'Xicotepec de Juárez, Puebla',
    price: '$880',
    priceUnit: '/noche',
    rating: 4.3,
    reviews: 712,
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZOC6PrAOZjbAZHUfF5XzBidXoptG5IJxBV3-VZHLU8BtEE5sFKQDv2mQTHr4sGz6u0AmptDadGIaj2Gr5hHUk4qeObNOP7ElJ4_bkPcM8J4e9ovvMBwD2acHgDXXtq1Bfo1ZAhO0XUjCFlqnSWWnG-u=s4800-w800-h600',
    tag: 'EN EL CENTRO',
    saved: true,
    horario: 'Consultar disponibilidad',
    description: 'Justo frente a la plaza principal. Buena relación calidad-precio, con restaurante y bar propios.',
  },
];

/* ─── Pantalla ───────────────────────────────────── */
export default function MisAlojamientos() {
  const router = useRouter();
  const [saved, setSaved] = useState<Record<string, boolean>>(
    Object.fromEntries(ACCOMMODATIONS.map((a) => [a.id, a.saved]))
  );
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);

  const openDetail = (item: Accommodation) => {
    setSelectedPlace({
      name: item.name,
      category: 'Hotel',
      price: `${item.price}${item.priceUnit}`,
      horario: item.horario,
      img: item.img,
      rating: item.rating,
      location: item.location,
      description: item.description,
    });
  };

  const handleReservar = (place: PlaceDetail) => {
    router.push({
      pathname: '/reservar',
      params: {
        name: place.name,
        img: place.img ?? '',
        price: place.price,
        category: place.category,
      },
    } as any);
  };

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
            onPress={() => openDetail(item)}
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

              <TouchableOpacity
                onPress={() =>
                  handleReservar({
                    name: item.name,
                    category: 'Hotel',
                    price: `${item.price}${item.priceUnit}`,
                    horario: item.horario,
                    img: item.img,
                  })
                }
                className="mt-3 bg-primary rounded-xl py-2.5 items-center"
              >
                <Text className="text-white text-sm font-bold">Reservar ahora</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <PlaceDetailModal
        visible={!!selectedPlace}
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        onReservar={handleReservar}
      />
    </SafeAreaView>
  );
}