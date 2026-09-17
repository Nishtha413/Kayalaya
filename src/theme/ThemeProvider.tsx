import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { palettes, type ColorMode, type ThemeColors } from './colors';
import { getItem, setItem } from '../utils/storage';

export const THEME_KEY = 'kayalaya.themeMode';

export interface ThemeContextValue {
  mode: ColorMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ColorMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ColorMode>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        if (mounted) {
          setModeState(stored);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    setItem(THEME_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: palettes[mode], isDark: mode === 'dark', setMode, toggle }),
    [mode, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}