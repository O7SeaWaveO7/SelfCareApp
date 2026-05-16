import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { C, HABIT_COLORS, HABIT_EMOJIS } from "@/constants/habitColors";
import { HabitConfig, HabitFrequency, useHabits } from "@/contexts/habits-context";

// Sun=0 … Sat=6  (matches JS getDay())
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const DEFAULT_CUSTOM_DAYS = [true, true, true, true, true, true, true];

// ─── Time picker modal ────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, "0"); }

function formatTime(hour: number, minute: number) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h12}:${pad(minute)} ${ampm}`;
}

type TimePickerProps = {
  visible: boolean;
  hour: number;
  minute: number;
  onConfirm: (h: number, m: number) => void;
  onClose: () => void;
};

function TimePicker({ visible, hour, minute, onConfirm, onClose }: TimePickerProps) {
  const [h, setH] = useState(hour);
  const [m, setM] = useState(minute);

  useEffect(() => { setH(hour); setM(minute); }, [visible]);

  const changeH = (delta: number) => setH((prev) => (prev + delta + 24) % 24);
  const changeM = (delta: number) => setM((prev) => (prev + delta + 60) % 60);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={tp.overlay} activeOpacity={1} onPress={onClose} />
      <View style={tp.sheet}>
        <Text style={tp.title}>Set Time</Text>

        <View style={tp.pickerRow}>
          {/* Hour */}
          <View style={tp.col}>
            <TouchableOpacity onPress={() => changeH(1)} style={tp.arrow}>
              <Text style={tp.arrowTxt}>▲</Text>
            </TouchableOpacity>
            <Text style={tp.digit}>{pad(h)}</Text>
            <TouchableOpacity onPress={() => changeH(-1)} style={tp.arrow}>
              <Text style={tp.arrowTxt}>▼</Text>
            </TouchableOpacity>
          </View>

          <Text style={tp.colon}>:</Text>

          {/* Minute */}
          <View style={tp.col}>
            <TouchableOpacity onPress={() => changeM(5)} style={tp.arrow}>
              <Text style={tp.arrowTxt}>▲</Text>
            </TouchableOpacity>
            <Text style={tp.digit}>{pad(m)}</Text>
            <TouchableOpacity onPress={() => changeM(-5)} style={tp.arrow}>
              <Text style={tp.arrowTxt}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* AM/PM label */}
          <Text style={tp.ampm}>{h < 12 ? "AM" : "PM"}</Text>
        </View>

        <TouchableOpacity style={tp.confirm} onPress={() => { onConfirm(h, m); onClose(); }}>
          <Text style={tp.confirmTxt}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const tp = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, paddingBottom: Platform.OS === "ios" ? 44 : 28,
    borderTopWidth: 1, borderColor: C.border,
  },
  title:  { color: C.text, fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 24 },
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28 },
  col:    { alignItems: "center", gap: 12 },
  arrow:  { padding: 8 },
  arrowTxt: { color: C.sub, fontSize: 14 },
  digit:  { color: C.text, fontSize: 40, fontWeight: "700", minWidth: 60, textAlign: "center" },
  colon:  { color: C.text, fontSize: 36, fontWeight: "300", marginBottom: 4 },
  ampm:   { color: C.sub, fontSize: 18, fontWeight: "600", alignSelf: "center", marginLeft: 4 },
  confirm: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
  },
  confirmTxt: { color: C.white, fontSize: 15, fontWeight: "700" },
});

// ─── Timer picker modal ───────────────────────────────────────────────────────

type TimerPickerProps = {
  visible: boolean;
  minutes: number;
  onConfirm: (m: number) => void;
  onClose: () => void;
};

function TimerPicker({ visible, minutes, onConfirm, onClose }: TimerPickerProps) {
  const [mins, setMins] = useState(minutes);

  useEffect(() => { setMins(minutes); }, [visible]);

  const change = (delta: number) => setMins((prev) => Math.max(1, Math.min(180, prev + delta)));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={tp.overlay} activeOpacity={1} onPress={onClose} />
      <View style={tp.sheet}>
        <Text style={tp.title}>Set Timer</Text>

        <View style={[tp.pickerRow, { marginBottom: 28 }]}>
          <View style={tp.col}>
            <TouchableOpacity onPress={() => change(5)} style={tp.arrow}>
              <Text style={tp.arrowTxt}>▲</Text>
            </TouchableOpacity>
            <Text style={tp.digit}>{pad(mins)}</Text>
            <TouchableOpacity onPress={() => change(-5)} style={tp.arrow}>
              <Text style={tp.arrowTxt}>▼</Text>
            </TouchableOpacity>
          </View>
          <Text style={[tp.ampm, { marginLeft: 8 }]}>min</Text>
        </View>

        <TouchableOpacity style={tp.confirm} onPress={() => { onConfirm(mins); onClose(); }}>
          <Text style={tp.confirmTxt}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AddHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { habits, addHabit, editHabit } = useHabits();

  // Only treat as edit if id is a non-empty string (not undefined/null/"")
  const editing = id && typeof id === "string" && id.length > 0
    ? habits.find((h) => h.id === id)
    : undefined;

  const [name,       setName]       = useState(editing?.name        ?? "");
  const [emoji,      setEmoji]      = useState(editing?.emoji       ?? HABIT_EMOJIS[0]);
  const [color,      setColor]      = useState(editing?.color       ?? HABIT_COLORS[0]);
  const [frequency,  setFrequency]  = useState<HabitFrequency>(editing?.frequency  ?? "daily");
  const [customDays, setCustomDays] = useState<boolean[]>(editing?.customDays ?? DEFAULT_CUSTOM_DAYS);

  const [remindEnabled, setRemindEnabled] = useState(editing?.remindEnabled ?? false);
  const [remindHour,    setRemindHour]    = useState(editing?.remindHour    ?? 8);
  const [remindMinute,  setRemindMinute]  = useState(editing?.remindMinute  ?? 0);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [timerEnabled, setTimerEnabled] = useState(editing?.timerEnabled ?? false);
  const [timerMinutes, setTimerMinutes] = useState(editing?.timerMinutes ?? 5);
  const [showTimerPicker, setShowTimerPicker] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setEmoji(editing.emoji);
      setColor(editing.color);
      setFrequency(editing.frequency);
      setCustomDays(editing.customDays);
      setRemindEnabled(editing.remindEnabled);
      setRemindHour(editing.remindHour);
      setRemindMinute(editing.remindMinute);
      setTimerEnabled(editing.timerEnabled);
      setTimerMinutes(editing.timerMinutes);
    } else {
      // Reset to blank when opened as "New habit"
      setName("");
      setEmoji(HABIT_EMOJIS[0]);
      setColor(HABIT_COLORS[0]);
      setFrequency("daily");
      setCustomDays(DEFAULT_CUSTOM_DAYS);
      setRemindEnabled(false);
      setRemindHour(8);
      setRemindMinute(0);
      setTimerEnabled(false);
      setTimerMinutes(5);
    }
  }, [id]);

  const toggleDay = (i: number) =>
    setCustomDays((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const save = async () => {
    if (!name.trim()) return;
    const cfg: HabitConfig = {
      name: name.trim(),
      emoji,
      color,
      frequency,
      customDays,
      remindEnabled,
      remindHour,
      remindMinute,
      timerEnabled,
      timerMinutes,
    };
    if (editing) {
      await editHabit(editing.id, cfg);
    } else {
      await addHabit(cfg);
    }
    router.back();
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* ── Top bar ─────────────────────────────────────── */}
          <View style={s.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={s.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={s.topTitle}>{editing ? "Edit habit" : "New habit"}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Name ────────────────────────────────────── */}
            <Text style={s.label}>NAME</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Drink 8 glasses of water"
              placeholderTextColor={C.muted}
              maxLength={40}
              returnKeyType="done"
            />

            {/* ── Icon ────────────────────────────────────── */}
            <Text style={s.label}>ICON</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.emojiScroll}
              contentContainerStyle={s.emojiContent}
            >
              {HABIT_EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={[
                    s.emojiOpt,
                    emoji === e && { borderColor: color, backgroundColor: color + "20" },
                  ]}
                >
                  <Text style={s.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Color ───────────────────────────────────── */}
            <Text style={s.label}>COLOR</Text>
            <View style={s.colorRow}>
              {HABIT_COLORS.map((col) => (
                <TouchableOpacity
                  key={col}
                  onPress={() => setColor(col)}
                  style={[
                    s.colorDot,
                    { backgroundColor: col },
                    color === col && s.colorDotSel,
                  ]}
                />
              ))}
            </View>

            {/* ── Frequency ───────────────────────────────── */}
            <Text style={s.label}>FREQUENCY</Text>
            <View style={s.freqRow}>
              {(["daily", "weekdays", "custom"] as HabitFrequency[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={[s.freqChip, frequency === f && { backgroundColor: C.text }]}
                >
                  <Text style={[s.freqTxt, frequency === f && { color: C.bg }]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {frequency === "custom" && (
              <View style={s.daysRow}>
                {DAY_LABELS.map((d, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => toggleDay(i)}
                    style={[s.dayChip, customDays[i] && { backgroundColor: C.text }]}
                  >
                    <Text style={[s.dayTxt, customDays[i] && { color: C.bg }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ── Remind me ───────────────────────────────── */}
            <Text style={s.label}>REMIND ME</Text>
            <View style={s.toggleRow}>
              <TouchableOpacity
                onPress={() => remindEnabled && setShowTimePicker(true)}
                disabled={!remindEnabled}
                style={s.toggleLabelBtn}
              >
                <Text style={[s.toggleLabel, !remindEnabled && { color: C.muted }]}>
                  {formatTime(remindHour, remindMinute)}
                </Text>
                {remindEnabled && <Text style={s.editHint}>tap to change</Text>}
              </TouchableOpacity>
              <Switch
                value={remindEnabled}
                onValueChange={(v) => { setRemindEnabled(v); if (v) setShowTimePicker(true); }}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor={C.white}
              />
            </View>

            {/* ── Timer ───────────────────────────────────── */}
            <Text style={s.label}>TIMER</Text>
            <View style={s.toggleRow}>
              <TouchableOpacity
                onPress={() => timerEnabled && setShowTimerPicker(true)}
                disabled={!timerEnabled}
                style={s.toggleLabelBtn}
              >
                <Text style={[s.toggleLabel, !timerEnabled && { color: C.muted }]}>
                  {pad(timerMinutes)}:00 min
                </Text>
                {timerEnabled && <Text style={s.editHint}>tap to change</Text>}
              </TouchableOpacity>
              <Switch
                value={timerEnabled}
                onValueChange={(v) => { setTimerEnabled(v); if (v) setShowTimerPicker(true); }}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor={C.white}
              />
            </View>

            {/* ── Actions ─────────────────────────────────── */}
            <View style={s.btns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: name.trim() ? C.text : C.border }]}
                onPress={save}
                disabled={!name.trim()}
              >
                <Text style={[s.saveTxt, { color: C.bg }]}>
                  {editing ? "Save" : "Add Habit"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Pickers rendered outside SafeAreaView so they sit over everything */}
      <TimePicker
        visible={showTimePicker}
        hour={remindHour}
        minute={remindMinute}
        onConfirm={(h, m) => { setRemindHour(h); setRemindMinute(m); }}
        onClose={() => setShowTimePicker(false)}
      />
      <TimerPicker
        visible={showTimerPicker}
        minutes={timerMinutes}
        onConfirm={(m) => setTimerMinutes(m)}
        onClose={() => setShowTimerPicker(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 },

  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backArrow: { color: C.text, fontSize: 28, fontWeight: "300", lineHeight: 32 },
  topTitle:  { color: C.text, fontSize: 17, fontWeight: "700" },

  label: {
    color: C.sub, fontSize: 10, fontWeight: "700",
    letterSpacing: 1.2, marginBottom: 10, marginTop: 20,
  },

  input: {
    backgroundColor: C.card, color: C.text,
    borderRadius: 14, padding: 14, fontSize: 15,
    borderWidth: 1, borderColor: C.border,
  },

  emojiScroll:  { marginHorizontal: -4 },
  emojiContent: { paddingHorizontal: 4, gap: 8 },
  emojiOpt: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "transparent", backgroundColor: C.card,
  },
  emojiText: { fontSize: 22 },

  colorRow:    { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorDot:    { width: 32, height: 32, borderRadius: 16 },
  colorDotSel: { borderWidth: 3, borderColor: C.white, transform: [{ scale: 1.15 }] },

  freqRow: { flexDirection: "row", gap: 10 },
  freqChip: {
    flex: 1, paddingVertical: 10, borderRadius: 20,
    alignItems: "center", borderWidth: 1, borderColor: C.border,
  },
  freqTxt: { color: C.text, fontSize: 13, fontWeight: "600" },

  daysRow: { flexDirection: "row", gap: 6, marginTop: 12 },
  dayChip: {
    flex: 1, aspectRatio: 1, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },
  dayTxt: { color: C.text, fontSize: 12, fontWeight: "700" },

  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.card, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: C.border,
  },
  toggleLabelBtn: { flex: 1 },
  toggleLabel:    { color: C.text, fontSize: 15, fontWeight: "600" },
  editHint:       { color: C.accent, fontSize: 11, marginTop: 2 },

  btns: { flexDirection: "row", gap: 12, marginTop: 32 },
  cancelBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 30,
    alignItems: "center", borderWidth: 1, borderColor: C.border,
  },
  cancelTxt: { color: C.sub, fontSize: 15, fontWeight: "600" },
  saveBtn:   { flex: 2, paddingVertical: 15, borderRadius: 30, alignItems: "center" },
  saveTxt:   { fontSize: 15, fontWeight: "700" },
});
