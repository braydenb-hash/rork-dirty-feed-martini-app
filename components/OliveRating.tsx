import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/colors';

interface OliveRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function OliveRating({ rating, size = 18, interactive = false, onRate }: OliveRatingProps) {
  const olives = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {olives.map((value) => (
        <Pressable
          key={value}
          onPress={() => interactive && onRate?.(value)}
          disabled={!interactive}
          testID={`olive-${value}`}
        >
          <Text style={[
            styles.olive,
            { fontSize: size },
            value <= rating ? styles.oliveActive : styles.oliveInactive,
          ]}>
            🫒
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  olive: {
    marginHorizontal: 1,
  },
  oliveActive: {
    opacity: 1,
  },
  oliveInactive: {
    opacity: 0.2,
  },
});
