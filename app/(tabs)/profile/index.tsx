import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, Alert, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wine, MapPin, Star, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useMartini } from '@/contexts/MartiniContext';
import BadgeCard from '@/components/BadgeCard';
import OliveRating from '@/components/OliveRating';
import { Badge, MartiniLog } from '@/types';

export default function ProfileScreen() {
  const { user, badges, myLogs, deleteLog } = useMartini();
  const insets = useSafeAreaInsets();

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  const renderBadge = useCallback(({ item }: { item: Badge }) => (
    <BadgeCard badge={item} />
  ), []);

  const badgeKeyExtractor = useCallback((item: Badge) => item.id, []);

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
            <Text style={styles.sectionTitle}>Badges Earned</Text>
            <Text style={styles.sectionCount}>{earnedBadges.length}/{badges.length}</Text>
          </View>
          <FlatList
            data={earnedBadges}
            renderItem={renderBadge}
            keyExtractor={badgeKeyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeList}
            scrollEnabled
          />
        </View>

        {lockedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locked</Text>
            <FlatList
              data={lockedBadges}
              renderItem={renderBadge}
              keyExtractor={badgeKeyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgeList}
              scrollEnabled
            />
          </View>
        )}

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
    marginBottom: 12,
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
  badgeList: {
    gap: 10,
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
