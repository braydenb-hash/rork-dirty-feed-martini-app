import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Star, X, Users, Wine, PenLine, Crown, TrendingUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { MOCK_BARS } from '@/mocks/data';
import { useMartini } from '@/contexts/MartiniContext';
import OliveRating from '@/components/OliveRating';

export default function BarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { feedLogs, barMayorships, user } = useMartini();
  const crownPulse = useRef(new Animated.Value(1)).current;

  const bar = MOCK_BARS.find(b => b.id === id);
  const barLogs = feedLogs.filter(l => l.barId === id);
  const mayorship = id ? barMayorships[id] : undefined;

  const currentUserLogCount = useMemo(() => {
    return barLogs.filter(l => l.userId === user.id).length;
  }, [barLogs, user.id]);

  const logsToOvertake = useMemo(() => {
    if (!mayorship || mayorship.userId === user.id) return 0;
    return Math.max(0, mayorship.logCount - currentUserLogCount + 1);
  }, [mayorship, currentUserLogCount, user.id]);

  const progressToMayor = useMemo(() => {
    if (!mayorship || mayorship.userId === user.id) return 1;
    if (mayorship.logCount === 0) return 0;
    return Math.min(currentUserLogCount / mayorship.logCount, 0.95);
  }, [mayorship, currentUserLogCount, user.id]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(crownPulse, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(crownPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [crownPulse]);

  if (!bar) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <X size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Bar not found</Text>
        </View>
      </View>
    );
  }

  const handleLogHere = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
    setTimeout(() => {
      router.push({ pathname: '/(tabs)/log', params: { barName: bar.name, barCity: bar.city, barId: bar.id } } as never);
    }, 300);
  };

  const isCurrentUserMayor = mayorship?.userId === user.id;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{ uri: bar.photo }} style={styles.heroImage} contentFit="cover" />
          <Pressable
            style={[styles.closeBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <X size={22} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.barName}>{bar.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.goldMuted} />
            <Text style={styles.address}>{bar.address}, {bar.city}</Text>
          </View>

          {mayorship && (
            <View style={[styles.mayorCard, isCurrentUserMayor && styles.mayorCardOwned]}>
              <View style={styles.mayorHeader}>
                <Animated.View style={{ transform: [{ scale: crownPulse }] }}>
                  <Crown size={20} color="#FFD700" />
                </Animated.View>
                <Text style={styles.mayorTitle}>Head Bartender</Text>
              </View>
              <View style={styles.mayorUser}>
                <Image source={{ uri: mayorship.userAvatar }} style={styles.mayorAvatar} />
                <View style={styles.mayorInfo}>
                  <Text style={styles.mayorName}>
                    {mayorship.userName}
                    {isCurrentUserMayor ? ' (You!)' : ''}
                  </Text>
                  <Text style={styles.mayorStat}>
                    {mayorship.logCount} log{mayorship.logCount !== 1 ? 's' : ''} at this bar
                  </Text>
                </View>
                {isCurrentUserMayor && (
                  <View style={styles.crownBadge}>
                    <Text style={styles.crownEmoji}>👑</Text>
                  </View>
                )}
              </View>

              {!isCurrentUserMayor && (
                <View style={styles.overtakeSection}>
                  <View style={styles.overtakeHeader}>
                    <TrendingUp size={14} color={Colors.goldLight} />
                    <Text style={styles.overtakeText}>
                      Log {logsToOvertake} more to overtake {mayorship.userName.split(' ')[0]}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressToMayor * 100}%` }]} />
                  </View>
                  <Text style={styles.progressLabel}>
                    {currentUserLogCount}/{mayorship.logCount} logs
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Star size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{bar.communityRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Community Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Users size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{bar.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Wine size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{bar.topDrink}</Text>
              <Text style={styles.statLabel}>Top Drink</Text>
            </View>
          </View>

          <Pressable style={styles.logHereButton} onPress={handleLogHere}>
            <PenLine size={18} color={Colors.dark} />
            <Text style={styles.logHereText}>Log a Martini Here</Text>
          </Pressable>

          {barLogs.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsTitle}>Recent Reviews</Text>
              {barLogs.map(log => (
                <View key={log.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: log.userAvatar }} style={styles.reviewAvatar} />
                    <View style={styles.reviewHeaderText}>
                      <Text style={styles.reviewUser}>{log.userName}</Text>
                      <OliveRating rating={log.rating} size={12} />
                    </View>
                    <View style={styles.reviewStyleBadge}>
                      <Text style={styles.reviewStyleText}>{log.style}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewNotes}>{log.notes}</Text>
                  {log.isGoldenHourLog && (
                    <View style={styles.goldenHourTag}>
                      <Text style={styles.goldenHourTagText}>🌅 Golden Hour</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: Colors.gray,
    fontSize: 16,
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: 20,
  },
  barName: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800' as const,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
  },
  address: {
    color: Colors.gray,
    fontSize: 14,
  },
  mayorCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  mayorCardOwned: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
  },
  mayorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mayorTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
  },
  mayorUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mayorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  mayorInfo: {
    flex: 1,
  },
  mayorName: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  mayorStat: {
    color: Colors.goldMuted,
    fontSize: 12,
    marginTop: 2,
  },
  crownBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownEmoji: {
    fontSize: 18,
  },
  overtakeSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
  },
  overtakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  overtakeText: {
    color: Colors.goldLight,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.darkBorder,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  progressLabel: {
    color: Colors.gray,
    fontSize: 11,
    textAlign: 'right' as const,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  statLabel: {
    color: Colors.gray,
    fontSize: 11,
    textAlign: 'center' as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.darkBorder,
  },
  logHereButton: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  logHereText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  reviewsSection: {
    marginTop: 4,
  },
  reviewsTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  reviewHeaderText: {
    flex: 1,
    gap: 2,
  },
  reviewUser: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  reviewStyleBadge: {
    backgroundColor: Colors.darkElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
  },
  reviewStyleText: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: '500' as const,
  },
  reviewNotes: {
    color: Colors.whiteMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  goldenHourTag: {
    marginTop: 8,
    alignSelf: 'flex-start' as const,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  goldenHourTagText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  bottomSpacer: {
    height: 40,
  },
});
