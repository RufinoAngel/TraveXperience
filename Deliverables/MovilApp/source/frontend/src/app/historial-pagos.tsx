import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface Payment {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  date: string;
  amount: string;
  positive: boolean;
  status: 'Completado' | 'Pendiente' | 'Cancelado';
  category: 'Hoteles' | 'Vuelos' | 'Otros';
}

/* ─── Datos ──────────────────────────────────────── */
const FILTERS = ['Todos', 'Hoteles', 'Vuelos', 'Otros'] as const;

const GROUPS: { month: string; items: Payment[] }[] = [
  {
    month: 'Mayo 2024',
    items: [
      {
        id: 'p1',
        icon: 'flight',
        title: 'Vuelos Iberia',
        subtitle: 'Madrid → París',
        date: '12 may 2024',
        amount: '-€452,00',
        positive: false,
        status: 'Completado',
        category: 'Vuelos',
      },
      {
        id: 'p2',
        icon: 'bed',
        title: 'Hotel Plaza Athénée',
        subtitle: 'París, Francia',
        date: '10 may 2024',
        amount: '-€1.240,00',
        positive: false,
        status: 'Completado',
        category: 'Hoteles',
      },
    ],
  },
  {
    month: 'Abril 2024',
    items: [
      {
        id: 'p3',
        icon: 'restaurant',
        title: 'Uber Eats',
        subtitle: 'Pedido #9823',
        date: '28 abr 2024',
        amount: '-€18,45',
        positive: false,
        status: 'Completado',
        category: 'Otros',
      },
      {
        id: 'p4',
        icon: 'flight',
        title: 'Air France',
        subtitle: 'Barcelona → Lyon',
        date: '20 abr 2024',
        amount: '-€340',
        positive: false,
        status: 'Completado',
        category: 'Vuelos',
      },
      {
        id: 'p5',
        icon: 'account-balance-wallet',
        title: 'Reembolso Hotel',
        subtitle: 'Cancelación reserva',
        date: '15 abr 2024',
        amount: '+€210,00',
        positive: true,
        status: 'Completado',
        category: 'Hoteles',
      },
    ],
  },
];

const STATUS_STYLE: Record<Payment['status'], { bg: string; text: string }> = {
  Completado: { bg: '#DCFCE7', text: '#16A34A' },
  Pendiente: { bg: '#FEF9C3', text: '#CA8A04' },
  Cancelado: { bg: '#FEE2E2', text: '#DC2626' },
};

/* ─── Componente ─────────────────────────────────── */
export default function HistorialPagos() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Todos');

  // Filtra cada grupo por categoría y descarta los meses que se quedan sin items
  const filteredGroups = GROUPS.map((group) => ({
    month: group.month,
    items:
      activeFilter === 'Todos'
        ? group.items
        : group.items.filter((item) => item.category === activeFilter),
  })).filter((group) => group.items.length > 0);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Historial de Pagos
        </Text>
        <TouchableOpacity hitSlop={10} className="w-10 items-end">
          <MaterialIcons name="filter-list" size={24} color="#0F1B2D" />
        </TouchableOpacity>
      </View>

      {/* Resumen */}
      <View className="mx-5 mt-5 bg-primary rounded-2xl p-4 flex-row justify-between">
        {[
          { label: 'Total gastado', value: '€2.260,45' },
          { label: 'Reembolsos', value: '€210,00' },
          { label: 'Neto', value: '€2.050,45' },
        ].map((s) => (
          <View key={s.label} className="items-center">
            <Text className="text-white/60 text-[10px] uppercase tracking-wide mb-0.5">
              {s.label}
            </Text>
            <Text className="text-white text-sm font-bold">{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 12 }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full border ${
              activeFilter === f
                ? 'bg-primary border-primary'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === f ? 'text-white' : 'text-gray-500'
              }`}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {filteredGroups.length === 0 ? (
          <View className="items-center py-16">
            <MaterialIcons name="receipt-long" size={40} color="#D1D5DB" />
            <Text className="text-sm text-gray-400 mt-3">
              No hay pagos en esta categoría
            </Text>
          </View>
        ) : (
          filteredGroups.map((group) => (
            <View key={group.month}>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">
                {group.month}
              </Text>
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 bg-gray-50 rounded-2xl p-3.5 mb-2.5"
                >
                  {/* Ícono */}
                  <View className="w-11 h-11 rounded-full bg-white border border-gray-100 items-center justify-center">
                    <MaterialIcons name={item.icon} size={20} color="#0F1B2D" />
                  </View>
                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-primary">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {item.subtitle}
                    </Text>
                    <Text className="text-[10px] text-gray-400 mt-0.5">
                      {item.date}
                    </Text>
                  </View>
                  {/* Monto + estado */}
                  <View className="items-end gap-1.5">
                    <Text
                      className={`text-sm font-bold ${
                        item.positive ? 'text-green-600' : 'text-primary'
                      }`}
                    >
                      {item.amount}
                    </Text>
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
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}