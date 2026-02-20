import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  Pressable, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, Send, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useMartini } from '@/contexts/MartiniContext';
import { MOCK_BARS, MARTINI_STYLES } from '@/mocks/data';
import OliveRating from '@/components/OliveRating';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import { MartiniLog, Badge } from '@/types';

export default function LogScreen() {
  const { addLog, user } = useMartini();
  const router = useRouter();
  const params = useLocalSearchParams<{ barName?: string; barCity?: string; barId?: string }>();
  const [barName, setBarName] = useState(params.barName ?? '');
  const [city, setCity] = useState(params.barCity ?? '');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('');
  const [style, setStyle] = useState('');
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showBarSuggestions, setShowBarSuggestions] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationBadges, setCelebrationBadges] = useState<Badge[]>([]);

  const submitScale = useRef(new Animated.Value(1)).current;

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
      console.log('Image picked:', result.assets[0].uri);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!barName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (rating === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (!style) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Animated.sequence([
      Animated.timing(submitScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(submitScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    const matchedBar = MOCK_BARS.find(b =>
      b.name.toLowerCase().includes(barName.toLowerCase())
    );

    const newLog: MartiniLog = {
      id: `log_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      barId: matchedBar?.id ?? `bar_custom_${Date.now()}`,
      barName: barName.trim(),
      city: city.trim() || 'Unknown',
      rating,
      photo: photo || 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=600&h=600&fit=crop',
      notes: notes.trim(),
      style,
      timestamp: new Date().toISOString(),
      likes: 0,
      liked: false,
    };

    const newBadges = addLog(newLog);
    setCelebrationBadges(newBadges);
    setShowCelebration(true);

    setBarName('');
    setCity('');
    setRating(0);
    setNotes('');
    setPhoto('');
    setStyle('');

    console.log('Logged martini:', newLog.id);
  }, [barName, city, rating, notes, photo, style, addLog, user, submitScale]);

  const handleCelebrationDismiss = useCallback(() => {
    setShowCelebration(false);
    setCelebrationBadges([]);
    router.push('/(tabs)/(feed)' as never);
  }, [router]);

  const filteredBars = MOCK_BARS.filter(b =>
    b.name.toLowerCase().includes(barName.toLowerCase()) && barName.length > 0
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={pickImage} style={styles.photoSection}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera size={36} color={Colors.goldMuted} />
              <Text style={styles.photoText}>Add a photo</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.label}>Where are you drinking?</Text>
          <TextInput
            style={styles.input}
            value={barName}
            onChangeText={(text) => {
              setBarName(text);
              setShowBarSuggestions(text.length > 0);
            }}
            placeholder="Bar or restaurant name"
            placeholderTextColor={Colors.gray}
            onBlur={() => setTimeout(() => setShowBarSuggestions(false), 200)}
            testID="bar-name-input"
          />
          {showBarSuggestions && filteredBars.length > 0 && (
            <View style={styles.suggestions}>
              {filteredBars.map(bar => (
                <Pressable
                  key={bar.id}
                  style={styles.suggestionRow}
                  onPress={() => {
                    setBarName(bar.name);
                    setCity(bar.city);
                    setShowBarSuggestions(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{bar.name}</Text>
                  <Text style={styles.suggestionCity}>{bar.city}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. New York"
            placeholderTextColor={Colors.gray}
            testID="city-input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Rate your martini</Text>
          <View style={styles.ratingContainer}>
            <OliveRating rating={rating} size={32} interactive onRate={setRating} />
            {rating > 0 && (
              <Text style={styles.ratingText}>{rating} olive{rating > 1 ? 's' : ''}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Style</Text>
          <Pressable
            style={styles.stylePicker}
            onPress={() => setShowStylePicker(!showStylePicker)}
          >
            <Text style={style ? styles.styleValue : styles.stylePlaceholder}>
              {style || 'Select martini style'}
            </Text>
            <ChevronDown size={18} color={Colors.gray} />
          </Pressable>
          {showStylePicker && (
            <View style={styles.styleOptions}>
              {MARTINI_STYLES.map(s => (
                <Pressable
                  key={s}
                  style={[styles.styleOption, style === s && styles.styleOptionActive]}
                  onPress={() => {
                    setStyle(s);
                    setShowStylePicker(false);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.styleOptionText, style === s && styles.styleOptionTextActive]}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tasting notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How was it? What made it special?"
            placeholderTextColor={Colors.gray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            testID="notes-input"
          />
        </View>

        <Animated.View style={{ transform: [{ scale: submitScale }] }}>
          <Pressable
            style={[styles.submitButton, (!barName || !rating || !style) && styles.submitDisabled]}
            onPress={handleSubmit}
            testID="submit-button"
          >
            <Send size={18} color={Colors.dark} />
            <Text style={styles.submitText}>Pour It In</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CelebrationOverlay
        visible={showCelebration}
        onDismiss={handleCelebrationDismiss}
        newBadges={celebrationBadges}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  photoSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.darkBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  photoText: {
    color: Colors.gray,
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  label: {
    color: Colors.goldLight,
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.darkCard,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  ratingText: {
    color: Colors.goldLight,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  stylePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  styleValue: {
    color: Colors.white,
    fontSize: 16,
  },
  stylePlaceholder: {
    color: Colors.gray,
    fontSize: 16,
  },
  styleOptions: {
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 6,
  },
  styleOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.darkElevated,
  },
  styleOptionActive: {
    backgroundColor: Colors.gold,
  },
  styleOptionText: {
    color: Colors.whiteMuted,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  styleOptionTextActive: {
    color: Colors.dark,
  },
  suggestions: {
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBorder,
  },
  suggestionText: {
    color: Colors.white,
    fontSize: 15,
  },
  suggestionCity: {
    color: Colors.gray,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: Colors.gold,
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: Colors.dark,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  bottomSpacer: {
    height: 40,
  },
});
