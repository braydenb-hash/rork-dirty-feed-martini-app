import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Flame, Star, MapPinned, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useMartini } from '@/contexts/MartiniContext';
import LeaderboardRow from '@/components/LeaderboardRow';
import { LeaderboardEntry, LeaderboardType } from '@/types';

const TABS: { key: LeaderboardType; label: string; icon: React.ReactNode }[] = [
  { key: 'most_poured', label: 'Most Poured', icon: <Flame size={16} color={Colors.gold} /> },
  { key: 'city_connoisseur', label: 'Connoisseur', icon: <Star size={16} color={Colors.gold} /> },
  { key: 'bar_hopper', label: 'Bar Hopper', icon: <MapPinned size={16} color={Colors.gold} /> },
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('most_poured');
  const [refreshing, setRefreshing] = useState(false);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { leaderboards, refreshFeed } = useMartini();

  const switchTab = useCallback((tab: LeaderboardType, index: number) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 300,
      friction: 30,
    }).start();
  }, [indicatorAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  }, [refreshFeed]);

  const handleUserPress = useCallback((userId: string) => {
    router.push(`/user/${userId}` as never);
  }, [router]);

  const data = leaderboards[activeTab];

  const renderItem = useCallback(({ item }: { item: LeaderboardEntry }) => (
    <LeaderboardRow entry={item} isCurrentUser={item.userId === 'user_me'} onPress={handleUserPress} />
  ), [handleUserPress]);

  const keyExtractor = useCallback((item: LeaderboardEntry) => `${activeTab}-${item.rank}`, [activeTab]);

  return (
    <View style={styles.container} testID="leaderboard-screen">
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => switchTab(tab.key, index)}
          >
            {tab.icon}
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {data.length >= 3 ? (
        <View style={styles.podium}>
          {data.slice(0, 3).map((entry, index) => (
            <Pressable
              key={entry.userId}
              style={[
                styles.podiumItem,
                index === 0 && styles.podiumFirst,
                index === 1 && styles.podiumSecond,
                index === 2 && styles.podiumThird,
              ]}
              onPress={() => handleUserPress(entry.userId)}
            >
              <Text style={styles.podiumRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </Text>
              <View style={[styles.podiumAvatarWrap, index === 0 && styles.podiumAvatarWrapFirst]}>
                <Image
                  source={{ uri: entry.userAvatar }}
                  style={[styles.podiumAvatar, index === 0 && styles.podiumAvatarFirst]}
                />
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{entry.userName.split(' ')[0]}</Text>
              {entry.title && (
                <View style={styles.podiumTitle}>
                  <Crown size={9} color="#FFD700" />
                  <Text style={styles.podiumTitleText} numberOfLines={1}>{entry.title}</Text>
                </View>
              )}
              <Text style={styles.podiumValue}>
                {Number.isInteger(entry.value) ? entry.value : entry.value.toFixed(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyPodium}>
          <Text style={styles.emptyPodiumText}>Log more martinis to fill the podium!</Text>
        </View>
      )}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
            progressBackgroundColor={Colors.darkCard}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyEmoji}>🍸</Text>
            <Text style={styles.emptyText}>No rankings yet</Text>
            <Text style={styles.emptySub}>Start logging to climb the board!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: Colors.darkCard,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },
  tabActive: {
    backgroundColor: Colors.darkElevated,
  },
  tabText: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  tabTextActive: {
    color: Colors.gold,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  podiumItem: {
    alignItems: 'center',
    width: 90,
  },
  podiumFirst: {
    marginBottom: 16,
  },
  podiumSecond: {
    marginBottom: 0,
  },
  podiumThird: {
    marginBottom: 0,
  },
  podiumRank: {
    fontSize: 24,
    marginBottom: 6,
  },
  podiumAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.goldMuted,
    overflow: 'hidden',
    marginBottom: 6,
  },
  podiumAvatarWrapFirst: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderColor: Colors.gold,
    borderWidth: 3,
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  podiumAvatarFirst: {
    borderRadius: 34,
  },
  podiumName: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  podiumTitle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  podiumTitleText: {
    color: '#FFD700',
    fontSize: 9,
    fontWeight: '700' as const,
  },
  podiumValue: {
    color: Colors.goldLight,
    fontSize: 16,
    fontWeight: '800' as const,
    marginTop: 2,
  },
  list: {
    paddingBottom: 20,
  },
  emptyPodium: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyPodiumText: {
    color: Colors.gray,
    fontSize: 14,
  },
  emptyList: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptySub: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 4,
  },
});
