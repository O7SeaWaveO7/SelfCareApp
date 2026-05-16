import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCurrentStreak, Habit, todayStr } from '@/contexts/habits-context';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  habit: Habit;
  isActiveToday: boolean;
  onToggle: () => void;
  onLongPress: () => void;
};

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function HabitRow({ habit, isActiveToday, onToggle, onLongPress }: Props) {
  const C = useTheme();
  const done   = habit.completedDates.includes(todayStr());
  const streak = getCurrentStreak(habit.completedDates);
  const scale  = useRef(new Animated.Value(1)).current;

  const totalSeconds = (habit.timerMinutes ?? 5) * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running,     setRunning]     = useState(false);
  const autoCompletedRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setRunning(false);
    autoCompletedRef.current = false;
  }, [habit.id, totalSeconds, done]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { setRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0 && !done && !autoCompletedRef.current) {
      autoCompletedRef.current = true;
      onToggle();
    }
  }, [secondsLeft]);

  const handleCheckPress = () => {
    if ((habit.timerEnabled ?? false) && !done && secondsLeft > 0) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true, tension: 400, friction: 8 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    onToggle();
  };

  const toggleTimer = () => {
    if (secondsLeft === 0) { setSecondsLeft(totalSeconds); autoCompletedRef.current = false; setRunning(true); }
    else setRunning(r => !r);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const showTimer    = (habit.timerEnabled ?? false) && !done && isActiveToday;
  const checkBlocked = (habit.timerEnabled ?? false) && !done && secondsLeft > 0 && isActiveToday;

  const timerLabel = running
    ? `⏱ ${pad(mins)}:${pad(secs)}`
    : secondsLeft === totalSeconds
      ? `⏱ ${habit.timerMinutes ?? 5} min  ·  tap to start`
      : `⏸ ${pad(mins)}:${pad(secs)}  ·  tap to resume`;

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[s.row, { backgroundColor: C.card, borderColor: C.border }, done && s.rowDone]}
    >
      <View style={[s.iconWrap, { backgroundColor: habit.color + '18' }]}>
        <Text style={s.emoji}>{habit.emoji}</Text>
      </View>

      <View style={s.body}>
        <Text style={[s.name, { color: C.text }, done && isActiveToday && { textDecorationLine: 'line-through', color: C.sub }]}>
          {habit.name}
        </Text>
        {!isActiveToday ? (
          <Text style={[s.subTxt, { color: C.muted, fontStyle: 'italic' }]}>not scheduled today</Text>
        ) : done ? (
          <Text style={[s.subTxt, { color: C.sub }]}>done</Text>
        ) : showTimer ? (
          <TouchableOpacity onPress={toggleTimer} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={[s.subTxt, { color: running ? C.accent : C.sub, fontWeight: '600' }]}>{timerLabel}</Text>
          </TouchableOpacity>
        ) : streak > 0 ? (
          <Text style={[s.subTxt, { color: C.sub }]}>
            {streak >= 7 ? '🔥' : '⚡'} {streak}-day streak
          </Text>
        ) : null}
      </View>

      {isActiveToday && (
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            onPress={handleCheckPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[
              s.check,
              { borderColor: C.border },
              done && { backgroundColor: habit.color, borderColor: habit.color },
              checkBlocked && { borderColor: C.muted, backgroundColor: C.muted + '20' },
            ]}
          >
            {done && <Text style={s.checkMark}>✓</Text>}
            {checkBlocked && <Text style={s.checkLock}>⏳</Text>}
          </TouchableOpacity>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingVertical: 14, paddingLeft: 14, paddingRight: 14, borderWidth: 1 },
  rowDone:   { opacity: 0.6 },
  iconWrap:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  emoji:     { fontSize: 22 },
  body:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '600' },
  subTxt:    { fontSize: 11, marginTop: 3 },
  check:     { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  checkLock: { fontSize: 12 },
});
