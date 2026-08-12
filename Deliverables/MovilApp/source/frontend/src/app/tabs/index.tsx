import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Fab from '../../components/Fab';
import Header from '../../components/Header';
import PlaceDetailModal, { PlaceDetail } from '../../components/PlaceDetailModal';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

const CATEGORIES: { key: string; label: string; icon: IconName }[] = [
  { key: 'hoteles', label: 'Hoteles', icon: 'hotel' },
  { key: 'vuelos', label: 'Vuelos', icon: 'flight' },
  { key: 'experiencias', label: 'Experiencias', icon: 'hiking' },
  { key: 'restaurantes', label: 'Restaurantes', icon: 'restaurant' },
];

const TRENDING = [
  {
    id: 1,
    title: 'Cruz Celestial de la Unidad',
    location: 'Xicotepec de Juárez',
    tag: 'MIRADOR',
    rating: 4.7,
    price: 'Gratis',
    horario: '5:00 AM – 7:00 PM',
    description: 'El mirador más alto del pueblo. Se llega subiendo una larga escalinata; la recompensa es una vista total de la sierra, sobre todo al amanecer con niebla.',
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZMasBXKYk8yYBxVYBCei27i15uoPjfCWAmx0yFh9RszhiJ_GNn2ed_B11xbBCz6HNkLr_S3HvBS-Om4kZ7VXegpP_pdg7fxRP3W3PLmXENQXydKC7LjWmsVbvGDfHa8bujRvm1cXFs41y_YEg=s4800-w800-h600',
  },
  {
    id: 2,
    title: 'Monumental Virgen de Guadalupe',
    location: 'Cerro El Tabacal',
    tag: 'CULTURA',
    rating: 4.6,
    price: 'Gratis',
    horario: 'Abierto 24 horas',
    description: 'Imagen de 20 metros de altura en el cerro El Tabacal, con una vista panorámica del centro de Xicotepec.',
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZOw-DWIyP_VOnkCApWP0eDVfsZUhM6TsII2721NqIrRzlUTsLd4jfUHExuajSZYOB1j8hOM2CdrCPgdZWHj38ikmGFQiSAAXSUMolt3UKr2nSKfZBSIldkoadHpag7jSOIbt43FHisNm0UJyg=s4800-w800-h600',
  },
  {
    id: 3,
    title: 'Los Arroyos',
    location: 'Río de aguas cristalinas',
    tag: 'NATURALEZA',
    rating: 4.8,
    price: '$50 MXN aprox. por auto',
    horario: 'Consultar horario local',
    description: 'Río de aguas cristalinas ideal para nadar y hacer picnic en familia. Se recomienda llevar comida propia y no dejar basura.',
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZNFYscFDYZkGT_dlEnRLT0eZouzEYzqA1_4hK-rlyv1187Omf1vvXsvvjdnLQkonW7OgiFYfNj8GB8rQgipZPFqdZiGD0ZU9rMTgcOL_OTF4ObyRfbUjhlakl_WAyJ914vpYUQ-9Giw_J8-eSY=s4800-w800-h600',
  },
  {
    id: 4,
    title: 'Xicopark',
    location: 'Ruta de la macadamia',
    tag: 'FAMILIA',
    rating: 4.4,
    price: 'Consultar tarifa de entrada',
    horario: '8:00 AM – 5:00 PM',
    description: 'Parque familiar a 10 minutos del centro, con ruta de macadamia, granja y senderos. Ideal para ir con niños.',
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZO5IYk-fCvbDfgZKYnd5xFdz2aKnLjgX_DvFCh3bu7_KFkQo7uF3LRhekNoOtWY8Tp2v8Y5BiOM31S53O0ipurIoKkzoGFu0chkGpL1E1OZpCu8S_cQC04BWeZBJ8CVYlm7dzIzTEUr_s8NOCY=s4800-w800-h600',
  },
];

const NEARBY = [
  {
    id: 1,
    name: 'La Tostadora Xico',
    location: 'Centro • Café tostado en casa',
    rating: 4.6,
    price: '$150–250 MXN por persona (estimado)',
    horario: 'Mié–Lun: 9:00 AM – 9:30 PM (cerrado martes)',
    description: 'El favorito para desayunar en Xicotepec. Café tostado en casa y desayunos tradicionales.',
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZM5_W-73E4jsj5UudaIDRzCuiPzRqqzwaDh4ZJsV92xC_ns9sTMHkMm8uYaXevcnF7n1I7QE2m8H_XpTl2p1jSrLPw6PZQX1meTMmRFnh4LpaDAniLp0NTUxgPadrivjj40AqB5dn27KC0gHA=s4800-w800-h600',
  },
  {
    id: 2,
    name: 'Hotel Casablanca Xicotepec',
    location: 'Centro • Alberca y temascal',
    rating: 4.5,
    price: '$1,200 MXN/noche (estimado)',
    horario: 'Recepción abierta 24 horas',
    description: 'Hotel moderno con alberca, temascal y gimnasio pequeño. Buen restaurante propio.',
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZNAacpVw3Gs9c95WGNFPKfML0csS41l-LGzQ_Zoy8uu41ywHpWIYIf3orNCfeYvuvJEQooHGmjJc7mc4_v-SOL_aCv-Wi7psoaJorKdQhZqWR_FBE1rOUHlQOm7wTTMaOd0-w_gW27gV_2jyg=s4800-w800-h600',
  },
  {
    id: 3,
    name: 'Parrilla de Villa',
    location: 'Centro • Cortes y vista a la presa',
    rating: 4.8,
    price: '$200–350 MXN por persona (estimado)',
    horario: 'Jue–Vie: 6:30–10 PM • Sáb: 5 AM–10:30 PM • Dom: 2:30–10 PM (cerrado Lun–Mié)',
    description: 'El favorito para carnes en Xicotepec. Recomiendan la picaña, con vista a la presa de Necaxa.',
    img: 'https://lh3.googleusercontent.com/place-photos/AJRVUZNjSr6q5cH0qIAHVtIU61ljIKKzEgCCrm9nMVq2GYy5YK1Yc3zUCMz_7ZwVdkmrN_KyRAFVDe9pvpn1nWd2pmWBssRRoW7NIvL87-sAwjITeLnbdprYGnRrlzrrmre62Xoy3r0IHa7IFufhgiw=s4800-w800-h600',
  },
];

export default function Descubrir() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('hoteles');
  const [search, setSearch] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);

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
    <View className="flex-1 bg-white">
      <Header variant="logo" onBellPress={() => {}} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Search bar */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3.5">
            <MaterialIcons name="search" size={20} color="#6B7280" />
            <TextInput
              placeholder="¿A dónde quieres ir?"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              className="flex-1 text-base text-primary"
            />
            <MaterialIcons name="tune" size={20} color="#6B7280" />
          </View>
        </View>

        {/* Categorías */}
        <View className="flex-row justify-between px-5 mt-5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setActiveCategory(cat.key)}
                className="items-center gap-1.5"
              >
                <View
                  className={`w-14 h-14 rounded-2xl items-center justify-center ${
                    isActive ? 'bg-primary' : 'bg-gray-100'
                  }`}
                >
                  <MaterialIcons
                    name={cat.icon}
                    size={24}
                    color={isActive ? '#FFFFFF' : '#0F1B2D'}
                  />
                </View>
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tendencias actuales */}
        <View className="mt-7">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text className="text-lg font-bold text-primary">Tendencias actuales</Text>
            <TouchableOpacity>
              <Text className="text-xs font-bold text-secondary">Ver todo</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {TRENDING.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-48 h-56 rounded-2xl overflow-hidden"
                activeOpacity={0.9}
                onPress={() =>
                  setSelectedPlace({
                    name: item.title,
                    category: 'Lugar turístico',
                    price: item.price,
                    horario: item.horario,
                    img: item.img,
                    rating: item.rating,
                    location: item.location,
                    description: item.description,
                  })
                }
              >
                <Image source={{ uri: item.img }} className="w-full h-full absolute" />
                <View className="absolute inset-0 bg-black/25" />
                <View className="absolute top-3 left-3 bg-secondary px-2.5 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-primary">{item.tag}</Text>
                </View>
                <View className="absolute bottom-3 left-3 right-3">
                  <Text className="text-white text-base font-bold">{item.title}</Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <MaterialIcons name="place" size={12} color="#FFFFFF" />
                    <Text className="text-white/80 text-xs">{item.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Descubrir cerca de ti */}
        <View className="mt-7 px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-primary">Descubrir cerca de ti</Text>
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="location-on" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-400">Xicotepec de Juárez</Text>
            </View>
          </View>
          <View className="gap-3">
            {NEARBY.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center gap-3 bg-white border border-gray-100 rounded-2xl p-2.5"
                activeOpacity={0.8}
                onPress={() =>
                  setSelectedPlace({
                    name: item.name,
                    category: item.name.toLowerCase().includes('hotel') ? 'Hotel' : 'Restaurante',
                    price: item.price,
                    horario: item.horario,
                    img: item.img,
                    rating: item.rating,
                    location: item.location,
                    description: item.description,
                  })
                }
              >
                <Image source={{ uri: item.img }} className="w-16 h-16 rounded-xl" />
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-primary flex-1" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-0.5">
                      <MaterialIcons name="star" size={13} color="#F4B400" />
                      <Text className="text-xs font-bold text-primary">{item.rating}</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                    {item.location}
                  </Text>
                  <Text className="text-xs font-semibold text-gray-400 mt-1">{item.price}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA planificar viaje */}
        <View className="mx-5 mt-6 bg-primary rounded-2xl p-6 items-center">
          <Text className="text-white text-base font-bold text-center mb-1">
            ¿Planeas algo especial?
          </Text>
          <Text className="text-white/70 text-xs text-center mb-4 leading-relaxed">
            Déjanos ayudarte a diseñar el itinerario perfecto para tu próxima aventura.
          </Text>
          <TouchableOpacity className="bg-secondary rounded-full px-6 py-3">
            <Text className="text-primary text-sm font-bold">Empezar a planear</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Fab icon="location-on" onPress={() => {}} />

      <PlaceDetailModal
        visible={!!selectedPlace}
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        onReservar={handleReservar}
      />
    </View>
  );
}