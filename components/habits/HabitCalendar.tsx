import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '@/constants/habitColors';
import { Habit, getCurrentStreak, getLongestStreak, todayStr } from '@/contexts/habits-context';

// ─── Cell sizing ──────────────────────────────────────────────────────────────
// Screen width minus: 20 (screen pad) + 16 (card pad) each side = 72 total,
// plus 6 × 2px gaps between 7 columns = 12px → divide remaining by 7.
const SCREEN_W = Dimensions.get('window').width;
const CELL_W = Math.floor((SCREEN_W - 72 - 12) / 7);
const CELL_H = CELL_W - 2;

// ─── Types ────────────────────────────────────────────────────────────────────
type CellState =
  | 'padding'
  | 'before_creation'
  | 'future'
  | 'done'
  | 'done_today'
  | 'today_undone'
  | 'missed';

type CalendarCell = {
  date: string | null;
  dayNum: number | null;
  isPadding: boolean;
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function buildCalendarGrid(year: number, month: number): CalendarCell[][] {
  const firstDay = new Date(year, month, 1);
  // Convert JS Sunday=0 to Monday=0 index
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ date: null, dayNum: null, isPadding: true });
    } else {
      const d = new Date(year, month, dayNum);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      cells.push({ date: `${y}-${mo}-${da}`, dayNum, isPadding: false });
    }
  }

  const rows: CalendarCell[][] = [];
  for (let r = 0; r < totalCells / 7; r++) {
    rows.push(cells.slice(r * 7, r * 7 + 7));
  }
  return rows;
}

function getCellState(
  date: string | null,
  completedSet: Set<string>,
  createdAt: string,
  todayDate: string,
): CellState {
  if (!date) return 'padding';
  if (date > todayDate) return 'future';
  if (date < createdAt) return 'before_creation';
  const done = completedSet.has(date);
  if (done && date === todayDate) return 'done_today';
  if (done) return 'done';
  if (date === todayDate) return 'today_undone';
  return 'missed';
}

function getCellBgStyle(state: CellState, habitColor: string): object {
  switch (state) {
    case 'done':         return { backgroundColor: habitColor + 'B3' };
    case 'done_today':   return { backgroundColor: C.green };
    case 'today_undone': return { borderWidth: 2, borderColor: C.accent };
    case 'missed':       return { backgroundColor: C.muted };
    default:             return {};
  }
}

function getCellTextColor(state: CellState): string {
  switch (state) {
    case 'done':         return C.white;
    case 'done_today':   return C.bg;
    case 'today_undone': return C.accent;
    case 'missed':       return C.sub;
    default:             return 'transparent';
  }
}

const HIDDEN_STATES: CellState[] = ['padding', 'future', 'before_creation'];

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { habit: Habit };

export default function HabitCalendar({ habit }: Props) {
  const now = new Date();
  const [viewYear, setViewYear]   = useState(() => now.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => now.getMonth());

  const todayDate = todayStr();

  const completedSet = useMemo(
    () => new Set(habit.completedDates),
    [habit.completedDates],
  );

  const grid = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthLabel = useMemo(
    () => new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [viewYear, viewMonth],
  );

  const currentStreak = useMemo(() => getCurrentStreak(habit.completedDates), [habit.completedDates]);
  const longestStreak = useMemo(() => getLongestStreak(habit.completedDates), [habit.completedDates]);

  const realNow = new Date();
  const isAtCurrentMonth =
    viewYear === realNow.getFullYear() && viewMonth === realNow.getMonth();

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (isAtCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <View style={s.container}>
      {/* Month navigation */}
      <View style={s.monthNav}>
        <TouchableOpacity onPress={goToPrevMonth} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          disabled={isAtCurrentMonth}
          style={[s.navBtn, isAtCurrentMonth && s.navBtnDisabled]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[s.navArrow, isAtCurrentMonth && s.navArrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day-of-week header */}
      <View style={s.dowRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <View key={i} style={s.dowCell}>
            <Text style={s.dowText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {grid.map((row, ri) => (
        <View key={ri} style={s.weekRow}>
          {row.map((cell, ci) => {
            const state = getCellState(cell.date, completedSet, habit.createdAt, todayDate);
            return (
              <View key={ci} style={[s.cell, getCellBgStyle(state, habit.color)]}>
                {cell.dayNum !== null && !HIDDEN_STATES.includes(state) && (
                  <Text style={[s.cellNum, { color: getCellTextColor(state) }]}>
                    {cell.dayNum}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* Streak footer */}
      <View style={s.streakRow}>
        <Text style={s.streakItem}>
          🔥 <Text style={s.streakVal}>{currentStreak}</Text>-day streak
        </Text>
        <Text style={s.streakItem}>
          🏆 <Text style={s.streakVal}>{longestStreak}</Text>-day best
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     C.border,
    marginBottom:    12,
  },

  monthNav: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   12,
  },
  navBtn:         { padding: 4 },
  navBtnDisabled: { opacity: 0.25 },
  navArrow:         { color: C.text,  fontSize: 24, fontWeight: '300', lineHeight: 26 },
  navArrowDisabled: { color: C.muted },
  monthLabel: { color: C.text, fontSize: 14, fontWeight: '700' },

  dowRow: { flexDirection: 'row', marginBottom: 4 },
  dowCell: {
    width:      CELL_W,
    alignItems: 'center',
    marginRight: 2,
  },
  dowText: { color: C.sub, fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  weekRow: { flexDirection: 'row', marginBottom: 2 },
  cell: {
    width:           CELL_W,
    height:          CELL_H,
    borderRadius:    6,
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     2,
  },
  cellNum: { fontSize: 10, fontWeight: '600' },

  streakRow: {
    flexDirection:  'row',
    justifyContent: 'space-around',
    marginTop:      12,
    paddingTop:     12,
    borderTopWidth: 1,
    borderColor:    C.border,
  },
  streakItem: { color: C.sub, fontSize: 12 },
  streakVal:  { color: C.text, fontWeight: '700' },
});
