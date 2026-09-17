import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, CommonActions, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { dayById, posesForDay } from '../data/program';
import AppText from '../components/AppText';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'DayComplete'>;

export default function DayCompletionScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { dayId } = route.params;
  const { completedDays, completeDay, isProgramComplete } = useApp();
  const recorded = useRef(false);
  const day = dayById(dayId);
  const poses = posesForDay(dayId);
  const result = completedDays[dayId];
  const accuracy = result?.accuracy ?? 85;
  const time = result?.timeSeconds ?? poses.length * 120;
  const mins = Math.floor(time / 60);
  const secs = time % 60;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!recorded.current && !completedDays[dayId]) {
      recorded.current = true;
      completeDay(dayId, Math.round(78 + Math.random() * 16), poses.length * 100);
    }
  }, [completedDays, completeDay, dayId, poses.length]);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [scale]);

  const goHome = () => {
    navigation.navigate('Main');
  };

  const goNext = () => {
    if (dayId < 7) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Main',
          params: { screen: 'Journey', params: { dayId: dayId + 1 } },
        }),
      );
    } else if (isProgramComplete) {
      navigation.navigate('AssessmentIntro');
    } else {
      navigation.navigate('Main');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <Icon name="trophy-outline" size={56} color={colors.primary} />
        <AppText variant="title" bold center style={styles.title}>
          Day {dayId} Complete!
        </AppText>
        <AppText variant="body" color={colors.textMuted} center>
          You've finished all {poses.length} poses for {day.title}!
        </AppText>

        <View style={[styles.statsCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <View style={styles.statRow}>
            <ProgressRing value={accuracy} size={100} strokeWidth={10}>
              <AppText variant="title" bold>{accuracy}%</AppText>
              <AppText variant="caption" color={colors.textMuted}>Accuracy</AppText>
            </ProgressRing>
          </View>
          <View style={styles.metaRow}>
            <MetaItem icon="timer" label="Duration" value={`${mins}m ${secs}s`} colors={colors} />
            <MetaItem icon="check-circle" label="Poses" value={`${poses.length}/${poses.length}`} colors={colors} />
            <MetaItem icon="chart-donut-variant" label="Avg" value={`${accuracy}%`} colors={colors} />
          </View>
        </View>

        {isProgramComplete && dayId === 7 ? (
          <View style={[styles.assessBanner, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
            <AppText variant="label" bold color={colors.primary}>
              You've completed the full 7-day program!
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              You're now ready for the final assessment.
            </AppText>
          </View>
        ) : null}
      </Animated.View>

      <View style={styles.buttons}>
        {dayId < 7 ? (
          <Button
            title={`Start Day ${dayId + 1}`}
            onPress={goNext}
            icon="skip-next"
          />
        ) : isProgramComplete ? (
          <Button
            title="Begin Assessment"
            onPress={() => navigation.navigate('AssessmentIntro')}
            icon="trophy-variant"
          />
        ) : (
          <Button title="Finish" onPress={goNext} icon="check-circle" />
        )}
        <Button title="Back to Home" variant="ghost" onPress={goHome} />
      </View>
    </View>
  );
}

function MetaItem({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={metaStyles.item}>
      <Icon name={icon as any} size={18} color={colors.primary} />
      <AppText variant="label" bold>{value}</AppText>
      <AppText variant="caption" color={colors.textMuted}>{label}</AppText>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  item: { alignItems: 'center', flex: 1, gap: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 22 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { marginTop: 12 },
  statsCard: { width: '100%', borderRadius: 22, borderWidth: 1, padding: 22, marginTop: 28 },
  statRow: { alignItems: 'center', marginBottom: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-around' },
  assessBanner: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 24,
    gap: 4,
  },
  buttons: { gap: 8, paddingBottom: 16 },
});