import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ProgressBar({
  value,
  color,
  height = 8,
  trackColor,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height, backgroundColor: trackColor ?? colors.surfaceVariant },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            borderRadius: height,
            backgroundColor: color ?? colors.primary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});