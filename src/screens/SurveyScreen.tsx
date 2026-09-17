import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, SurveyAnswers } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import AppText from '../components/AppText';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import Button from '../components/Button';
import Chip from '../components/Chip';
import ProgressBar from '../components/ProgressBar';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Survey'>;
type Route = RouteProp<RootStackParamList, 'Survey'>;

const TOTAL_STEPS = 3;

const GENDER_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say'];
const EXPERIENCE_OPTIONS = ['Complete Beginner', 'Some Experience', 'Returning After a Break'];
const GOAL_OPTIONS = ['Flexibility', 'Strength', 'Relaxation', 'General Fitness', 'Balance', 'Stress Relief'];
const MINUTES_OPTIONS = ['10–15', '15–30', '30–45', '45–60'];

export default function SurveyScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { completeSurvey } = useApp();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState<SurveyAnswers>(
    route.params?.survey ?? {
      age: '',
      gender: '',
      heightCm: '',
      weightKg: '',
      experience: '',
      goals: [],
      dailyMinutes: '',
    },
  );

  const update = (patch: Partial<SurveyAnswers>) => setAnswers((prev) => ({ ...prev, ...patch }));

  const toggleGoal = (g: string) =>
    update({ goals: answers.goals.includes(g) ? answers.goals.filter((x) => x !== g) : [...answers.goals, g] });

  const next = async () => {
    setError(null);
    if (step === 0) {
      if (!answers.age.trim() || !answers.gender || !answers.heightCm.trim() || !answers.weightKg.trim()) {
        setError('Please fill in all personal details.');
        return;
      }
    }
    if (step === 1) {
      if (!answers.experience || answers.goals.length === 0 || !answers.dailyMinutes) {
        setError('Please complete all fields.');
        return;
      }
    }
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      await completeSurvey(answers);
      setLoading(false);
      if (route.params?.survey) {
        navigation.goBack();
      } else {
        navigation.replace('Main');
      }
    }
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigation.goBack();
  };

  return (
    <Screen scroll title={step === TOTAL_STEPS - 1 ? 'Almost Done' : 'About You'} right={null}>
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <ProgressBar
            key={i}
            value={i <= step ? 100 : 0}
            height={4}
            color={i <= step ? colors.primary : colors.surfaceVariant}
          />
        ))}
      </View>
      <AppText variant="caption" color={colors.textFaint} style={styles.stepLabel}>
        STEP {step + 1} OF {TOTAL_STEPS}
      </AppText>

      {step === 0 && (
        <View style={styles.stepView}>
          <AppText variant="heading">Personal Information</AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.hint}>
            Help us personalise your yoga program.
          </AppText>
          <TextField label="Age" placeholder="e.g. 28" keyboardType="numeric" value={answers.age} onChangeText={(t) => update({ age: t })} />
          <AppText variant="caption" color={colors.textMuted} style={styles.fieldLabel}>Gender</AppText>
          <View style={styles.chipRow}>
            {GENDER_OPTIONS.map((g) => (
              <Chip key={g} label={g} selected={answers.gender === g} onPress={() => update({ gender: g })} />
            ))}
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <TextField label="Height (cm)" placeholder="170" keyboardType="numeric" value={answers.heightCm} onChangeText={(t) => update({ heightCm: t })} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextField label="Weight (kg)" placeholder="65" keyboardType="numeric" value={answers.weightKg} onChangeText={(t) => update({ weightKg: t })} />
            </View>
          </View>
        </View>
      )}

      {step === 1 && (
        <View style={styles.stepView}>
          <AppText variant="heading">Experience & Goals</AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.hint}>
            Where are you in your yoga journey?
          </AppText>
          <AppText variant="caption" color={colors.textMuted} style={styles.fieldLabel}>Yoga Experience</AppText>
          <View style={styles.chipRow}>
            {EXPERIENCE_OPTIONS.map((e) => (
              <Chip key={e} label={e} selected={answers.experience === e} onPress={() => update({ experience: e })} />
            ))}
          </View>
          <AppText variant="caption" color={colors.textMuted} style={styles.fieldLabel}>Goals</AppText>
          <View style={styles.chipRow}>
            {GOAL_OPTIONS.map((g) => (
              <Chip key={g} label={g} selected={answers.goals.includes(g)} onPress={() => toggleGoal(g)} />
            ))}
          </View>
          <AppText variant="caption" color={colors.textMuted} style={styles.fieldLabel}>Preferred Session Length</AppText>
          <View style={styles.chipRow}>
            {MINUTES_OPTIONS.map((m) => (
              <Chip key={m} label={`${m} min`} selected={answers.dailyMinutes === m} onPress={() => update({ dailyMinutes: m })} />
            ))}
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepView}>
          <AppText variant="heading">Your Setup</AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.hint}>
            You're almost ready to start Day 1!
          </AppText>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              ['Name', route.params?.name ?? 'You'],
              ['Age', answers.age],
              ['Height', `${answers.heightCm} cm`],
              ['Weight', `${answers.weightKg} kg`],
              ['Experience', answers.experience],
              ['Goals', answers.goals.join(', ')],
              ['Daily Time', `${answers.dailyMinutes} min`],
            ].map(([label, value]) => (
              <View key={label} style={styles.summaryRow}>
                <AppText variant="caption" color={colors.textMuted}>{label}</AppText>
                <AppText variant="label">{value}</AppText>
              </View>
            ))}
          </View>
        </View>
      )}

      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>{error}</AppText>
      ) : null}

      <Button title={step === TOTAL_STEPS - 1 ? 'Start My Journey' : 'Continue'} onPress={next} loading={loading} />

      {step > 0 ? (
        <Button title="Back" variant="ghost" onPress={back} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  stepLabel: { textAlign: 'center', marginBottom: 24 },
  stepView: { gap: 4 },
  hint: { marginBottom: 18 },
  fieldLabel: { marginTop: 8, marginBottom: 4, marginLeft: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  row: { flexDirection: 'row' },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  error: { textAlign: 'center', marginBottom: 8 },
});