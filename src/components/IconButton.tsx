import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import type { IconName } from '../types';
import Icon from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { s } from '../utils/responsive';

interface IconButtonProps {
  name: IconName;
  onPress: () => void;
  size?: number;
  borderRadius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function IconButton({
  name,
  onPress,
  size = 36,
  borderRadius,
  color,
  style,
  disabled,
}: IconButtonProps) {
  const { colors } = useTheme();
  const dim = s(size);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        width: dim,
        height: dim,
        borderRadius: borderRadius ?? dim / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceAlt,
        opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        style,
      })}
    >
      <Icon name={name} size={dim * 0.55} color={color ?? colors.text} />
    </Pressable>
  );
}