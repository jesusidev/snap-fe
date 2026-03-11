// Snap FE - Color Palette

const dark = [
  '#f5f5f5', // 0 - text primary
  '#a3a3a3', // 1 - text secondary
  '#737373', // 2 - text muted
  '#404040', // 3 - borders
  '#2a2a2a', // 4 - subtle bg
  '#242424', // 5 - elevated surfaces
  '#1a1a1a', // 6 - primary surface
  '#121212', // 7 - background
  '#0d0d0d', // 8 - deep background
  '#0a0a0a', // 9 - deepest black
] as const;

const brand = [
  '#e8f5ff', // 0
  '#b3dbff', // 1
  '#80c2ff', // 2
  '#4da8ff', // 3
  '#1a8fff', // 4
  '#0074e6', // 5 - primary
  '#005bb4', // 6
  '#004282', // 7
  '#002951', // 8
  '#001021', // 9
] as const;

const gray = [
  '#f2f2f2',
  '#d9d9d9',
  '#bfbfbf',
  '#a6a6a6',
  '#8c8c8c',
  '#737373',
  '#595959',
  '#404040',
  '#262626',
  '#0d0d0d',
] as const;

const green = [
  '#e4fbed',
  '#c3ecd3',
  '#a1ddb8',
  '#7ccf9d',
  '#59c282',
  '#3fa869',
  '#308351',
  '#205d39',
  '#0f3922',
  '#001507',
] as const;

const red = [
  '#ffe4e4',
  '#ffb4b5',
  '#f98586',
  '#f65656',
  '#f22726',
  '#d9100d',
  '#a90909',
  '#7a0506',
  '#4b0102',
  '#1f0000',
] as const;

export const black = '#0a0a0a';

const colors = {
  dark,
  brand,
  gray,
  green,
  red,
} as const;

export type ColorName = keyof typeof colors;

export type Colors = {
  [key in ColorName]: (typeof colors)[key];
};

export const color: Colors = colors;
