import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0F1B2D]">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
        }}
        className="flex-1"
        imageStyle={{ opacity: 0.8 }}
      >
        {/* Capa de gradiente oscuro para asegurar legibilidad del texto */}
        <View className="flex-1 bg-black/40 justify-between px-6 pb-12 pt-20">
          
          {/* Logo Superior */}
          <View className="items-center mt-8">
            <View className="w-16 h-16 rounded-3xl bg-white/20 items-center justify-center mb-4 backdrop-blur-md border border-white/30">
              <MaterialIcons name="flight-takeoff" size={36} color="#F4B400" />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-widest text-center">
              TraveXperience
            </Text>
            <Text className="text-gray-300 mt-2 font-medium tracking-wider text-center">
              PREMIUM TRAVEL APP
            </Text>
          </View>

          {/* Textos y Botones Inferiores */}
          <View className="w-full">
            <Text className="text-white text-5xl font-bold mb-4 leading-tight shadow-sm">
              Descubre el mundo a tu manera.
            </Text>
            <Text className="text-gray-200 text-base mb-10 leading-relaxed font-medium shadow-sm">
              Planifica, reserva y gestiona tus viajes soñados con itinerarios inteligentes y sugerencias personalizadas.
            </Text>

            <View className="gap-4">
              {/* Botón Principal - Register */}
              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                activeOpacity={0.85}
                className="bg-[#F4B400] w-full py-4 rounded-2xl items-center shadow-lg flex-row justify-center gap-2"
              >
                <Text className="text-[#0F1B2D] font-bold text-lg">
                  Empezar aventura
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#0F1B2D" />
              </TouchableOpacity>

              {/* Botón Secundario - Login */}
              <TouchableOpacity
                onPress={() => router.push('/auth/login')}
                activeOpacity={0.8}
                className="w-full py-4 rounded-2xl items-center border-2 border-white/80 bg-white/10 backdrop-blur-sm"
              >
                <Text className="text-white font-bold text-lg">
                  Ya tengo cuenta
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ImageBackground>
    </View>
  );
}
