import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Fab from '../../components/Fab';

/* ─── Tipos ─────────────────────────────────────── */
interface Transaction {
  id: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  amount: string;
  positive: boolean;
  status: 'completado' | 'pendiente' | 'cancelado';
}

/* ─── Datos de ejemplo ───────────────────────────── */
const TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    icon: 'flight',
    title: 'Vuelos Iberia',
    subtitle: 'Madrid → París',
    amount: '-€348,00',
    positive: false,
    status: 'completado',
  },
  {
    id: 't2',
    icon: 'bed',
    title: 'Hôtel Plaza Athénée',
    subtitle: 'París, Francia',
    amount: '-€1.240,00',
    positive: false,
    status: 'completado',
  },
  {
    id: 't3',
    icon: 'restaurant',
    title: 'Producción del Bistrot',
    subtitle: 'París, Francia',
    amount: '-€94,50',
    positive: false,
    status: 'completado',
  },
  {
    id: 't4',
    icon: 'account-balance-wallet',
    title: 'Reembolso Hotel',
    subtitle: 'Cancelación Trip #382',
    amount: '+€210,00',
    positive: true,
    status: 'completado',
  },
];

const STATUS_COLOR: Record<string, string> = {
  completado: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  cancelado: 'bg-red-100 text-red-700',
};

/* ─── Componente tarjeta de crédito ─────────────── */
function CreditCard() {
  return (
    <View
      className="mx-5 rounded-3xl overflow-hidden"
      style={{
        height: 190,
        backgroundColor: '#0F1B2D',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      {/* Círculos decorativos */}
      <View
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: '#F4B400',
          opacity: 0.15,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -50,
          left: -20,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: '#F4B400',
          opacity: 0.08,
        }}
      />

      {/* Contenido */}
      <View className="flex-1 p-6 justify-between">
        {/* Top row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-white/60 text-xs font-semibold tracking-widest">
            TARJETA DE DÉBITO
          </Text>
          <View className="flex-row items-center gap-1">
            <View className="w-7 h-7 rounded-full bg-secondary opacity-90" />
            <View
              className="w-7 h-7 rounded-full opacity-70"
              style={{
                backgroundColor: '#FF5F00',
                marginLeft: -10,
              }}
            />
          </View>
        </View>

        {/* Número */}
        <Text
          className="text-white text-xl font-bold tracking-widest"
          style={{ letterSpacing: 4 }}
        >
          •••• •••• •••• 4821
        </Text>

        {/* Bottom row */}
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
              Titular
            </Text>
            <Text className="text-white text-sm font-bold">Julián Thomás</Text>
          </View>
          <View className="items-end">
            <Text className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
              Válida hasta
            </Text>
            <Text className="text-white text-sm font-bold">12/26</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ─── Componente fila de transacción ─────────────── */
function TransactionRow({ item }: { item: Transaction }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-3.5 border-b border-gray-50"
    >
      {/* Ícono */}
      <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center">
        <MaterialIcons name={item.icon} size={20} color="#0F1B2D" />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-bold text-primary" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">{item.subtitle}</Text>
      </View>

      {/* Monto + estado */}
      <View className="items-end gap-1">
        <Text
          className={`text-sm font-bold ${item.positive ? 'text-green-600' : 'text-primary'}`}
        >
          {item.amount}
        </Text>
        <View
          className={`px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status].split(' ')[0]}`}
        >
          <Text
            className={`text-[10px] font-semibold ${STATUS_COLOR[item.status].split(' ')[1]}`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Pantalla principal ─────────────────────────── */
export default function Billetera() {
  const [addModal, setAddModal] = useState(false);

  return (
    <View className="flex-1 bg-white">
      <Header variant="logo" title="TraveXperience" onBellPress={() => {}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Balance total */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Saldo disponible
          </Text>
          <Text className="text-4xl font-bold text-primary mt-1">
            €3.842<Text className="text-2xl text-gray-400">,50</Text>
          </Text>
        </View>

        {/* Tarjeta */}
        <CreditCard />

        {/* Métodos de pago guardados */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-primary">
              Métodos de pago
            </Text>
            <TouchableOpacity
              onPress={() => setAddModal(true)}
              className="flex-row items-center gap-1"
            >
              <MaterialIcons name="add" size={16} color="#F4B400" />
              <Text className="text-xs font-bold text-secondary">Agregar</Text>
            </TouchableOpacity>
          </View>

          {/* Métodos guardados */}
          {[
            { label: 'Tarjeta Mastercard ••4821', icon: 'credit-card' as const, active: true },
            { label: 'PayPal — julian@mail.com', icon: 'account-balance-wallet' as const, active: false },
          ].map((m) => (
            <TouchableOpacity
              key={m.label}
              className={`flex-row items-center gap-3 p-3.5 rounded-2xl mb-2.5 border ${
                m.active
                  ? 'border-secondary bg-secondary/10'
                  : 'border-gray-100 bg-gray-50'
              }`}
              activeOpacity={0.8}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  m.active ? 'bg-secondary' : 'bg-gray-200'
                }`}
              >
                <MaterialIcons
                  name={m.icon}
                  size={20}
                  color={m.active ? '#0F1B2D' : '#6B7280'}
                />
              </View>
              <Text
                className={`flex-1 text-sm font-semibold ${
                  m.active ? 'text-primary' : 'text-gray-500'
                }`}
              >
                {m.label}
              </Text>
              {m.active && (
                <View className="bg-secondary px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-bold text-primary">
                    Principal
                  </Text>
                </View>
              )}
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Transacciones recientes */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-bold text-primary">
              Transacciones recientes
            </Text>
            <TouchableOpacity>
              <Text className="text-xs font-bold text-secondary">Ver todas</Text>
            </TouchableOpacity>
          </View>
          {TRANSACTIONS.map((t) => (
            <TransactionRow key={t.id} item={t} />
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <Fab icon="qr-code-scanner" onPress={() => {}} />

      {/* Modal Agregar Método */}
      <Modal
        visible={addModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setAddModal(false)}
        />
        <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
          <View className="p-6">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />
            <Text className="text-lg font-bold text-primary mb-4">
              Agregar método de pago
            </Text>
            {[
              { icon: 'credit-card' as const, label: 'Tarjeta de crédito / débito' },
              { icon: 'account-balance-wallet' as const, label: 'PayPal' },
              { icon: 'account-balance' as const, label: 'Transferencia bancaria' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => setAddModal(false)}
                className="flex-row items-center gap-3 py-4 border-b border-gray-100"
              >
                <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
                  <MaterialIcons name={opt.icon} size={20} color="#0F1B2D" />
                </View>
                <Text className="text-sm font-semibold text-primary flex-1">
                  {opt.label}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
