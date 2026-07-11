import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface NotifItem {
  id: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  category: 'seguridad' | 'vuelo' | 'cobro' | 'promo' | 'app';
}

/* ─── Datos ──────────────────────────────────────── */
const NOTIFICATIONS: NotifItem[] = [
  {
    id: 'n1',
    icon: 'security',
    iconBg: '#DBEAFE',
    iconColor: '#1D4ED8',
    title: 'Autenticación de dos pasos',
    body: 'Se ha activado la verificación de dos factores en tu cuenta.',
    time: 'Hace 5 min',
    read: false,
    category: 'seguridad',
  },
  {
    id: 'n2',
    icon: 'home',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    title: 'App Airbnb — Actualización',
    body: 'Tu reserva en Santorini ha sido confirmada para el 22 de julio.',
    time: 'Hace 1 h',
    read: false,
    category: 'app',
  },
  {
    id: 'n3',
    icon: 'flight',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
    title: 'Mensaje de Vuelo (2001)',
    body: 'Vuelo AF2001 Madrid → París: Embarque abierto — Puerta C12.',
    time: 'Hace 2 h',
    read: false,
    category: 'vuelo',
  },
  {
    id: 'n4',
    icon: 'account-balance-wallet',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
    title: 'Cobro Procesado',
    body: 'Se ha cobrado €452,00 por tu reserva de Hotel Ritz Carlton.',
    time: 'Ayer',
    read: true,
    category: 'cobro',
  },
  {
    id: 'n5',
    icon: 'local-offer',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    title: 'Oferta especial — 20% OFF',
    body: 'Este fin de semana tienes un 20% de descuento en alojamientos seleccionados.',
    time: 'Hace 2 días',
    read: true,
    category: 'promo',
  },
];

/* ─── Pantalla ───────────────────────────────────── */
export default function Notificaciones() {
  const router = useRouter();
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0F1B2D" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-primary">
          Notificaciones
        </Text>
        <TouchableOpacity hitSlop={10} className="w-10 items-end">
          <MaterialIcons name="done-all" size={22} color="#0F1B2D" />
        </TouchableOpacity>
      </View>

      {/* Badge resumen */}
      {unread > 0 && (
        <View className="mx-5 mt-4 bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3 flex-row items-center gap-2">
          <View className="w-6 h-6 rounded-full bg-secondary items-center justify-center">
            <Text className="text-[10px] font-bold text-primary">{unread}</Text>
          </View>
          <Text className="text-sm text-primary font-semibold">
            {unread} notificaciones sin leer
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 10 }}
      >
        {NOTIFICATIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.75}
            className={`flex-row items-start gap-3 p-4 rounded-2xl border ${
              item.read
                ? 'bg-white border-gray-100'
                : 'bg-secondary/5 border-secondary/20'
            }`}
          >
            {/* Ícono */}
            <View
              className="w-11 h-11 rounded-2xl items-center justify-center mt-0.5"
              style={{ backgroundColor: item.iconBg }}
            >
              <MaterialIcons
                name={item.icon}
                size={20}
                color={item.iconColor}
              />
            </View>

            {/* Contenido */}
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-sm font-bold text-primary flex-1"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!item.read && (
                  <View className="w-2 h-2 rounded-full bg-secondary ml-2" />
                )}
              </View>
              <Text
                className="text-xs text-gray-500 mt-1 leading-relaxed"
                numberOfLines={2}
              >
                {item.body}
              </Text>
              <Text className="text-[10px] text-gray-400 mt-1.5">{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
