import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface MenuRow {
  id: string;
  icon: IconName;
  label: string;
  badge?: string;
  route?: string;
  toggle?: boolean;
  danger?: boolean;
}

/* ─── Datos ──────────────────────────────────────── */
const MENU_SECTIONS: { title: string; items: MenuRow[] }[] = [
  {
    title: 'Mi cuenta',
    items: [
      { id: 'perfil', icon: 'person-outline', label: 'Información personal', route: '/informe-personal' },
      { id: 'reservas', icon: 'bookmark-border', label: 'Reservas guardadas', route: '/mis-alojamientos' },
      { id: 'pagos', icon: 'credit-card', label: 'Métodos de pago', route: '/metodos-pago' },
      { id: 'histpagos', icon: 'receipt-long', label: 'Historial de pagos', route: '/historial-pagos' },
    ],
  },
  {
    title: 'Viajes',
    items: [
      { id: 'hoteles', icon: 'bed', label: 'Historial de hoteles', route: '/historial-hoteles' },
      { id: 'transporte', icon: 'directions-car', label: 'Historial de transporte', route: '/historial-transporte' },
    ],
  },
  {
    title: 'Dispositivos',
    items: [
      { id: 'smartwatch', icon: 'watch', label: 'Conectar smartwatch', route: '/smartwatch' },
    ],
  },
  {
    title: 'Seguridad',
    items: [
      { id: 'dosfactor', icon: 'security', label: 'Autenticación de dos pasos', toggle: true },
      { id: 'notif', icon: 'notifications-none', label: 'Notificaciones', route: '/notificaciones', badge: '3' },
      { id: 'mensajes', icon: 'chat-bubble-outline', label: 'Mensaje de vuelo (2001)' },
    ],
  },
  {
    title: '',
    items: [
      { id: 'soporte', icon: 'help-outline', label: 'Centro de ayuda' },
      { id: 'logout', icon: 'logout', label: 'Cerrar sesión', danger: true, route: '/auth/login' },
    ],
  },
];

/* ─── Componente fila menú ───────────────────────── */
function MenuRowItem({
  item,
  onPress,
}: {
  item: MenuRow;
  onPress?: () => void;
}) {
  const [enabled, setEnabled] = useState(false);

  return (
    <TouchableOpacity
      onPress={item.toggle ? undefined : onPress}
      activeOpacity={item.toggle ? 1 : 0.7}
      className="flex-row items-center gap-3 py-3.5 border-b border-gray-50"
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center ${
          item.danger ? 'bg-red-50' : 'bg-gray-100'
        }`}
      >
        <MaterialIcons
          name={item.icon}
          size={20}
          color={item.danger ? '#EF4444' : '#0F1B2D'}
        />
      </View>
      <Text
        className={`flex-1 text-sm font-semibold ${
          item.danger ? 'text-red-500' : 'text-primary'
        }`}
      >
        {item.label}
      </Text>
      {item.badge && (
        <View className="w-5 h-5 rounded-full bg-secondary items-center justify-center">
          <Text className="text-[10px] font-bold text-primary">{item.badge}</Text>
        </View>
      )}
      {item.toggle ? (
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: '#E5E7EB', true: '#F4B400' }}
          thumbColor="#0F1B2D"
        />
      ) : (
        !item.danger && (
          <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
        )
      )}
    </TouchableOpacity>
  );
}

/* ─── Pantalla principal ─────────────────────────── */
export default function Perfil() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <Header variant="logo" title="TraveXperience" onBellPress={() => router.push('/notificaciones')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Avatar + nombre */}
        <View className="items-center pt-8 pb-6 px-5">
          <View className="relative">
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              }}
              className="w-24 h-24 rounded-full"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary items-center justify-center border-2 border-white"
            >
              <MaterialIcons name="edit" size={14} color="#0F1B2D" />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-primary mt-3">
            Julián Thomás
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            Viajero Frecuente • Costa Rica
          </Text>

          {/* Stats */}
          <View className="flex-row gap-8 mt-5">
            {[
              { label: 'Viajes', value: '34' },
              { label: 'Países', value: '18' },
              { label: 'Reseñas', value: '126' },
            ].map((stat) => (
              <View key={stat.label} className="items-center">
                <Text className="text-2xl font-bold text-primary">
                  {stat.value}
                </Text>
                <Text className="text-xs text-gray-500">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Banner descuento especial */}
        <View className="mx-5 mb-5 bg-primary rounded-2xl p-4 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center">
            <MaterialIcons name="local-offer" size={20} color="#0F1B2D" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-bold">
              ¡Descuento especial!
            </Text>
            <Text className="text-white/70 text-xs mt-0.5" numberOfLines={2}>
              Tienes un 15% de descuento en tu próxima reserva. ¡Válido esta semana!
            </Text>
          </View>
          <TouchableOpacity className="bg-secondary px-3 py-1.5 rounded-full">
            <Text className="text-primary text-xs font-bold">Usar</Text>
          </TouchableOpacity>
        </View>

        {/* Menú */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} className="px-5 mb-2">
            {section.title ? (
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                {section.title}
              </Text>
            ) : null}
            {section.items.map((item) => (
              <MenuRowItem
                key={item.id}
                item={item}
                onPress={() => {
                  if (item.route) router.push(item.route as any);
                }}
              />
            ))}
          </View>
        ))}

        {/* Versión */}
        <Text className="text-center text-xs text-gray-300 mt-4">
          TraveXperience v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}