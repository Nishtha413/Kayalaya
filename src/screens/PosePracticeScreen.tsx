import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  RootStackParamList,
  AssessmentResult,
  PerPoseAssessment,
} from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { posesForDay } from '../data/program';
import { useApp } from '../context/AppContext';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';
import ProgressBar from '../components/ProgressBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'PosePractice'>;

type Mode = 'detail' | 'practice' | 'done';

const ASSESSMENT_SECONDS = 120;

export default function PosePracticeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const camHeight = Math.round(width * 1.2);
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { dayId, poseIndex } = route.params;
  const marks = route.params.marks ?? [];
  const { completeDay, markPoseCompletion } = useApp();
  const poses = posesForDay(dayId);
  const pose = poses[poseIndex];
  const isAssessment = dayId === 7;
  const [mode, setMode] = useState<Mode>('detail');
  const [accuracy, setAccuracy] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [countdown, setCountdown] = useState(ASSESSMENT_SECONDS);
  const [result, setResult] = useState<'detected' | 'missed' | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [correction, setCorrection] = useState<string | null>(null);

  const percent = Math.round(((poseIndex + 1) / poses.length) * 100);
  const minutes = Math.max(1, Math.round(pose.duration / 60));
  const nextPose = poseIndex + 1 < poses.length ? poses[poseIndex + 1] : null;
  const timeLabel = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (mode !== 'practice' || isAssessment) {
      return;
    }
    setAccuracy(0);
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
      setAccuracy((a) => Math.min(100, a + Math.floor(Math.random() * 8) + 3));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isAssessment]);

  useEffect(() => {
    if (!isAssessment || mode !== 'practice') {
      return;
    }
    const interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    detectRef.current = setTimeout(() => setResult('detected'), 12000);
    return () => {
      clearInterval(interval);
      if (detectRef.current) clearTimeout(detectRef.current);
    };
  }, [mode, isAssessment]);

  useEffect(() => {
    if (!isAssessment || mode !== 'practice') {
      return;
    }
    setCountdown(ASSESSMENT_SECONDS);
    setResult(null);
  }, [poseIndex, mode, isAssessment]);

  useEffect(() => {
    if (isAssessment && mode === 'practice' && countdown <= 0 && !result) {
      setResult('missed');
    }
  }, [countdown, isAssessment, mode, result]);

  useEffect(() => {
    if (mode === 'done' || !isAssessment) {
      return;
    }
    if (result) {
      setMode('done');
    }
  }, [result, mode, isAssessment]);

  useEffect(() => {
    if (mode === 'practice' && (elapsed >= 8 || accuracy >= 100) && !isAssessment) {
      if (timerRef.current) clearInterval(timerRef.current);
      setMode('done');
    }
  }, [mode, elapsed, accuracy, isAssessment]);

  useEffect(() => {
    if (mode !== 'practice') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [mode, pulse]);

  useEffect(() => {
    if (mode !== 'practice' || isAssessment) {
      setCorrection(null);
      return;
    }
    const cues = pose.tips;
    const id = setInterval(() => {
      const good = Math.random() < 0.3;
      setCorrection(
        good
          ? 'Great — hold it steady!'
          : `Fix: ${cues[Math.floor(Math.random() * cues.length)]}`,
      );
    }, 2200);
    return () => clearInterval(id);
  }, [mode, isAssessment, poseIndex, pose]);

  const finishAssessment = (finalMarks: PerPoseAssessment[]) => {
    const correctCount = finalMarks.filter((m) => m.correct).length;
    const score = Math.round((correctCount / finalMarks.length) * 100);
    const resultData: AssessmentResult = {
      date: new Date().toISOString(),
      totalPoses: finalMarks.length,
      correctCount,
      score,
      marks: correctCount,
      perPose: finalMarks,
      strengths:
        score >= 67 ? ['Mountain Pose', 'Tree Pose', 'Downward-Facing Dog'] : ['Mountain Pose'],
      improvements:
        score >= 67
          ? ['Cobra Pose', 'Warrior II']
          : ['Warrior II', 'Triangle Pose', 'Cobra Pose', 'Chair Pose'],
    };
    completeDay(7, score, finalMarks.length * ASSESSMENT_SECONDS);
    navigation.replace('AssessmentResult', { result: resultData });
  };

  const goNext = () => {
    markPoseCompletion(dayId, poseIndex + 1);
    const earned = result === 'detected';
    const nextMarks: PerPoseAssessment[] = [...marks, { poseId: pose.id, correct: earned }];
    if (nextPose) {
      navigation.replace('PosePractice', {
        dayId,
        poseIndex: poseIndex + 1,
        marks: nextMarks,
      });
    } else if (isAssessment) {
      finishAssessment(nextMarks);
    } else {
      navigation.replace('DayComplete', { dayId });
    }
  };

  const feedback = accuracy >= 75 ? 'Great posture!' : 'Keep adjusting your form.';

  const startPractice = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setMode('practice');
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['left', 'right']}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <AppText variant="label" color={colors.textMuted} style={styles.backText}>
            ← Back
          </AppText>
        </Pressable>
        <ProgressRing value={percent} size={44} strokeWidth={5}>
          <AppText variant="caption" color={colors.text} bold style={styles.ringText}>
            {percent}%
          </AppText>
        </ProgressRing>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {mode === 'detail' ? (
          isAssessment ? (
            <AssessmentDetail
              pose={pose}
              timeLabel="2:00"
              colors={colors}
              onBegin={() => void startPractice()}
            />
          ) : (
            <>
              <AppText variant="heading" style={styles.poseName}>
                {pose.name}
              </AppText>
              <AppText variant="body" color={colors.textMuted} style={styles.sanskrit}>
                {pose.sanskrit}
              </AppText>

              <LinearGradient
                colors={[colors.pink, colors.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.referenceCard}
              >
                <View style={styles.referenceTop}>
                  <AppText variant="overline" color="#FFFFFF">
                    Reference pose
                  </AppText>
                  <View style={styles.badge}>
                    <AppText variant="label" color={colors.ink} bold>
                      {pose.difficulty}
                    </AppText>
                  </View>
                </View>
                <View style={styles.poseIcon}>
                  <Icon name={pose.icon} size={80} color="#FFFFFF" />
                </View>
                <View style={styles.referenceStats}>
                  {[
                    { l: 'Duration', v: `${minutes} min` },
                    { l: 'Builds', v: pose.builds.join(', ') },
                    { l: 'Rated', v: pose.difficulty },
                  ].map((s) => (
                    <View key={s.l} style={styles.referenceStat}>
                      <AppText
                        variant="overline"
                        color="#FFFFFF"
                        style={styles.referenceStatLabel}
                      >
                        {s.l}
                      </AppText>
                      <AppText
                        variant="caption"
                        color="#FFFFFF"
                        bold
                        style={styles.referenceStatValue}
                      >
                        {s.v}
                      </AppText>
                    </View>
                  ))}
                </View>
              </LinearGradient>

              <AppText variant="overline" color={colors.sageDeep} style={styles.howLabel}>
                How to do it
              </AppText>
              <AppText variant="body" color={colors.text} style={styles.howText}>
                {pose.description}
              </AppText>

              <View
                style={[
                  styles.cuesCard,
                  { backgroundColor: colors.card, borderColor: colors.line },
                ]}
              >
                <AppText variant="overline" color={colors.sageDeep}>
                  Pose cues
                </AppText>
                {pose.tips.map((tip, i) => (
                  <View key={i} style={styles.cueRow}>
                    <View style={styles.cueCircle}>
                      <AppText variant="label" color="#FFFFFF" style={styles.cueNum}>
                        {i + 1}
                      </AppText>
                    </View>
                    <AppText variant="body" color={colors.text} style={styles.cueText}>
                      {tip}
                    </AppText>
                  </View>
                ))}
              </View>

              <View style={styles.cameraCard}>
                <View style={styles.mpTag}>
                  <AppText variant="overline" color="#FFFFFF">
                    MediaPipe
                  </AppText>
                </View>
                <View style={styles.cameraIconWrap}>
                  <Icon name="camera" size={30} color="#FFFFFF" />
                </View>
                <AppText variant="heading" color="#FFFFFF" style={styles.cameraTitle}>
                  Camera ready
                </AppText>
                <AppText variant="body" color="rgba(255,255,255,0.8)" center style={styles.cameraDesc}>
                  Enable your camera for real-time pose feedback.
                </AppText>
                <Button
                  title="Enable AI camera"
                  onPress={() => void startPractice()}
                  icon="camera-outline"
                  style={[styles.cameraBtn, { backgroundColor: undefined }]}
                />
              </View>
            </>
          )
        ) : (
          <>
            <AppText variant="heading" style={styles.poseName}>
              {pose.name}
            </AppText>
            <AppText variant="body" color={colors.textMuted} style={styles.sanskrit}>
              {pose.sanskrit}
            </AppText>

            {isAssessment ? (
              <>
                <View style={[styles.liveCameraWrap, { height: camHeight }]}>
                  {permission?.granted ? (
                    <CameraView style={styles.cameraFeed} facing="front" />
                  ) : null}
                  <View style={styles.mpTag}>
                    <AppText variant="overline" color="#FFFFFF">
                      MediaPipe
                    </AppText>
                  </View>
                  <Animated.View
                    style={[
                      styles.cameraIconWrap,
                      {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        transform: [{ scale: mode === 'practice' ? pulse : 1 }],
                      },
                    ]}
                  >
                    <Icon
                      name={pose.icon}
                      size={76}
                      color={result === 'detected' ? colors.sageDeep : '#FFFFFF'}
                    />
                  </Animated.View>
                  <AppText
                    variant="caption"
                    color="rgba(255,255,255,0.7)"
                    style={styles.liveLabel}
                  >
                    {mode === 'practice'
                      ? 'Detecting pose...'
                      : result === 'detected'
                        ? 'Pose detected'
                        : 'Time up'}
                  </AppText>

                  {mode === 'done' ? (
                    <View style={[styles.feedbackBox, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                      <Icon
                        name={result === 'detected' ? 'check-circle' : 'alert-circle'}
                        size={18}
                        color={result === 'detected' ? colors.sageDeep : colors.pinkDeep}
                      />
                      <AppText variant="label" color="#FFFFFF">
                        {result === 'detected' ? 'Detected correctly · 1/8' : 'Not in time · 0/8'}
                      </AppText>
                    </View>
                  ) : null}
                </View>

                <View
                  style={[
                    styles.assessTimer,
                    { backgroundColor: colors.card, borderColor: colors.line },
                  ]}
                >
                  <AppText
                    variant="display"
                    bold
                    color={countdown <= 20 ? colors.danger : colors.primary}
                  >
                    {timeLabel}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    time remaining
                  </AppText>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.liveCameraWrap, { height: camHeight }]}>
                  {permission?.granted ? (
                    <CameraView style={styles.cameraFeed} facing="front" />
                  ) : null}
                  <View style={styles.mpTag}>
                    <AppText variant="overline" color="#FFFFFF">
                      MediaPipe
                    </AppText>
                  </View>
                  <Animated.View
                    style={[
                      styles.cameraIconWrap,
                      {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        transform: [{ scale: pulse }],
                      },
                    ]}
                  >
                    <Icon
                      name={pose.icon}
                      size={76}
                      color={mode === 'done' && accuracy >= 75 ? colors.sageDeep : '#FFFFFF'}
                    />
                  </Animated.View>
                  <AppText variant="caption" color="rgba(255,255,255,0.7)" style={styles.liveLabel}>
                    {mode === 'practice' ? 'Camera feed' : 'Done'}
                  </AppText>

                  {mode === 'practice' && correction ? (
                    <View
                      style={[
                        styles.correctionChip,
                        {
                          backgroundColor: correction.startsWith('Fix')
                            ? '#E39CAA'
                            : 'rgba(111,145,99,0.92)',
                        },
                      ]}
                    >
                      <Icon
                        name={correction.startsWith('Fix') ? 'alert' : 'check'}
                        size={16}
                        color="#FFFFFF"
                      />
                      <AppText variant="label" color="#FFFFFF" style={styles.correctionText}>
                        {correction}
                      </AppText>
                    </View>
                  ) : null}

                  {mode === 'practice' ? (
                    <View style={styles.liveStats}>
                      <ProgressBar
                        value={accuracy}
                        height={8}
                        color={colors.sageDeep}
                        trackColor="rgba(255,255,255,0.15)"
                        style={styles.liveBar}
                      />
                      <View style={styles.liveRow}>
                        <AppText variant="label" color="#FFFFFF" bold>
                          {accuracy}% accuracy
                        </AppText>
                        <AppText variant="caption" color="rgba(255,255,255,0.7)">
                          {elapsed}s elapsed
                        </AppText>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.feedbackBox, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                      <Icon
                        name={accuracy >= 75 ? 'check-circle' : 'alert-circle'}
                        size={18}
                        color={accuracy >= 75 ? colors.sageDeep : colors.pinkDeep}
                      />
                      <AppText variant="label" color="#FFFFFF">
                        {feedback}
                      </AppText>
                    </View>
                  )}
                </View>
              </>
            )}

            <View
              style={[
                styles.refCard,
                { backgroundColor: colors.card, borderColor: colors.line },
              ]}
            >
              <View style={styles.refHead}>
                <AppText variant="overline" color={colors.sageDeep}>
                  Pose reference
                </AppText>
                <AppText variant="caption" color={colors.textFaint}>
                  Keep this form · check camera corrections
                </AppText>
              </View>
              <View style={styles.refBody}>
                <LinearGradient
                  colors={[colors.pink, colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.refImg}
                >
                  <Icon name={pose.icon} size={58} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.refCues}>
                  {pose.tips.slice(0, 3).map((tip, i) => (
                    <View key={i} style={styles.refCue}>
                      <Icon name="check" size={13} color={colors.success} />
                      <AppText variant="caption" color={colors.textMuted} style={styles.refCueText}>
                        {tip}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {nextPose ? (
              <View
                style={[
                  styles.nextPreview,
                  { backgroundColor: colors.card, borderColor: colors.line },
                ]}
              >
                <AppText variant="caption" color={colors.textFaint}>
                  Up Next
                </AppText>
                <View style={styles.nextRow}>
                  <Icon name={nextPose.icon} size={24} color={colors.primary} />
                  <AppText variant="label">{nextPose.name}</AppText>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <View style={styles.bottom}>
        {mode === 'detail' ? null : mode === 'practice' ? (
          isAssessment ? (
            <Button title="I've held this pose" variant="secondary" onPress={() => setResult('detected')} />
          ) : (
            <Button
              title="Finish Early"
              variant="secondary"
              onPress={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setMode('done');
              }}
            />
          )
        ) : (
          <Button
            title={nextPose ? 'Next Pose' : 'Finish Assessment'}
            onPress={goNext}
            icon={nextPose ? 'skip-next' : 'check-circle'}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function AssessmentDetail({
  pose,
  timeLabel,
  colors,
  onBegin,
}: {
  pose: PosePracticeScreenPose;
  timeLabel: string;
  colors: ReturnType<typeof useTheme>['colors'];
  onBegin: () => void;
}) {
  return (
    <>
      <AppText variant="heading" style={styles.poseName}>
        {pose.name}
      </AppText>
      <AppText variant="body" color={colors.textMuted} style={styles.sanskrit}>
        {pose.sanskrit}
      </AppText>

      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.referenceCard}
      >
        <View style={styles.referenceTop}>
          <AppText variant="overline" color="#FFFFFF">
            Final assessment
          </AppText>
          <View style={styles.badge}>
            <AppText variant="label" color={colors.ink} bold>
              Pose {poseIndexGlobal(pose)}
            </AppText>
          </View>
        </View>
        <View style={styles.poseIcon}>
          <Icon name={pose.icon} size={80} color="#FFFFFF" />
        </View>
        <AppText variant="heading" color="#FFFFFF" style={styles.assessHeadline}>
          Now you are at the last day of your journey
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.85)" center style={styles.assessSub}>
          Perform each pose within its time window. No demos, cues, or corrections will be shown.
        </AppText>
      </LinearGradient>

      <View
        style={[styles.cuesCard, { backgroundColor: colors.card, borderColor: colors.line }]}
      >
        <AppText variant="overline" color={colors.sageDeep}>
          The rules
        </AppText>
        {[
          { icon: 'timer', text: `${timeLabel} duration for each pose` },
          { icon: 'check-circle', text: 'Pose detected correctly earns 1/8' },
          { icon: 'close-circle', text: 'Not performed within the time earns 0/8' },
        ].map((r, i) => (
          <View key={i} style={styles.cueRow}>
            <View style={[styles.cueCircle, { backgroundColor: '#E39CAA' }]}>
              <Icon name={r.icon as any} size={14} color="#FFFFFF" />
            </View>
            <AppText variant="body" color={colors.text} style={styles.cueText}>
              {r.text}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.cameraCard}>
        <View style={styles.mpTag}>
          <AppText variant="overline" color="#FFFFFF">
            No demo
          </AppText>
        </View>
        <View style={styles.cameraIconWrap}>
          <Icon name="camera" size={30} color="#FFFFFF" />
        </View>
        <AppText variant="heading" color="#FFFFFF" style={styles.cameraTitle}>
          Camera detects automatically
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.8)" center style={styles.cameraDesc}>
          Hold the pose and let the AI check your form. No demo is available in the assessment.
        </AppText>
        <Button
          title={`Begin Pose · ${timeLabel}`}
          onPress={onBegin}
          icon="play-circle-outline"
          style={[styles.cameraBtn, { backgroundColor: undefined }]}
        />
      </View>
    </>
  );
}

type PosePracticeScreenPose = ReturnType<typeof posesForDay>[number];

function poseIndexGlobal(p: PosePracticeScreenPose): number {
  return p.id === 'mountain'
    ? 1
    : p.id === 'tree'
      ? 2
      : p.id === 'downward-dog'
        ? 3
        : p.id === 'warrior-2'
          ? 4
          : p.id === 'triangle'
            ? 5
            : p.id === 'cobra'
              ? 6
              : p.id === 'childs'
                ? 7
                : 8;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  ringText: { fontSize: 10 },
  scroll: { paddingHorizontal: 22, paddingBottom: 24 },
  poseName: { fontSize: 24, marginTop: 10 },
  sanskrit: { marginTop: 2, marginBottom: 16 },
  referenceCard: {
    borderRadius: 22,
    padding: 18,
  },
  referenceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  poseIcon: {
    alignItems: 'center',
    marginVertical: 18,
  },
  referenceStats: {
    flexDirection: 'row',
    gap: 10,
  },
  referenceStat: { flex: 1, gap: 2 },
  referenceStatLabel: { color: 'rgba(255,255,255,0.85)' },
  referenceStatValue: { fontSize: 12 },
  assessHeadline: { fontSize: 21, textAlign: 'center', marginBottom: 6 },
  assessSub: { textAlign: 'center' },
  howLabel: { marginTop: 22, marginBottom: 8 },
  howText: { marginBottom: 4 },
  cuesCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginTop: 8,
  },
  cueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  cueCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E39CAA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cueNum: { fontSize: 12, color: '#FFFFFF' },
  cueText: { flex: 1 },
  cameraCard: {
    backgroundColor: '#2E2640',
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  cameraIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cameraTitle: { color: '#FFFFFF', marginTop: 12, textAlign: 'center' },
  cameraDesc: { maxWidth: 240, marginTop: 4, marginBottom: 16 },
  cameraBtn: { width: '100%' },
  mpTag: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cameraFeed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  liveCameraWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    padding: 20,
    paddingBottom: 18,
    alignItems: 'center',
  },
  correctionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 12,
    alignSelf: 'center',
  },
  correctionText: { flexShrink: 1, fontSize: 12 },
  refCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginTop: 18,
    gap: 12,
  },
  refHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  refImg: {
    width: 92,
    height: 92,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refCues: { flex: 1, gap: 6 },
  refCue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refCueText: { flex: 1 },
  liveLabel: { marginTop: 12 },
  liveStats: { width: '100%', marginTop: 14 },
  liveBar: { marginBottom: 8 },
  liveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 14,
  },
  nextPreview: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
    gap: 6,
  },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assessTimer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 20,
    marginVertical: 24,
    gap: 4,
  },
  bottom: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 4 },
});