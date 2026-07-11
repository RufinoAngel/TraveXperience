import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);

  const handleLogin = () => {
    // Si aceptó términos, ir al Home (tabs)
    if (accepted) {
      router.replace('/tabs');
    } else {
      alert('Debes aceptar los Términos y Condiciones.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        }}
        className="flex-1 justify-between"
      >
        {/* Capa oscura superior opcional para contraste */}
        <View className="absolute inset-0 bg-black/20" />

        <View className="pt-16 px-6">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="location-on" size={24} color="#F4B400" />
            <Text className="text-white text-xl font-bold tracking-widest">
              TraveXperience
            </Text>
          </View>
        </View>

        {/* Panel inferior blanco */}
        <View className="bg-white rounded-t-[36px] px-8 pt-10 pb-12 shadow-2xl">
          <Text className="text-3xl font-extrabold text-primary mb-2">
            Comienza tu aventura
          </Text>
          <Text className="text-sm text-gray-500 mb-8 leading-relaxed">
            Regístrate para explorar los Alpes Suizos y más allá.
          </Text>

          {/* Formulario */}
          <View className="gap-5">
            <View>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                Correo electrónico
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="viajero@ejemplo.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-primary font-semibold"
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                Contraseña
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-primary font-semibold"
              />
            </View>

            {/* Checkbox */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAccepted(!accepted)}
              className="flex-row items-center gap-3 mt-2 pr-4"
            >
              <View
                className={`w-6 h-6 rounded-md items-center justify-center border ${
                  accepted
                    ? 'bg-primary border-primary'
                    : 'bg-transparent border-gray-300'
                }`}
              >
                {accepted && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
              </View>
              <Text className="flex-1 text-xs text-gray-500 leading-relaxed">
                Acepto los Términos y Condiciones y la Política de Privacidad
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            className="bg-primary rounded-2xl py-4 mt-8 items-center shadow-lg"
          >
            <Text className="text-white font-bold text-base">Iniciar sesión</Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center gap-1 mt-6">
            <Text className="text-sm text-gray-500">¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text className="text-sm font-bold text-secondary">Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
