import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Header from '../../components/Header';
import Fab from '../../components/Fab';

type ItemType = 'flight' | 'hotel' | 'culture' | 'food';

interface ItineraryItem {
  id: string;
  type: ItemType;
  label: string;
  time: string;
  title: string;
  description: string;
  image?: string;
}

interface ItineraryDay {
  dayNumber: string;
  weekday: string;
  title: string;
  items: ItineraryItem[];
}

const TRIP = {
  title: 'Verano en París',
  dateRange: '14 jul — 21 jul',
  duration: '7 Días',
};

const DAYS: ItineraryDay[] = [
  {
    dayNumber: '14',
    weekday: 'Domingo, 14 de julio',
    title: 'Día de Llegada',
    items: [
      {
        id: 'd1-1',
        type: 'flight',
        label: 'VUELO AF1203',
        time: '10:30 AM',
        title: 'CDG Terminal 2E',
        description: 'Directo desde JFK. Llegada a puerta estimada: 10:45 AM hora local.',
      },
      {
        id: 'd1-2',
        type: 'hotel',
        label: 'ENTRADA',
        time: '2:00 PM',
        title: 'Hôtel Plaza Athénée',
        description: '25 Avenue Montaigne, 75008 Paris.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    dayNumber: '15',
    weekday: 'Lunes, 15 de julio',
    title: 'Explorando Le Marais',
    items: [
      {
        id: 'd2-1',
        type: 'culture',
        label: 'CULTURA',
        time: '11:00 AM',
        title: 'El Museo del Louvre',
        description: 'Entrada sin colas reservada. Punto de encuentro: Entrada de la Pirámide.',
      },
      {
        id: 'd2-2',
        type: 'food',
        label: 'CENA',
        time: '8:30 PM',
        title: 'Le Comptoir de La Relais',
        description: 'Bistró francés clásico. Check-in confirmado para 2.',
      },
    ],
  },
];

const TYPE_ICON: Record<ItemType, React.ComponentProps<typeof MaterialIcons>['name']> = {
  flight: 'flight',
  hotel: 'bed',
  culture: 'museum',
  food: 'restaurant',
};

const MAP_PINS = [
  { id: 1, label: 'Disfrutar', icon: 'restaurant' as const, top: 220, left: 130, dark: true },
  { id: 2, label: 'Hotel Arts', icon: 'bed' as const, top: 430, left: 210, dark: true },
  { id: 3, label: 'Nomad Coffee', icon: 'local-cafe' as const, top: 560, left: 175, dark: true },
];

function TimelineCard({ item }: { item: ItineraryItem }) {
  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name={TYPE_ICON[item.type]} size={16} color="#0F1B2D" />
          <Text className="text-xs font-bold text-gray-500 tracking-wide">{item.label}</Text>
        </View>
        <Text className="text-xs font-bold text-secondary">{item.time}</Text>
      </View>
      <Text className="text-base font-bold text-primary mb-1">{item.title}</Text>
      <Text className="text-sm text-gray-500 leading-relaxed">{item.description}</Text>
      {item.image && (
        <Image source={{ uri: item.image }} className="w-full h-36 rounded-xl mt-3" />
      )}
    </View>
  );
}

function CronogramaView() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {DAYS.map((day, dayIdx) => (
        <View key={day.dayNumber} className="flex-row px-5">
          {/* Columna del timeline (número + línea vertical) */}
          <View className="items-center mr-4">
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
              <Text className="text-white text-sm font-bold">{day.dayNumber}</Text>
            </View>
            {dayIdx < DAYS.length - 1 && <View className="flex-1 w-px bg-gray-200 mt-2" />}
          </View>

          {/* Contenido del día */}
          <View className="flex-1 pb-8">
            <Text className="text-lg font-bold text-primary">{day.title}</Text>
            <Text className="text-xs font-bold text-secondary mb-4 uppercase tracking-wide">
              {day.weekday}
            </Text>
            {day.items.map((item) => (
              <TimelineCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function MapaView() {
  const [activeFilter, setActiveFilter] = useState('Favoritos');

  const MARKERS = [
    {
      id: 1,
      label: 'Disfrutar',
      icon: 'restaurant' as const,
      latitude: 41.3851,
      longitude: 2.1734,
    },
    {
      id: 2,
      label: 'Hotel Arts',
      icon: 'bed' as const,
      latitude: 41.3878,
      longitude: 2.1960,
    },
    {
      id: 3,
      label: 'Nomad Coffee',
      icon: 'local-cafe' as const,
      latitude: 41.3905,
      longitude: 2.1622,
    },
  ];

  return (
    <View className="flex-1">
      {/* Filtros flotantes */}
      <View
        style={{
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          zIndex: 10,
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 16,
        }}
      >
        {['Favoritos', 'Hoteles', 'Restaurantes'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={{
              backgroundColor: activeFilter === f ? '#0F1B2D' : '#FFFFFF',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MaterialIcons
              name={f === 'Favoritos' ? 'favorite-border' : f === 'Hoteles' ? 'bed' : 'restaurant'}
              size={14}
              color={activeFilter === f ? '#F4B400' : '#0F1B2D'}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: activeFilter === f ? '#FFFFFF' : '#0F1B2D',
              }}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mapa real */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 41.3851,
          longitude: 2.1734,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {MARKERS.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.label}
          >
            {/* Pin personalizado */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#0F1B2D',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#F4B400',
                }}
              >
                <MaterialIcons name={pin.icon} size={18} color="#FFFFFF" />
              </View>
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  marginTop: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F1B2D' }}>
                  {pin.label}
                </Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

export default function Itinerario() {
  const [view, setView] = useState<'cronograma' | 'mapa'>('cronograma');
  const [successModal, setSuccessModal] = useState(false);
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <Header variant="logo" onBellPress={() => {}} />

      {view === 'cronograma' && (
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-primary">{TRIP.title}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {TRIP.dateRange} • {TRIP.duration}
          </Text>

          {/* Toggle Cronograma / Vista de Mapa */}
          <View className="flex-row bg-gray-100 rounded-full p-1 mt-4 self-start">
            <TouchableOpacity
              className="px-4 py-2 rounded-full bg-white shadow-sm"
            >
              <Text className="text-xs font-bold text-primary">
                Cronograma
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView('mapa')}
              className="px-4 py-2 rounded-full"
            >
              <Text className="text-xs font-bold text-gray-500">
                Vista de Mapa
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {view === 'mapa' && (
        <View className="px-5 py-2">
          <View className="flex-row bg-gray-100 rounded-full p-1 self-start">
            <TouchableOpacity
              onPress={() => setView('cronograma')}
              className="px-4 py-2 rounded-full"
            >
              <Text className="text-xs font-bold text-gray-500">Cronograma</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 rounded-full bg-white shadow-sm"
            >
              <Text className="text-xs font-bold text-primary">Vista de Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {view === 'cronograma' ? <CronogramaView /> : <MapaView />}

      <Fab
        icon={view === 'cronograma' ? 'payments' : 'add'}
        onPress={() =>
          view === 'cronograma'
            ? setSuccessModal(true)
            : router.push('/gestion-transporte')
        }
      />

      {/* Modal Pago Exitoso */}
      <Modal
        visible={successModal}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
          onPress={() => setSuccessModal(false)}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F4B400', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MaterialIcons name="check" size={40} color="#0F1B2D" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#0F1B2D', textAlign: 'center', marginBottom: 8 }}>¡Pago Exitoso!</Text>
            <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
              Tu reserva ha sido procesada correctamente.
            </Text>
            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 20, width: '100%' }}>
              <Text style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginBottom: 4 }}>Número de referencia</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F1B2D', textAlign: 'center', letterSpacing: 4 }}>JTX 785310</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <TouchableOpacity
                onPress={() => { setSuccessModal(false); router.push('/gestion-transporte'); }}
                style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' }}
              >
                <Text style={{ color: '#0F1B2D', fontWeight: '700', fontSize: 13 }}>Transporte</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSuccessModal(false)}
                style={{ flex: 1, backgroundColor: '#0F1B2D', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Ver Itinerario</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}