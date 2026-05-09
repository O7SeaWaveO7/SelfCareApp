import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ALL_BADGES, BadgeId } from '@/contexts/habits-context';
import { C } from '@/constants/habitColors';

const BADGE_W = (Dimensions.get('window').width - 50) / 2;

type Props = { earnedBadges: BadgeId[] };

export default function BadgeGrid({ earnedBadges }: Props) {
  return (
    <View style={s.grid}>
      {ALL_BADGES.map(badge => {
        const earned = earnedBadges.includes(badge.id);
        return (
          <View key={badge.id} style={[s.card, !earned && s.locked]}>
            <Text style={s.emoji}>{badge.emoji}</Text>
            <Text style={[s.name, !earned && s.dimText]}>{badge.name}</Text>
            <Text style={[s.desc, !earned && s.dimText]} numberOfLines={2}>
              {earned ? badge.description : '???'}
            </Text>
            {earned && (
              <View style={s.check}>
                <Text style={s.checkTxt}>✓</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  grid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  card: {
    width:           BADGE_W,
    backgroundColor: C.card,
    borderRadius:    14,
    padding:         14,
    borderWidth:     1,
    borderColor:     C.border,
    position:        'relative',
  },
  locked:  { opacity: 0.4 },

  emoji:   { fontSize: 28, marginBottom: 8 },
  name:    { color: C.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  desc:    { color: C.sub, fontSize: 11, lineHeight: 15 },
  dimText: { color: C.muted },

  check: {
    position:        'absolute',
    top:             10,
    right:           10,
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: C.green,
    alignItems:      'center',
    justifyContent:  'center',
  },
  checkTxt: { color: C.bg, fontSize: 9, fontWeight: '900' },
});
