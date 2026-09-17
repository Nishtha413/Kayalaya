import { Pressable, StyleSheet } from 'react-native';
import type { IconName } from '../types';
import AppText from './AppText';
import Icon from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { s, v } from '../utils/responsive';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}

export default function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  const { colors } = useTheme();
  const content = (
    <>
      {icon ? <Icon name={icon} size={15} color={selected ? colors.primary : colors.textMuted} /> : null}
      <AppText
        variant="label"
        color={selected ? colors.primary : colors.textMuted}
        style={icon ? { marginLeft: 6 } : undefined}
      >
        {label}
      </AppText>
    </>
  );
  const style = [
    styles.chip,
    {
      backgroundColor: selected ? colors.primarySoft : colors.surfaceAlt,
      borderColor: selected ? colors.primary : 'transparent',
    },
  ];
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={style}>
        {content}
      </Pressable>
    );
  }
  return <Pressable disabled style={style}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(14),
    paddingVertical: v(8),
    borderRadius: s(20),
    borderWidth: 1,
  },
});