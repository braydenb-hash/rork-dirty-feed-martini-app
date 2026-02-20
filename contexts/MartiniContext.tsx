import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { MartiniLog, Badge, Comment, LeaderboardEntry, LeaderboardTitle, BarMayorship } from '@/types';
import { MOCK_FEED, MY_LOGS, CURRENT_USER, ALL_BADGES, MOCK_USER_STREAKS } from '@/mocks/data';

const LOGS_KEY = 'dirty_feed_logs';
const MY_LOGS_KEY = 'dirty_feed_my_logs';
const FEED_KEY = 'dirty_feed_feed';
const STREAK_KEY = 'dirty_feed_streak';

interface StreakData {
  count: number;
  longest: number;
  lastLogDate: string | null;
}

function computeStreak(currentStreak: StreakData, newLogTimestamp: string): StreakData {
  if (!currentStreak.lastLogDate) {
    return { count: 1, longest: Math.max(currentStreak.longest, 1), lastLogDate: newLogTimestamp };
  }

  const lastLog = new Date(currentStreak.lastLogDate);
  const newLog = new Date(newLogTimestamp);
  const diffMs = newLog.getTime() - lastLog.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  let newCount = currentStreak.count;
  if (diffHours >= 24 && diffHours <= 48) {
    newCount = currentStreak.count + 1;
  } else if (diffHours < 24) {
    newCount = currentStreak.count;
  } else {
    newCount = 1;
  }

  return {
    count: newCount,
    longest: Math.max(currentStreak.longest, newCount),
    lastLogDate: newLogTimestamp,
  };
}

function checkGoldenHour(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 17 && hour < 18;
}

function getGoldenHourEnd(): Date {
  const now = new Date();
  const end = new Date(now);
  end.setHours(18, 0, 0, 0);
  if (now >= end) {
    end.setDate(end.getDate() + 1);
  }
  return end;
}

function getGoldenHourStart(): Date {
  const now = new Date();
  const start = new Date(now);
  start.setHours(17, 0, 0, 0);
  if (now.getHours() >= 18) {
    start.setDate(start.getDate() + 1);
  }
  return start;
}

const TITLE_MAP: Record<string, LeaderboardTitle> = {
  most_poured: 'The Brine King',
  city_connoisseur: 'The Golden Garnish',
  bar_hopper: 'The Urban Legend',
};

export const [MartiniProvider, useMartini] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [feedLogs, setFeedLogs] = useState<MartiniLog[]>(MOCK_FEED);
  const [myLogs, setMyLogs] = useState<MartiniLog[]>(MY_LOGS);
  const [user, setUser] = useState(CURRENT_USER);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Badge[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    count: CURRENT_USER.streakCount,
    longest: CURRENT_USER.longestStreak,
    lastLogDate: CURRENT_USER.lastLogDate ?? null,
  });
  const [isGoldenHour, setIsGoldenHour] = useState<boolean>(checkGoldenHour());
  const [goldenHourCountdown, setGoldenHourCountdown] = useState<number>(0);
  const previousBadgeIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const updateGoldenHour = () => {
      const active = checkGoldenHour();
      setIsGoldenHour(active);

      if (active) {
        const end = getGoldenHourEnd();
        const remaining = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
        setGoldenHourCountdown(remaining);
      } else {
        const start = getGoldenHourStart();
        const until = Math.max(0, Math.floor((start.getTime() - Date.now()) / 1000));
        setGoldenHourCountdown(until);
      }
    };

    updateGoldenHour();
    const interval = setInterval(updateGoldenHour, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const streakQuery = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      if (stored) {
        return JSON.parse(stored) as StreakData;
      }
      return { count: CURRENT_USER.streakCount, longest: CURRENT_USER.longestStreak, lastLogDate: CURRENT_USER.lastLogDate ?? null };
    },
  });

  useEffect(() => {
    if (streakQuery.data) {
      setStreakData(streakQuery.data);
    }
  }, [streakQuery.data]);

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

  const saveStreakMutation = useMutation({
    mutationFn: async (data: StreakData) => {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
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
    const hasGoldenHourLog = logs.some(l => l.isGoldenHourLog === true);
    const filthyCount = logs.filter(l => l.style === 'Filthy').length;

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
        case 'golden_hour':
          earned = hasGoldenHourLog;
          progress = hasGoldenHourLog ? 1 : 0;
          progressMax = 1;
          break;
        case 'filthy_rich':
          earned = filthyCount >= 5;
          progress = Math.min(filthyCount, 5);
          progressMax = 5;
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
    const isGH = checkGoldenHour();
    const enrichedLog: MartiniLog = {
      ...log,
      isGoldenHourLog: isGH,
      likes: isGH ? (log.likes || 0) + 2 : log.likes,
    };

    const updatedMyLogs = [enrichedLog, ...myLogs];
    const updatedFeed = [enrichedLog, ...feedLogs];
    setMyLogs(updatedMyLogs);
    setFeedLogs(updatedFeed);
    saveMutation.mutate(updatedMyLogs);
    saveFeedMutation.mutate(updatedFeed);

    const newStreak = computeStreak(streakData, log.timestamp);
    setStreakData(newStreak);
    saveStreakMutation.mutate(newStreak);
    console.log('Streak updated:', newStreak.count, '| Longest:', newStreak.longest);
    if (isGH) {
      console.log('Golden Hour bonus applied!');
    }

    console.log('Added martini log:', log.id);
    return computeBadges(updatedMyLogs).filter(b => b.earned && !previousBadgeIds.current.has(b.id));
  }, [myLogs, feedLogs, saveMutation, saveFeedMutation, computeBadges, streakData, saveStreakMutation]);

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
    await queryClient.invalidateQueries({ queryKey: ['streak'] });
    console.log('Feed refreshed');
  }, [queryClient]);

  const userStreaks = useMemo(() => {
    const streaks: Record<string, number> = { ...MOCK_USER_STREAKS };
    streaks[user.id] = streakData.count;
    return streaks;
  }, [streakData.count, user.id]);

  const activeBars = useMemo(() => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const barActivity: Record<string, number> = {};
    feedLogs.forEach(log => {
      if (log.timestamp >= twoHoursAgo) {
        barActivity[log.barId] = (barActivity[log.barId] || 0) + 1;
      }
    });
    return barActivity;
  }, [feedLogs]);

  const barMayorships = useMemo(() => {
    const barUserCounts: Record<string, Record<string, { count: number; name: string; avatar: string }>> = {};
    feedLogs.forEach(log => {
      if (!barUserCounts[log.barId]) {
        barUserCounts[log.barId] = {};
      }
      if (!barUserCounts[log.barId][log.userId]) {
        barUserCounts[log.barId][log.userId] = { count: 0, name: log.userName, avatar: log.userAvatar };
      }
      barUserCounts[log.barId][log.userId].count++;
    });

    const mayorships: Record<string, BarMayorship> = {};
    Object.entries(barUserCounts).forEach(([barId, users]) => {
      let topUserId = '';
      let topCount = 0;
      let topName = '';
      let topAvatar = '';
      Object.entries(users).forEach(([userId, data]) => {
        if (data.count > topCount) {
          topCount = data.count;
          topUserId = userId;
          topName = data.name;
          topAvatar = data.avatar;
        }
      });
      if (topUserId) {
        mayorships[barId] = {
          barId,
          userId: topUserId,
          userName: topName,
          userAvatar: topAvatar,
          logCount: topCount,
        };
      }
    });
    return mayorships;
  }, [feedLogs]);

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
      .map((entry, i) => ({
        ...entry,
        rank: i + 1,
        title: i === 0 ? TITLE_MAP['most_poured'] : undefined,
      }));

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
      .map((entry, i) => ({
        ...entry,
        rank: i + 1,
        title: i === 0 ? TITLE_MAP['city_connoisseur'] : undefined,
      }));

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
      .map((entry, i) => ({
        ...entry,
        rank: i + 1,
        title: i === 0 ? TITLE_MAP['bar_hopper'] : undefined,
      }));

    return {
      most_poured: mostPoured,
      city_connoisseur: connoisseur,
      bar_hopper: barHopper,
    };
  }, [feedLogs]);

  const userTitles = useMemo(() => {
    const titles: Record<string, LeaderboardTitle[]> = {};
    const categories: Array<'most_poured' | 'city_connoisseur' | 'bar_hopper'> = ['most_poured', 'city_connoisseur', 'bar_hopper'];
    categories.forEach(cat => {
      const leader = leaderboards[cat][0];
      if (leader) {
        if (!titles[leader.userId]) titles[leader.userId] = [];
        titles[leader.userId].push(TITLE_MAP[cat]);
      }
    });
    return titles;
  }, [leaderboards]);

  return {
    feedLogs,
    myLogs,
    user: {
      ...user,
      badges,
      streakCount: streakData.count,
      longestStreak: streakData.longest,
      lastLogDate: streakData.lastLogDate ?? undefined,
    },
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
    userStreaks,
    activeBars,
    userTitles,
    isGoldenHour,
    goldenHourCountdown,
    barMayorships,
  };
});
