import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface TransportRecord {
  id: string;
  type: 'flight' | 'car' | 'train' | 'taxi';
  icon: IconName;
  from: string;
  to: string;
  date: string;
  duration: string;
  amount: string;
  status: 'Completado' | 'Cancelado' | 'Pendiente';
  provider: string;
}

/* ─── Datos ──────────────────────────────────────── */
const RECORDS: TransportRecord[] = [
  {
    id: 'tr1',
    type: 'flight',
    icon: 'flight',
    from: 'Ámsterdam',
    to: 'Viena',
    date: '22 jun 2024',
    duration: '2h 10m',
    amount: '€16,20',
    status: 'Completado',
    provider: 'Lüft Airlineas',
  },
  {
    id: 'tr2',
    type: 'train',
    icon: 'train',
    from: 'Xante Ave',
    to: 'París',
    date: '20 jun 2024',
    duration: '3h 45m',
    amount: '€75,00',
    status: 'Completado',
    provider: 'Eurail',
  },
  {
    id: 'tr3',
    type: 'taxi',
    icon: 'local-taxi',
    from: 'Vario',
    to: 'Madrid',
    date: '15 jun 2024',
    duration: '45m',
    amount: '€5,50',
    status: 'Completado',
    provider: 'Vento de Madrid',
  },
  {
    id: 'tr4',
    type: 'car',
    icon: 'directions-car',
    from: 'Safety Lits',
    to: 'Barcelona',
    date: '10 jun 2024',
    duration: '2h 30m',
    amount: '€13,40',
    status: 'Completado',
    provider: 'Safety Lits',
  },
];

const TYPE_COLOR: Record<TransportRecord['type'], string> = {
  flight: '#DBEAFE',
  car: '#D1FAE5',
  train: '#EDE9FE',
  taxi: '#FEF3C7',
};

const TYPE_ICON_COLOR: Record<TransportRecord['type'], string> = {
  flight: '#1D4ED8',
  car: '#059669',
  train: '#7C3AED',
  taxi: '#D97706',
};

const STATUS_STYLE: Record<TransportRecord['status'], { bg: string; text: string }> = {
  Completado: { bg: '#DCFCE7', text: '#16A34A' },
  Cancelado: { bg: '#FEE2E2', text: '#DC2626' },
  Pendiente: { bg: '#FEF9C3', text: '#CA8A04' },
};

/* ─── Pantalla ───────────────────────────────────── */
export default function HistorialTransporte() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Historial de Transporte
        </Text>
        <TouchableOpacity hitSlop={10} className="w-10 items-end">
          <MaterialIcons name="more-vert" size={24} color="#0F1B2D" />
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View className="px-5 py-4 bg-gray-50 border-b border-gray-100">
        <Text className="text-xs text-gray-400 mb-1">Total en transporte</Text>
        <Text className="text-2xl font-bold text-primary">€110,10</Text>
        <Text className="text-xs text-gray-400 mt-0.5">4 viajes registrados</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 12 }}
      >
        {RECORDS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            className="bg-white border border-gray-100 rounded-2xl p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-3">
              {/* Ícono tipo */}
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: TYPE_COLOR[item.type] }}
              >
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={TYPE_ICON_COLOR[item.type]}
                />
              </View>

              {/* Info ruta */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-bold text-primary">
                    {item.from}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={14} color="#9CA3AF" />
                  <Text className="text-sm font-bold text-primary">
                    {item.to}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500 mt-0.5">{item.provider}</Text>
                <View className="flex-row items-center gap-3 mt-1">
                  <View className="flex-row items-center gap-0.5">
                    <MaterialIcons name="schedule" size={11} color="#9CA3AF" />
                    <Text className="text-[10px] text-gray-400">{item.duration}</Text>
                  </View>
                  <View className="flex-row items-center gap-0.5">
                    <MaterialIcons name="calendar-today" size={11} color="#9CA3AF" />
                    <Text className="text-[10px] text-gray-400">{item.date}</Text>
                  </View>
                </View>
              </View>

              {/* Monto + estado */}
              <View className="items-end gap-1.5">
                <Text className="text-base font-bold text-primary">{item.amount}</Text>
                <View
                  style={{ backgroundColor: STATUS_STYLE[item.status].bg }}
                  className="px-2 py-0.5 rounded-full"
                >
                  <Text
                    style={{ color: STATUS_STYLE[item.status].text }}
                    className="text-[10px] font-semibold"
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
