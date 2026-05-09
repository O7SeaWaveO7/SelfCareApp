import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  completedDates: string[]; // 'YYYY-MM-DD' local date strings
  createdAt: string;
};

export type BadgeId =
  | "first_step"
  | "on_fire"
  | "week_warrior"
  | "month_master"
  | "perfect_day"
  | "collector"
  | "century"
  | "elite";

export const ALL_BADGES: {
  id: BadgeId;
  name: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "first_step",
    name: "First Step",
    emoji: "🌱",
    description: "Complete your first habit",
  },
  {
    id: "on_fire",
    name: "On Fire",
    emoji: "🔥",
    description: "Achieve a 3-day streak",
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    emoji: "💪",
    description: "Achieve a 7-day streak",
  },
  {
    id: "month_master",
    name: "Month Master",
    emoji: "🌟",
    description: "30-day streak on any habit",
  },
  {
    id: "perfect_day",
    name: "Perfect Day",
    emoji: "⚡",
    description: "Complete all habits in one day",
  },
  {
    id: "collector",
    name: "Collector",
    emoji: "🏆",
    description: "Create 5 or more habits",
  },
  {
    id: "century",
    name: "Century",
    emoji: "💫",
    description: "Earn 100 total points",
  },
  { id: "elite", name: "Elite", emoji: "👑", description: "Reach Level 5" },
];

export type UserStats = { totalPoints: number; earnedBadges: BadgeId[] };

export type ToggleResult = {
  pointsEarned: number;
  message: string;
  newBadges: BadgeId[];
};

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const todayStr = (): string => localDateStr(new Date());

// ─── Streak Helpers ───────────────────────────────────────────────────────────

export function getCurrentStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates)].sort();
  const today = todayStr();
  const yday = new Date();
  yday.setDate(yday.getDate() - 1);
  const ydayStr = localDateStr(yday);

  if (!unique.includes(today) && !unique.includes(ydayStr)) return 0;

  let streak = 0;
  const check = new Date(unique.includes(today) ? today : ydayStr);

  for (let i = unique.length - 1; i >= 0; i--) {
    const cs = localDateStr(check);
    if (unique[i] === cs) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else if (unique[i] < cs) {
      break;
    }
  }
  return streak;
}

export function getLongestStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates)].sort();
  if (unique.length === 1) return 1;
  let longest = 1;
  let cur = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (localDateStr(prev) === unique[i]) {
      cur++;
      if (cur > longest) longest = cur;
    } else {
      cur = 1;
    }
  }
  return longest;
}

// ─── Level System ─────────────────────────────────────────────────────────────

export type LevelInfo = {
  level: number;
  name: string;
  progress: number; // 0–1
  nextThreshold: number;
  currentThreshold: number;
};

const LEVELS = [
  { min: 0, name: "Beginner" },
  { min: 100, name: "Explorer" },
  { min: 300, name: "Dedicated" },
  { min: 700, name: "Champion" },
  { min: 1500, name: "Master" },
  { min: 3000, name: "Legend" },
];

export function getLevelInfo(points: number): LevelInfo {
  let lv = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) lv = i;
  }
  const curr = LEVELS[lv].min;
  const next = LEVELS[lv + 1]?.min ?? curr * 2 + 1000;
  const progress =
    lv === LEVELS.length - 1 ? 1 : Math.min(1, (points - curr) / (next - curr));
  return {
    level: lv + 1,
    name: LEVELS[lv].name,
    progress,
    nextThreshold: next,
    currentThreshold: curr,
  };
}

// ─── Badge Logic ──────────────────────────────────────────────────────────────

function computeEarnedBadges(habits: Habit[], totalPoints: number): BadgeId[] {
  const today = todayStr();
  const earned: BadgeId[] = [];
  if (habits.some((h) => h.completedDates.length > 0))
    earned.push("first_step");
  if (habits.some((h) => getCurrentStreak(h.completedDates) >= 3))
    earned.push("on_fire");
  if (habits.some((h) => getCurrentStreak(h.completedDates) >= 7))
    earned.push("week_warrior");
  if (habits.some((h) => getCurrentStreak(h.completedDates) >= 30))
    earned.push("month_master");
  if (
    habits.length > 0 &&
    habits.every((h) => h.completedDates.includes(today))
  )
    earned.push("perfect_day");
  if (habits.length >= 5) earned.push("collector");
  if (totalPoints >= 100) earned.push("century");
  if (getLevelInfo(totalPoints).level >= 5) earned.push("elite");
  return earned;
}

// ─── Motivational Messages ────────────────────────────────────────────────────

const MESSAGES = [
  "You're crushing it! 🔥",
  "Keep the momentum! ⚡",
  "One step closer! 💪",
  "Habit locked in! ✅",
  "That's the spirit! 🌟",
  "Building greatness! 🏆",
  "Consistency wins! 🗝️",
  "Unstoppable! 🚀",
  "Small steps, big change! 🎯",
  "You're on a roll! 🎉",
];

// ─── Context ──────────────────────────────────────────────────────────────────

type HabitsContextType = {
  habits: Habit[];
  stats: UserStats;
  isLoading: boolean;
  addHabit: (name: string, emoji: string, color: string) => Promise<void>;
  editHabit: (
    id: string,
    name: string,
    emoji: string,
    color: string,
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string) => Promise<ToggleResult | null>;
};

const HabitsCtx = createContext<HabitsContextType | null>(null);

const HABITS_KEY = "habtrack_habits_v1";
const STATS_KEY = "habtrack_stats_v1";

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    earnedBadges: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [hj, sj] = await Promise.all([
          AsyncStorage.getItem(HABITS_KEY),
          AsyncStorage.getItem(STATS_KEY),
        ]);
        if (hj) setHabits(JSON.parse(hj));
        if (sj) setStats(JSON.parse(sj));
      } catch (e) {
        console.error("HabitsProvider load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (h: Habit[], s: UserStats) => {
    setHabits(h);
    setStats(s);
    await Promise.all([
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(h)),
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(s)),
    ]);
  }, []);

  const addHabit = useCallback(
    async (name: string, emoji: string, color: string) => {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name,
        emoji,
        color,
        completedDates: [],
        createdAt: todayStr(),
      };
      await persist([...habits, newHabit], stats);
    },
    [habits, stats, persist],
  );

  const editHabit = useCallback(
    async (id: string, name: string, emoji: string, color: string) => {
      await persist(
        habits.map((h) => (h.id === id ? { ...h, name, emoji, color } : h)),
        stats,
      );
    },
    [habits, stats, persist],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      await persist(
        habits.filter((h) => h.id !== id),
        stats,
      );
    },
    [habits, stats, persist],
  );

  const toggleHabit = useCallback(
    async (id: string): Promise<ToggleResult | null> => {
      const today = todayStr();
      const habit = habits.find((h) => h.id === id);
      if (!habit) return null;

      const isDone = habit.completedDates.includes(today);
      let pointsEarned = 0;

      const newHabits = habits.map((h) => {
        if (h.id !== id) return h;
        if (isDone) {
          return {
            ...h,
            completedDates: h.completedDates.filter((d) => d !== today),
          };
        }
        const newDates = [...h.completedDates, today];
        const streak = getCurrentStreak(newDates);
        pointsEarned = 10 + streak * 2;
        return { ...h, completedDates: newDates };
      });

      const newTotal = isDone
        ? Math.max(0, stats.totalPoints - 10)
        : stats.totalPoints + pointsEarned;
      const allBadges = computeEarnedBadges(newHabits, newTotal);
      const freshBadges = allBadges.filter(
        (b) => !stats.earnedBadges.includes(b),
      );
      const newStats: UserStats = {
        totalPoints: newTotal,
        earnedBadges: [...new Set([...stats.earnedBadges, ...allBadges])],
      };

      await persist(newHabits, newStats);

      if (isDone) return null;
      return {
        pointsEarned,
        message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
        newBadges: freshBadges,
      };
    },
    [habits, stats, persist],
  );

  return (
    <HabitsCtx.Provider
      value={{
        habits,
        stats,
        isLoading,
        addHabit,
        editHabit,
        deleteHabit,
        toggleHabit,
      }}
    >
      {children}
    </HabitsCtx.Provider>
  );
}

export function useHabits(): HabitsContextType {
  const ctx = useContext(HabitsCtx);
  if (!ctx) throw new Error("useHabits must be used inside HabitsProvider");
  return ctx;
}
