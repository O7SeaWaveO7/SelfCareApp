import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLongestStreak, todayStr, useHabits } from '@/contexts/habits-context';
import { useSettings } from '@/contexts/settings-context';
import { useTheme } from '@/hooks/useTheme';

type Colors = { bg: string; card: string; border: string; accent: string; green: string; gold: string; text: string; sub: string; muted: string; white: string };

// ─── Sizing ───────────────────────────────────────────────────────────────────

const SCREEN_W = Dimensions.get('window').width;
const CELL = Math.floor((SCREEN_W - 40 - 32 - 24) / 7);

// ─── Date helpers ─────────────────────────────────────────────────────────────

function pad2(n: number) { return String(n).padStart(2, '0'); }

function makeDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function buildGrid(year: number, month: number): (string | null)[][] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const cells: (string | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDow + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? makeDateStr(year, month, dayNum) : null);
  }
  const rows: (string | null)[][] = [];
  for (let r = 0; r < totalCells / 7; r++) rows.push(cells.slice(r * 7, r * 7 + 7));
  return rows;
}

// ─── Ratio helpers ────────────────────────────────────────────────────────────

type HabitSlice = { completedDates: string[]; createdAt: string; frequency: string; customDays: boolean[] };

function isScheduledOn(habit: HabitSlice, date: string): boolean {
  if (habit.createdAt > date) return false;
  const dow = new Date(date + 'T00:00:00').getDay();
  if (habit.frequency === 'weekdays') return dow >= 1 && dow <= 5;
  if (habit.frequency === 'custom') return Array.isArray(habit.customDays) ? (habit.customDays[dow] ?? true) : true;
  return true;
}

function getDayRatio(date: string, habits: HabitSlice[]): number {
  const scheduled = habits.filter(h => isScheduledOn(h, date));
  if (!scheduled.length) return -1;
  return scheduled.filter(h => h.completedDates.includes(date)).length / scheduled.length;
}

function getFullDayStreak(habits: HabitSlice[], today: string): number {
  if (!habits.length) return 0;
  const check = new Date(today + 'T00:00:00');
  let streak = 0;
  for (let i = 0; i < 1000; i++) {
    const d = `${check.getFullYear()}-${pad2(check.getMonth() + 1)}-${pad2(check.getDate())}`;
    const ratio = getDayRatio(d, habits);
    if (ratio === 1) { streak++; } else if (i === 0) { } else { break; }
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

function getMonthCompletion(year: number, month: number, habits: HabitSlice[], today: string): number {
  if (!habits.length) return 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let total = 0, done = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = makeDateStr(year, month, d);
    if (ds > today) break;
    const scheduled = habits.filter(h => isScheduledOn(h, ds));
    if (!scheduled.length) continue;
    total += scheduled.length;
    done  += scheduled.filter(h => h.completedDates.includes(ds)).length;
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function getBestStreak(habits: HabitSlice[]): number {
  if (!habits.length) return 0;
  const allDates = new Set<string>();
  habits.forEach(h => h.completedDates.forEach(d => allDates.add(d)));
  const fullDays = [...allDates].sort().filter(d => getDayRatio(d, habits) === 1);
  return getLongestStreak(fullDays);
}

// ─── DayCell ─────────────────────────────────────────────────────────────────

type CellKind = 'full' | 'half' | 'missed' | 'today_full' | 'today_partial' | 'today_empty' | 'future' | 'empty';

function DayCell({ date, kind, C }: { date: string | null; kind: CellKind; C: Colors }) {
  const dayNum = date ? parseInt(date.slice(8), 10) : null;

  if (!dayNum || kind === 'empty' || kind === 'future') {
    return (
      <View style={[cell.wrap, { width: CELL, height: CELL }]}>
        {dayNum ? <Text style={[cell.num, { color: C.sub + '55' }]}>{dayNum}</Text> : null}
      </View>
    );
  }
  if (kind === 'missed') {
    return (
      <View style={[cell.wrap, { width: CELL, height: CELL }]}>
        <Text style={[cell.num, { color: C.sub + 'AA' }]}>{dayNum}</Text>
      </View>
    );
  }
  if (kind === 'full') {
    return (
      <View style={[cell.wrap, { width: CELL, height: CELL }]}>
        <View style={[cell.fullCircle, { width: CELL - 4, height: CELL - 4, borderRadius: (CELL - 4) / 2, backgroundColor: C.accent }]} />
        <Text style={[cell.num, { color: C.white, position: 'absolute' }]}>{dayNum}</Text>
      </View>
    );
  }
  if (kind === 'today_full') {
    return (
      <View style={[cell.wrap, { width: CELL, height: CELL }]}>
        <View style={[cell.todayCircle, { width: CELL - 4, height: CELL - 4, borderRadius: (CELL - 4) / 2, backgroundColor: C.accent, borderColor: C.white + '55' }]} />
        <Text style={[cell.num, { color: C.white, position: 'absolute', fontWeight: '800' }]}>{dayNum}</Text>
      </View>
    );
  }
  if (kind === 'today_empty') {
    return (
      <View style={[cell.wrap, { width: CELL, height: CELL }]}>
        <View style={[cell.halfOutline, { width: CELL - 4, height: CELL - 4, borderRadius: (CELL - 4) / 2, borderColor: C.accent + '88', borderStyle: 'dashed' }]} />
        <Text style={[cell.num, { color: C.accent, position: 'absolute', fontWeight: '700' }]}>{dayNum}</Text>
      </View>
    );
  }
  const r = (CELL - 4) / 2;
  const isToday = kind === 'today_partial';
  return (
    <View style={[cell.wrap, { width: CELL, height: CELL }]}>
      <View style={[cell.halfOutline, { width: CELL - 4, height: CELL - 4, borderRadius: r, borderColor: isToday ? C.accent : C.accent + '55' }]} />
      <View style={[cell.halfClip, { width: r, height: CELL - 4, borderTopLeftRadius: r, borderBottomLeftRadius: r, overflow: 'hidden' }]}>
        <View style={[cell.halfFill, { width: CELL - 4, height: CELL - 4, borderRadius: r, backgroundColor: C.accent, opacity: isToday ? 0.9 : 0.7 }]} />
      </View>
      <Text style={[cell.num, { color: C.text, position: 'absolute', fontWeight: '800' }]}>{dayNum}</Text>
    </View>
  );
}

const cell = StyleSheet.create({
  wrap:       { alignItems: 'center', justifyContent: 'center' },
  num:        { fontSize: 10, fontWeight: '600' },
  fullCircle: { opacity: 0.85, position: 'absolute' },
  todayCircle:{ position: 'absolute', borderWidth: 2 },
  halfOutline:{ position: 'absolute', borderWidth: 1.5 },
  halfClip:   { position: 'absolute', left: 2 },
  halfFill:   {},
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StreakScreen() {
  const { habits } = useHabits();
  const { settings } = useSettings();
  const C = useTheme();
  const today = todayStr();

  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goForward = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const monthLabel = useMemo(
    () => new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [viewYear, viewMonth],
  );
  const grid      = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const streak    = useMemo(() => getFullDayStreak(habits, today), [habits, today]);
  const monthPct  = useMemo(() => getMonthCompletion(viewYear, viewMonth, habits, today), [habits, viewYear, viewMonth, today]);
  const bestEver  = useMemo(() => getBestStreak(habits), [habits]);
  const daysToRecord = bestEver > 0 && streak < bestEver ? bestEver - streak + 1 : null;

  const motivMsg = useMemo(() => {
    if (!habits.length)        return 'Add habits to start tracking your streak!';
    if (streak === 0)          return 'Complete all habits today to start a streak!';
    if (daysToRecord === 1)    return '1 more day = new record!';
    if (daysToRecord !== null) return `${daysToRecord} more days = new record!`;
    if (streak >= bestEver && bestEver > 0) return "You're at your best — keep going! 🏆";
    return `${streak}-day streak — don't break it! 🔥`;
  }, [habits.length, streak, bestEver, daysToRecord]);

  function cellKind(date: string | null): CellKind {
    if (!date) return 'empty';
    if (date > today) return 'future';
    const ratio = getDayRatio(date, habits);
    if (ratio < 0) return 'empty';
    if (date === today) return ratio === 1 ? 'today_full' : ratio > 0 ? 'today_partial' : 'today_empty';
    if (ratio === 1) return 'full';
    if (ratio > 0)  return 'half';
    return 'missed';
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={settings.lightMode ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <View style={s.monthNav}>
            <TouchableOpacity onPress={goBack} hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}>
              <Text style={[s.navArrow, { color: C.text }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[s.monthLabel, { color: C.text }]}>{monthLabel}</Text>
            <TouchableOpacity onPress={goForward} disabled={isCurrentMonth} hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}>
              <Text style={[s.navArrow, { color: isCurrentMonth ? C.muted : C.text }]}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={s.dowRow}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <View key={i} style={{ width: CELL, alignItems: 'center' }}>
                  <Text style={[s.dowText, { color: C.sub }]}>{d}</Text>
                </View>
              ))}
            </View>
            {grid.map((row, ri) => (
              <View key={ri} style={s.weekRow}>
                {row.map((date, ci) => (
                  <DayCell key={ci} date={date} kind={cellKind(date)} C={C} />
                ))}
              </View>
            ))}
          </View>

          <View style={[s.statsRow, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: C.text }]}>{streak}</Text>
              <Text style={[s.statLbl, { color: C.sub }]}>streak</Text>
            </View>
            <View style={[s.divider, { backgroundColor: C.border }]} />
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: C.text }]}>{monthPct}%</Text>
              <Text style={[s.statLbl, { color: C.sub }]}>month</Text>
            </View>
            <View style={[s.divider, { backgroundColor: C.border }]} />
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: C.text }]}>{bestEver}</Text>
              <Text style={[s.statLbl, { color: C.sub }]}>best ever</Text>
            </View>
          </View>

          <View style={[s.banner, { backgroundColor: C.accent + '1A', borderColor: C.accent + '44' }]}>
            <Text style={[s.bannerText, { color: C.text }]}>{motivMsg}</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  scroll:     { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  monthNav:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  navArrow:   { fontSize: 34, fontWeight: '300', lineHeight: 38 },
  monthLabel: { fontSize: 20, fontWeight: '700' },
  card:       { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20 },
  dowRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dowText:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  weekRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statsRow:   { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 20, justifyContent: 'space-around', alignItems: 'center', marginBottom: 16 },
  statBox:    { alignItems: 'center', flex: 1 },
  statNum:    { fontSize: 28, fontWeight: '800' },
  statLbl:    { fontSize: 11, fontWeight: '600', marginTop: 3 },
  divider:    { width: 1, height: 40 },
  banner:     { borderRadius: 14, borderWidth: 1, padding: 18, alignItems: 'center' },
  bannerText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
