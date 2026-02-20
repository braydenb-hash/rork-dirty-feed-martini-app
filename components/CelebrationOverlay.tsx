import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Badge } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CelebrationOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  newBadges?: Badge[];
}

const CONFETTI_COLORS = [Colors.gold, Colors.goldLight, Colors.olive, Colors.oliveLight, '#E25555', Colors.white];

function CelebrationOverlay({ visible, onDismiss, newBadges = [] }: CelebrationOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const glassAnim = useRef(new Animated.Value(0)).current;
  const badgeSlide = useRef(new Animated.Value(50)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const confettiAnims = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(SCREEN_WIDTH / 2),
      y: new Animated.Value(SCREEN_HEIGHT / 2),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0),
    })),
  []);

  useEffect(() => {
    if (!visible) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    fadeAnim.setValue(0);
    scaleAnim.setValue(0.3);
    glassAnim.setValue(0);
    badgeSlide.setValue(50);
    badgeFade.setValue(0);
    shimmerAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(100),
      Animated.spring(glassAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ).start();

    confettiAnims.forEach((anim, i) => {
      const angle = (Math.PI * 2 * i) / confettiAnims.length + (Math.random() - 0.5) * 0.5;
      const distance = 120 + Math.random() * 140;
      const targetX = SCREEN_WIDTH / 2 + Math.cos(angle) * distance;
      const targetY = SCREEN_HEIGHT / 2 - 60 + Math.sin(angle) * distance * 0.7;

      anim.x.setValue(SCREEN_WIDTH / 2);
      anim.y.setValue(SCREEN_HEIGHT / 2 - 60);
      anim.opacity.setValue(1);
      anim.rotation.setValue(0);
      anim.scale.setValue(0);

      Animated.sequence([
        Animated.delay(200 + i * 30),
        Animated.parallel([
          Animated.spring(anim.scale, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
          Animated.timing(anim.x, { toValue: targetX, duration: 600, useNativeDriver: true }),
          Animated.timing(anim.y, { toValue: targetY + 80, duration: 800, useNativeDriver: true }),
          Animated.timing(anim.rotation, { toValue: Math.random() * 4 - 2, duration: 800, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(500),
            Animated.timing(anim.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    });

    if (newBadges.length > 0) {
      Animated.sequence([
        Animated.delay(800),
        Animated.parallel([
          Animated.spring(badgeSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
          Animated.timing(badgeFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();

      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 900);
    }
  }, [visible]);

  if (!visible) return null;

  const glassScale = glassAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 1.15, 1],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Pressable style={styles.touchArea} onPress={onDismiss}>
        {confettiAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                width: 6 + Math.random() * 6,
                height: 6 + Math.random() * 6,
                borderRadius: Math.random() > 0.5 ? 10 : 2,
                transform: [
                  { translateX: Animated.subtract(anim.x, SCREEN_WIDTH / 2) },
                  { translateY: Animated.subtract(anim.y, SCREEN_HEIGHT / 2) },
                  { scale: anim.scale },
                  { rotate: anim.rotation.interpolate({ inputRange: [-2, 2], outputRange: ['-180deg', '180deg'] }) },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.Text style={[styles.glassEmoji, { transform: [{ scale: glassScale }] }]}>
            🍸
          </Animated.Text>
          <Text style={styles.title}>Cheers!</Text>
          <Text style={styles.subtitle}>Your martini has been logged</Text>

          {newBadges.length > 0 && (
            <Animated.View style={[styles.badgeSection, { transform: [{ translateY: badgeSlide }], opacity: badgeFade }]}>
              <View style={styles.badgeDivider} />
              <Text style={styles.badgeTitle}>Badge Unlocked!</Text>
              {newBadges.map(badge => (
                <View key={badge.id} style={styles.badgeRow}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDesc}>{badge.description}</Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          <Text style={styles.tapHint}>Tap anywhere to continue</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(CelebrationOverlay);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  confetti: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  glassEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    color: Colors.gold,
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.whiteMuted,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  badgeSection: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  badgeDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.goldMuted,
    borderRadius: 1,
    marginBottom: 16,
  },
  badgeTitle: {
    color: Colors.goldLight,
    fontSize: 14,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold + '15',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
    marginBottom: 8,
    width: 260,
  },
  badgeIcon: {
    fontSize: 36,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  badgeDesc: {
    color: Colors.whiteMuted,
    fontSize: 13,
  },
  tapHint: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 32,
    fontWeight: '500' as const,
  },
});
