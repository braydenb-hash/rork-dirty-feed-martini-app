import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

function SkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: Colors.darkElevated,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

export function FeedSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      {[0, 1, 2].map(i => (
        <View key={i} style={skeletonStyles.card}>
          <View style={skeletonStyles.cardHeader}>
            <SkeletonBlock width={40} height={40} borderRadius={20} />
            <View style={skeletonStyles.headerText}>
              <SkeletonBlock width={120} height={14} />
              <SkeletonBlock width={80} height={11} style={{ marginTop: 6 }} />
            </View>
          </View>
          <SkeletonBlock height={280} borderRadius={0} style={{ marginTop: 14 }} />
          <View style={skeletonStyles.cardContent}>
            <View style={skeletonStyles.ratingRow}>
              <SkeletonBlock width={100} height={16} />
              <SkeletonBlock width={70} height={24} borderRadius={12} />
            </View>
            <SkeletonBlock height={14} style={{ marginTop: 10 }} />
            <SkeletonBlock width="70%" height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function LeaderboardSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      <View style={skeletonStyles.podiumSkeleton}>
        {[0, 1, 2].map(i => (
          <View key={i} style={skeletonStyles.podiumCol}>
            <SkeletonBlock width={i === 0 ? 64 : 52} height={i === 0 ? 64 : 52} borderRadius={32} />
            <SkeletonBlock width={60} height={12} style={{ marginTop: 8 }} />
            <SkeletonBlock width={40} height={16} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
      {[0, 1, 2, 3, 4].map(i => (
        <View key={i} style={skeletonStyles.listRow}>
          <SkeletonBlock width={32} height={32} borderRadius={16} />
          <SkeletonBlock width={40} height={40} borderRadius={20} style={{ marginLeft: 12 }} />
          <SkeletonBlock width={120} height={14} style={{ marginLeft: 12 }} />
          <View style={{ flex: 1 }} />
          <SkeletonBlock width={40} height={18} />
        </View>
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  cardContent: {
    padding: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  podiumSkeleton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 20,
  },
  podiumCol: {
    alignItems: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
});

export default SkeletonBlock;
