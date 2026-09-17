export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  mode: ColorMode;

  /* — spec tokens — */
  bgPage: string;
  bg: string;
  card: string;
  pink: string;
  pinkDeep: string;
  sage: string;
  sageDeep: string;
  purple: string;
  purpleDeep: string;
  ink: string;
  inkSoft: string;
  muted: string;
  line: string;
  camera: string;
  darkFlowCard: string;

  /* — backward-compat aliases used by existing components — */
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceVariant: string;
  border: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  textFaint: string;
  textOnPrimary: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
}

const light: ThemeColors = {
  mode: 'light',

  bgPage: '#EFE9E4',
  bg: '#FBF7F3',
  card: '#FFFFFF',
  pink: '#F5D2D9',
  pinkDeep: '#E39CAA',
  sage: '#B7CBAE',
  sageDeep: '#6F9163',
  purple: '#D3C2E6',
  purpleDeep: '#8E6BB8',
  ink: '#392F45',
  inkSoft: '#6C6178',
  muted: '#9A90A6',
  line: '#EEE6EC',
  camera: '#2E2640',
  darkFlowCard: '#33294B',

  background: '#FBF7F3',
  surface: '#FFFFFF',
  surfaceAlt: '#D3C2E6',
  surfaceVariant: '#EEE6EC',
  border: '#EEE6EC',
  primary: '#8E6BB8',
  primaryPressed: '#7A599E',
  primarySoft: '#D3C2E6',
  accent: '#E39CAA',
  accentSoft: '#F5D2D9',
  text: '#392F45',
  textMuted: '#6C6178',
  textFaint: '#9A90A6',
  textOnPrimary: '#FFFFFF',
  success: '#6F9163',
  successSoft: '#B7CBAE',
  warning: '#E89B3C',
  warningSoft: 'rgba(232,155,60,0.14)',
  danger: '#E39CAA',
  dangerSoft: '#F5D2D9',
};

const dark: ThemeColors = {
  mode: 'dark',

  bgPage: '#15111C',
  bg: '#211B29',
  card: '#2B2434',
  pink: '#5B3A44',
  pinkDeep: '#E39CAA',
  sage: '#3A4640',
  sageDeep: '#8FBF80',
  purple: '#4A3A63',
  purpleDeep: '#B79BDD',
  ink: '#F3EEF7',
  inkSoft: '#CFC5D9',
  muted: '#9C90AC',
  line: '#3B3247',
  camera: '#2E2640',
  darkFlowCard: '#33294B',

  background: '#211B29',
  surface: '#2B2434',
  surfaceAlt: '#4A3A63',
  surfaceVariant: '#3B3247',
  border: '#3B3247',
  primary: '#B79BDD',
  primaryPressed: '#A386C8',
  primarySoft: '#4A3A63',
  accent: '#E39CAA',
  accentSoft: '#5B3A44',
  text: '#F3EEF7',
  textMuted: '#CFC5D9',
  textFaint: '#9C90AC',
  textOnPrimary: '#FFFFFF',
  success: '#8FBF80',
  successSoft: '#3A4640',
  warning: '#F0B45F',
  warningSoft: 'rgba(240,180,95,0.16)',
  danger: '#E39CAA',
  dangerSoft: '#5B3A44',
};

export const palettes: Record<ColorMode, ThemeColors> = { light, dark };
