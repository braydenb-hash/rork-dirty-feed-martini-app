import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MapPin, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { MartiniLog } from '@/types';
import OliveRating from './OliveRating';

interface FeedCardProps {
  log: MartiniLog;
  onLike: (id: string) => void;
  onBarPress?: (barId: string) => void;
  onUserPress?: (userId: string) => void;
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function FeedCardInner({ log, onLike, onBarPress, onUserPress }: FeedCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onLike(log.id);
  }, [log.id, onLike, scaleAnim]);

  return (
    <View style={styles.card} testID={`feed-card-${log.id}`}>
      <View style={styles.header}>
        <Pressable onPress={() => onUserPress?.(log.userId)}>
          <Image source={{ uri: log.userAvatar }} style={styles.avatar} />
        </Pressable>
        <View style={styles.headerText}>
          <Pressable onPress={() => onUserPress?.(log.userId)}>
            <Text style={styles.userName}>{log.userName}</Text>
          </Pressable>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.goldMuted} />
            <Pressable onPress={() => onBarPress?.(log.barId)}>
              <Text style={styles.barName}>{log.barName}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={11} color={Colors.gray} />
          <Text style={styles.timeText}>{formatTimeAgo(log.timestamp)}</Text>
        </View>
      </View>

      <Image source={{ uri: log.photo }} style={styles.photo} contentFit="cover" />

      <View style={styles.content}>
        <View style={styles.ratingRow}>
          <OliveRating rating={log.rating} size={16} />
          <View style={styles.styleBadge}>
            <Text style={styles.styleText}>{log.style}</Text>
          </View>
        </View>

        <Text style={styles.notes} numberOfLines={3}>{log.notes}</Text>

        <View style={styles.footer}>
          <Pressable onPress={handleLike} style={styles.likeButton} hitSlop={10}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Heart
                size={20}
                color={log.liked ? '#E25555' : Colors.gray}
                fill={log.liked ? '#E25555' : 'transparent'}
              />
            </Animated.View>
            <Text style={[styles.likeCount, log.liked && styles.likeCountActive]}>
              {log.likes}
            </Text>
          </Pressable>
          <Text style={styles.cityText}>{log.city}</Text>
        </View>
      </View>
    </View>
  );
}

export default React.memo(FeedCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.goldMuted,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  barName: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    color: Colors.gray,
    fontSize: 12,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
  },
  content: {
    padding: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  styleBadge: {
    backgroundColor: Colors.darkElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
  },
  styleText: {
    color: Colors.goldLight,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  notes: {
    color: Colors.whiteMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCount: {
    color: Colors.gray,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  likeCountActive: {
    color: '#E25555',
  },
  cityText: {
    color: Colors.gray,
    fontSize: 12,
  },
});
