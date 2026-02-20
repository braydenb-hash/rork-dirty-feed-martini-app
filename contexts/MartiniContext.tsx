import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { MartiniLog, Badge } from '@/types';
import { MOCK_FEED, MY_LOGS, CURRENT_USER, ALL_BADGES } from '@/mocks/data';

const LOGS_KEY = 'dirty_feed_logs';
const MY_LOGS_KEY = 'dirty_feed_my_logs';

export const [MartiniProvider, useMartini] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [feedLogs, setFeedLogs] = useState<MartiniLog[]>(MOCK_FEED);
  const [myLogs, setMyLogs] = useState<MartiniLog[]>(MY_LOGS);
  const [user, setUser] = useState(CURRENT_USER);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Badge[]>([]);
  const previousBadgeIds = useRef<Set<string>>(new Set());

  const myLogsQuery = useQuery({
    queryKey: ['myLogs'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(MY_LOGS_KEY);
      if (stored) {
        return JSON.parse(stored) as MartiniLog[];
      }
      return MY_LOGS;
    },
  });

  useEffect(() => {
    if (myLogsQuery.data) {
      setMyLogs(myLogsQuery.data);
      setUser(prev => ({
        ...prev,
        totalMartinis: myLogsQuery.data.length,
        averageRating: myLogsQuery.data.length > 0
          ? Math.round((myLogsQuery.data.reduce((sum, l) => sum + l.rating, 0) / myLogsQuery.data.length) * 10) / 10
          : 0,
        barsVisited: new Set(myLogsQuery.data.map(l => l.barId)).size,
      }));
    }
  }, [myLogsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (logs: MartiniLog[]) => {
      await AsyncStorage.setItem(MY_LOGS_KEY, JSON.stringify(logs));
      return logs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLogs'] });
    },
  });

  const computeBadges = useCallback((logs: MartiniLog[]): Badge[] => {
    const totalMartinis = logs.length;
    const uniqueBars = new Set(logs.map(l => l.barId)).size;
    const hasRated5 = logs.some(l => l.rating === 5);
    const uniqueCities = new Set(logs.map(l => l.city)).size;
    const avgRating = totalMartinis > 0
      ? logs.reduce((sum, l) => sum + l.rating, 0) / totalMartinis
      : 0;
    const hasNightLog = logs.some(l => {
      const hour = new Date(l.timestamp).getHours();
      return hour >= 0 && hour < 5;
    });

    return ALL_BADGES.map(badge => {
      let earned = false;
      switch (badge.id) {
        case 'first_martini': earned = totalMartinis >= 1; break;
        case 'stirred_not_shaken': earned = uniqueBars >= 5; break;
        case 'dirty_dozen': earned = totalMartinis >= 12; break;
        case 'olive_branch': earned = hasRated5; break;
        case 'connoisseur': earned = avgRating >= 4 && totalMartinis >= 5; break;
        case 'night_owl': earned = hasNightLog; break;
        case 'globe_trotter': earned = uniqueCities >= 3; break;
        case 'top_shelf': earned = totalMartinis >= 50; break;
        default: earned = badge.earned; break;
      }
      return { ...badge, earned, earnedDate: earned ? (badge.earnedDate ?? new Date().toISOString()) : undefined };
    });
  }, []);

  const badges = useMemo(() => computeBadges(myLogs), [myLogs, computeBadges]);

  useEffect(() => {
    const earnedIds = new Set(badges.filter(b => b.earned).map(b => b.id));
    if (previousBadgeIds.current.size > 0) {
      const newOnes = badges.filter(b => b.earned && !previousBadgeIds.current.has(b.id));
      if (newOnes.length > 0) {
        setNewlyEarnedBadges(newOnes);
        console.log('New badges earned:', newOnes.map(b => b.name));
      }
    }
    previousBadgeIds.current = earnedIds;
  }, [badges]);

  const addLog = useCallback((log: MartiniLog) => {
    const updatedMyLogs = [log, ...myLogs];
    const updatedFeed = [log, ...feedLogs];
    setMyLogs(updatedMyLogs);
    setFeedLogs(updatedFeed);
    saveMutation.mutate(updatedMyLogs);
    console.log('Added martini log:', log.id);
    return computeBadges(updatedMyLogs).filter(b => b.earned && !previousBadgeIds.current.has(b.id));
  }, [myLogs, feedLogs, saveMutation, computeBadges]);

  const toggleLike = useCallback((logId: string) => {
    setFeedLogs(prev => prev.map(log =>
      log.id === logId
        ? { ...log, liked: !log.liked, likes: log.liked ? log.likes - 1 : log.likes + 1 }
        : log
    ));
  }, []);

  const clearNewBadges = useCallback(() => {
    setNewlyEarnedBadges([]);
  }, []);

  const refreshFeed = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log('Feed refreshed');
  }, []);

  return {
    feedLogs,
    myLogs,
    user: { ...user, badges },
    addLog,
    toggleLike,
    badges,
    isLoading: myLogsQuery.isLoading,
    newlyEarnedBadges,
    clearNewBadges,
    refreshFeed,
  };
});
