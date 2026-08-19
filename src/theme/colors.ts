import type { MantineColorsTuple } from '@mantine/core';

export const greyscale: MantineColorsTuple = [
  '#fcfcfc',
  '#f7f7fc',
  '#eff0f6',
  '#d9dbe9',
  '#a0a3bd',
  '#6e7191',
  '#4e4b66',
  '#393652',
  '#262338',
  '#14142b',
];

export const primary: MantineColorsTuple = [
  '#e6eaf1',
  '#b0bed5',
  '#8a9ec0',
  '#5472a3',
  '#335691',
  '#00286b',
  '#002C76',
  '#001f54',
  '#001841',
  '#001232',
];

export const secondary: MantineColorsTuple = [
  '#f8e9e9',
  '#e8babc',
  '#dd989b',
  '#cd696e',
  '#c44c51',
  '#b51f26',
  '#a51c23',
  '#81161b',
  '#641115',
  '#4c0d10',
];

export const info: MantineColorsTuple = [
  '#eaf2fd',
  '#bfd8f9',
  '#9fc5f7',
  '#74aaf3',
  '#5999f1',
  '#002C76',
  '#2f80ed',
  '#2b74d8',
  '#215ba8',
  '#1a4682',
];

export const success: MantineColorsTuple = [
  '#e9f7ef',
  '#bce6ce',
  '#9cdab6',
  '#6ec994',
  '#52be80',
  '#27ae60',
  '#239e57',
  '#1c7c44',
  '#156035',
  '#104928',
];

export const warning: MantineColorsTuple = [
  '#fcf8eb',
  '#f6e9c2',
  '#f2dfa5',
  '#ecd07c',
  '#e8c762',
  '#e2b93b',
  '#cea836',
  '#a0832a',
  '#7c6620',
  '#5f4e19',
];

export const error: MantineColorsTuple = [
  '#fde7e8',
  '#fac9ca',
  '#f8aeb0',
  '#f69395',
  '#F4787B',
  '#F15D60',
  '#EC1F24',
  '#b00f13',
  '#69090b',
  '#230304',
];

export const neutral: MantineColorsTuple = [
  '#FCFCFC', // 0 Off white
  '#F7F7FC', // 1 BG
  '#EFF0F6', // 2 Input
  '#D9DBE9', // 3 Line
  '#A0A3BD', // 4 Placehold
  '#6E7191', // 5 Label
  '#4E4B66', // 6 Body
  '#393652', // 7 Ash
  '#262338', // 8 Ash-dark
  '#14142B', // 9 Ash
];

const colors = {
  greyscale,
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  neutral,
  // Backwards compatibility aliases
  corporateBlue: primary,
  kbzRed: secondary,
};

export default colors;
