import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { ALL_BADGES, BadgeId } from '@/contexts/habits-context';
import { useTheme } from '@/hooks/useTheme';

const BADGE_W = (Dimensions.get('window').width - 50) / 2;

type Props = { earnedBadges: BadgeId[] };

export default function BadgeGrid({ earnedBadges }: Props) {
  const C = useTheme();

  return (
    <View style={s.grid}>
      {ALL_BADGES.map(badge => {
        const earned = earnedBadges.includes(badge.id);
        return (
          <View key={badge.id} style={[s.card, { backgroundColor: C.card, borderColor: C.border }, !earned && s.locked]}>
            <Text style={s.emoji}>{badge.emoji}</Text>
            <Text style={[s.name, { color: earned ? C.text : C.muted }]}>{badge.name}</Text>
            <Text style={[s.desc, { color: earned ? C.sub : C.muted }]} numberOfLines={2}>
              {earned ? badge.description : '???'}
            </Text>
            {earned && (
              <View style={[s.check, { backgroundColor: C.green }]}>
                <Text style={[s.checkTxt, { color: C.bg }]}>✓</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card:     { width: BADGE_W, borderRadius: 14, padding: 14, borderWidth: 1, position: 'relative' },
  locked:   { opacity: 0.4 },
  emoji:    { fontSize: 28, marginBottom: 8 },
  name:     { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  desc:     { fontSize: 11, lineHeight: 15 },
  check:    { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  checkTxt: { fontSize: 9, fontWeight: '900' },
});
