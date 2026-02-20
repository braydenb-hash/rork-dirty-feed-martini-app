import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { MartiniLog, Badge, Comment, LeaderboardEntry } from '@/types';
import { MOCK_FEED, MY_LOGS, CURRENT_USER, ALL_BADGES } from '@/mocks/data';

const LOGS_KEY = 'dirty_feed_logs';
const MY_LOGS_KEY = 'dirty_feed_my_logs';
const FEED_KEY = 'dirty_feed_feed';

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

  const feedQuery = useQuery({
    queryKey: ['feedLogs'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FEED_KEY);
      if (stored) {
        return JSON.parse(stored) as MartiniLog[];
      }
      return MOCK_FEED;
    },
  });

  useEffect(() => {
    if (feedQuery.data) {
      setFeedLogs(feedQuery.data);
    }
  }, [feedQuery.data]);

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

  const saveFeedMutation = useMutation({
    mutationFn: async (logs: MartiniLog[]) => {
      await AsyncStorage.setItem(FEED_KEY, JSON.stringify(logs));
      return logs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedLogs'] });
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
      let progress = 0;
      let progressMax = 1;

      switch (badge.id) {
        case 'first_martini':
          earned = totalMartinis >= 1;
          progress = Math.min(totalMartinis, 1);
          progressMax = 1;
          break;
        case 'stirred_not_shaken':
          earned = uniqueBars >= 5;
          progress = Math.min(uniqueBars, 5);
          progressMax = 5;
          break;
        case 'dirty_dozen':
          earned = totalMartinis >= 12;
          progress = Math.min(totalMartinis, 12);
          progressMax = 12;
          break;
        case 'olive_branch':
          earned = hasRated5;
          progress = hasRated5 ? 1 : 0;
          progressMax = 1;
          break;
        case 'connoisseur':
          earned = avgRating >= 4 && totalMartinis >= 5;
          progress = totalMartinis >= 5 ? (avgRating >= 4 ? 1 : 0) : Math.min(totalMartinis, 5);
          progressMax = totalMartinis >= 5 ? 1 : 5;
          break;
        case 'night_owl':
          earned = hasNightLog;
          progress = hasNightLog ? 1 : 0;
          progressMax = 1;
          break;
        case 'globe_trotter':
          earned = uniqueCities >= 3;
          progress = Math.min(uniqueCities, 3);
          progressMax = 3;
          break;
        case 'top_shelf':
          earned = totalMartinis >= 50;
          progress = Math.min(totalMartinis, 50);
          progressMax = 50;
          break;
        default:
          earned = badge.earned;
          break;
      }
      return {
        ...badge,
        earned,
        earnedDate: earned ? (badge.earnedDate ?? new Date().toISOString()) : undefined,
        progress,
        progressMax,
      };
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
    saveFeedMutation.mutate(updatedFeed);
    console.log('Added martini log:', log.id);
    return computeBadges(updatedMyLogs).filter(b => b.earned && !previousBadgeIds.current.has(b.id));
  }, [myLogs, feedLogs, saveMutation, saveFeedMutation, computeBadges]);

  const deleteLog = useCallback((logId: string) => {
    const updatedMyLogs = myLogs.filter(l => l.id !== logId);
    const updatedFeed = feedLogs.filter(l => l.id !== logId);
    setMyLogs(updatedMyLogs);
    setFeedLogs(updatedFeed);
    saveMutation.mutate(updatedMyLogs);
    saveFeedMutation.mutate(updatedFeed);
    console.log('Deleted martini log:', logId);
  }, [myLogs, feedLogs, saveMutation, saveFeedMutation]);

  const toggleLike = useCallback((logId: string) => {
    const updated = feedLogs.map(log =>
      log.id === logId
        ? { ...log, liked: !log.liked, likes: log.liked ? log.likes - 1 : log.likes + 1 }
        : log
    );
    setFeedLogs(updated);
    saveFeedMutation.mutate(updated);
  }, [feedLogs, saveFeedMutation]);

  const addComment = useCallback((logId: string, text: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text,
      timestamp: new Date().toISOString(),
    };
    const updated = feedLogs.map(log =>
      log.id === logId
        ? { ...log, comments: [...(log.comments ?? []), newComment] }
        : log
    );
    setFeedLogs(updated);
    saveFeedMutation.mutate(updated);
    console.log('Added comment to log:', logId);
  }, [feedLogs, user, saveFeedMutation]);

  const clearNewBadges = useCallback(() => {
    setNewlyEarnedBadges([]);
  }, []);

  const refreshFeed = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['feedLogs'] });
    await queryClient.invalidateQueries({ queryKey: ['myLogs'] });
    console.log('Feed refreshed');
  }, [queryClient]);

  const leaderboards = useMemo(() => {
    const allLogs = feedLogs;
    const userMap = new Map<string, { logs: MartiniLog[]; avatar: string; name: string }>();

    allLogs.forEach(log => {
      const existing = userMap.get(log.userId);
      if (existing) {
        existing.logs.push(log);
      } else {
        userMap.set(log.userId, {
          logs: [log],
          avatar: log.userAvatar,
          name: log.userName,
        });
      }
    });

    const mostPoured: LeaderboardEntry[] = Array.from(userMap.entries())
      .map(([userId, data]) => ({
        rank: 0,
        userId,
        userName: data.name,
        userAvatar: data.avatar,
        value: data.logs.length,
        label: 'martinis',
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    const connoisseur: LeaderboardEntry[] = Array.from(userMap.entries())
      .map(([userId, data]) => ({
        rank: 0,
        userId,
        userName: data.name,
        userAvatar: data.avatar,
        value: Math.round((data.logs.reduce((s, l) => s + l.rating, 0) / data.logs.length) * 10) / 10,
        label: 'avg olives',
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    const barHopper: LeaderboardEntry[] = Array.from(userMap.entries())
      .map(([userId, data]) => ({
        rank: 0,
        userId,
        userName: data.name,
        userAvatar: data.avatar,
        value: new Set(data.logs.map(l => l.barId)).size,
        label: 'bars',
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    return {
      most_poured: mostPoured,
      city_connoisseur: connoisseur,
      bar_hopper: barHopper,
    };
  }, [feedLogs]);

  return {
    feedLogs,
    myLogs,
    user: { ...user, badges },
    addLog,
    deleteLog,
    toggleLike,
    addComment,
    badges,
    isLoading: myLogsQuery.isLoading,
    newlyEarnedBadges,
    clearNewBadges,
    refreshFeed,
    leaderboards,
  };
});
