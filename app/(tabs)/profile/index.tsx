import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, Alert, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wine, MapPin, Star, Trash2, Flame, Crown, ChevronRight, Lock, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useMartini } from '@/contexts/MartiniContext';
import OliveRating from '@/components/OliveRating';
import { Badge, MartiniLog } from '@/types';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A8A8',
  gold: '#FFD700',
};

const TIER_LABELS: Record<string, string> = {
  bronze: 'Beginner',
  silver: 'Intermediate',
  gold: 'Master',
};

export default function ProfileScreen() {
  const { user, badges, myLogs, deleteLog, userTitles } = useMartini();
  const insets = useSafeAreaInsets();
  const flamePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user.streakCount >= 3) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(flamePulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(flamePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [user.streakCount, flamePulse]);

  const pathData = useMemo(() => {
    const tiers: Array<{ tier: string; label: string; color: string; badges: Badge[] }> = [];
    const tierOrder = ['bronze', 'silver', 'gold'];

    tierOrder.forEach(tier => {
      const tierBadges = badges.filter(b => b.tier === tier);
      if (tierBadges.length > 0) {
        tiers.push({
          tier,
          label: TIER_LABELS[tier],
          color: TIER_COLORS[tier],
          badges: tierBadges,
        });
      }
    });

    const noBadges = badges.filter(b => !b.tier);
    if (noBadges.length > 0) {
      tiers.push({
        tier: 'other',
        label: 'Special',
        color: Colors.gold,
        badges: noBadges,
      });
    }

    return tiers;
  }, [badges]);

  const earnedCount = badges.filter(b => b.earned).length;

  const handleDelete = useCallback((logId: string, barName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Log',
      `Remove your log at ${barName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteLog(logId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }, [deleteLog]);

  const isBadgeUnlockable = useCallback((badge: Badge): boolean => {
    if (badge.earned) return true;
    if (!badge.prerequisiteId) return true;
    const prereq = badges.find(b => b.id === badge.prerequisiteId);
    return prereq?.earned === true;
  }, [badges]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[Colors.goldMuted + '30', Colors.dark]}
          style={styles.headerGradient}
        >
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>{user.username}</Text>

          {user.streakCount > 0 && (
            <View style={styles.streakCard}>
              <Animated.View style={{ transform: [{ scale: user.streakCount >= 3 ? flamePulse : 1 }] }}>
                <Flame size={20} color="#FF6B35" fill="#FF6B35" />
              </Animated.View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{user.streakCount}</Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
              {user.longestStreak > user.streakCount && (
                <View style={styles.bestStreak}>
                  <Text style={styles.bestStreakText}>Best: {user.longestStreak}</Text>
                </View>
              )}
            </View>
          )}

          {userTitles[user.id] && userTitles[user.id].length > 0 && (
            <View style={styles.titlesRow}>
              {userTitles[user.id].map(title => (
                <View key={title} style={styles.profileTitleBadge}>
                  <Crown size={12} color="#FFD700" />
                  <Text style={styles.profileTitleText}>{title}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.city}>
            <MapPin size={12} color={Colors.gray} /> {user.city}
          </Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Wine size={18} color={Colors.gold} />
            <Text style={styles.statValue}>{user.totalMartinis}</Text>
            <Text style={styles.statLabel}>Martinis</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Star size={18} color={Colors.gold} />
            <Text style={styles.statValue}>{user.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MapPin size={18} color={Colors.gold} />
            <Text style={styles.statValue}>{user.barsVisited}</Text>
            <Text style={styles.statLabel}>Bars</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Martini Path</Text>
            <Text style={styles.sectionCount}>{earnedCount}/{badges.length}</Text>
          </View>

          {pathData.map(tierGroup => (
            <View key={tierGroup.tier} style={styles.tierSection}>
              <View style={styles.tierHeader}>
                <View style={[styles.tierDot, { backgroundColor: tierGroup.color }]} />
                <Text style={[styles.tierLabel, { color: tierGroup.color }]}>{tierGroup.label}</Text>
                <View style={styles.tierLine} />
              </View>

              <View style={styles.pathGrid}>
                {tierGroup.badges.map((badge, idx) => {
                  const unlockable = isBadgeUnlockable(badge);
                  const prereq = badge.prerequisiteId
                    ? badges.find(b => b.id === badge.prerequisiteId)
                    : null;

                  return (
                    <View key={badge.id} style={styles.pathNodeWrap}>
                      {idx > 0 && (
                        <View style={[styles.pathConnector, badge.earned ? styles.pathConnectorActive : {}]} />
                      )}
                      <View
                        style={[
                          styles.pathNode,
                          badge.earned && styles.pathNodeEarned,
                          !badge.earned && !unlockable && styles.pathNodeLocked,
                          !badge.earned && unlockable && styles.pathNodeAvailable,
                        ]}
                      >
                        <Text style={[styles.pathIcon, !unlockable && !badge.earned && styles.pathIconLocked]}>
                          {badge.icon}
                        </Text>
                        {!badge.earned && !unlockable && (
                          <View style={styles.lockOverlay}>
                            <Lock size={12} color={Colors.gray} />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.pathName,
                          badge.earned && styles.pathNameEarned,
                          !badge.earned && !unlockable && styles.pathNameLocked,
                        ]}
                        numberOfLines={2}
                      >
                        {badge.name}
                      </Text>
                      {!badge.earned && unlockable && badge.progress != null && badge.progressMax != null && (
                        <View style={styles.miniProgress}>
                          <View style={styles.miniProgressTrack}>
                            <View
                              style={[
                                styles.miniProgressFill,
                                { width: `${Math.min((badge.progress / badge.progressMax) * 100, 100)}%`, backgroundColor: tierGroup.color },
                              ]}
                            />
                          </View>
                          <Text style={styles.miniProgressText}>{badge.progress}/{badge.progressMax}</Text>
                        </View>
                      )}
                      {!badge.earned && !unlockable && prereq && (
                        <Text style={styles.prereqText}>Needs: {prereq.name}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Logs</Text>
          {myLogs.length === 0 ? (
            <View style={styles.emptyLogs}>
              <Text style={styles.emptyEmoji}>🍸</Text>
              <Text style={styles.emptyText}>No logs yet</Text>
              <Text style={styles.emptySub}>Log your first martini!</Text>
            </View>
          ) : (
            myLogs.map(log => (
              <LogHistoryItem key={log.id} log={log} onDelete={handleDelete} />
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function LogHistoryItem({ log, onDelete }: { log: MartiniLog; onDelete: (id: string, barName: string) => void }) {
  return (
    <View style={styles.logItem}>
      <Image source={{ uri: log.photo }} style={styles.logPhoto} contentFit="cover" />
      <View style={styles.logInfo}>
        <Text style={styles.logBar}>{log.barName}</Text>
        <OliveRating rating={log.rating} size={12} />
        <View style={styles.logMeta}>
          <Text style={styles.logStyle}>{log.style}</Text>
          {log.isGoldenHourLog && (
            <View style={styles.logGoldenTag}>
              <Text style={styles.logGoldenText}>🌅 2x</Text>
            </View>
          )}
          <Text style={styles.logDate}>
            {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.deleteBtn}
        onPress={() => onDelete(log.id, log.barName)}
        hitSlop={10}
      >
        <Trash2 size={16} color={Colors.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerGradient: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.gold,
    marginBottom: 12,
  },
  name: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  username: {
    color: Colors.goldLight,
    fontSize: 15,
    marginTop: 2,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakValue: {
    color: '#FF6B35',
    fontSize: 22,
    fontWeight: '800' as const,
  },
  streakLabel: {
    color: '#FF6B35',
    fontSize: 13,
    fontWeight: '500' as const,
    opacity: 0.8,
  },
  bestStreak: {
    marginLeft: 4,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bestStreakText: {
    color: 'rgba(255, 107, 53, 0.7)',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  titlesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  profileTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  profileTitleText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  city: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    padding: 18,
    marginTop: -8,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800' as const,
  },
  statLabel: {
    color: Colors.gray,
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.darkBorder,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  sectionCount: {
    color: Colors.goldMuted,
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  tierSection: {
    marginBottom: 20,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  tierLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.darkBorder,
  },
  pathGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pathNodeWrap: {
    width: 80,
    alignItems: 'center',
  },
  pathConnector: {
    position: 'absolute',
    top: 28,
    left: -12,
    width: 12,
    height: 2,
    backgroundColor: Colors.darkBorder,
  },
  pathConnectorActive: {
    backgroundColor: Colors.gold,
  },
  pathNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkElevated,
    borderWidth: 2,
    borderColor: Colors.darkBorder,
    marginBottom: 6,
  },
  pathNodeEarned: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(212, 168, 75, 0.12)',
  },
  pathNodeLocked: {
    opacity: 0.4,
    borderColor: Colors.grayLight,
  },
  pathNodeAvailable: {
    borderColor: Colors.goldMuted,
    borderStyle: 'dashed' as const,
  },
  pathIcon: {
    fontSize: 24,
  },
  pathIconLocked: {
    opacity: 0.3,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  pathName: {
    color: Colors.whiteMuted,
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    lineHeight: 13,
  },
  pathNameEarned: {
    color: Colors.gold,
  },
  pathNameLocked: {
    color: Colors.grayLight,
  },
  miniProgress: {
    width: '100%',
    marginTop: 4,
    alignItems: 'center',
    gap: 2,
  },
  miniProgressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.darkBorder,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  miniProgressText: {
    color: Colors.gray,
    fontSize: 8,
    fontWeight: '600' as const,
  },
  prereqText: {
    color: Colors.grayLight,
    fontSize: 8,
    marginTop: 2,
    textAlign: 'center' as const,
  },
  logItem: {
    flexDirection: 'row',
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  logPhoto: {
    width: 72,
    height: 72,
  },
  logInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    gap: 4,
  },
  logBar: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logStyle: {
    color: Colors.goldMuted,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  logGoldenTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  logGoldenText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  logDate: {
    color: Colors.gray,
    fontSize: 12,
  },
  deleteBtn: {
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  emptyLogs: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  emptySub: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 20,
  },
});
