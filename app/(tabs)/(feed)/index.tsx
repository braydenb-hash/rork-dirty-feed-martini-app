import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import {
  View, FlatList, StyleSheet, Text, RefreshControl,
  TextInput, Pressable, ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, X, SlidersHorizontal, Clock, Sunrise } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useMartini } from '@/contexts/MartiniContext';
import FeedCard from '@/components/FeedCard';
import { FeedSkeleton } from '@/components/SkeletonLoader';
import { MartiniLog } from '@/types';
import { MARTINI_STYLES } from '@/mocks/data';

const CITIES = ['All', 'New York', 'Brooklyn', 'Manhattan', 'Chicago'];
const RATING_FILTERS = ['All', '5 🫒', '4+ 🫒', '3+ 🫒'];

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function FeedScreen() {
  const {
    feedLogs, toggleLike, addComment, isLoading, refreshFeed,
    userStreaks, isGoldenHour, goldenHourCountdown,
  } = useMartini();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const filterHeight = useRef(new Animated.Value(0)).current;
  const goldenPulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isGoldenHour) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(goldenPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(goldenPulse, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isGoldenHour, goldenPulse]);

  const toggleFilters = useCallback(() => {
    Haptics.selectionAsync();
    const newState = !showFilters;
    setShowFilters(newState);
    Animated.spring(filterHeight, {
      toValue: newState ? 1 : 0,
      tension: 100,
      friction: 15,
      useNativeDriver: false,
    }).start();
  }, [showFilters, filterHeight]);

  const filteredLogs = useMemo(() => {
    let result = feedLogs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(log =>
        log.barName.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.notes.toLowerCase().includes(q) ||
        log.style.toLowerCase().includes(q)
      );
    }

    if (selectedCity !== 'All') {
      result = result.filter(log => log.city === selectedCity);
    }

    if (selectedStyle !== 'All') {
      result = result.filter(log => log.style === selectedStyle);
    }

    if (selectedRating !== 'All') {
      if (selectedRating === '5 🫒') result = result.filter(log => log.rating === 5);
      else if (selectedRating === '4+ 🫒') result = result.filter(log => log.rating >= 4);
      else if (selectedRating === '3+ 🫒') result = result.filter(log => log.rating >= 3);
    }

    return result;
  }, [feedLogs, searchQuery, selectedCity, selectedStyle, selectedRating]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  }, [refreshFeed]);

  const handleBarPress = useCallback((barId: string) => {
    router.push(`/bar/${barId}` as never);
  }, [router]);

  const handleUserPress = useCallback((userId: string) => {
    router.push(`/user/${userId}` as never);
  }, [router]);

  const handleComment = useCallback((logId: string, text: string) => {
    addComment(logId, text);
  }, [addComment]);

  const renderItem = useCallback(({ item }: { item: MartiniLog }) => (
    <FeedCard
      log={item}
      onLike={toggleLike}
      onComment={handleComment}
      onBarPress={handleBarPress}
      onUserPress={handleUserPress}
      streakCount={userStreaks[item.userId] ?? 0}
    />
  ), [toggleLike, handleComment, handleBarPress, handleUserPress, userStreaks]);

  const keyExtractor = useCallback((item: MartiniLog) => item.id, []);

  const hasActiveFilters = selectedCity !== 'All' || selectedStyle !== 'All' || selectedRating !== 'All';

  const clearFilters = useCallback(() => {
    setSelectedCity('All');
    setSelectedStyle('All');
    setSelectedRating('All');
    setSearchQuery('');
  }, []);

  const animatedFilterHeight = filterHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <FeedSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="feed-screen">
      <FlatList
        data={filteredLogs}
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
        ListHeaderComponent={
          <View>
            {isGoldenHour ? (
              <Animated.View style={[styles.goldenBanner, { opacity: goldenPulse }]}>
                <View style={styles.goldenBannerInner}>
                  <View style={styles.goldenLeft}>
                    <Sunrise size={22} color="#FFD700" />
                    <View>
                      <Text style={styles.goldenTitle}>Golden Hour is LIVE</Text>
                      <Text style={styles.goldenSub}>Log now for 2x bonus points!</Text>
                    </View>
                  </View>
                  <View style={styles.goldenTimer}>
                    <Clock size={14} color="#FFD700" />
                    <Text style={styles.goldenTimerText}>{formatCountdown(goldenHourCountdown)}</Text>
                  </View>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.goldenPreview}>
                <View style={styles.goldenPreviewInner}>
                  <Sunrise size={16} color={Colors.goldMuted} />
                  <Text style={styles.goldenPreviewText}>
                    Golden Hour {goldenHourCountdown < 3600
                      ? `in ${formatCountdown(goldenHourCountdown)}`
                      : 'today at 5 PM'}
                  </Text>
                  <Clock size={12} color={Colors.gray} />
                </View>
              </View>
            )}

            <View style={styles.headerBanner}>
              <Text style={styles.headerEmoji}>🍸</Text>
              <Text style={styles.headerTitle}>What's being poured</Text>
              <Text style={styles.headerSub}>{feedLogs.length} martinis in the feed</Text>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Search size={16} color={Colors.gray} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search bars, people, styles..."
                  placeholderTextColor={Colors.gray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  testID="feed-search"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <X size={16} color={Colors.gray} />
                  </Pressable>
                )}
              </View>
              <Pressable
                style={[styles.filterToggle, hasActiveFilters && styles.filterToggleActive]}
                onPress={toggleFilters}
              >
                <SlidersHorizontal size={18} color={hasActiveFilters ? Colors.dark : Colors.gold} />
              </Pressable>
            </View>

            <Animated.View style={[styles.filterContainer, { maxHeight: animatedFilterHeight, overflow: 'hidden' }]}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>City</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {CITIES.map(c => (
                    <Pressable
                      key={c}
                      style={[styles.chip, selectedCity === c && styles.chipActive]}
                      onPress={() => { setSelectedCity(c); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.chipText, selectedCity === c && styles.chipTextActive]}>{c}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Rating</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {RATING_FILTERS.map(r => (
                    <Pressable
                      key={r}
                      style={[styles.chip, selectedRating === r && styles.chipActive]}
                      onPress={() => { setSelectedRating(r); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.chipText, selectedRating === r && styles.chipTextActive]}>{r}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Style</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  <Pressable
                    style={[styles.chip, selectedStyle === 'All' && styles.chipActive]}
                    onPress={() => { setSelectedStyle('All'); Haptics.selectionAsync(); }}
                  >
                    <Text style={[styles.chipText, selectedStyle === 'All' && styles.chipTextActive]}>All</Text>
                  </Pressable>
                  {MARTINI_STYLES.map(s => (
                    <Pressable
                      key={s}
                      style={[styles.chip, selectedStyle === s && styles.chipActive]}
                      onPress={() => { setSelectedStyle(s); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.chipText, selectedStyle === s && styles.chipTextActive]}>{s}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </Animated.View>

            {hasActiveFilters && (
              <View style={styles.activeFilterBar}>
                <Text style={styles.activeFilterText}>
                  {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''}
                </Text>
                <Pressable onPress={clearFilters} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Clear all</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🫒</Text>
            <Text style={styles.emptyText}>
              {hasActiveFilters || searchQuery ? 'No matches found' : 'No martinis yet'}
            </Text>
            <Text style={styles.emptySub}>
              {hasActiveFilters || searchQuery ? 'Try adjusting your filters' : 'Be the first to log one!'}
            </Text>
            {(hasActiveFilters || searchQuery.length > 0) && (
              <Pressable onPress={clearFilters} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Clear filters</Text>
              </Pressable>
            )}
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
  list: {
    paddingBottom: 20,
  },
  goldenBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  goldenBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  goldenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  goldenTitle: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
  },
  goldenSub: {
    color: 'rgba(255, 215, 0, 0.7)',
    fontSize: 12,
    marginTop: 1,
  },
  goldenTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  goldenTimerText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  goldenPreview: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  goldenPreviewInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.darkCard,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  goldenPreviewText: {
    color: Colors.goldMuted,
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 1,
  },
  headerBanner: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSub: {
    color: Colors.gray,
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    padding: 0,
  },
  filterToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  filterToggleActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterContainer: {
    paddingHorizontal: 16,
  },
  filterSection: {
    marginBottom: 10,
  },
  filterLabel: {
    color: Colors.goldMuted,
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  chipRow: {
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.darkElevated,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  chipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  chipText: {
    color: Colors.whiteMuted,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  chipTextActive: {
    color: Colors.dark,
    fontWeight: '600' as const,
  },
  activeFilterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 4,
  },
  activeFilterText: {
    color: Colors.gray,
    fontSize: 13,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: Colors.darkElevated,
  },
  clearBtnText: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptySub: {
    color: Colors.gray,
    fontSize: 14,
    marginTop: 4,
  },
  emptyBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gold + '20',
  },
  emptyBtnText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
