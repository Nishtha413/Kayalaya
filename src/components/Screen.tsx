import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './AppText';
import { s, v, f } from '../utils/responsive';

interface ScreenProps {
  title?: string;
  children: React.ReactNode;
  scroll?: boolean;
  center?: boolean;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Screen({
  title,
  children,
  scroll = true,
  center = false,
  right,
  style,
}: ScreenProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  const header = (
    <View style={styles.header}>
      {canGoBack ? (
        <Pressable onPress={navigation.goBack} hitSlop={10} style={styles.back}>
          <AppText variant="label" color={colors.textMuted} style={styles.backText}>
            ← Back
          </AppText>
        </Pressable>
      ) : (
        <View style={{ width: 36 }} />
      )}
      {title ? (
        <AppText variant="heading" center style={styles.title}>
          {title}
        </AppText>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right ?? <View style={{ width: 36 }} />}
    </View>
  );

  const content = (
    <View
      style={[
        styles.content,
        center && styles.center,
        styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.safe, { backgroundColor: colors.background }]}>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, styles.nonScroll, center && styles.center]}>
          {content}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  padding: { paddingHorizontal: s(22), paddingVertical: v(24) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(18),
    paddingTop: v(8),
    paddingBottom: v(4),
  },
  title: { flex: 1, marginHorizontal: 12 },
  back: { paddingVertical: 6, paddingRight: 12 },
  backText: { fontSize: f(13), fontWeight: '700', letterSpacing: 0.2 },
  content: { width: '100%', flexGrow: 1 },
  scrollContent: { flexGrow: 1 },
  nonScroll: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});