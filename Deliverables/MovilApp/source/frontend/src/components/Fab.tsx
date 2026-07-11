import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface FabProps {
  icon?: IconName;
  onPress?: () => void;
  bottom?: number;
  right?: number;
}

/**
 * Botón flotante amarillo, reutilizado en casi todas las pantallas.
 */
export default function Fab({ icon = 'add', onPress, bottom = 24, right = 20 }: FabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ position: 'absolute', bottom, right }}
      className="w-14 h-14 rounded-full bg-secondary items-center justify-center shadow-lg"
    >
      <MaterialIcons name={icon} size={24} color="#0F1B2D" />
    </TouchableOpacity>
  );
}