import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Habit, todayStr, getCurrentStreak } from '@/contexts/habits-context';
import { C } from '@/constants/habitColors';

type Props = {
  habit: Habit;
  onToggle: () => void;
  onLongPress: () => void;
};

export default function HabitRow({ habit, onToggle, onLongPress }: Props) {
  const done   = habit.completedDates.includes(todayStr());
  const streak = getCurrentStreak(habit.completedDates);
  const scale  = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3,  useNativeDriver: true, tension: 400, friction: 8 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={0.75}
      style={[s.row, done && s.rowDone]}
    >
      {/* Icon */}
      <View style={[s.icon, { backgroundColor: habit.color + '20' }]}>
        <Text style={s.emoji}>{habit.emoji}</Text>
      </View>

      {/* Text */}
      <View style={s.body}>
        <Text style={[s.name, done && s.nameDone]}>{habit.name}</Text>
        {streak > 0 && (
          <Text style={[s.streak, { color: streak >= 7 ? C.gold : C.sub }]}>
            🔥 {streak}-day streak
          </Text>
        )}
      </View>

      {/* Check button */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={handlePress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[s.check, done && { backgroundColor: C.green, borderColor: C.green }]}
        >
          {done && <Text style={s.checkMark}>✓</Text>}
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.card,
    borderRadius:    14,
    paddingVertical: 12,
    paddingLeft:     14,
    paddingRight:    12,
    borderWidth:     1,
    borderColor:     C.border,
  },
  rowDone: { opacity: 0.55 },

  icon: {
    width:          40,
    height:         40,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    12,
  },
  emoji: { fontSize: 20 },

  body:     { flex: 1 },
  name:     { color: C.text, fontSize: 15, fontWeight: '600' },
  nameDone: { textDecorationLine: 'line-through', color: C.sub },
  streak:   { fontSize: 12, marginTop: 2 },

  check: {
    width:          32,
    height:         32,
    borderRadius:   16,
    borderWidth:    2,
    borderColor:    C.border,
    alignItems:     'center',
    justifyContent: 'center',
  },
  checkMark: { color: C.bg, fontWeight: '900', fontSize: 17 },
});
