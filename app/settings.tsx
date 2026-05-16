import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/contexts/settings-context';

// ── Themed color sets ────────────────────────────────────────────────────────

const DARK = {
  bg:      '#0D1117',
  card:    '#161B27',
  border:  '#21293D',
  text:    '#E8EEFF',
  sub:     '#6B7A99',
  accent:  '#5B8AF0',
  sep:     '#21293D',
  label:   '#6B7A99',
};

const LIGHT = {
  bg:      '#F5F5F5',
  card:    '#FFFFFF',
  border:  '#E0E0E0',
  text:    '#111111',
  sub:     '#777777',
  accent:  '#5B8AF0',
  sep:     '#E0E0E0',
  label:   '#999999',
};

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label, C }: { label: string; C: typeof DARK }) {
  return (
    <Text style={[styles.sectionLabel, { color: C.label }]}>{label}</Text>
  );
}

function SettingRow({
  label,
  right,
  onPress,
  C,
  last,
}: {
  label: string;
  right: React.ReactNode;
  onPress?: () => void;
  C: typeof DARK;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={[
        styles.row,
        { backgroundColor: C.card, borderColor: C.border },
        !last && { borderBottomWidth: 1, borderBottomColor: C.sep },
      ]}
    >
      <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
      <View style={styles.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, update } = useSettings();
  const C = settings.lightMode ? LIGHT : DARK;

  const { start, end } = settings.quietHours;
  const fmtHour = (h: number) => {
    const ampm = h >= 12 ? 'a' : 'p';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}${ampm}`;
  };
  const quietLabel = `${fmtHour(start)} – ${fmtHour(end)}`;

  const switchTrack = { false: C.border, true: C.accent };

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={settings.lightMode ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Back + Title ─────────────────────────────────── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.backArrow, { color: C.sub }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: C.text }]}>Settings</Text>
          </View>

          {/* ── Profile row ──────────────────────────────────── */}
          <View
            style={[
              styles.profileCard,
              { backgroundColor: C.card, borderColor: C.border },
            ]}
          >
            <View style={[styles.avatarWrap, { backgroundColor: C.border }]}>
              <Image
                source={require('@/assets/images/mood/happy.png')}
                style={styles.avatarImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: C.text }]}>Sam</Text>
              <Text style={[styles.profileEmail, { color: C.sub }]}>
                sam@example.com
              </Text>
            </View>
            <Text style={[styles.chevron, { color: C.sub }]}>›</Text>
          </View>

          <View style={[styles.divider, { borderColor: C.sep }]} />

          {/* ── PRACTICE ─────────────────────────────────────── */}
          <SectionLabel label="PRACTICE" C={C} />

          <View style={[styles.card, { borderColor: C.border }]}>
            <SettingRow
              label="Light Mode"
              C={C}
              right={
                <Switch
                  value={settings.lightMode}
                  onValueChange={v => update({ lightMode: v })}
                  trackColor={switchTrack}
                  thumbColor={C.card}
                />
              }
            />
            <SettingRow
              label="Quiet hours"
              C={C}
              onPress={() => {/* future: time picker */}}
              right={
                <View style={styles.rowRightInline}>
                  <Text style={[styles.rowValue, { color: C.sub }]}>
                    {quietLabel}
                  </Text>
                  <Text style={[styles.chevron, { color: C.sub }]}>›</Text>
                </View>
              }
            />
            <SettingRow
              label="Reminder"
              C={C}
              onPress={() => {/* future: reminder list */}}
              right={
                <Text style={[styles.chevron, { color: C.sub }]}>›</Text>
              }
            />
            <SettingRow
              label="Notifications"
              C={C}
              last
              right={
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={v => update({ notificationsEnabled: v })}
                  trackColor={switchTrack}
                  thumbColor={C.card}
                />
              }
            />
          </View>

          {/* ── SUPPORT ──────────────────────────────────────── */}
          <SectionLabel label="SUPPORT" C={C} />

          <View style={[styles.card, { borderColor: C.border }]}>
            <SettingRow
              label="Mood prompts"
              C={C}
              right={
                <Switch
                  value={settings.moodPromptsEnabled}
                  onValueChange={v => update({ moodPromptsEnabled: v })}
                  trackColor={switchTrack}
                  thumbColor={C.card}
                />
              }
            />
            <SettingRow
              label="Sound effects"
              C={C}
              right={
                <Switch
                  value={settings.soundEffectsEnabled}
                  onValueChange={v => update({ soundEffectsEnabled: v })}
                  trackColor={switchTrack}
                  thumbColor={C.card}
                />
              }
            />
            <SettingRow
              label="Haptics"
              C={C}
              last
              right={
                <Switch
                  value={settings.hapticsEnabled}
                  onValueChange={v => update({ hapticsEnabled: v })}
                  trackColor={switchTrack}
                  thumbColor={C.card}
                />
              }
            />
          </View>

          {/* ── Version ──────────────────────────────────────── */}
          <Text style={[styles.version, { color: C.sub }]}>
            v 0.1 · made with care
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn:   { marginRight: 8, padding: 4 },
  backArrow: { fontSize: 32, lineHeight: 36, fontWeight: '300' },
  title:     { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg:    { width: 46, height: 46 },
  profileInfo:  { flex: 1, marginLeft: 12 },
  profileName:  { fontSize: 16, fontWeight: '700' },
  profileEmail: { fontSize: 12, marginTop: 2 },

  divider: {
    borderTopWidth: 1,
    marginVertical: 20,
    opacity: 0.5,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowRight: { alignItems: 'center', justifyContent: 'center' },
  rowRightInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13 },

  chevron: { fontSize: 20, fontWeight: '400', lineHeight: 24 },

  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
