import React, { useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, TextInput, Share, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MapPin, Clock, MessageCircle, Send, Share2, Flame, Sunrise } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/themes';
import { MartiniLog, Comment } from '@/types';
import OliveRating from './OliveRating';

interface FeedCardProps {
  log: MartiniLog;
  onLike: (id: string) => void;
  onComment?: (id: string, text: string) => void;
  onBarPress?: (barId: string) => void;
  onUserPress?: (userId: string) => void;
  streakCount?: number;
  xpProgress?: number;
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

function FeedCardInner({ log, onLike, onComment, onBarPress, onUserPress, streakCount, xpProgress }: FeedCardProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flamePulse = useRef(new Animated.Value(1)).current;
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const comments = log.comments ?? [];

  const xp = xpProgress ?? (log.rating / 5);

  React.useEffect(() => {
    if (streakCount && streakCount >= 3) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(flamePulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(flamePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [streakCount, flamePulse]);

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.spring(scaleAnim, {
      toValue: 1.35,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    });
    onLike(log.id);
  }, [log.id, onLike, scaleAnim]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${log.userName} rated a ${log.style} martini ${log.rating}/5 olives at ${log.barName}! "${log.notes}" — Dirty Feed 🍸`,
      });
    } catch (e) {
      console.log('Share cancelled or failed:', e);
    }
  }, [log]);

  const handleSubmitComment = useCallback(() => {
    if (!commentText.trim() || !onComment) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComment(log.id, commentText.trim());
    setCommentText('');
  }, [log.id, commentText, onComment]);

  const toggleComments = useCallback(() => {
    Haptics.selectionAsync();
    setShowComments(prev => !prev);
  }, []);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.bgBorder,
        },
      ]}
      testID={`feed-card-${log.id}`}
    >
      <View style={[styles.xpBarContainer, { backgroundColor: theme.xpBarBg }]}>
        <View
          style={[
            styles.xpBarFill,
            {
              backgroundColor: theme.xpBar,
              width: `${Math.min(xp * 100, 100)}%`,
            },
          ]}
        />
      </View>

      <LinearGradient
        colors={[theme.glassHighlight, 'transparent']}
        style={styles.glassHighlight}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <View style={styles.header}>
        <Pressable onPress={() => onUserPress?.(log.userId)}>
          <Image source={{ uri: log.userAvatar }} style={[styles.avatar, { borderColor: theme.accentMuted }]} />
        </Pressable>
        <View style={styles.headerText}>
          <View style={styles.userNameRow}>
            <Pressable onPress={() => onUserPress?.(log.userId)}>
              <Text style={[styles.userName, { color: theme.textPrimary, fontFamily: Fonts.prestigeRegular }]}>{log.userName}</Text>
            </Pressable>
            {streakCount != null && streakCount > 0 && (
              <Animated.View style={[styles.streakBadge, { transform: [{ scale: streakCount >= 3 ? flamePulse : 1 }] }]}>
                <Flame size={11} color="#FF6B35" fill="#FF6B35" />
                <Text style={styles.streakText}>{streakCount}</Text>
              </Animated.View>
            )}
          </View>
          <View style={styles.locationRow}>
            <MapPin size={12} color={theme.accentMuted} />
            <Pressable onPress={() => onBarPress?.(log.barId)}>
              <Text style={[styles.barName, { color: theme.accent, fontFamily: Fonts.dataLight }]}>{log.barName}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={11} color={theme.textDim} />
          <Text style={[styles.timeText, { color: theme.textDim, fontFamily: Fonts.dataLight }]}>{formatTimeAgo(log.timestamp)}</Text>
        </View>
      </View>

      <Image source={{ uri: log.photo }} style={styles.photo} contentFit="cover" />

      <View style={styles.content}>
        <View style={styles.ratingRow}>
          <OliveRating rating={log.rating} size={16} />
          <View style={[styles.styleBadge, { backgroundColor: theme.bgElevated, borderColor: theme.accentMuted }]}>
            <Text style={[styles.styleText, { color: theme.accentLight, fontFamily: Fonts.data }]}>{log.style}</Text>
          </View>
        </View>

        <Text style={[styles.notes, { color: theme.textSecondary, fontFamily: Fonts.prestigeRegular }]} numberOfLines={3}>{log.notes}</Text>

        {log.isGoldenHourLog && (
          <View style={styles.goldenHourChip}>
            <Sunrise size={11} color="#FFD700" />
            <Text style={[styles.goldenHourChipText, { fontFamily: Fonts.dataBold }]}>Golden Hour · 2x</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <Pressable onPress={handleLike} style={styles.actionButton} hitSlop={10}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Heart
                  size={20}
                  color={log.liked ? '#E25555' : theme.textMuted}
                  fill={log.liked ? '#E25555' : 'transparent'}
                />
              </Animated.View>
              <Text style={[styles.actionCount, { color: log.liked ? '#E25555' : theme.textMuted, fontFamily: Fonts.data }]}>
                {log.likes}
              </Text>
            </Pressable>

            <Pressable onPress={toggleComments} style={styles.actionButton} hitSlop={10}>
              <MessageCircle size={19} color={comments.length > 0 ? theme.accent : theme.textMuted} />
              {comments.length > 0 && (
                <Text style={[styles.actionCountAccent, { color: theme.accent, fontFamily: Fonts.data }]}>{comments.length}</Text>
              )}
            </Pressable>

            <Pressable onPress={handleShare} style={styles.actionButton} hitSlop={10}>
              <Share2 size={18} color={theme.textMuted} />
            </Pressable>
          </View>
          <Text style={[styles.cityText, { color: theme.textDim, fontFamily: Fonts.dataLight }]}>{log.city}</Text>
        </View>

        {showComments && (
          <View style={[styles.commentsSection, { borderTopColor: theme.bgBorder }]}>
            {comments.length > 0 && (
              <View style={styles.commentsList}>
                {comments.slice(-3).map(comment => (
                  <View key={comment.id} style={styles.commentRow}>
                    <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
                    <View style={[styles.commentBubble, { backgroundColor: theme.bgElevated }]}>
                      <Text style={[styles.commentUser, { color: theme.accent, fontFamily: Fonts.dataBold }]}>{comment.userName}</Text>
                      <Text style={[styles.commentTextDisplay, { color: theme.textSecondary }]}>{comment.text}</Text>
                    </View>
                  </View>
                ))}
                {comments.length > 3 && (
                  <Text style={[styles.moreComments, { color: theme.textMuted, fontFamily: Fonts.data }]}>
                    View all {comments.length} comments
                  </Text>
                )}
              </View>
            )}
            <View style={[styles.commentInput, { backgroundColor: theme.bgElevated }]}>
              <TextInput
                style={[styles.commentTextInput, { color: theme.textPrimary }]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={handleSubmitComment}
                returnKeyType="send"
              />
              {commentText.trim().length > 0 && (
                <Pressable onPress={handleSubmitComment} style={styles.commentSend} hitSlop={8}>
                  <Send size={16} color={theme.accent} />
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export default React.memo(FeedCardInner);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  xpBarContainer: {
    height: 2,
    width: '100%',
  },
  xpBarFill: {
    height: 2,
    borderRadius: 1,
  },
  glassHighlight: {
    height: 1,
    width: '100%',
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
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  userNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  streakBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  streakText: {
    color: '#FF6B35',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  barName: {
    fontSize: 13,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  styleText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  actionCountAccent: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  cityText: {
    fontSize: 12,
  },
  goldenHourChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    alignSelf: 'flex-start' as const,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  goldenHourChipText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  commentsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  commentsList: {
    marginBottom: 10,
    gap: 8,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  commentBubble: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 1,
  },
  commentTextDisplay: {
    fontSize: 13,
    lineHeight: 17,
  },
  moreComments: {
    fontSize: 12,
    fontWeight: '500' as const,
    paddingLeft: 32,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  commentTextInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  commentSend: {
    padding: 4,
  },
});
