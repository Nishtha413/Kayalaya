import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { poseById } from '../data/program';
import AppText from '../components/AppText';
import Screen from '../components/Screen';
import ProgressRing from '../components/ProgressRing';
import Icon from '../components/Icon';
import Button from '../components/Button';
import Card from '../components/Card';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AssessmentResult'>;

export default function AssessmentResultScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { result } = route.params;
  const { completeAssessment } = useApp();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    completeAssessment(result);
  }, [completeAssessment, result]);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [scale]);

  const praise =
    result.score >= 80
      ? 'Outstanding! You really mastered the beginner program.'
      : result.score >= 60
        ? 'Great work! A little more practice and you will shine.'
        : 'Keep going! Consistency is the secret to growth.';

  return (
    <Screen title="Assessment Result">
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center', gap: 8, paddingTop: 16 }}>
        <Icon name="trophy-variant" size={56} color={colors.warning} />
        <AppText variant="title" bold center>Assessment Complete</AppText>
        <AppText variant="body" color={colors.textMuted} center>{praise}</AppText>
      </Animated.View>

      <View style={[styles.scoreCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <ProgressRing value={result.score} size={120} strokeWidth={12}>
          <AppText variant="display" bold>{result.score}%</AppText>
        </ProgressRing>
        <View style={styles.scoreMeta}>
          <MetaRow icon="check-circle" label="Correct Poses" value={`${result.correctCount}/${result.totalPoses}`} color={colors.success} colors={colors} />
          <MetaRow icon="star" label="Marks" value={`${result.marks}/${result.totalPoses}`} color={colors.warning} colors={colors} />
          <MetaRow icon="timer" label="Date" value={new Date(result.date).toLocaleDateString()} color={colors.textMuted} colors={colors} />
        </View>
      </View>

      <AppText variant="heading" style={styles.section}>Pose Results</AppText>
      {result.perPose.map((p) => {
        const pose = poseById(p.poseId);
        return (
          <View key={p.poseId} style={[styles.poseRow, { borderBottomColor: colors.border }]}>
            <Icon name={pose.icon} size={22} color={colors.textMuted} />
            <View style={{ flex: 1 }}>
              <AppText variant="label">{pose.name}</AppText>
              <AppText variant="caption" color={colors.textFaint}>{pose.sanskrit}</AppText>
            </View>
            <View style={[styles.resultBadge, { backgroundColor: p.correct ? colors.successSoft : colors.dangerSoft }]}>
              <Icon name={p.correct ? 'check' : 'close'} size={14} color={p.correct ? colors.success : colors.danger} />
              <AppText variant="caption" color={p.correct ? colors.success : colors.danger}>
                {p.correct ? 'Correct' : 'Practice more'}
              </AppText>
            </View>
          </View>
        );
      })}

      <Card variant="accent" style={styles.feedbackCard}>
        <AppText variant="label" bold>Strengths</AppText>
        <View style={styles.tagsRow}>
          {result.strengths.map((s) => (
            <Tag key={s} label={s} color={colors.success} colors={colors} />
          ))}
        </View>
        <AppText variant="label" bold style={styles.feedbackTitle}>Focus Areas</AppText>
        <View style={styles.tagsRow}>
          {result.improvements.map((s) => (
            <Tag key={s} label={s} color={colors.warning} colors={colors} />
          ))}
        </View>
        <AppText variant="body" color={colors.textMuted} style={styles.motivation}>
          Every practice makes you stronger. Show up tomorrow and try again!
        </AppText>
      </Card>

      <Button
        title="Back to Home"
        onPress={() => navigation.navigate('Main')}
        icon="check-circle"
      />
    </Screen>
  );
}

function MetaRow({
  icon,
  label,
  value,
  color,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.metaRow}>
      <Icon name={icon as any} size={18} color={color} />
      <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>{label}</AppText>
      <AppText variant="label" bold color={color}>{value}</AppText>
    </View>
  );
}

function Tag({
  label,
  color,
  colors,
}: {
  label: string;
  color: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[styles.tag, { backgroundColor: colors.surface, borderColor: color }]}>
      <AppText variant="caption" color={color}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: 22, borderWidth: 1, padding: 20, marginTop: 24 },
  scoreMeta: { flex: 1, gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  section: { marginTop: 24, marginBottom: 10 },
  poseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  feedbackCard: { marginTop: 20, gap: 6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 10 },
  tag: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  feedbackTitle: { marginTop: 10 },
  motivation: { marginTop: 12 },
});