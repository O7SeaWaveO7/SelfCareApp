import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LevelInfo } from '@/contexts/habits-context';
import { C } from '@/constants/habitColors';

type Props = {
  info: LevelInfo;
  points: number;
};

export default function LevelBar({ info, points }: Props) {
  const pct = `${Math.round(info.progress * 100)}%`;

  return (
    <View style={s.wrap}>
      {/* Level pill */}
      <View style={s.pill}>
        <Text style={s.pillTxt}>Lv.{info.level}  ·  ⭐ {points}</Text>
      </View>

      {/* XP bar */}
      <View style={s.barRow}>
        <View style={s.track}>
          <View style={[s.fill, { width: pct }]} />
        </View>
        <Text style={s.name}>{info.name}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 20 },

  pill: {
    alignSelf:       'flex-end',
    backgroundColor: C.card,
    borderRadius:    20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth:     1,
    borderColor:     C.border,
    marginBottom:    12,
  },
  pillTxt: { color: C.sub, fontSize: 12, fontWeight: '600' },

  barRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: {
    flex:            1,
    height:          3,
    backgroundColor: C.border,
    borderRadius:    2,
    overflow:        'hidden',
  },
  fill:  { height: '100%', backgroundColor: C.accent, borderRadius: 2 },
  name:  { color: C.muted, fontSize: 11, fontWeight: '600', minWidth: 64 },
});
