import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { ThemePreference, AppTheme, getTheme } from '@/constants/themes';

const THEME_KEY = 'dirty_feed_theme_pref';
const ONBOARDING_KEY = 'dirty_feed_onboarded';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themePreference, setThemePreference] = useState<ThemePreference>('dirty');
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  const initQuery = useQuery({
    queryKey: ['themeInit'],
    queryFn: async () => {
      const [themePref, onboarded] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);
      console.log('[ThemeContext] Init - theme:', themePref, 'onboarded:', onboarded);
      return {
        theme: (themePref as ThemePreference) ?? 'dirty',
        onboarded: onboarded === 'true',
      };
    },
  });

  useEffect(() => {
    if (initQuery.data) {
      setThemePreference(initQuery.data.theme);
      setHasOnboarded(initQuery.data.onboarded);
    }
  }, [initQuery.data]);

  const saveThemeMutation = useMutation({
    mutationFn: async (pref: ThemePreference) => {
      await AsyncStorage.setItem(THEME_KEY, pref);
      return pref;
    },
  });

  const saveOnboardingMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    },
  });

  const setTheme = (pref: ThemePreference) => {
    setThemePreference(pref);
    saveThemeMutation.mutate(pref);
    console.log('[ThemeContext] Theme changed to:', pref);
  };

  const completeOnboarding = (pref: ThemePreference) => {
    setThemePreference(pref);
    setHasOnboarded(true);
    saveThemeMutation.mutate(pref);
    saveOnboardingMutation.mutate();
    console.log('[ThemeContext] Onboarding completed, theme:', pref);
  };

  const theme: AppTheme = getTheme(themePreference);

  return {
    theme,
    themePreference,
    setTheme,
    hasOnboarded,
    completeOnboarding,
    isLoading: initQuery.isLoading,
  };
});
