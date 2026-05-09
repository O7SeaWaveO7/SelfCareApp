import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Habit, UserStats, getCurrentStreak } from '@/contexts/habits-context';
import { C } from '@/constants/habitColors';

type Props = {
  habits: Habit[];
  stats:  UserStats;
};

export default function StatChips({ habits, stats }: Props) {
  const bestStreak      = habits.length > 0
    ? Math.max(...habits.map(h => getCurrentStreak(h.completedDates)))
    : 0;
  const totalCompletions = habits.reduce((a, h) => a + h.completedDates.length, 0);

  const chips = [
    { icon: '⭐', value: stats.totalPoints.toString(), label: 'Points'     },
    { icon: '🔥', value: bestStreak.toString(),        label: 'Best Streak' },
    { icon: '✅', value: totalCompletions.toString(),  label: 'Total Done'  },
  ];

  return (
    <View style={s.row}>
      {chips.map(chip => (
        <View key={chip.label} style={s.chip}>
          <Text style={s.val}>{chip.icon} {chip.value}</Text>
          <Text style={s.lbl}>{chip.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  chip: {
    flex:            1,
    backgroundColor: C.card,
    borderRadius:    12,
    padding:         14,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     C.border,
  },
  val: { color: C.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  lbl: { color: C.muted, fontSize: 10, fontWeight: '600' },
});
