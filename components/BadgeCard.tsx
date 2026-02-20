import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { Badge } from '@/types';

interface BadgeCardProps {
  badge: Badge;
  compact?: boolean;
}

function BadgeCardInner({ badge, compact = false }: BadgeCardProps) {
  return (
    <View style={[
      styles.card,
      compact && styles.cardCompact,
      !badge.earned && styles.cardLocked,
    ]} testID={`badge-${badge.id}`}>
      <Text style={[styles.icon, compact && styles.iconCompact, !badge.earned && styles.iconLocked]}>
        {badge.icon}
      </Text>
      <Text style={[styles.name, compact && styles.nameCompact, !badge.earned && styles.nameLocked]} numberOfLines={1}>
        {badge.name}
      </Text>
      {!compact && (
        <Text style={[styles.description, !badge.earned && styles.descLocked]} numberOfLines={2}>
          {badge.earned ? badge.description : badge.requirement}
        </Text>
      )}
    </View>
  );
}

export default React.memo(BadgeCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkElevated,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldMuted,
    width: 120,
  },
  cardCompact: {
    width: 80,
    padding: 10,
  },
  cardLocked: {
    borderColor: Colors.darkBorder,
    opacity: 0.5,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  iconCompact: {
    fontSize: 24,
    marginBottom: 4,
  },
  iconLocked: {
    opacity: 0.4,
  },
  name: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  nameCompact: {
    fontSize: 10,
  },
  nameLocked: {
    color: Colors.gray,
  },
  description: {
    color: Colors.whiteMuted,
    fontSize: 11,
    textAlign: 'center' as const,
    marginTop: 4,
    lineHeight: 15,
  },
  descLocked: {
    color: Colors.gray,
  },
});
