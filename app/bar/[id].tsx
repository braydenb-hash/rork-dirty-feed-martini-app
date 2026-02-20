import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Star, X, Users, Wine } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { MOCK_BARS } from '@/mocks/data';
import { useMartini } from '@/contexts/MartiniContext';
import OliveRating from '@/components/OliveRating';

export default function BarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { feedLogs } = useMartini();

  const bar = MOCK_BARS.find(b => b.id === id);
  const barLogs = feedLogs.filter(l => l.barId === id);

  if (!bar) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <X size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Bar not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{ uri: bar.photo }} style={styles.heroImage} contentFit="cover" />
          <Pressable
            style={[styles.closeBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <X size={22} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.barName}>{bar.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.goldMuted} />
            <Text style={styles.address}>{bar.address}, {bar.city}</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Star size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{bar.communityRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Community Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Users size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{bar.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Wine size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{bar.topDrink}</Text>
              <Text style={styles.statLabel}>Top Drink</Text>
            </View>
          </View>

          {barLogs.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsTitle}>Recent Reviews</Text>
              {barLogs.map(log => (
                <View key={log.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: log.userAvatar }} style={styles.reviewAvatar} />
                    <View style={styles.reviewHeaderText}>
                      <Text style={styles.reviewUser}>{log.userName}</Text>
                      <OliveRating rating={log.rating} size={12} />
                    </View>
                    <View style={styles.reviewStyleBadge}>
                      <Text style={styles.reviewStyleText}>{log.style}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewNotes}>{log.notes}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
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
  closeBtn: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: 20,
  },
  barName: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800' as const,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
  },
  address: {
    color: Colors.gray,
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  statLabel: {
    color: Colors.gray,
    fontSize: 11,
    textAlign: 'center' as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.darkBorder,
  },
  reviewsSection: {
    marginTop: 4,
  },
  reviewsTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  reviewHeaderText: {
    flex: 1,
    gap: 2,
  },
  reviewUser: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  reviewStyleBadge: {
    backgroundColor: Colors.darkElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
  },
  reviewStyleText: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: '500' as const,
  },
  reviewNotes: {
    color: Colors.whiteMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  bottomSpacer: {
    height: 40,
  },
});
