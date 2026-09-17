import { StyleSheet, View } from 'react-native';
import type { Pose } from '../types';
import Card from './Card';
import AppText from './AppText';
import Icon from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { s, v } from '../utils/responsive';

type PoseStatus = 'done' | 'rest' | 'play';

interface PoseCardProps {
  pose: Pose;
  index: number;
  onPress?: () => void;
  completed?: boolean;
  status?: PoseStatus;
}

export default function PoseCard({ pose, index, onPress, completed = false, status }: PoseCardProps) {
  const { colors } = useTheme();

  const tileBg =
    status === 'done'
      ? colors.sage
      : status === 'rest'
        ? colors.pink
        : status === 'play'
          ? colors.purple
          : colors.primarySoft;

  const tileIcon = status === 'done' ? colors.ink : status === 'rest' || status === 'play' ? '#FFFFFF' : colors.primary;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={[styles.tile, { backgroundColor: tileBg }]}>
        <Icon name={pose.icon} size={s(30)} color={tileIcon} />
      </View>
      <View style={styles.info}>
        <AppText variant="caption" color={colors.textFaint}>
          Pose {String(index + 1).padStart(2, '0')}
        </AppText>
        <AppText variant="body" bold style={styles.name}>
          {pose.name}
        </AppText>
        {status ? (
          <AppText variant="caption" color={colors.textMuted}>
            {pose.sanskrit}
          </AppText>
        ) : (
          <AppText variant="caption" color={colors.textMuted}>
            {pose.difficulty}
          </AppText>
        )}
      </View>

      {status === 'done' ? (
        <View style={[styles.pill, { backgroundColor: colors.sage }]}>
          <AppText variant="overline" color={colors.ink}>
            Done
          </AppText>
        </View>
      ) : status === 'rest' ? (
        <View style={[styles.pill, { backgroundColor: colors.purple }]}>
          <AppText variant="overline" color="#FFFFFF">
            Rest
          </AppText>
        </View>
      ) : status === 'play' ? (
        <View style={styles.play}>
          <Icon name="play" size={22} color="#FFFFFF" />
        </View>
      ) : (
        <View style={styles.chevron}>
          {completed ? (
            <View style={[styles.pill, { backgroundColor: colors.successSoft }]}>
              <Icon name="check" size={13} color={colors.success} />
              <AppText variant="caption" color={colors.success}>
                Done
              </AppText>
            </View>
          ) : (
            <Icon name="chevron-right" size={24} color={colors.textFaint} />
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: v(14),
    marginBottom: v(12),
  },
  tile: {
    width: s(56),
    height: s(56),
    borderRadius: s(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(14),
  },
  info: { flex: 1 },
  name: { marginTop: 1, marginBottom: 4 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: s(12),
    paddingVertical: v(6),
    borderRadius: 999,
  },
  play: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: '#211E29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});