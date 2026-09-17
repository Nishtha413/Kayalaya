import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { dayById, posesForDay } from '../data/program';
import AppText from '../components/AppText';
import Icon from '../components/Icon';
import Button from '../components/Button';
import PoseCard from '../components/PoseCard';
import ProgressBar from '../components/ProgressBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<MainTabParamList, 'Journey'>;

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { nextDayId, completedDays, poseProgress } = useApp();

  const dayId = route.params?.dayId ?? nextDayId;
  const day = dayById(dayId);
  const poses = posesForDay(dayId);
  const result = completedDays[dayId];
  const done = Boolean(result);
  const progressCount = done ? poses.length : Math.min(poses.length, poseProgress[dayId] ?? 0);
  const progressValue = Math.round((progressCount / poses.length) * 100);
  const totalSeconds = poses.reduce((s, p) => s + p.duration, 0);
  const minutes = Math.round(totalSeconds / 60);

  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bgPage }]}
      edges={['left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.sage,
              paddingTop: insets.top + 14,
              borderBottomLeftRadius: 28,
              borderBottomRightRadius: 28,
            },
          ]}
        >
          <View style={styles.headerTopRow}>
            {canGoBack ? (
              <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
                <AppText variant="label" color={colors.textMuted} style={styles.backText}>
                  ← Back
                </AppText>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <View style={styles.metaCard}>
              {[
                { v: `${poses.length}`, l: 'poses' },
                { v: `~${minutes}`, l: 'min' },
              ].map((m) => (
                <View key={m.l} style={styles.metaItem}>
                  <AppText variant="heading" color="#4F2F75" style={styles.metaValue}>
                    {m.v}
                  </AppText>
                  <AppText variant="overline" color="#4F2F75">
                    {m.l}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          <AppText variant="heading" color={colors.ink} style={styles.title}>
            Day {day.id}
          </AppText>
        </View>

        <View
          style={[
            styles.progressCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={styles.progressRow}>
            <AppText variant="overline" color={colors.muted}>
              Progress
            </AppText>
            <AppText variant="overline" color={colors.textMuted}>
              {progressCount}/{poses.length} poses
            </AppText>
          </View>
          <ProgressBar
            value={progressValue}
            height={6}
            color={colors.sageDeep}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.poseList}>
          {dayId === 7 ? (
            <View
              style={[
                styles.assessBanner,
                { backgroundColor: colors.primarySoft, borderColor: colors.primary },
              ]}
            >
              <Icon name="trophy-outline" size={22} color={colors.warning} />
              <View style={styles.assessBannerText}>
                <AppText variant="label" bold>
                  Final Assessment
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  2 min per pose · detected = 1/8, missed = 0/8 · no demo
                </AppText>
              </View>
            </View>
          ) : null}
          {poses.map((pose, idx) => (
            <PoseCard
              key={pose.id}
              pose={pose}
              index={idx}
              status={done || progressCount > idx ? 'done' : pose.rest ? 'rest' : 'play'}
              onPress={() => navigation.navigate('PosePractice', { dayId, poseIndex: idx })}
            />
          ))}
        </View>

        <View style={styles.resumeWrap}>
          <Button
            title={done ? 'Practice Again' : dayId === 7 ? 'Start Final Assessment' : 'Resume Practice'}
            onPress={() => navigation.navigate('PosePractice', { dayId, poseIndex: 0 })}
            icon="play-circle-outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: {
    paddingBottom: 26,
    paddingHorizontal: 22,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  metaCard: {
    flexDirection: 'row',
    backgroundColor: '#F5D2D9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 18,
  },
  metaItem: { alignItems: 'center', gap: 1 },
  metaValue: { fontSize: 18 },
  title: { fontSize: 26, marginTop: 16 },
  progressCard: {
    marginHorizontal: 22,
    marginTop: -18,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: { height: 6 },
  poseList: { paddingHorizontal: 22, marginTop: 12 },
  assessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  assessBannerText: { flex: 1, gap: 3 },
  resumeWrap: { paddingHorizontal: 22, marginTop: 18 },
});