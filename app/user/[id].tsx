import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Wine, Star, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useMartini } from '@/contexts/MartiniContext';
import OliveRating from '@/components/OliveRating';
import { MartiniLog } from '@/types';

const MOCK_USERS: Record<string, { name: string; username: string; avatar: string; city: string; joinedDate: string }> = {
  user_me: { name: 'Alex Rivera', username: '@alexshaken', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', city: 'New York', joinedDate: '2024-11-01' },
  user_2: { name: 'Jordan Blake', username: '@jordanb', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', city: 'New York', joinedDate: '2024-10-15' },
  user_3: { name: 'Sam Chen', username: '@samchen', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face', city: 'Chicago', joinedDate: '2024-12-01' },
  user_4: { name: 'Mia Torres', username: '@miatorres', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face', city: 'New York', joinedDate: '2024-09-20' },
  user_5: { name: 'Leo Nakamura', username: '@leonak', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', city: 'Manhattan', joinedDate: '2024-08-10' },
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { feedLogs } = useMartini();

  const userData = MOCK_USERS[id ?? ''];
  const userLogs = useMemo(() =>
    feedLogs.filter(l => l.userId === id),
  [feedLogs, id]);

  const stats = useMemo(() => {
    const total = userLogs.length;
    const avgRating = total > 0
      ? Math.round((userLogs.reduce((sum, l) => sum + l.rating, 0) / total) * 10) / 10
      : 0;
    const uniqueBars = new Set(userLogs.map(l => l.barId)).size;
    return { total, avgRating, uniqueBars };
  }, [userLogs]);

  if (!userData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>User not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.goldMuted + '25', Colors.dark]}
          style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
        >
          <Pressable style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.white} />
          </Pressable>

          <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.username}>{userData.username}</Text>
          <View style={styles.cityRow}>
            <MapPin size={12} color={Colors.gray} />
            <Text style={styles.city}>{userData.city}</Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Wine size={18} color={Colors.gold} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Martinis</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Star size={18} color={Colors.gold} />
            <Text style={styles.statValue}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MapPin size={18} color={Colors.gold} />
            <Text style={styles.statValue}>{stats.uniqueBars}</Text>
            <Text style={styles.statLabel}>Bars</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          {userLogs.length === 0 ? (
            <View style={styles.emptyLogs}>
              <Text style={styles.emptyText}>No visible logs yet</Text>
            </View>
          ) : (
            userLogs.map(log => (
              <UserLogItem key={log.id} log={log} onBarPress={(barId) => router.push(`/bar/${barId}` as never)} />
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function UserLogItem({ log, onBarPress }: { log: MartiniLog; onBarPress: (barId: string) => void }) {
  return (
    <Pressable style={styles.logItem} onPress={() => onBarPress(log.barId)}>
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
    </Pressable>
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
  backBtn: {
    position: 'absolute' as const,
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerGradient: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.gold,
    marginBottom: 14,
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
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  city: {
    color: Colors.gray,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    padding: 18,
    marginTop: -10,
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
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 14,
  },
  emptyLogs: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 14,
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
  bottomSpacer: {
    height: 40,
  },
});
