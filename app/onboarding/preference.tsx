import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemePreference, dirtyTheme, cleanTheme, Fonts } from '@/constants/themes';

export default function PreferenceScreen() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [chosen, setChosen] = useState<ThemePreference | null>(null);

  const floodScale = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  const handleChoice = useCallback((pref: ThemePreference) => {
    if (chosen) return;
    setChosen(pref);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Animated.parallel([
      Animated.timing(floodScale, {
        toValue: 30,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(resultFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    setTimeout(() => {
      setTheme(pref);
      router.push({ pathname: '/onboarding/confirm', params: { preference: pref } } as never);
    }, 2400);
  }, [chosen, floodScale, contentFade, resultFade, setTheme, router]);

  const floodColor = chosen === 'dirty' ? dirtyTheme.accent : cleanTheme.accent;
  const floodCenterX = chosen === 'dirty' ? width * 0.25 : width * 0.75;
  const floodCenterY = height * 0.5;

  return (
    <View style={styles.container} testID="preference-screen">
      <Animated.View style={[styles.splitContainer, { opacity: contentFade }]}>
        <View style={[styles.headerBar, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerLabel}>CHOOSE YOUR SIDE</Text>
        </View>

        <View style={styles.halves}>
          <Pressable
            style={styles.half}
            onPress={() => handleChoice('dirty')}
            testID="choice-dirty"
          >
            <LinearGradient
              colors={['#1C1C0A', '#0C0C04']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.factionContent}>
              <Text style={styles.factionEmoji}>🫒</Text>
              <Text style={[styles.factionTitle, { color: dirtyTheme.accent }]}>DIRTY</Text>
              <View style={styles.factionDivider}>
                <View style={[styles.factionLine, { backgroundColor: dirtyTheme.accentMuted }]} />
              </View>
              <Text style={[styles.factionSub, { color: dirtyTheme.accentMuted }]}>
                Olives{'\n'}Brine{'\n'}Character
              </Text>
            </View>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={styles.half}
            onPress={() => handleChoice('clean')}
            testID="choice-clean"
          >
            <LinearGradient
              colors={['#0A0E1C', '#04060C']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.factionContent}>
              <Text style={styles.factionEmoji}>✨</Text>
              <Text style={[styles.factionTitle, { color: cleanTheme.accent }]}>CLEAN</Text>
              <View style={styles.factionDivider}>
                <View style={[styles.factionLine, { backgroundColor: cleanTheme.accentMuted }]} />
              </View>
              <Text style={[styles.factionSub, { color: cleanTheme.accentMuted }]}>
                Crystal{'\n'}Precision{'\n'}Purity
              </Text>
            </View>
          </Pressable>
        </View>
      </Animated.View>

      {chosen && (
        <Animated.View
          style={[
            styles.floodCircle,
            {
              backgroundColor: floodColor,
              left: floodCenterX - 30,
              top: floodCenterY - 30,
              transform: [{ scale: floodScale }],
            },
          ]}
          pointerEvents="none"
        />
      )}

      {chosen && (
        <Animated.View
          style={[
            styles.resultOverlay,
            { opacity: resultFade, paddingTop: insets.top },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.resultEmoji}>
            {chosen === 'dirty' ? '🫒' : '🥂'}
          </Text>
          <Text style={styles.resultTitle}>
            {chosen === 'dirty' ? 'Brine Initiate' : 'The Purist'}
          </Text>
          <Text style={styles.resultSub}>Your journey begins</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020202',
  },
  splitContainer: {
    flex: 1,
  },
  headerBar: {
    alignItems: 'center' as const,
    paddingBottom: 12,
  },
  headerLabel: {
    fontFamily: Fonts.data,
    fontSize: 11,
    color: '#5A5848',
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
  },
  halves: {
    flex: 1,
    flexDirection: 'row' as const,
  },
  half: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  factionContent: {
    alignItems: 'center' as const,
    gap: 12,
  },
  factionEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  factionTitle: {
    fontFamily: Fonts.prestige,
    fontStyle: 'italic' as const,
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 6,
  },
  factionDivider: {
    width: 40,
    alignItems: 'center' as const,
    marginVertical: 4,
  },
  factionLine: {
    width: 40,
    height: 1,
  },
  factionSub: {
    fontFamily: Fonts.data,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  divider: {
    width: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  dividerLine: {
    width: 1,
    height: 60,
    backgroundColor: '#2A2820',
  },
  dividerText: {
    fontFamily: Fonts.data,
    fontSize: 10,
    color: '#3A3828',
    letterSpacing: 2,
  },
  floodCircle: {
    position: 'absolute' as const,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  resultTitle: {
    fontFamily: Fonts.prestige,
    fontStyle: 'italic' as const,
    fontSize: 32,
    fontWeight: '600' as const,
    color: '#020202',
    letterSpacing: 2,
    marginBottom: 8,
  },
  resultSub: {
    fontFamily: Fonts.data,
    fontSize: 13,
    color: '#020202',
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    opacity: 0.7,
  },
});
