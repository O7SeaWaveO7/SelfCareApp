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
import {
  Habit,
  isHabitActiveToday,
  todayStr,
  ToggleResult,
  useHabits,
} from "@/contexts/habits-context";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/contexts/settings-context";

type Filter = "today" | "all";

export default function HomeScreen() {
  const { habits, deleteHabit, toggleHabit } = useHabits();
  const { settings } = useSettings();
  const router = useRouter();
  const C = useTheme();

  const [toast, setToast] = useState<ToggleResult | null>(null);
  const [filter, setFilter] = useState<Filter>("today");

  const today = todayStr();
  const todayHabits = habits.filter(isHabitActiveToday);
  const visibleHabits = filter === "today" ? todayHabits : habits;
  const done = todayHabits.filter((h) => h.completedDates.includes(today)).length;
  const total = todayHabits.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const dateLabel = new Date()
    .toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })
    .toLowerCase();

  const motivationMsg = () => {
    if (total === 0) return "No habits scheduled today 🌱";
    if (done === total) return "Perfect day! You crushed it! 🏆";
    if (done === 0) return "Ready to build some habits? 💪";
    return `${done} of ${total} done today.\nYou're on a roll!`;
  };

  const onToggle = useCallback(async (id: string) => {
    const result = await toggleHabit(id);
    if (result) setToast(result);
  }, [toggleHabit]);

  const openMenu = (habit: Habit) =>
    Alert.alert(habit.name, undefined, [
      { text: "Edit", onPress: () => router.push({ pathname: "./add", params: { id: habit.id } }) },
      {
        text: "Delete", style: "destructive",
        onPress: () =>
          Alert.alert("Delete habit?", `Remove "${habit.name}" permanently?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteHabit(habit.id) },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={settings.lightMode ? "dark-content" : "light-content"} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {toast && <Toast result={toast} onHide={() => setToast(null)} />}

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            <View style={[s.avatar, { backgroundColor: C.card, borderColor: C.border }]}>
              <Image
                source={require("@/assets/images/mood/happy.png")}
                style={s.avatarEmoji}
                resizeMode="contain"
              />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[s.welcomeText, { color: C.text }]}>Welcome back!</Text>
              <Text style={[s.dateText, { color: C.sub }]}>{dateLabel}</Text>
            </View>
          </View>

          {/* Progress card */}
          {habits.length > 0 && (
            <View style={[s.progressCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={s.progressTextRow}>
                <Text style={[s.progressMsg, { color: C.text }]}>{motivationMsg()}</Text>
                <Text style={[s.progressPct, { color: C.accent }]}>{pct}%</Text>
              </View>
              <View style={[s.barTrack, { backgroundColor: C.border }]}>
                <View style={[s.barFill, { width: `${pct}%`, backgroundColor: C.accent }]} />
              </View>
            </View>
          )}

          {/* Filter tabs */}
          {habits.length > 0 && (
            <View style={s.filterRow}>
              {(["today", "all"] as Filter[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    s.filterChip,
                    { borderColor: C.border, backgroundColor: C.card },
                    filter === f && { backgroundColor: C.accent, borderColor: C.accent },
                  ]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[
                    s.filterTxt, { color: C.sub },
                    filter === f && { color: C.white },
                  ]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Habit list */}
          {habits.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🌱</Text>
              <Text style={[s.emptyTitle, { color: C.text }]}>No habits yet</Text>
              <Text style={[s.emptySub, { color: C.sub }]}>Tap + to add your first habit</Text>
            </View>
          ) : visibleHabits.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>☀️</Text>
              <Text style={[s.emptyTitle, { color: C.text }]}>Nothing scheduled today</Text>
              <Text style={[s.emptySub, { color: C.sub }]}>Switch to All to see every habit</Text>
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
            <Text style={[s.hint, { color: C.muted }]}>Long-press a habit to edit or delete</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 90, height: 90, borderRadius: 100, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarEmoji:  { width: 100, height: 100 },
  welcomeText:  { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  dateText:     { fontSize: 13, fontWeight: "500" },

  progressCard:    { borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 1 },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  progressMsg:     { fontSize: 15, fontWeight: "600", lineHeight: 22, flex: 1, marginRight: 8 },
  progressPct:     { fontSize: 20, fontWeight: "800" },
  barTrack:        { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill:         { height: "100%", borderRadius: 3 },

  filterRow:       { flexDirection: "row", gap: 10, marginBottom: 16 },
  filterChip:      { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterTxt:       { fontSize: 13, fontWeight: "600" },

  list:      { gap: 10, marginBottom: 16 },
  empty:     { alignItems: "center", paddingVertical: 64 },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptySub:   { fontSize: 13 },
  hint:       { fontSize: 11, textAlign: "center", marginTop: 8 },
});
