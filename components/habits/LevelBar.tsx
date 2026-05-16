import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LevelInfo } from '@/contexts/habits-context';
import { useTheme } from '@/hooks/useTheme';

type Props = { info: LevelInfo; points: number };

export default function LevelBar({ info, points }: Props) {
  const C = useTheme();
  const pct = `${Math.round(info.progress * 100)}%`;

  return (
    <View style={s.wrap}>
      <View style={[s.pill, { backgroundColor: C.card, borderColor: C.border }]}>
        <Text style={[s.pillTxt, { color: C.sub }]}>Lv.{info.level}  ·  ⭐ {points}</Text>
      </View>
      <View style={s.barRow}>
        <View style={[s.track, { backgroundColor: C.border }]}>
          <View style={[s.fill, { width: pct, backgroundColor: C.accent }]} />
        </View>
        <Text style={[s.name, { color: C.muted }]}>{info.name}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:    { marginBottom: 20 },
  pill:    { alignSelf: 'flex-end', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, marginBottom: 12 },
  pillTxt: { fontSize: 12, fontWeight: '600' },
  barRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track:   { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  fill:    { height: '100%', borderRadius: 2 },
  name:    { fontSize: 11, fontWeight: '600', minWidth: 64 },
});
