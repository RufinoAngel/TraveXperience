import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Tipos ──────────────────────────────────────── */
type FlowState = 'list' | 'connecting' | 'celebration' | 'home';

interface FoundDevice {
  id: string;
  name: string;
  signal: string;
  featured?: boolean;
}

const DEVICES: FoundDevice[] = [
  { id: 'd1', name: 'TraveXperience Watch Pro', signal: 'Señal Excelente', featured: true },
  { id: 'd2', name: 'Galaxy Watch 5', signal: 'Vincular anterior' },
];

/* ─── Header oscuro reutilizable ─────────────────── */
function DarkHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
      <TouchableOpacity onPress={onBack} hitSlop={10}>
        <MaterialIcons name="arrow-back" size={24} color="#F4B400" />
      </TouchableOpacity>
      <Text className="text-secondary text-sm font-bold tracking-[3px] uppercase">
        {title}
      </Text>
      <TouchableOpacity hitSlop={10}>
        <MaterialIcons name="settings" size={22} color="#F4B400" />
      </TouchableOpacity>
    </View>
  );
}

/* ─── Pantalla 1: Buscar dispositivos ────────────── */
function ListScreen({ onConnect }: { onConnect: () => void }) {
  return (
    <View className="flex-1">
      <DarkHeader title="Conectar" onBack={() => {}} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Ilustración radar */}
        <View className="items-center mt-8 mb-4">
          <View className="flex-row items-center gap-6">
            <View className="w-20 h-28 rounded-3xl border-2 border-white/10 bg-white/5 items-center justify-center">
              <MaterialIcons name="smartphone" size={30} color="#F4B400" />
            </View>
            <MaterialIcons name="bolt" size={22} color="#F4B400" />
            <View className="w-20 h-20 rounded-full border-2 border-secondary items-center justify-center">
              <MaterialIcons name="watch" size={30} color="#F4B400" />
            </View>
          </View>
          <Text className="text-white/50 text-xs font-bold tracking-[2px] uppercase mt-6">
            Buscando dispositivos...
          </Text>
        </View>

        {/* Badges de estado */}
        <View className="flex-row gap-3 px-5 mt-4">
          <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3.5 flex-row items-center gap-2.5">
            <MaterialIcons name="bluetooth" size={18} color="#F4B400" />
            <View>
              <Text className="text-white/40 text-[10px] uppercase tracking-wide">Bluetooth</Text>
              <Text className="text-white text-sm font-bold">Activado</Text>
            </View>
          </View>
          <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3.5 flex-row items-center gap-2.5">
            <MaterialIcons name="sync" size={18} color="#F4B400" />
            <View>
              <Text className="text-white/40 text-[10px] uppercase tracking-wide">Sincronización</Text>
              <Text className="text-white text-sm font-bold">Lista</Text>
            </View>
          </View>
        </View>

        {/* Lista de dispositivos */}
        <View className="px-5 mt-7">
          <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
            Dispositivos cercanos
          </Text>

          {DEVICES.map((d) =>
            d.featured ? (
              <TouchableOpacity
                key={d.id}
                onPress={onConnect}
                activeOpacity={0.85}
                className="flex-row items-center gap-3 bg-secondary/10 border-2 border-secondary rounded-2xl p-4 mb-3"
              >
                <View className="w-11 h-11 rounded-xl bg-secondary items-center justify-center">
                  <MaterialIcons name="watch" size={20} color="#0F1B2D" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{d.name}</Text>
                  <Text className="text-secondary text-xs font-semibold mt-0.5">{d.signal}</Text>
                </View>
                <View className="bg-secondary px-3.5 py-2 rounded-xl">
                  <Text className="text-primary text-xs font-bold">CONECTAR</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View
                key={d.id}
                className="flex-row items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 mb-3"
              >
                <View className="w-11 h-11 rounded-xl bg-white/10 items-center justify-center">
                  <MaterialIcons name="watch" size={20} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-white/60 text-sm font-semibold">{d.name}</Text>
                  <Text className="text-white/30 text-xs mt-0.5">{d.signal}</Text>
                </View>
              </View>
            )
          )}
        </View>

        {/* Sincronizar datos */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-2 border-2 border-white/15 rounded-2xl py-3.5"
          >
            <MaterialIcons name="sync" size={16} color="#F4B400" />
            <Text className="text-secondary text-xs font-bold tracking-wide uppercase">
              Sincronizar datos ahora
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* ─── Pantalla 2: Conectando ─────────────────────── */
function ConnectingScreen({ onCancel }: { onCancel: () => void }) {
  return (
    <View className="flex-1">
      <DarkHeader title="Connect" onBack={onCancel} />
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-72 h-72 rounded-full border-4 border-secondary/25 items-center justify-center">
          <View className="w-72 h-72 rounded-full border-4 border-secondary items-center justify-center absolute" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
          <View className="w-28 h-28 rounded-full border-2 border-secondary items-center justify-center mb-5">
            <MaterialIcons name="smartphone" size={44} color="#F4B400" />
          </View>
          <Text className="text-white text-lg font-bold text-center">Buscando teléfono...</Text>
          <Text className="text-white/40 text-sm mt-1">TraveXperience App</Text>
        </View>

        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.85}
          className="border-2 border-white/15 rounded-2xl px-8 py-3.5 mt-10 flex-row items-center gap-2"
        >
          <MaterialIcons name="close" size={16} color="#9CA3AF" />
          <Text className="text-white/60 text-xs font-bold uppercase tracking-wide">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Pantalla 3: Celebración de conexión ────────── */
function CelebrationScreen({ onDone }: { onDone: () => void }) {
  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-72 h-72 rounded-full border-4 border-secondary items-center justify-center">
          <Text className="text-white/30 text-[10px] font-bold tracking-[3px] uppercase absolute" style={{ top: 30 }}>
            TraveXperience
          </Text>
          <View className="w-28 h-28 rounded-full bg-secondary/20 border-2 border-secondary items-center justify-center mb-4">
            <MaterialIcons name="check" size={48} color="#F4B400" />
          </View>
          <Text className="text-white text-2xl font-extrabold">¡Conectado!</Text>
          <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mt-1">
            Sincronización completa
          </Text>

          <TouchableOpacity
            onPress={onDone}
            activeOpacity={0.85}
            className="bg-secondary rounded-2xl px-10 py-3 mt-6"
          >
            <Text className="text-primary text-sm font-bold">Listo</Text>
          </TouchableOpacity>

          <Text className="text-white/20 text-[10px] font-semibold tracking-widest uppercase absolute" style={{ bottom: 26 }}>
            BLE v5.3
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Pantalla 4: Resumen / Home conectado ───────── */
function ConnectedHomeScreen({
  onGoHome,
  onDisconnect,
}: {
  onGoHome: () => void;
  onDisconnect: () => void;
}) {
  return (
    <View className="flex-1">
      <DarkHeader title="Connect" onBack={onGoHome} />

      <View className="flex-1 items-center justify-center px-8">
        <View className="w-24 h-24 rounded-full bg-secondary items-center justify-center mb-6">
          <MaterialIcons name="check" size={44} color="#0F1B2D" />
        </View>

        {/* Mini barra de estado teléfono ... reloj */}
        <View className="flex-row items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 mb-6">
          <MaterialIcons name="smartphone" size={20} color="#9CA3AF" />
          <MaterialIcons name="more-horiz" size={18} color="#4B5563" />
          <View className="w-9 h-9 rounded-full border-2 border-secondary items-center justify-center">
            <MaterialIcons name="watch" size={16} color="#F4B400" />
          </View>
        </View>

        <Text className="text-white text-2xl font-extrabold text-center">
          Smartwatch Conectado
        </Text>
        <Text className="text-white/50 text-sm text-center mt-2 leading-relaxed">
          Tu <Text className="text-secondary font-bold">TraveXperience Watch Pro</Text> está listo para el viaje.
        </Text>

        <TouchableOpacity
          onPress={onGoHome}
          activeOpacity={0.85}
          className="bg-secondary rounded-2xl py-4 w-full items-center mt-8"
        >
          <Text className="text-primary font-bold text-sm">Ir al Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          className="border-2 border-white/15 rounded-2xl py-4 w-full items-center mt-3"
        >
          <Text className="text-white font-bold text-sm">Configurar Notificaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDisconnect} className="mt-5">
          <Text className="text-red-400 text-xs font-bold uppercase tracking-wide">
            Desvincular dispositivo
          </Text>
        </TouchableOpacity>

        <Text className="text-white/20 text-[10px] font-semibold tracking-widest uppercase mt-6">
          Sincronizado vía Bluetooth 5.2
        </Text>
      </View>
    </View>
  );
}

/* ─── Pantalla principal (máquina de estados) ────── */
export default function Smartwatch() {
  const router = useRouter();
  const [flow, setFlow] = useState<FlowState>('list');

  useEffect(() => {
    if (flow === 'connecting') {
      const timer = setTimeout(() => setFlow('celebration'), 2200);
      return () => clearTimeout(timer);
    }
  }, [flow]);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-primary">
      {flow === 'list' && (
        <ListScreen onConnect={() => setFlow('connecting')} />
      )}

      {flow === 'connecting' && <ConnectingScreen onCancel={() => setFlow('list')} />}

      {flow === 'celebration' && (
        <CelebrationScreen onDone={() => setFlow('home')} />
      )}

      {flow === 'home' && (
        <ConnectedHomeScreen
          onGoHome={() => router.push('/tabs')}
          onDisconnect={() => setFlow('list')}
        />
      )}
    </SafeAreaView>
  );
}