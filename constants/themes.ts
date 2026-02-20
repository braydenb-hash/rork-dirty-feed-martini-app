import { Platform } from 'react-native';

export type ThemePreference = 'dirty' | 'clean';

export interface AppTheme {
  preference: ThemePreference;
  bg: string;
  bgCard: string;
  bgElevated: string;
  bgBorder: string;
  accent: string;
  accentLight: string;
  accentMuted: string;
  accentGlow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  highlight: string;
  danger: string;
  success: string;
  factionEmoji: string;
  factionName: string;
}

export const Fonts = {
  prestige: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, Times New Roman, serif',
  }) as string,
  data: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Menlo, Courier New, monospace',
  }) as string,
};

export const dirtyTheme: AppTheme = {
  preference: 'dirty',
  bg: '#080806',
  bgCard: '#151510',
  bgElevated: '#1E1C14',
  bgBorder: '#2A2820',
  accent: '#8B9A3B',
  accentLight: '#AAB85A',
  accentMuted: '#5E6E24',
  accentGlow: 'rgba(139, 154, 59, 0.45)',
  textPrimary: '#EAE6D6',
  textSecondary: '#AAA690',
  textMuted: '#6A6752',
  highlight: '#D4A84B',
  danger: '#C44D4D',
  success: '#6B8E23',
  factionEmoji: '🫒',
  factionName: 'Brine Initiate',
};

export const cleanTheme: AppTheme = {
  preference: 'clean',
  bg: '#040810',
  bgCard: '#0C1424',
  bgElevated: '#14203A',
  bgBorder: '#1E3050',
  accent: '#A8C4E0',
  accentLight: '#D0E2F5',
  accentMuted: '#5A80A8',
  accentGlow: 'rgba(168, 196, 224, 0.35)',
  textPrimary: '#ECF0F8',
  textSecondary: '#8898B0',
  textMuted: '#4A5A72',
  highlight: '#C8D8EC',
  danger: '#E05555',
  success: '#5CC8A0',
  factionEmoji: '🥂',
  factionName: 'The Purist',
};

export function getTheme(preference: ThemePreference): AppTheme {
  return preference === 'dirty' ? dirtyTheme : cleanTheme;
}
