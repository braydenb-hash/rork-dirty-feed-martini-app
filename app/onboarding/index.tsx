import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Fonts } from '@/constants/themes';

export default function OnboardingSplash() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const tapPulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -14, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.timing(titleFade, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(900),
      Animated.timing(subtitleFade, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(tapPulse, { toValue: 0.9, duration: 1600, useNativeDriver: true }),
        Animated.timing(tapPulse, { toValue: 0.3, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, [floatAnim, titleFade, subtitleFade, tapPulse]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/preference' as never);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress} testID="onboarding-splash">
      <View style={[styles.inner, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.spacer} />

        <View style={styles.center}>
          <Animated.Text style={[styles.glassEmoji, { transform: [{ translateY: floatAnim }] }]}>
            🍸
          </Animated.Text>

          <Animated.View style={[styles.wordmarkContainer, { opacity: titleFade }]}>
            <Text style={styles.wordmarkTop}>POUR</Text>
            <Text style={styles.ampersand}>&</Text>
            <Text style={styles.wordmarkBottom}>COMPARE</Text>
          </Animated.View>

          <Animated.Text style={[styles.tagline, { opacity: subtitleFade }]}>
            Rate. Rank. Repeat.
          </Animated.Text>
        </View>

        <View style={styles.spacer} />

        <Animated.Text style={[styles.tapText, { opacity: tapPulse }]}>
          Tap to begin
        </Animated.Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020202',
  },
  inner: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  spacer: {
    flex: 1,
  },
  center: {
    alignItems: 'center' as const,
    gap: 8,
  },
  glassEmoji: {
    fontSize: 88,
    marginBottom: 24,
  },
  wordmarkContainer: {
    alignItems: 'center' as const,
  },
  wordmarkTop: {
    fontFamily: Fonts.prestige,
    fontStyle: 'italic' as const,
    fontSize: 42,
    fontWeight: '300' as const,
    color: '#E8E4D4',
    letterSpacing: 12,
  },
  ampersand: {
    fontFamily: Fonts.prestige,
    fontStyle: 'italic' as const,
    fontSize: 28,
    color: '#6A6752',
    marginVertical: -4,
  },
  wordmarkBottom: {
    fontFamily: Fonts.prestige,
    fontStyle: 'italic' as const,
    fontSize: 42,
    fontWeight: '300' as const,
    color: '#E8E4D4',
    letterSpacing: 12,
  },
  tagline: {
    fontFamily: Fonts.data,
    fontSize: 12,
    color: '#6A6752',
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    marginTop: 16,
  },
  tapText: {
    fontFamily: Fonts.data,
    fontSize: 12,
    color: '#4A4838',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: 40,
  },
});
