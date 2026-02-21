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
  prestige: 'CormorantGaramond_400Regular_Italic',
  prestigeBold: 'CormorantGaramond_600SemiBold_Italic',
  prestigeRegular: 'CormorantGaramond_400Regular',
  data: 'IBMPlexMono_400Regular',
  dataLight: 'IBMPlexMono_300Light',
  dataBold: 'IBMPlexMono_600SemiBold',
};

export const dirtyTheme: AppTheme = {
  preference: 'dirty',
  bg: '#0A0A06',
  bgCard: '#16160E',
  bgElevated: '#1F1D12',
  bgBorder: '#2E2C1E',
  accent: '#9BA83E',
  accentLight: '#B5C35C',
  accentMuted: '#6B7A2A',
  accentGlow: 'rgba(155, 168, 62, 0.5)',
  textPrimary: '#F0ECD8',
  textSecondary: '#B0AC94',
  textMuted: '#6E6B56',
  highlight: '#D9AD4A',
  danger: '#C94848',
  success: '#6F9226',
  factionEmoji: '🫒',
  factionName: 'Brine Initiate',
};

export const cleanTheme: AppTheme = {
  preference: 'clean',
  bg: '#060A14',
  bgCard: '#0E1828',
  bgElevated: '#162440',
  bgBorder: '#223458',
  accent: '#B0CCE8',
  accentLight: '#D8EAF8',
  accentMuted: '#6488B0',
  accentGlow: 'rgba(176, 204, 232, 0.4)',
  textPrimary: '#F0F4FC',
  textSecondary: '#8C9CB8',
  textMuted: '#4E5E78',
  highlight: '#D0E0F0',
  danger: '#E45050',
  success: '#58C89C',
  factionEmoji: '🥂',
  factionName: 'The Purist',
};

export function getTheme(preference: ThemePreference): AppTheme {
  return preference === 'dirty' ? dirtyTheme : cleanTheme;
}
