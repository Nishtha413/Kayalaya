import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { IconName } from '../types';
import AppText from './AppText';
import Icon from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { s, v } from '../utils/responsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'flow';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  const isFlow = variant === 'flow';
  const isDanger = variant === 'danger';

  const background =
    variant === 'secondary' || variant === 'ghost'
      ? 'transparent'
      : variant === 'danger'
        ? colors.danger
        : variant === 'soft'
          ? colors.primarySoft
          : variant === 'flow'
            ? colors.sage
            : 'transparent';

  const borderColor =
    variant === 'secondary' || variant === 'ghost' ? colors.border : 'transparent';
  const borderWidth = variant === 'secondary' || variant === 'ghost' ? 1.5 : 0;

  const textColor = isFlow
    ? colors.mode === 'light'
      ? '#233420'
      : colors.text
    : isPrimary
      ? colors.textOnPrimary
      : isDanger
        ? colors.textOnPrimary
        : colors.text;

  const dims = size === 'sm' ? v(40) : size === 'lg' ? v(52) : v(46);

  const content = (
    <View style={styles.content}>
      {icon ? <Icon name={icon} size={s(18)} color={textColor} /> : null}
      <AppText
        variant="label"
        bold
        color={textColor}
        style={icon ? { marginLeft: 8, fontWeight: '700' } : { fontWeight: '700' }}
      >
        {title}
      </AppText>
    </View>
  );

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          {
            height: dims,
            borderRadius: s(16),
            borderWidth: 0,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
            overflow: 'hidden',
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          content
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          height: dims,
          borderRadius: s(16),
          backgroundColor: background,
          borderWidth,
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(18),
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});