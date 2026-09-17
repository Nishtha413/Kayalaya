import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import AppText from '../components/AppText';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, mode, toggle } = useTheme();
  const headerInk = colors.mode === 'dark' ? '#5B3A93' : colors.ink;
  const headerMuted = colors.mode === 'dark' ? '#5A4D6C' : colors.muted;
  const navigation = useNavigation<Nav>();
  const {
    user,
    completedDays,
    totalSessions,
    averageAccuracy,
    totalPracticeSeconds,
    streakDays,
    nextDayId,
    signOut,
    updateProfile,
    resetProgress,
  } = useApp();
  const totalMinutes = Math.floor(totalPracticeSeconds / 60);
  const survey = user?.survey;
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? '');

  const handleLogout = async () => {
    await signOut();
    navigation.navigate('Auth', { mode: 'login' });
  };

  const goEditDetails = () =>
    navigation.navigate('Survey', { name: user?.name, survey: survey ?? undefined });

  const startNameEdit = () => {
    setNameDraft(user?.name ?? '');
    setEditingName(true);
  };

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) {
      updateProfile({ name: trimmed });
    }
    setEditingName(false);
  };

  const detailRows: [string, string][] = survey
    ? [
        ['Age', survey.age],
        ['Gender', survey.gender],
        ['Height', survey.heightCm ? `${survey.heightCm} cm` : '—'],
        ['Weight', survey.weightKg ? `${survey.weightKg} kg` : '—'],
        ['Experience', survey.experience || '—'],
        ['Goals', survey.goals.length ? survey.goals.join(', ') : '—'],
        ['Daily time', survey.dailyMinutes ? `${survey.dailyMinutes} min` : '—'],
      ]
    : [];

  const settingsRows: { label: string; value: string; onPress?: () => void }[] = [
    { label: 'Appearance', value: mode === 'dark' ? 'Dark' : 'Light', onPress: toggle },
    { label: 'Notifications', value: 'On' },
    { label: 'Reset progress', value: 'Day 1', onPress: () => {
        Alert.alert('Reset progress?', 'This will remove all completed days.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: () => void resetProgress() },
        ]);
      } },
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
            styles.header,
            {
              paddingTop: insets.top + 18,
              borderBottomLeftRadius: 28,
              borderBottomRightRadius: 28,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.card }]}>
            <Icon name="account-circle-outline" size={52} color={headerMuted} />
          </View>
          <AppText variant="heading" color={headerInk} style={styles.name}>
            {user?.name ?? 'Yogi'}
          </AppText>
          <AppText variant="caption" color={headerMuted}>
            {user?.email}
          </AppText>
          <View style={styles.levelPill}>
            <AppText variant="label" color={headerInk} bold>
              Beginner Yogi
            </AppText>
          </View>
        </LinearGradient>

        <View
          style={[
            styles.accuracyCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <ProgressRing
            value={averageAccuracy}
            size={140}
            strokeWidth={12}
            color={colors.primary}
            trackColor={colors.line}
          >
            <View style={[styles.accuracyDisc, { backgroundColor: colors.primary }]}>
              <AppText variant="display" bold style={styles.accuracyValue}>
                {averageAccuracy}%
              </AppText>
            </View>
          </ProgressRing>
          <AppText variant="caption" color={colors.textMuted} style={styles.accuracyLabel}>
            Average accuracy
          </AppText>
          <AppText variant="caption" color={colors.sageDeep} bold>
            ↑ {Math.max(0, averageAccuracy - 80)}% from last week
          </AppText>
        </View>

        <View style={styles.statsRow}>
          {[
            { l: 'Streak', v: `${streakDays}`, icon: 'fire', bg: colors.sage, fg: colors.sageDeep },
            { l: 'Sessions', v: `${totalSessions}`, icon: 'meditation', bg: colors.primarySoft, fg: colors.primary },
            { l: 'Time', v: `${totalMinutes} min`, icon: 'clock-outline', bg: colors.pink, fg: colors.pinkDeep },
          ].map((s) => (
            <View
              key={s.l}
              style={[styles.statCard, { backgroundColor: s.bg }]}
            >
              <View style={[styles.statIcon, { backgroundColor: s.fg }]}>
                <Icon name={s.icon as any} size={13} color="#FFFFFF" />
              </View>
              <AppText variant="display" color={s.fg} style={styles.statValue}>
                {s.v}
              </AppText>
              <AppText variant="overline" color={colors.muted} style={styles.statLabel}>
                {s.l}
              </AppText>
            </View>
          ))}
        </View>

        <AppText variant="overline" color={colors.muted} style={styles.sectionLabel}>
          Personal details
        </AppText>
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <Pressable
            onPress={goEditDetails}
            style={[
              styles.detailHeader,
              { borderBottomColor: colors.line },
              !survey && styles.lastRow,
            ]}
          >
            <AppText variant="label" color={colors.ink} bold>
              About you
            </AppText>
            <View style={styles.detailEdit}>
              <AppText variant="label" color={colors.primary}>
                {survey ? 'Edit' : 'Complete'}
              </AppText>
              <Icon name="pencil-outline" size={16} color={colors.primary} />
            </View>
          </Pressable>

          <View style={[styles.detailRow, { borderBottomColor: colors.line }]}>
            <AppText variant="caption" color={colors.textMuted}>
              Nickname
            </AppText>
            {editingName ? (
              <View style={styles.nickEdit}>
                <TextInput
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  style={[
                    styles.nickInput,
                    { backgroundColor: colors.surfaceVariant, color: colors.text },
                  ]}
                  placeholder="Nickname"
                  placeholderTextColor={colors.textFaint}
                  autoFocus
                  maxLength={30}
                  onSubmitEditing={saveName}
                />
                <Pressable onPress={saveName} hitSlop={8}>
                  <AppText variant="label" color={colors.primary} bold>
                    Save
                  </AppText>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.nickValue} onPress={startNameEdit} hitSlop={8}>
                <AppText variant="label" style={styles.detailValue}>
                  {user?.name ?? '—'}
                </AppText>
                <Icon name="pencil-outline" size={15} color={colors.primary} />
              </Pressable>
            )}
          </View>

          {survey ? (
            detailRows.map(([label, value], i, arr) => (
              <View
                key={label}
                style={[
                  styles.detailRow,
                  { borderBottomColor: colors.line },
                  i === arr.length - 1 && styles.lastRow,
                ]}
              >
                <AppText variant="caption" color={colors.textMuted}>
                  {label}
                </AppText>
                <AppText variant="label" style={styles.detailValue}>
                  {value}
                </AppText>
              </View>
            ))
          ) : (
            <View style={styles.detailEmpty}>
              <AppText variant="caption" color={colors.textMuted}>
                Tell us about yourself to personalise your program.
              </AppText>
            </View>
          )}
        </View>

        <AppText variant="overline" color={colors.muted} style={styles.sectionLabel}>
          Day-by-day
        </AppText>
        <View style={styles.dayTrack}>
          {Array.from({ length: nextDayId }, (_, i) => i + 1).map((id) => (
            <View
              key={id}
              style={[
                styles.daySegment,
                {
                  backgroundColor:
                    [colors.sage, colors.purple, colors.pink][(id - 1) % 3],
                },
              ]}
            >
              <AppText variant="caption" color={colors.ink} bold style={styles.dayNumber}>
                {id}
              </AppText>
            </View>
          ))}
        </View>

        <AppText variant="overline" color={colors.muted} style={styles.sectionLabel}>
          Settings
        </AppText>
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          {settingsRows.map((row, i) => (
            <Pressable
              key={row.label}
              onPress={row.onPress}
              style={[
                styles.settingRow,
                { borderBottomColor: colors.line },
                i === settingsRows.length - 1 && styles.lastRow,
              ]}
            >
              <AppText variant="label">{row.label}</AppText>
              <View style={styles.settingValue}>
                <AppText variant="label" color={colors.textMuted}>
                  {row.value}
                </AppText>
                <Icon name="chevron-right" size={20} color={colors.textFaint} />
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logout} onPress={handleLogout} hitSlop={12}>
          <AppText variant="label" color={colors.pinkDeep} bold>
            Log out
          </AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 48 },
  header: {
    paddingBottom: 64,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 22, marginTop: 10 },
  levelPill: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  accuracyCard: {
    marginHorizontal: 22,
    marginTop: -34,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  accuracyDisc: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyValue: { fontSize: 34, color: '#FFFFFF' },
  accuracyLabel: { marginTop: 6, marginBottom: 3 },
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
    paddingHorizontal: 4,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 24 },
  statLabel: { marginTop: 6 },
  sectionLabel: {
    marginHorizontal: 22,
    marginTop: 26,
    marginBottom: 12,
  },
  dayTrack: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
  },
  daySegment: {
    flex: 1,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: { fontSize: 12 },
  settingsCard: {
    marginHorizontal: 22,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lastRow: { borderBottomWidth: 0 },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  detailEdit: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  detailValue: { flexShrink: 1, textAlign: 'right' },
  nickEdit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nickInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 140,
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
  nickValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailEmpty: { paddingVertical: 20, paddingHorizontal: 16 },
  logout: { marginTop: 30, alignItems: 'center' },
});