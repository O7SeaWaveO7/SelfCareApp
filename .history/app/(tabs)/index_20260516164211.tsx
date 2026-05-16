import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HabitRow from "@/components/habits/HabitRow";
import Toast from "@/components/habits/Toast";
import { C } from "@/constants/habitColors";
import {
  Habit,
  isHabitActiveToday,
  todayStr,
  ToggleResult,
  useHabits,
} from "@/contexts/habits-context";

type Filter = "today" | "all";

export default function HomeScreen() {
  const { habits, deleteHabit, toggleHabit } = useHabits();
  const router = useRouter();

  const [toast, setToast] = useState<ToggleResult | null>(null);
  const [filter, setFilter] = useState<Filter>("today");

  const today = todayStr();

  // "Today" tab: only habits scheduled for today's weekday
  const todayHabits = habits.filter(isHabitActiveToday);
  // "All" tab: every habit regardless of schedule
  const visibleHabits = filter === "today" ? todayHabits : habits;

  const done = todayHabits.filter((h) =>
    h.completedDates.includes(today),
  ).length;
  const total = todayHabits.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const dateLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
    })
    .toLowerCase();

  const motivationMsg = () => {
    if (total === 0) return "No habits scheduled today 🌱";
    if (done === total) return "Perfect day! You crushed it! 🏆";
    if (done === 0) return "Ready to build some habits? 💪";
    return `${done} of ${total} done today.\nYou're on a roll!`;
  };

  const onToggle = useCallback(
    async (id: string) => {
      const result = await toggleHabit(id);
      if (result) setToast(result);
    },
    [toggleHabit],
  );

  const openMenu = (habit: Habit) =>
    Alert.alert(habit.name, undefined, [
      {
        text: "Edit",
        onPress: () =>
          router.push({ pathname: "./add", params: { id: habit.id } }),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          Alert.alert("Delete habit?", `Remove "${habit.name}" permanently?`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteHabit(habit.id),
            },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {toast && <Toast result={toast} onHide={() => setToast(null)} />}

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ──────────────────────────────────────────── */}
          <View style={s.header}>
            <View style={s.avatar}>
              <Image
                source={require("@/assets/images/mood/happy.png")}
                style={s.avatarEmoji}
                resizeMode="contain"
              />
            </View>
            <Text> Welcome Back!!!</Text>
            <Text style={s.dateText}>{dateLabel}</Text>
          </View>

          {/* ── Progress card ────────────────────────────────────── */}
          {habits.length > 0 && (
            <View style={s.progressCard}>
              <View style={s.progressTextRow}>
                <Text style={s.progressMsg}>{motivationMsg()}</Text>
                <Text style={s.progressPct}>{pct}%</Text>
              </View>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${pct}%` }]} />
              </View>
            </View>
          )}

          {/* ── Filter tabs ──────────────────────────────────────── */}
          {habits.length > 0 && (
            <View style={s.filterRow}>
              <TouchableOpacity
                style={[s.filterChip, filter === "today" && s.filterChipActive]}
                onPress={() => setFilter("today")}
              >
                <Text
                  style={[s.filterTxt, filter === "today" && s.filterTxtActive]}
                >
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.filterChip, filter === "all" && s.filterChipActive]}
                onPress={() => setFilter("all")}
              >
                <Text
                  style={[s.filterTxt, filter === "all" && s.filterTxtActive]}
                >
                  All
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Habit list ───────────────────────────────────────── */}
          {habits.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🌱</Text>
              <Text style={s.emptyTitle}>No habits yet</Text>
              <Text style={s.emptySub}>Tap + to add your first habit</Text>
            </View>
          ) : visibleHabits.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>☀️</Text>
              <Text style={s.emptyTitle}>Nothing scheduled today</Text>
              <Text style={s.emptySub}>Switch to All to see every habit</Text>
            </View>
          ) : (
            <View style={s.list}>
              {visibleHabits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  isActiveToday={isHabitActiveToday(habit)}
                  onToggle={() => onToggle(habit.id)}
                  onLongPress={() => openMenu(habit)}
                />
              ))}
            </View>
          )}

          {habits.length > 0 && (
            <Text style={s.hint}>Long-press a habit to edit or delete</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 100,
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { width: 100, height: 100 },
  dateText: { color: C.sub, fontSize: 13, fontWeight: "500" },

  progressCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  progressMsg: {
    color: C.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
  },
  progressPct: { color: C.accent, fontSize: 20, fontWeight: "800" },
  barTrack: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: C.accent, borderRadius: 3 },

  // Filter tabs
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  filterChipActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  filterTxt: { color: C.sub, fontSize: 13, fontWeight: "600" },
  filterTxtActive: { color: C.white },

  list: { gap: 10, marginBottom: 16 },
  empty: { alignItems: "center", paddingVertical: 64 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySub: { color: C.sub, fontSize: 13 },
  hint: { color: C.muted, fontSize: 11, textAlign: "center", marginTop: 8 },
});
