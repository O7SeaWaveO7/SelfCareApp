import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { C } from "@/constants/habitColors";
import {
  getLevelInfo,
  Habit,
  todayStr,
  ToggleResult,
  useHabits,
} from "@/contexts/habits-context";

import HabitModal from "@/components/habits/HabitModal";
import HabitRow from "@/components/habits/HabitRow";
import LevelBar from "@/components/habits/LevelBar";
import Toast from "@/components/habits/Toast";

export default function TodayScreen() {
  const { habits, stats, addHabit, editHabit, deleteHabit, toggleHabit } =
    useHabits();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>();
  const [toast, setToast] = useState<ToggleResult | null>(null);

  const today = todayStr();
  const done = habits.filter((h) => h.completedDates.includes(today)).length;
  const total = habits.length;
  const levelInfo = getLevelInfo(stats.totalPoints);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
        onPress: () => {
          setEditing(habit);
          setModalOpen(true);
        },
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
        {/* Floating toast — sits above scroll content */}
        {toast && <Toast result={toast} onHide={() => setToast(null)} />}

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date + title */}
          <Text style={s.date}>{dateLabel}</Text>
          <Text style={s.title}>Today</Text>

          {/* Level + XP */}
          <LevelBar info={levelInfo} points={stats.totalPoints} />

          {/* Progress summary line */}
          {total > 0 && (
            <Text style={s.progress}>
              {done === total
                ? `🏆 Perfect day — all ${total} done!`
                : `${done} of ${total} completed`}
            </Text>
          )}

          {/* Habits */}
          {habits.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🌱</Text>
              <Text style={s.emptyTitle}>No habits yet</Text>
              <Text style={s.emptySub}>
                Tap "Add Habit" to start your routine
              </Text>
            </View>
          ) : (
            <View style={s.list}>
              {habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  onToggle={() => onToggle(habit.id)}
                  onLongPress={() => openMenu(habit)}
                />
              ))}
            </View>
          )}

          {/* Add habit */}
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => {
              setEditing(undefined);
              setModalOpen(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={s.addTxt}>+ Add Habit</Text>
          </TouchableOpacity>

          {habits.length > 0 && (
            <Text style={s.hint}>Long-press a habit to edit or delete</Text>
          )}
        </ScrollView>

        <HabitModal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(name, emoji, color) => {
            if (editing) editHabit(editing.id, name, emoji, color);
            else addHabit(name, emoji, color);
          }}
          initial={editing}
        />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 48 },

  date: { color: C.sub, fontSize: 12, marginBottom: 4 },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  progress: { color: C.sub, fontSize: 13, marginBottom: 16 },

  list: { gap: 8, marginBottom: 20 },

  empty: {
    alignItems: "center",
    paddingVertical: 56,
  },
  emptyIcon: { fontSize: 44, marginBottom: 14 },
  emptyTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySub: { color: C.sub, fontSize: 13 },

  addBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
  },
  addTxt: { color: C.accent, fontSize: 15, fontWeight: "700" },
  hint: { color: C.muted, fontSize: 11, textAlign: "center", marginTop: 12 },
});
