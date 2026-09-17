import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { s } from '../utils/responsive';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'accent';
}

export default function Card({ children, style, onPress, variant = 'default' }: CardProps) {
  const { colors } = useTheme();
  const background = variant === 'accent' ? colors.surfaceAlt : colors.surface;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: background, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <BaseCard background={background} borderColor={colors.border} style={style}>
      {children}
    </BaseCard>
  );
}

function BaseCard({
  children,
  background,
  borderColor,
  style,
}: {
  children: React.ReactNode;
  background: string;
  borderColor: string;
  style: StyleProp<ViewStyle> | undefined;
}) {
  return (
    <Pressable
      disabled
      style={[styles.card, { backgroundColor: background, borderColor }, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: s(22),
    padding: s(18),
    borderWidth: 1,
  },
});