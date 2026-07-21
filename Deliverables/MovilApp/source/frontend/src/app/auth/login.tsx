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

interface FormErrors {
  email?: string;
  password?: string;
  terms?: string;
}

/* ─── Validadores (autocontenidos, no requieren utils externos) ─── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

function isValidPassword(value: string): boolean {
  return value.length >= 6;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Ingresa un correo válido (ej. nombre@dominio.com).';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!accepted) {
      newErrors.terms = 'Debes aceptar los Términos y Condiciones.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validate()) {
      router.replace('/tabs');
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
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="viajero@ejemplo.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                className={`bg-gray-50 border rounded-2xl px-5 py-4 text-primary font-semibold ${
                  errors.email ? 'border-red-400' : 'border-gray-100'
                }`}
              />
              {errors.email ? (
                <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                Contraseña
              </Text>
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                className={`bg-gray-50 border rounded-2xl px-5 py-4 text-primary font-semibold ${
                  errors.password ? 'border-red-400' : 'border-gray-100'
                }`}
              />
              {errors.password ? (
                <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">
                  {errors.password}
                </Text>
              ) : null}
            </View>

            {/* Checkbox */}
            <View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setAccepted(!accepted);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                }}
                className="flex-row items-center gap-3 mt-2 pr-4"
              >
                <View
                  className={`w-6 h-6 rounded-md items-center justify-center border ${
                    accepted
                      ? 'bg-primary border-primary'
                      : errors.terms
                      ? 'bg-transparent border-red-400'
                      : 'bg-transparent border-gray-300'
                  }`}
                >
                  {accepted && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                </View>
                <Text className="flex-1 text-xs text-gray-500 leading-relaxed">
                  Acepto los Términos y Condiciones y la Política de Privacidad
                </Text>
              </TouchableOpacity>
              {errors.terms ? (
                <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">
                  {errors.terms}
                </Text>
              ) : null}
            </View>
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