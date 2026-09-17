import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, AssessmentResult, PerPoseAssessment } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { poseById, ASSESSMENT_POSE_IDS } from '../data/program';
import AppText from '../components/AppText';
import Icon from '../components/Icon';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const POSE_DURATION = 5;

export default function AssessmentScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const poses = ASSESSMENT_POSE_IDS.map((id) => poseById(id));
  const [index, setIndex] = useState(0);
  const [countdown, setCountdown] = useState(POSE_DURATION);
  const [status, setStatus] = useState<'preparing' | 'detecting' | 'next'>('preparing');
  const pulse = useRef(new Animated.Value(1)).current;
  const pose = poses[index];

  useEffect(() => {
    setStatus('preparing');
    setCountdown(POSE_DURATION);
    const timer = setTimeout(() => setStatus('detecting'), 1200);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (status !== 'detecting') {
      return;
    }
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setStatus('next');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
    return () => {
      pulse.stopAnimation();
    };
  }, [index, pulse]);

  const finishAssessment = () => {
    const perPose: PerPoseAssessment[] = poses.map((p, i) => ({
      poseId: p.id,
      correct: (i + 3) % 3 !== 0,
    }));
    const correctCount = perPose.filter((p) => p.correct).length;
    const score = Math.round((correctCount / poses.length) * 100);
    const marks = correctCount;
    const result: AssessmentResult = {
      date: new Date().toISOString(),
      totalPoses: poses.length,
      correctCount,
      score,
      marks,
      perPose,
      strengths: score >= 67 ? ['Mountain Pose', 'Tree Pose'] : ['Mountain Pose'],
      improvements: score >= 67 ? ['Cobra Pose', 'Warrior II'] : ['Tree Pose', 'Warrior II', 'Cobra Pose'],
    };
    navigation.replace('AssessmentResult', { result });
  };

  const nextPose = () => {
    if (index + 1 < poses.length) {
      setIndex(index + 1);
    } else {
      finishAssessment();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <AppText variant="caption" color={colors.textMuted}>
          Assessment · Pose {index + 1} of {poses.length}
        </AppText>
        <AppText variant="heading" bold>{pose.name}</AppText>
        <AppText variant="caption" color={colors.textFaint}>{pose.sanskrit}</AppText>
      </View>

      <ProgressBar
        value={(index / poses.length) * 100 + (countdown / POSE_DURATION) * (100 / poses.length)}
        height={6}
      />

      <View style={styles.preview}>
        <View style={[styles.previewInner, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
          <Animated.View style={{ transform: [{ scale: status === 'detecting' ? pulse : 1 }] }}>
            <Icon name={pose.icon} size={104} color={status === 'detecting' ? colors.primary : colors.textFaint} />
          </Animated.View>
          <AppText variant="caption" color={colors.textFaint} style={styles.previewLabel}>
            {status === 'detecting' ? 'Detecting pose...' : 'Get ready...'}
          </AppText>
          {status === 'detecting' ? (
            <View style={[styles.detectBadge, { backgroundColor: colors.primarySoft }]}>
              <Icon name="camera" size={16} color={colors.primary} />
              <AppText variant="label" color={colors.primary}>Detecting</AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.countdown, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <AppText variant="display" bold color={colors.primary}>
          {status === 'detecting' ? countdown : '3·2·1'}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>seconds remaining</AppText>
      </View>

      <View style={styles.action}>
        {status === 'next' ? (
          <Button
            title={index + 1 < poses.length ? 'Next Pose' : 'Finish Assessment'}
            onPress={nextPose}
            icon={index + 1 < poses.length ? 'skip-next' : 'check-circle'}
          />
        ) : (
          <Button title="Start Over" variant="ghost" onPress={finishAssessment} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 16 },
  header: { alignItems: 'center', gap: 4, marginBottom: 12 },
  preview: { marginTop: 16, alignItems: 'center' },
  previewInner: {
    width: '100%',
    height: 280,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: { marginTop: 10 },
  detectBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 12 },
  countdown: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 20,
    marginVertical: 24,
    gap: 4,
  },
  action: { marginTop: 'auto', paddingBottom: 32 },
});