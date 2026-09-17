import { MaterialCommunityIcons } from 'expo-vector-icons';
import type { IconName } from '../types';
import { useTheme } from '../theme/ThemeProvider';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 22, color }: IconProps) {
  const { colors } = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? colors.text} />;
}