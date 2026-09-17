import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { FONT_ITALIC } from '../theme/fonts';
import AppText from '../components/AppText';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<Nav>();
  const { hydrated, user } = useApp();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const returning = hydrated && Boolean(user?.survey);
  const firstName = user?.name?.split(' ')[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [fade, scale]);

  const logo = (
    <Image
      source={require('../../assets/images/kayalaya.png')}
      style={styles.logoImg}
      resizeMode="contain"
    />
  );

  const content = (
    <Animated.View
      style={[
        styles.content,
        { opacity: fade, transform: [{ scale }] },
      ]}
    >
      {logo}
      <AppText
        variant="overline"
        color={isDark ? colors.inkSoft : colors.ink}
        style={styles.tagline}
      >
        Home of the body
      </AppText>
      <View style={styles.bodyWrap}>
        <AppText
          variant="body"
          color={colors.ink}
          center
          style={styles.body}
        >
          Begin your 7-day yoga journey with guided daily practice.
        </AppText>
      </View>

      <View style={styles.buttons}>
        {returning ? (
          <>
            <View style={styles.buttonRow}>
              <Button
                title={`Continue${firstName ? `, ${firstName}` : ''}`}
                onPress={() => navigation.replace('Main')}
              />
            </View>
            <View style={styles.buttonRow}>
              <Button
                title="Not you? Switch account"
                variant="ghost"
                onPress={() => navigation.navigate('Auth', { mode: 'login' })}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.buttonRow}>
              <Button
                title="Get started"
                onPress={() => navigation.navigate('Auth', { mode: 'create' })}
              />
            </View>
            <View style={styles.buttonRow}>
              <Button
                title="I already have an account"
                variant="ghost"
                onPress={() => navigation.navigate('Auth', { mode: 'login' })}
              />
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isDark
            ? [colors.bg, colors.bg]
            : [colors.pink, colors.purple, colors.sage]
        }
        start={{ x: 0.9, y: 0 }}
        end={{ x: 0.1, y: 1 }}
        style={styles.gradient}
      >
        {isDark ? null : (
          <>
            <View style={[styles.blob, styles.blobTR]} />
            <View style={[styles.blob, styles.blobBL]} />
          </>
        )}
        {content}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  blobTR: { top: -70, right: -60 },
  blobBL: { bottom: -80, left: -70 },
  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    width: '100%',
  },
  logoImg: {
    width: 190,
    height: 176,
    marginBottom: 26,
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 8,
  },
  bodyWrap: { maxWidth: 250, marginTop: 22 },
  body: {
    textAlign: 'center',
    fontFamily: FONT_ITALIC,
    fontSize: 18,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  buttons: { marginTop: 34, width: '100%', gap: 12 },
  buttonRow: { width: '100%' },
});