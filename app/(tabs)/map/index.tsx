import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Star, Wine, ChevronRight, Navigation, X, Search, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { MOCK_BARS } from '@/mocks/data';
import { useMartini } from '@/contexts/MartiniContext';
import OliveRating from '@/components/OliveRating';
import { Bar } from '@/types';

let MapView: React.ComponentType<any> | null = null;
let Marker: React.ComponentType<any> | null = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const NYC_REGION = {
  latitude: 40.7350,
  longitude: -73.9900,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { feedLogs, activeBars } = useMartini();
  const mapRef = useRef<any>(null);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const barReviewCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    feedLogs.forEach(log => {
      counts[log.barId] = (counts[log.barId] || 0) + 1;
    });
    return counts;
  }, [feedLogs]);

  const filteredBars = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_BARS;
    const q = searchQuery.toLowerCase();
    return MOCK_BARS.filter(bar =>
      bar.name.toLowerCase().includes(q) ||
      bar.city.toLowerCase().includes(q) ||
      bar.topDrink.toLowerCase().includes(q) ||
      bar.address.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const showCard = useCallback((bar: Bar) => {
    setSelectedBar(bar);
    slideAnim.setValue(200);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const hideCard = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setSelectedBar(null));
  }, [slideAnim, fadeAnim]);

  const isBarActive = useCallback((barId: string): boolean => {
    return (activeBars[barId] ?? 0) > 0;
  }, [activeBars]);

  const getActiveCount = useCallback((barId: string): number => {
    return activeBars[barId] ?? 0;
  }, [activeBars]);

  const handleMarkerPress = useCallback((bar: Bar) => {
    console.log('Marker pressed:', bar.name);
    if (isBarActive(bar.id)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Live bar tapped:', bar.name);
    }
    showCard(bar);
    mapRef.current?.animateToRegion(
      {
        latitude: bar.latitude - 0.008,
        longitude: bar.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      400
    );
  }, [showCard, isBarActive]);

  const handleBarDetail = useCallback((barId: string) => {
    console.log('Navigating to bar:', barId);
    router.push(`/bar/${barId}` as never);
  }, [router]);

  const handleRecenter = useCallback(() => {
    mapRef.current?.animateToRegion(NYC_REGION, 600);
    hideCard();
  }, [hideCard]);

  if (Platform.OS === 'web' || !MapView || !Marker) {
    return (
      <View style={styles.container}>
        <View style={[styles.webFallback, { paddingTop: insets.top }]}>
          <Text style={styles.titleText}>Explore Bars</Text>
          <View style={styles.webSearchBar}>
            <Search size={16} color={Colors.gray} />
            <TextInput
              style={styles.webSearchInput}
              placeholder="Search bars, cities, drinks..."
              placeholderTextColor={Colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <X size={16} color={Colors.gray} />
              </Pressable>
            )}
          </View>
          <Text style={[styles.subtitleText, { marginBottom: 12, marginTop: 8 }]}>
            {filteredBars.length} martini spot{filteredBars.length !== 1 ? 's' : ''}
          </Text>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {filteredBars.map(bar => (
              <Pressable
                key={bar.id}
                style={[styles.webBarCard, isBarActive(bar.id) && styles.webBarCardActive]}
                onPress={() => handleBarDetail(bar.id)}
              >
                <View>
                  <Image
                    source={{ uri: bar.photo }}
                    style={styles.webBarImage}
                    contentFit="cover"
                  />
                  {isBarActive(bar.id) && (
                    <View style={styles.webActiveDot}>
                      <Zap size={10} color="#FFD700" fill="#FFD700" />
                    </View>
                  )}
                </View>
                <View style={styles.webBarInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>{bar.name}</Text>
                  <View style={styles.cardLocationRow}>
                    <MapPin size={12} color={Colors.goldMuted} />
                    <Text style={styles.cardAddress} numberOfLines={1}>
                      {bar.address}, {bar.city}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {isBarActive(bar.id) ? (
                      <>
                        <Zap size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.webNowPouring}>Now Pouring</Text>
                      </>
                    ) : (
                      <>
                        <Star size={12} color={Colors.gold} fill={Colors.gold} />
                        <Text style={styles.webBarRating}>{bar.communityRating.toFixed(1)}</Text>
                      </>
                    )}
                    <Text style={styles.cardStatLabel}>{bar.topDrink}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={Colors.gray} />
              </Pressable>
            ))}
            {filteredBars.length === 0 && (
              <View style={styles.webEmpty}>
                <Text style={styles.webEmptyText}>No bars match your search</Text>
              </View>
            )}
            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>
        </View>
      </View>
    );
  }

  const NativeMapView = MapView;
  const NativeMarker = Marker;

  return (
    <View style={styles.container}>
      <NativeMapView
        ref={mapRef}
        style={styles.map}
        initialRegion={NYC_REGION}
        onPress={hideCard}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
      >
        {filteredBars.map(bar => {
          const active = isBarActive(bar.id);
          return (
            <NativeMarker
              key={bar.id}
              coordinate={{ latitude: bar.latitude, longitude: bar.longitude }}
              title={bar.name}
              description={active ? `🔥 Now Pouring · ${getActiveCount(bar.id)} recent` : `${bar.communityRating.toFixed(1)} ⭐ · ${bar.topDrink}`}
              onPress={() => handleMarkerPress(bar)}
              pinColor={active ? '#FFD700' : bar.communityRating >= 4.5 ? Colors.gold : bar.communityRating >= 4.0 ? Colors.goldLight : Colors.goldMuted}
            />
          );
        })}
      </NativeMapView>

      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={16} color={Colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search bars..."
              placeholderTextColor={Colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <X size={16} color={Colors.gray} />
              </Pressable>
            )}
          </View>
          <Text style={styles.subtitleText}>
            {filteredBars.length} spot{filteredBars.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <Pressable
        style={[styles.recenterBtn, { bottom: selectedBar ? 220 + insets.bottom : 24 + insets.bottom }]}
        onPress={handleRecenter}
      >
        <Navigation size={18} color={Colors.white} />
      </Pressable>

      {selectedBar && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              paddingBottom: insets.bottom + 12,
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable style={styles.card} onPress={() => handleBarDetail(selectedBar.id)}>
            <Pressable style={styles.cardClose} onPress={hideCard}>
              <X size={16} color={Colors.gray} />
            </Pressable>

            <View style={styles.cardRow}>
              <Image
                source={{ uri: selectedBar.photo }}
                style={styles.cardImage}
                contentFit="cover"
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>{selectedBar.name}</Text>
                <View style={styles.cardLocationRow}>
                  <MapPin size={12} color={Colors.goldMuted} />
                  <Text style={styles.cardAddress} numberOfLines={1}>
                    {selectedBar.address}, {selectedBar.city}
                  </Text>
                </View>
                <OliveRating rating={Math.round(selectedBar.communityRating)} size={14} />
              </View>
            </View>

            {isBarActive(selectedBar.id) && (
              <View style={styles.nowPouringBanner}>
                <Zap size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.nowPouringText}>Now Pouring</Text>
                <Text style={styles.nowPouringCount}>{getActiveCount(selectedBar.id)} logged recently</Text>
              </View>
            )}

            <View style={styles.cardStats}>
              <View style={styles.cardStat}>
                <Star size={14} color={Colors.gold} />
                <Text style={styles.cardStatValue}>{selectedBar.communityRating.toFixed(1)}</Text>
                <Text style={styles.cardStatLabel}>rating</Text>
              </View>
              <View style={styles.cardStatDivider} />
              <View style={styles.cardStat}>
                <Wine size={14} color={Colors.gold} />
                <Text style={styles.cardStatValue}>{selectedBar.topDrink}</Text>
                <Text style={styles.cardStatLabel}>top drink</Text>
              </View>
              <View style={styles.cardStatDivider} />
              <View style={styles.cardStat}>
                <Text style={styles.cardStatValue}>{barReviewCounts[selectedBar.id] || selectedBar.totalReviews}</Text>
                <Text style={styles.cardStatLabel}>reviews</Text>
              </View>
            </View>

            <View style={styles.cardAction}>
              <Text style={styles.cardActionText}>View Bar Details</Text>
              <ChevronRight size={16} color={Colors.gold} />
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  map: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    backgroundColor: 'rgba(13,13,13,0.92)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    padding: 0,
  },
  titleText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800' as const,
  },
  subtitleText: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(13,13,13,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.darkElevated,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  cardName: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
    paddingRight: 24,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardAddress: {
    color: Colors.gray,
    fontSize: 12,
    flex: 1,
  },
  cardStats: {
    flexDirection: 'row',
    backgroundColor: Colors.darkElevated,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  cardStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  cardStatValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  cardStatLabel: {
    color: Colors.gray,
    fontSize: 10,
  },
  cardStatDivider: {
    width: 1,
    backgroundColor: Colors.darkBorder,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(212,168,75,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,168,75,0.2)',
  },
  cardActionText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  webFallback: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  webSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    marginTop: 12,
  },
  webSearchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    padding: 0,
  },
  webBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    gap: 12,
  },
  webBarImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  webBarInfo: {
    flex: 1,
    gap: 2,
  },
  webBarRating: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  nowPouringBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  nowPouringText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  nowPouringCount: {
    color: Colors.goldMuted,
    fontSize: 12,
    marginLeft: 'auto' as const,
  },
  webBarCardActive: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  webActiveDot: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  webNowPouring: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  webEmpty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  webEmptyText: {
    color: Colors.gray,
    fontSize: 14,
  },
});
