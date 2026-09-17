import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { poseById, ASSESSMENT_POSE_IDS } from '../data/program';
import AppText from '../components/AppText';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AssessmentIntroScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const poses = ASSESSMENT_POSE_IDS.map((id) => poseById(id));

  return (
    <Screen title="Final Assessment">
      <View style={styles.top}>
        <Icon name="trophy-outline" size={64} color={colors.warning} />
        <AppText variant="title" bold center style={styles.title}>
          Final Assessment
        </AppText>
        <AppText variant="body" color={colors.textMuted} center>
          Test what you've learned from the 7-day beginner program.
        </AppText>
      </View>

      <Card variant="accent" style={styles.rulesCard}>
        <AppText variant="label" bold>How it works</AppText>
        <View style={styles.ruleList}>
          {[
            'You will perform each pose for ~10 seconds',
            'No demonstrations are provided during the test',
            'No real-time feedback or corrections',
            'Your pose will be detected automatically',
            'Each correct detection earns a mark',
          ].map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <Icon name="check" size={14} color={colors.primary} />
              <AppText variant="body" color={colors.textMuted} style={{ flex: 1 }}>{rule}</AppText>
            </View>
          ))}
        </View>
      </Card>

      <AppText variant="heading" color={colors.text} style={styles.section}>
        Assessment Poses ({poses.length})
      </AppText>
      {poses.map((pose, i) => (
        <View key={pose.id} style={[styles.poseRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.poseNum, { backgroundColor: colors.primarySoft }]}>
            <AppText variant="label" color={colors.primary}>{i + 1}</AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="label">{pose.name}</AppText>
            <AppText variant="caption" color={colors.textMuted}>{pose.sanskrit}</AppText>
          </View>
          <Icon name={pose.icon} size={22} color={colors.textMuted} />
        </View>
      ))}

      <View style={styles.timeRow}>
        <Icon name="timer" size={20} color={colors.warning} />
        <AppText variant="label" color={colors.warning}>
          Estimated time: {poses.length * 15} seconds
        </AppText>
      </View>

      <Button
        title="Begin Assessment"
        onPress={() => navigation.navigate('Assessment')}
        icon="play-circle-outline"
        style={styles.startBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 8, marginBottom: 28, marginTop: 16 },
  title: { marginTop: 10 },
  rulesCard: { marginBottom: 28 },
  ruleList: { gap: 10, marginTop: 14 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  section: { marginBottom: 12 },
  poseRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  poseNum: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 12 },
  startBtn: { marginTop: 4 },
});