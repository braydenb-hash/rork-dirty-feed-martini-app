import React, { useCallback, useRef } from 'react';
import { View, Pressable, Text, StyleSheet, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Wine, Map as MapIcon, Plus, Trophy, User as UserIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/themes';

interface TabState {
  index: number;
  routes: Array<{ key: string; name: string }>;
}

interface TabNavigation {
  navigate: (name: string) => void;
}

const ROUTE_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  '(feed)': Wine,
  map: MapIcon,
  log: Plus,
  leaderboard: Trophy,
  profile: UserIcon,
};

const ROUTE_LABELS: Record<string, string> = {
  '(feed)': 'Feed',
  map: 'Map',
  log: 'Log',
  leaderboard: 'Ranks',
  profile: 'Profile',
};

function CustomTabBar({ state, navigation }: { state: TabState; navigation: TabNavigation; descriptors?: unknown; insets?: unknown }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const centerScale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback((routeName: string, isFocused: boolean) => {
    if (!isFocused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate(routeName);
    }
  }, [navigation]);

  const handleCenterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(centerScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(centerScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    navigation.navigate('log');
  }, [navigation, centerScale]);

  const bgColor = Platform.OS === 'web' ? theme.bg + 'F2' : theme.bg + '90';

  return (
    <View style={styles.outerContainer} testID="custom-tab-bar">
      {Platform.OS !== 'web' ? (
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
      <View style={[styles.topLine, { backgroundColor: theme.bgBorder }]} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCenter = index === 2;

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerSlot}>
                <Animated.View style={{ transform: [{ scale: centerScale }] }}>
                  <Pressable onPress={handleCenterPress} style={styles.centerTouchable}>
                    <View
                      style={[
                        styles.centerButton,
                        {
                          backgroundColor: theme.accent,
                          shadowColor: theme.accent,
                        },
                      ]}
                    >
                      <Plus size={26} color={theme.bg} strokeWidth={2.5} />
                    </View>
                  </Pressable>
                </Animated.View>
              </View>
            );
          }

          const Icon = ROUTE_ICONS[route.name] ?? Wine;
          const label = ROUTE_LABELS[route.name] ?? '';
          const color = isFocused ? theme.accent : theme.textMuted;

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={() => handlePress(route.name, isFocused)}
              testID={`tab-${route.name}`}
            >
              <Icon size={21} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
              {isFocused && (
                <View style={[styles.activeIndicator, { backgroundColor: theme.accent }]} />
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={{ height: insets.bottom }} />
    </View>
  );
}

export default React.memo(CustomTabBar);

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'visible' as const,
  },
  topLine: {
    height: StyleSheet.hairlineWidth,
  },
  tabRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    height: 58,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 6,
    gap: 3,
  },
  tabLabel: {
    fontSize: 7,
    fontFamily: Fonts.data,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  activeIndicator: {
    position: 'absolute' as const,
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  centerTouchable: {
    marginTop: -16,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
});
