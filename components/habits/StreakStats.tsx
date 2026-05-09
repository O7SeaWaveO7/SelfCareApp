import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Habit, getCurrentStreak, getLongestStreak } from '@/contexts/habits-context';
import { C } from '@/constants/habitColors';

type Props = { habit: Habit };

export default function StreakStats({ habit }: Props) {
  const stats = [
    { icon: '🔥', value: getCurrentStreak(habit.completedDates),  label: 'Current'  },
    { icon: '🏆', value: getLongestStreak(habit.completedDates),   label: 'Longest'  },
    { icon: '✅', value: habit.completedDates.length,              label: 'Total'    },
  ];

  return (
    <View style={s.row}>
      {stats.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <View style={s.divider} />}
          <View style={s.item}>
            <Text style={s.value}>{item.value}</Text>
            <Text style={s.label}>{item.icon} {item.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection:  'row',
    paddingTop:     16,
    marginTop:      16,
    borderTopWidth: 1,
    borderColor:    C.border,
  },
  item:    { flex: 1, alignItems: 'center' },
  value:   { color: C.text, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  label:   { color: C.sub, fontSize: 11 },
  divider: { width: 1, backgroundColor: C.border },
});
