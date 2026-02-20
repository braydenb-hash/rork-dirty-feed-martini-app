import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Animated,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemePreference, dirtyTheme, cleanTheme, Fonts, getTheme } from '@/constants/themes';

export default function ConfirmScreen() {
  const { completeOnboarding } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preference } = useLocalSearchParams<{ preference: string }>();
  const pref = (preference as ThemePreference) || 'dirty';
  const theme = getTheme(pref);

  const [displayName, setDisplayName] = useState<string>('');
  const [handle, setHandle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.5)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;

  const badgeEmoji = pref === 'dirty' ? '🫒' : '🥂';
  const badgeName = pref === 'dirty' ? 'Brine Initiate' : 'The Purist';

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
    ]).start();

    Animated.timing(buttonSlide, { toValue: 0, duration: 700, delay: 400, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeIn, badgeScale, badgePulse, buttonSlide]);

  const canSubmit = displayName.trim().length >= 2 && handle.trim().length >= 2;

  const handleConfirm = useCallback(() => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log('[Confirm] Completing onboarding with preference:', pref, 'name:', displayName, 'handle:', handle);
    completeOnboarding(pref);
    router.replace('/(tabs)' as never);
  }, [canSubmit, isSubmitting, pref, displayName, handle, completeOnboarding, router]);

  const handleFormatHandle = useCallback((text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    setHandle(cleaned);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]} testID="confirm-screen">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.badgeSection, { opacity: fadeIn }]}>
            <Text style={[styles.stepLabel, { color: theme.textMuted, fontFamily: Fonts.data }]}>
              STEP 3 — PROFILE SETUP
            </Text>

            <Animated.View style={[styles.badgeContainer, { transform: [{ scale: Animated.multiply(badgeScale, badgePulse) }] }]}>
              <View style={[styles.badgeGlow, { shadowColor: theme.accent, backgroundColor: theme.bgElevated }]}>
                <Text style={styles.badgeEmoji}>{badgeEmoji}</Text>
              </View>
            </Animated.View>

            <Text style={[styles.badgeTitle, { color: theme.accent, fontFamily: Fonts.prestigeBold }]}>
              {badgeName}
            </Text>
            <Text style={[styles.badgeDesc, { color: theme.textSecondary, fontFamily: Fonts.data }]}>
              Your first badge has been earned
            </Text>
          </Animated.View>

          <Animated.View style={[styles.formSection, { opacity: fadeIn }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted, fontFamily: Fonts.data }]}>
                DISPLAY NAME
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.textPrimary,
                    borderColor: displayName.length > 0 ? theme.accent : theme.bgBorder,
                    backgroundColor: theme.bgCard,
                    fontFamily: Fonts.prestigeRegular,
                  },
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={theme.textMuted}
                maxLength={24}
                autoCapitalize="words"
                testID="input-name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted, fontFamily: Fonts.data }]}>
                HANDLE
              </Text>
              <View style={[
                styles.handleInputRow,
                {
                  borderColor: handle.length > 0 ? theme.accent : theme.bgBorder,
                  backgroundColor: theme.bgCard,
                },
              ]}>
                <Text style={[styles.handlePrefix, { color: theme.accentMuted, fontFamily: Fonts.data }]}>@</Text>
                <TextInput
                  style={[
                    styles.handleInput,
                    {
                      color: theme.textPrimary,
                      fontFamily: Fonts.data,
                    },
                  ]}
                  value={handle}
                  onChangeText={handleFormatHandle}
                  placeholder="yourhandle"
                  placeholderTextColor={theme.textMuted}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="input-handle"
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: buttonSlide }], opacity: fadeIn }}>
            <Pressable
              style={[
                styles.confirmButton,
                {
                  backgroundColor: canSubmit ? theme.accent : theme.bgElevated,
                  shadowColor: canSubmit ? theme.accent : 'transparent',
                },
              ]}
              onPress={handleConfirm}
              disabled={!canSubmit || isSubmitting}
              testID="confirm-button"
            >
              <Text style={[
                styles.confirmText,
                {
                  color: canSubmit ? theme.bg : theme.textMuted,
                  fontFamily: Fonts.dataBold,
                },
              ]}>
                {isSubmitting ? 'ENTERING...' : 'ENTER THE BAR'}
              </Text>
            </Pressable>

            {!canSubmit && (
              <Text style={[styles.hint, { color: theme.textMuted, fontFamily: Fonts.dataLight }]}>
                Name and handle must be at least 2 characters
              </Text>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: 'center' as const,
  },
  badgeSection: {
    alignItems: 'center' as const,
    marginBottom: 48,
  },
  stepLabel: {
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
    marginBottom: 32,
  },
  badgeContainer: {
    marginBottom: 20,
  },
  badgeGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  badgeEmoji: {
    fontSize: 52,
  },
  badgeTitle: {
    fontSize: 28,
    letterSpacing: 1,
    marginBottom: 6,
  },
  badgeDesc: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  formSection: {
    marginBottom: 40,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    marginLeft: 4,
  },
  textInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  handleInputRow: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
  },
  handlePrefix: {
    fontSize: 16,
    marginRight: 2,
  },
  handleInput: {
    flex: 1,
    fontSize: 16,
    height: 52,
  },
  confirmButton: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmText: {
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
  },
  hint: {
    fontSize: 11,
    textAlign: 'center' as const,
    marginTop: 12,
    letterSpacing: 0.5,
  },
});
