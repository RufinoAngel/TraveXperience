import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Fab from '../../components/Fab';

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
    title: 'Jungla de Bali',
    location: 'Indonesia',
    tag: 'AVENTURA',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Zermatt',
    location: 'Suiza',
    tag: 'LUJO',
    img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=600&q=80',
  },
];

const NEARBY = [
  {
    id: 1,
    name: 'Atelier del Café',
    location: 'Eixample • Café de especialidad',
    rating: 4.9,
    price: '€€',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Hotel Blue Horizon',
    location: 'Poblenou • Vistas al mar',
    rating: 4.8,
    price: '€€€',
    img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 3,
    name: 'Mare Nostrum',
    location: 'Gòtic • Cocina Mediterránea',
    rating: 4.7,
    price: '€€',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=200&q=80',
  },
];

export default function Descubrir() {
  const [activeCategory, setActiveCategory] = useState('hoteles');
  const [search, setSearch] = useState('');

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
              <Text className="text-xs text-gray-400">Barcelona</Text>
            </View>
          </View>
          <View className="gap-3">
            {NEARBY.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center gap-3 bg-white border border-gray-100 rounded-2xl p-2.5"
                activeOpacity={0.8}
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
    </View>
  );
}