import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import Header from '../../components/Header';
import Fab from '../../components/Fab';
import PlaceDetailModal, { PlaceDetail } from '../../components/PlaceDetailModal';

type ItemType = 'flight' | 'hotel' | 'culture' | 'food';

interface ItineraryItem {
  id: string;
  type: ItemType;
  label: string;
  time: string;
  title: string;
  description: string;
  image?: string;
  price: string;
  horario: string;
}

interface ItineraryDay {
  dayNumber: string;
  weekday: string;
  title: string;
  items: ItineraryItem[];
}

const TRIP = {
  title: 'Escapada a Xicotepec de Juárez',
  dateRange: '14 jul — 16 jul',
  duration: '3 Días',
};

const DAYS: ItineraryDay[] = [
  {
    dayNumber: '14',
    weekday: 'Martes, 14 de julio',
    title: 'Día de Llegada',
    items: [
      {
        id: 'd1-1',
        type: 'hotel',
        label: 'ENTRADA',
        time: '2:00 PM',
        title: 'Hotel Casablanca Xicotepec',
        description: 'Blvrd Benito Juárez 264, Col. Centro, Xicotepec de Juárez, Puebla.',
        price: '$1,200 MXN/noche (estimado)',
        horario: 'Recepción abierta 24 horas',
        image: 'https://lh3.googleusercontent.com/place-photos/AJRVUZNAacpVw3Gs9c95WGNFPKfML0csS41l-LGzQ_Zoy8uu41ywHpWIYIf3orNCfeYvuvJEQooHGmjJc7mc4_v-SOL_aCv-Wi7psoaJorKdQhZqWR_FBE1rOUHlQOm7wTTMaOd0-w_gW27gV_2jyg=s4800-w800-h600',
      },
      {
        id: 'd1-2',
        type: 'food',
        label: 'CENA',
        time: '8:00 PM',
        title: 'Parrilla de Villa',
        description: 'Cortes de carne y vista a la presa de Necaxa. Recomendado: la picaña.',
        price: '$200–350 MXN por persona (estimado)',
        horario: 'Jue–Vie: 6:30–10 PM • Sáb: 5 AM–10:30 PM • Dom: 2:30–10 PM (cerrado Lun–Mié)',
      },
    ],
  },
  {
    dayNumber: '15',
    weekday: 'Miércoles, 15 de julio',
    title: 'Miradores y Naturaleza',
    items: [
      {
        id: 'd2-1',
        type: 'culture',
        label: 'MIRADOR',
        time: '7:00 AM',
        title: 'Cruz Celestial de la Unidad',
        description: 'Subida recomendada temprano para evitar el calor. Vistas de toda la sierra.',
        price: 'Gratis',
        horario: '5:00 AM – 7:00 PM',
      },
      {
        id: 'd2-2',
        type: 'culture',
        label: 'NATURALEZA',
        time: '1:00 PM',
        title: 'Los Arroyos',
        description: 'Río de aguas cristalinas, ideal para nadar y hacer picnic.',
        price: '$50 MXN aprox. por auto',
        horario: 'Consultar horario local',
      },
      {
        id: 'd2-3',
        type: 'food',
        label: 'CENA',
        time: '7:30 PM',
        title: 'La Terraza, Restaurante & Cafetería',
        description: 'Comida tradicional cerca de la plaza principal.',
        price: '$150–300 MXN por persona (estimado)',
        horario: 'Lun–Sáb: 7:00 AM – 11:00 PM • Dom: 7:00 AM – 10:00 PM',
      },
    ],
  },
  {
    dayNumber: '16',
    weekday: 'Jueves, 16 de julio',
    title: 'Centro Histórico y Salida',
    items: [
      {
        id: 'd3-1',
        type: 'food',
        label: 'DESAYUNO',
        time: '9:00 AM',
        title: 'La Tostadora Xico',
        description: 'Café tostado en casa y desayunos tradicionales.',
        price: '$150–250 MXN por persona (estimado)',
        horario: 'Mié–Lun: 9:00 AM – 9:30 PM (cerrado martes)',
      },
      {
        id: 'd3-2',
        type: 'culture',
        label: 'CULTURA',
        time: '11:30 AM',
        title: 'Xochipila y Zócalo de Xicotepec',
        description: 'Centro ceremonial prehispánico y mercado del centro histórico.',
        price: 'Gratis',
        horario: 'Abierto 24 horas (Zócalo) • Xochipila: consultar horario',
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

function TimelineCard({ item, onPress }: { item: ItineraryItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-white border border-gray-200 rounded-2xl p-4 mb-4"
    >
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
    </TouchableOpacity>
  );
}

function CronogramaView({ onSelectItem }: { onSelectItem: (item: ItineraryItem) => void }) {
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
              <TimelineCard key={item.id} item={item} onPress={() => onSelectItem(item)} />
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
      label: 'Parrilla de Villa',
      icon: 'restaurant' as const,
      latitude: 20.2827255,
      longitude: -97.9582991,
    },
    {
      id: 2,
      label: 'Hotel Casablanca',
      icon: 'bed' as const,
      latitude: 20.2644975,
      longitude: -97.9637654,
    },
    {
      id: 3,
      label: 'La Tostadora Xico',
      icon: 'local-cafe' as const,
      latitude: 20.269717,
      longitude: -97.9588949,
    },
    {
      id: 4,
      label: 'Cruz Celestial',
      icon: 'terrain' as const,
      latitude: 20.2893933,
      longitude: -97.9485139,
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

      {/* Mapa real con Leaflet + OpenStreetMap dentro de un WebView (100% gratis, sin API key) */}
      <WebView
        originWhitelist={['*']}
        style={{ flex: 1 }}
        source={{
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .pin {
      background: #0F1B2D;
      border: 2px solid #F4B400;
      border-radius: 20px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .pin-label {
      background: #FFFFFF;
      border-radius: 6px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 700;
      color: #0F1B2D;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      white-space: nowrap;
      text-align: center;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([20.2766, -97.9581], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var markers = ${JSON.stringify(MARKERS)};

    markers.forEach(function (pin) {
      var icon = L.divIcon({
        className: '',
        html: '<div style="display:flex;flex-direction:column;align-items:center;"><div class="pin">📍</div><div class="pin-label">' + pin.label + '</div></div>',
        iconSize: [80, 60],
        iconAnchor: [40, 20],
      });
      L.marker([pin.latitude, pin.longitude], { icon: icon }).addTo(map);
    });
  </script>
</body>
</html>
          `,
        }}
      />
    </View>
  );
}

export default function Itinerario() {
  const [view, setView] = useState<'cronograma' | 'mapa'>('cronograma');
  const [selectedItem, setSelectedItem] = useState<PlaceDetail | null>(null);
  const router = useRouter();

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

      {view === 'cronograma' ? (
        <CronogramaView
          onSelectItem={(item) =>
            setSelectedItem({
              name: item.title,
              category:
                item.type === 'hotel'
                  ? 'Hotel'
                  : item.type === 'food'
                  ? 'Restaurante'
                  : item.type === 'flight'
                  ? 'Transporte'
                  : 'Lugar turístico',
              price: item.price,
              horario: item.horario,
              img: item.image,
              description: item.description,
            })
          }
        />
      ) : (
        <MapaView />
      )}

      <Fab
        icon={view === 'cronograma' ? 'payments' : 'add'}
        onPress={() =>
          view === 'cronograma'
            ? router.push({
                pathname: '/reservar',
                params: {
                  name: TRIP.title,
                  category: 'Itinerario completo',
                  price: 'Ver desglose en el siguiente paso',
                },
              } as any)
            : router.push('/gestion-transporte')
        }
      />

      <PlaceDetailModal
        visible={!!selectedItem}
        place={selectedItem}
        onClose={() => setSelectedItem(null)}
        onReservar={handleReservar}
      />
    </View>
  );
}