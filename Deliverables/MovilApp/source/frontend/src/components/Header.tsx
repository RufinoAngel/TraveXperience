import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

type HeaderVariant = 'logo' | 'menu' | 'back' | 'close';

interface HeaderProps {
  variant?: HeaderVariant;
  title?: string;
  onLeftPress?: () => void;
  onBellPress?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
  showBell?: boolean;
}

/**
 * Header reutilizable para todas las pantallas.
 *
 * Variantes:
 * - "logo"  → pin + "TraveXperience" a la izquierda, campana a la derecha (Descubrir)
 * - "menu"  → ☰ a la izquierda, título centrado, campana a la derecha
 * - "back"  → ← a la izquierda, título centrado, ícono opcional a la derecha
 * - "close" → ✕ a la izquierda, título centrado
 */
export default function Header({
  variant = 'logo',
  title = 'TraveXperience',
  onLeftPress,
  onBellPress,
  rightIcon,
  onRightPress,
  showBell = true,
}: HeaderProps) {
  // --- Variante "logo": pin + texto a la izquierda, campana a la derecha ---
  if (variant === 'logo') {
    return (
      <SafeAreaView edges={['top']} className="bg-secondary">
        <View className="h-14 px-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="location-on" size={20} color="#0F1B2D" />
            <Text className="text-lg font-bold text-primary">{title}</Text>
          </View>
          {showBell && (
            <TouchableOpacity onPress={onBellPress} hitSlop={10}>
              <MaterialIcons name="notifications-none" size={24} color="#0F1B2D" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --- Variantes "menu" / "back" / "close": ícono izq. + título centrado + slot derecho ---
  const LEFT_ICON: Record<Exclude<HeaderVariant, 'logo'>, IconName> = {
    menu: 'menu',
    back: 'arrow-back',
    close: 'close',
  };

  return (
    <SafeAreaView edges={['top']} className="bg-secondary">
      <View className="h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={onLeftPress} hitSlop={10} className="w-10">
          <MaterialIcons name={LEFT_ICON[variant]} size={variant === 'menu' ? 26 : 24} color="#0F1B2D" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-base font-bold text-primary" numberOfLines={1}>
          {title}
        </Text>

        <View className="w-10 items-end">
          {variant === 'menu' && showBell && (
            <TouchableOpacity onPress={onBellPress} hitSlop={10}>
              <MaterialIcons name="notifications-none" size={24} color="#0F1B2D" />
            </TouchableOpacity>
          )}
          {variant === 'back' && rightIcon && (
            <TouchableOpacity onPress={onRightPress} hitSlop={10}>
              <MaterialIcons name={rightIcon} size={22} color="#0F1B2D" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}