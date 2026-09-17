import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import AppText from '../components/AppText';
import TextField from '../components/TextField';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;
type Route = RouteProp<RootStackParamList, 'Auth'>;

type AuthMode = 'create' | 'login';

export default function AuthScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { signIn } = useApp();
  const [mode, setMode] = useState<AuthMode>(route.params?.mode ?? 'create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (mode === 'create') {
      if (!name.trim() || !email.trim()) {
        setError('Please fill in your name and email.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }
    }
    setLoading(true);
    try {
      const displayName = mode === 'create' ? name.trim() : '';
      const profile = await signIn(displayName, email.trim());
      if (profile.survey) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Survey', params: { name: profile.name } }],
        });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/kayalaya.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <AppText variant="heading" center style={styles.title}>
          {mode === 'create' ? 'Create your account' : 'Welcome back'}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} center style={styles.subtitle}>
          {mode === 'create'
            ? 'Begin your 7-day yoga program.'
            : 'Sign in to continue your yoga journey.'}
        </AppText>

        <View style={[styles.segment, { backgroundColor: colors.line }]}>
          {(['create', 'login'] as AuthMode[]).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => switchMode(m)}
                style={[styles.segmentItem, active && { backgroundColor: colors.primary }]}
              >
                <AppText variant="label" color={active ? '#FFFFFF' : colors.muted}>
                  {m === 'create' ? 'Create account' : 'Log in'}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.fields}>
          {mode === 'create' ? (
            <TextField
              label="Full name"
              placeholder="Your full name"
              value={name}
              onChangeText={setName}
              uppercaseLabel
            />
          ) : null}
          <TextField
            label="Email"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            uppercaseLabel
          />
          <TextField
            label="Password"
            placeholder={mode === 'create' ? 'Choose a password' : 'Enter your password'}
            value={password}
            onChangeText={setPassword}
            secure
            autoCapitalize="none"
            uppercaseLabel
          />
          {mode === 'create' ? (
            <AppText variant="caption" color={colors.primary} style={styles.helper}>
              Min. 8 characters
            </AppText>
          ) : null}
          {error ? (
            <AppText variant="caption" color={colors.danger} style={styles.error}>
              {error}
            </AppText>
          ) : null}
          <Button title="Continue" onPress={submit} loading={loading} icon="arrow-right" />
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.line }]} />
          <AppText variant="overline" color={colors.muted}>
            or continue with
          </AppText>
          <View style={[styles.line, { backgroundColor: colors.line }]} />
        </View>

        <View style={styles.socialRow}>
          <Button
            title="Google"
            variant="secondary"
            fullWidth={false}
            style={styles.socialBtn}
            icon="google"
            onPress={() => {}}
          />
          <Button
            title="Apple"
            variant="secondary"
            fullWidth={false}
            style={styles.socialBtn}
            icon="apple"
            onPress={() => {}}
          />
        </View>

        <Pressable
          style={styles.footer}
          onPress={() => switchMode(mode === 'create' ? 'login' : 'create')}
        >
          <AppText variant="body" color={colors.textMuted}>
            {mode === 'create' ? 'Already have an account? ' : "Don't have an account? "}
          </AppText>
          <AppText variant="body" bold color={colors.primary}>
            {mode === 'create' ? 'Log in' : 'Sign up'}
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 36,
    paddingBottom: 24,
  },
  logo: {
    width: 132,
    height: 122,
    alignSelf: 'center',
  },
  title: { fontSize: 21, marginTop: 16 },
  subtitle: { marginTop: 8, marginBottom: 20 },
  segment: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  fields: { width: '100%' },
  helper: { marginTop: -8, marginBottom: 12, marginLeft: 2 },
  error: { textAlign: 'center', marginBottom: 8 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 22,
  },
  line: { flex: 1, height: 1 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
    paddingBottom: 16,
  },
});