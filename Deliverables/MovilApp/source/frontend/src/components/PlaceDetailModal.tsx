import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface PlaceDetail {
  name: string;
  category: string; // 'Lugar turístico' | 'Hotel' | 'Restaurante'
  price: string;
  horario: string;
  img?: string;
  rating?: number;
  location?: string;
  description?: string;
}

interface Props {
  visible: boolean;
  place: PlaceDetail | null;
  onClose: () => void;
  onReservar?: (place: PlaceDetail) => void;
}

export default function PlaceDetailModal({ visible, place, onClose, onReservar }: Props) {
  if (!place) return null;

  const handleAddItinerario = () => {
    onClose();
    setTimeout(() => {
      Alert.alert('¡Agregado!', `${place.name} se agregó a tu itinerario.`);
    }, 250);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50" onPress={onClose} />
      <View className="bg-white rounded-t-3xl" style={{ maxHeight: '88%' }}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Imagen */}
          <View>
            {place.img ? (
              <Image source={{ uri: place.img }} className="w-full h-52" />
            ) : (
              <View className="w-full h-24 bg-gray-100" />
            )}
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 items-center justify-center"
            >
              <MaterialIcons name="close" size={20} color="#0F1B2D" />
            </TouchableOpacity>
          </View>

          <View className="p-5">
            {/* Categoría */}
            <View className="bg-secondary self-start px-2.5 py-1 rounded-full mb-2">
              <Text className="text-[10px] font-bold text-primary uppercase tracking-wide">
                {place.category}
              </Text>
            </View>

            {/* Nombre */}
            <Text className="text-xl font-bold text-primary">{place.name}</Text>

            {/* Ubicación */}
            {place.location && (
              <View className="flex-row items-center gap-1 mt-1">
                <MaterialIcons name="place" size={13} color="#9CA3AF" />
                <Text className="text-xs text-gray-500">{place.location}</Text>
              </View>
            )}

            {/* Rating */}
            {place.rating != null && (
              <View className="flex-row items-center gap-1 mt-1.5">
                <MaterialIcons name="star" size={14} color="#F4B400" />
                <Text className="text-sm font-bold text-primary">{place.rating}</Text>
              </View>
            )}

            {/* Descripción */}
            {place.description && (
              <Text className="text-sm text-gray-500 mt-3 leading-relaxed">
                {place.description}
              </Text>
            )}

            {/* Precio + Horario */}
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                <Text className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                  Precio
                </Text>
                <Text className="text-sm font-bold text-primary">{place.price}</Text>
              </View>
              <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                <Text className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                  Horario
                </Text>
                <Text className="text-sm font-bold text-primary">{place.horario}</Text>
              </View>
            </View>

            {/* Botones */}
            <View className="gap-3 mt-6">
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onReservar?.(place);
                }}
                activeOpacity={0.85}
                className="bg-primary rounded-2xl py-4 items-center"
              >
                <Text className="text-white font-bold text-sm">Reservar / Pagar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddItinerario}
                activeOpacity={0.85}
                className="border-2 border-primary rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
              >
                <MaterialIcons name="add" size={18} color="#0F1B2D" />
                <Text className="text-primary font-bold text-sm">Agregar al itinerario</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}