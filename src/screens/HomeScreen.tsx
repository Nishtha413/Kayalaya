import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { DAYS, DAY_COUNT } from '../data/program';
import { FONT_ITALIC } from '../theme/fonts';
import AppText from '../components/AppText';
import Icon from '../components/Icon';
import Button from '../components/Button';
import ProgressRing from '../components/ProgressRing';
import Card from '../components/Card';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const DAILY_QUOTES = [
  'Breathe in calm, breathe out stress. Your practice begins with a single breath.',
  'Consistency is not about perfection — it\'s about showing up for yourself.',
  'Listen to your body. It knows the way better than your mind ever will.',
  'Strength grows in the moments when you think you cannot go on.',
  'Balance is not something you find, it is something you create.',
  'Yoga teaches that the pose is not the goal — the feeling is.',
  'You made it to the final day. Let the calm roll off the mat with you.',
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const heroInk = colors.mode === 'dark' ? '#392F45' : colors.ink;
  const heroInkSoft = colors.mode === 'dark' ? 'rgba(57,47,69,0.9)' : colors.inkSoft;
  const navigation = useNavigation<Nav>();
  const {
    user,
    nextDayId,
    completedDayCount,
    averageAccuracy,
    streakDays,
    completedDays,
    isProgramComplete,
  } = useApp();

  const totalSeconds = Object.values(completedDays).reduce((s, d) => s + d.timeSeconds, 0);
  const totalMinutes = Math.max(1, Math.floor(totalSeconds / 60));
  const progressPct = Math.round((completedDayCount / DAY_COUNT) * 100);
  const weekday = new Date().toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();
  const currentDay = DAYS.find((d) => d.id === nextDayId) ?? DAYS[0];
  const quote = DAILY_QUOTES[nextDayId - 1] ?? DAILY_QUOTES[0];

  const openDay = (dayId: number) =>
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Main',
        params: { screen: 'Journey', params: { dayId } },
      }),
    );

  const stats = [
    { label: 'Streak', value: `${streakDays}`, icon: 'fire', bg: colors.sage, fg: colors.sageDeep },
    { label: 'Accuracy', value: `${averageAccuracy}%`, icon: 'target', bg: colors.primarySoft, fg: colors.primary },
    { label: 'Time', value: `${totalMinutes} min`, icon: 'clock-outline', bg: colors.pink, fg: colors.pinkDeep },
  ];

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
        <LinearGradient
          colors={['#FFD6E1', '#D9BFF0', '#A9CB9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.5, 1]}
          style={[
            styles.hero,
            {
              paddingTop: insets.top + 14,
              borderBottomLeftRadius: 28,
              borderBottomRightRadius: 28,
            },
          ]}
        >
          <View style={styles.heroRow}>
            <Image
              source={require('../../assets/images/kayalaya.png')}
              style={styles.brandImg}
              resizeMode="contain"
            />
            <View style={styles.heroRight}>
              <View style={styles.streakChip}>
                <AppText variant="label" color={heroInk} bold>
                  🔥 {streakDays} day streak
                </AppText>
              </View>
              <View style={[styles.avatar, { backgroundColor: colors.card }]}>
                <Icon name="account-circle-outline" size={24} color={colors.muted} />
              </View>
            </View>
          </View>

          <View style={styles.greeting}>
            <AppText variant="overline" color={heroInkSoft}>
              {weekday} · DAY {nextDayId} — {currentDay.theme.toUpperCase()}
            </AppText>
            <AppText variant="heading" color={heroInk} style={styles.headline}>
              {user?.name ? `Good morning, ${user.name.split(' ')[0]}` : 'Good morning'}
            </AppText>
          </View>
        </LinearGradient>

        <View style={[styles.flowCard, { backgroundColor: colors.darkFlowCard }]}>
          <View style={styles.flowTop}>
            <View style={styles.flowInfo}>
              <AppText variant="overline" color={colors.muted}>
                Up next
              </AppText>
              <AppText variant="heading" color="#FFFFFF" style={styles.flowTitle}>
                Day {nextDayId} · {currentDay.theme}
              </AppText>
            </View>
            <View style={styles.weekBadge}>
              <AppText variant="overline" color="#FFFFFF">
                Week 1
              </AppText>
            </View>
          </View>

          <View style={styles.flowMidRow}>
            <ProgressRing
              value={progressPct}
              size={84}
              strokeWidth={9}
              color={colors.primary}
              trackColor="rgba(255,255,255,0.18)"
            >
              <View
                style={[
                  styles.ringDisc,
                  { backgroundColor: 'rgba(255,255,255,0.1)' },
                ]}
              >
                <AppText variant="heading" color="#FFFFFF" bold style={styles.ringPct}>
                  {completedDayCount}/{DAY_COUNT}
                </AppText>
                <AppText variant="overline" color="rgba(255,255,255,0.7)">
                  days
                </AppText>
              </View>
            </ProgressRing>
            <View style={styles.flowStats}>
              <AppText variant="body" color="#FFFFFF" bold>
                {completedDayCount} days completed
              </AppText>
              <AppText variant="caption" color={colors.sageDeep}>
                {averageAccuracy}% average accuracy
              </AppText>
            </View>
          </View>

          <Button
            title={completedDayCount === 0 ? 'Start Day 1' : `Continue Day ${nextDayId}`}
            onPress={() => openDay(nextDayId)}
            style={styles.flowBtn}
          />
        </View>

        <View
          style={[
            styles.quoteCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <AppText variant="overline" color={colors.primary} style={styles.quoteDay}>
            Day {nextDayId} · Daily mantra
          </AppText>
          <AppText variant="body" color={colors.ink} style={styles.quoteText}>
            {quote}
          </AppText>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={[
                styles.statCard,
                { backgroundColor: s.bg },
              ]}
            >
              <View style={[styles.statIcon, { backgroundColor: s.fg }]}>
                <Icon name={s.icon as any} size={13} color="#FFFFFF" />
              </View>
              <AppText
                variant="display"
                color={s.fg}
                style={styles.statValue}
              >
                {s.value}
              </AppText>
              <AppText variant="overline" color={colors.muted} style={styles.statLabel}>
                {s.label}
              </AppText>
            </View>
          ))}
        </View>

        <AppText variant="overline" color={colors.muted} style={styles.sectionLabel}>
          Seven mornings
        </AppText>
        <View style={styles.dayList}>
          {DAYS.map((day) => {
            const done = Boolean(completedDays[day.id]);
            const isCurrent = day.id === nextDayId && !isProgramComplete;
            return (
              <Pressable
                key={day.id}
                onPress={() => openDay(day.id)}
                style={[
                  styles.dayRow,
                  { backgroundColor: colors.card, borderColor: colors.line },
                ]}
              >
                <View
                  style={[
                    styles.dayBadge,
                    {
                      backgroundColor: done
                        ? colors.sage
                        : isCurrent
                          ? colors.primary
                          : 'transparent',
                      borderWidth: !done && !isCurrent ? 1.5 : 0,
                      borderColor: colors.line,
                    },
                  ]}
                >
                  <Icon
                    name={done ? 'check' : isCurrent ? 'play' : 'chevron-right'}
                    size={16}
                    color={done ? colors.ink : isCurrent ? '#FFFFFF' : colors.muted}
                  />
                </View>
                <View style={styles.dayInfo}>
                  <AppText variant="label" color={colors.ink} bold>
                    Day {day.id}
                  </AppText>
                  <AppText variant="caption" color={colors.muted}>
                    {day.theme}
                  </AppText>
                </View>
                {done ? (
                  <View style={[styles.donePill, { backgroundColor: colors.sage }]}>
                    <AppText variant="overline" color={colors.ink} style={styles.donePillText}>
                      Done
                    </AppText>
                  </View>
                ) : isCurrent ? (
                  <View style={[styles.currentPill, { backgroundColor: colors.primarySoft }]}>
                    <AppText variant="overline" color={colors.primary} style={styles.donePillText}>
                      Today
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {isProgramComplete ? (
          <Card style={styles.assessCard}>
            <View style={styles.assessHeader}>
              <Icon name="trophy-outline" size={24} color={colors.warning} />
              <AppText variant="heading" bold>
                Final Assessment
              </AppText>
            </View>
            <AppText variant="body" color={colors.textMuted} style={styles.assessBody}>
              You've completed the 7-day program! Take the assessment to test what you've learned.
            </AppText>
            <Button
              title="Take Assessment"
              onPress={() => navigation.navigate('AssessmentIntro')}
              icon="trophy-variant"
              size="md"
            />
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  hero: {
    paddingBottom: 52,
    paddingHorizontal: 22,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandImg: {
    width: 52,
    height: 48,
  },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakChip: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { marginTop: 18 },
  headline: { fontSize: 26, marginTop: 4 },
  flowCard: {
    marginHorizontal: 22,
    marginTop: -10,
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
  },
  flowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flowInfo: { flex: 1, marginRight: 10 },
  flowTitle: { fontSize: 21, marginTop: 2 },
  weekBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  flowMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  ringDisc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: { fontSize: 16 },
  flowStats: { flex: 1, gap: 3 },
  flowBtn: { marginTop: 16 },
  quoteCard: {
    marginHorizontal: 22,
    marginTop: 18,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 22,
    gap: 8,
  },
  quoteDay: { textAlign: 'center' },
  quoteText: {
    textAlign: 'center',
    fontFamily: FONT_ITALIC,
    fontSize: 18,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 22,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 6,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 22 },
  statLabel: { marginTop: 6 },
  sectionLabel: {
    marginHorizontal: 22,
    marginTop: 26,
    marginBottom: 12,
  },
  dayList: { paddingHorizontal: 22, gap: 10 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dayBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInfo: { flex: 1, gap: 1 },
  donePill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  currentPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  donePillText: { fontSize: 10, lineHeight: 12 },
  assessCard: { marginHorizontal: 22, marginTop: 24 },
  assessHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assessBody: { marginTop: 4, marginBottom: 14 },
});