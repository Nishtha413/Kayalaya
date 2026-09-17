import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { f } from '../utils/responsive';
import {
  FONT_HEADING,
  FONT_BODY,
  FONT_BODY_BOLD,
  FONT_BODY_HEAVY,
} from '../theme/fonts';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'overline';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  bold?: boolean;
  center?: boolean;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: { fontSize: f(30), lineHeight: f(38), fontWeight: '600', fontFamily: FONT_HEADING },
  title: { fontSize: f(24), lineHeight: f(32), fontWeight: '600', fontFamily: FONT_HEADING },
  heading: { fontSize: f(19), lineHeight: f(26), fontWeight: '600', fontFamily: FONT_HEADING },
  body: { fontSize: f(16), lineHeight: f(24), fontWeight: '400', fontFamily: FONT_BODY },
  label: { fontSize: f(14), lineHeight: f(20), fontWeight: '700', fontFamily: FONT_BODY_BOLD },
  caption: { fontSize: f(13), lineHeight: f(18), fontWeight: '400', fontFamily: FONT_BODY },
  overline: {
    fontSize: f(11),
    lineHeight: f(14),
    fontWeight: '800',
    fontFamily: FONT_BODY_HEAVY,
    textTransform: 'uppercase',
  },
};

const overlineExtra: TextStyle = { letterSpacing: 0.5 };

export default function AppText({
  variant = 'body',
  color,
  bold,
  center,
  style,
  children,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        variantStyles[variant],
        { color: color ?? colors.text },
        variant === 'overline' && overlineExtra,
        bold && styles.bold,
        center && styles.center,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: '700' },
  center: { textAlign: 'center' },
});