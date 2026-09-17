import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const MIN_RATIO = 0.85;
const MAX_RATIO = 1.4;

const clampRatio = (n: number) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, n));

const widthRatio = clampRatio(width / BASE_WIDTH);
const heightRatio = clampRatio(height / BASE_HEIGHT);

export const scale = (size: number) => Math.round(size * widthRatio);
export const verticalScale = (size: number) => Math.round(size * heightRatio);

const moderate = (size: number, factor = 0.4) =>
  Math.round(size + (widthRatio - 1) * size * factor);

export const fontScale = (size: number) => Math.max(9, moderate(size));

export const isTablet = width >= 600;

export const s = scale;
export const v = verticalScale;
export const f = fontScale;