export type ThemePreference = 'dirty' | 'clean';

export interface AppTheme {
  preference: ThemePreference;
  bg: string;
  bgCard: string;
  bgElevated: string;
  bgBorder: string;
  cardBg: string;
  accent: string;
  accentLight: string;
  accentMuted: string;
  accentGlow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  highlight: string;
  danger: string;
  success: string;
  factionEmoji: string;
  factionName: string;
  glassHighlight: string;
  xpBar: string;
  xpBarBg: string;
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
  cardBg: 'rgba(22, 22, 14, 0.85)',
  accent: '#9BA83E',
  accentLight: '#B5C35C',
  accentMuted: '#6B7A2A',
  accentGlow: 'rgba(155, 168, 62, 0.5)',
  textPrimary: '#F0ECD8',
  textSecondary: '#B0AC94',
  textMuted: '#6E6B56',
  textDim: 'rgba(110, 107, 86, 0.6)',
  highlight: '#D9AD4A',
  danger: '#C94848',
  success: '#6F9226',
  factionEmoji: '🫒',
  factionName: 'Brine Initiate',
  glassHighlight: 'rgba(155, 168, 62, 0.15)',
  xpBar: '#9BA83E',
  xpBarBg: 'rgba(155, 168, 62, 0.12)',
};

export const cleanTheme: AppTheme = {
  preference: 'clean',
  bg: '#060A14',
  bgCard: '#0E1828',
  bgElevated: '#162440',
  bgBorder: '#223458',
  cardBg: 'rgba(14, 24, 40, 0.85)',
  accent: '#B0CCE8',
  accentLight: '#D8EAF8',
  accentMuted: '#6488B0',
  accentGlow: 'rgba(176, 204, 232, 0.4)',
  textPrimary: '#F0F4FC',
  textSecondary: '#8C9CB8',
  textMuted: '#4E5E78',
  textDim: 'rgba(78, 94, 120, 0.6)',
  highlight: '#D0E0F0',
  danger: '#E45050',
  success: '#58C89C',
  factionEmoji: '🥂',
  factionName: 'The Purist',
  glassHighlight: 'rgba(176, 204, 232, 0.12)',
  xpBar: '#B0CCE8',
  xpBarBg: 'rgba(176, 204, 232, 0.1)',
};

export function getTheme(preference: ThemePreference): AppTheme {
  return preference === 'dirty' ? dirtyTheme : cleanTheme;
}
