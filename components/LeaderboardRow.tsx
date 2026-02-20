import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Crown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LeaderboardEntry } from '@/types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  onPress?: (userId: string) => void;
}

function LeaderboardRowInner({ entry, isCurrentUser = false, onPress }: LeaderboardRowProps) {
  const isTop3 = entry.rank <= 3;
  const rankColors = ['#D4A84B', '#A8A8A8', '#CD7F32'];

  return (
    <Pressable
      style={[styles.row, isCurrentUser && styles.rowHighlight]}
      onPress={() => onPress?.(entry.userId)}
      testID={`leaderboard-row-${entry.rank}`}
    >
      <View style={[styles.rankContainer, isTop3 && { backgroundColor: rankColors[entry.rank - 1] + '20' }]}>
        <Text style={[styles.rank, isTop3 && { color: rankColors[entry.rank - 1] }]}>
          {entry.rank}
        </Text>
      </View>
      <Image source={{ uri: entry.userAvatar }} style={[styles.avatar, isTop3 && styles.avatarTop3]} />
      <View style={styles.info}>
        <View style={styles.nameColumn}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, isCurrentUser && styles.nameHighlight]}>{entry.userName}</Text>
            {isCurrentUser && <Text style={styles.youBadge}>You</Text>}
          </View>
          {entry.title && (
            <View style={styles.titleBadge}>
              <Crown size={10} color="#FFD700" />
              <Text style={styles.titleText}>{entry.title}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, isTop3 && styles.valueTop3]}>
          {Number.isInteger(entry.value) ? entry.value : entry.value.toFixed(1)}
        </Text>
        <Text style={styles.label}>{entry.label}</Text>
      </View>
    </Pressable>
  );
}

export default React.memo(LeaderboardRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 12,
  },
  rowHighlight: {
    backgroundColor: Colors.gold + '10',
    borderWidth: 1,
    borderColor: Colors.goldMuted + '40',
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rank: {
    color: Colors.gray,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarTop3: {
    borderWidth: 2,
    borderColor: Colors.goldMuted,
  },
  info: {
    flex: 1,
  },
  nameColumn: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  titleBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  titleText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  name: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  nameHighlight: {
    color: Colors.gold,
  },
  youBadge: {
    backgroundColor: Colors.gold + '20',
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '700' as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  valueTop3: {
    color: Colors.gold,
  },
  label: {
    color: Colors.gray,
    fontSize: 11,
    marginTop: 1,
  },
});
