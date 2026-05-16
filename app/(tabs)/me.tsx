import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getCurrentStreak,
  getLevelInfo,
  getLongestStreak,
  isHabitActiveToday,
  todayStr,
  useHabits,
} from '@/contexts/habits-context';
import { useSettings } from '@/contexts/settings-context';

const DARK = {
  bg:     '#0D1117',
  card:   '#161B27',
  border: '#21293D',
  text:   '#E8EEFF',
  sub:    '#6B7A99',
};

const LIGHT = {
  bg:     '#F5F5F5',
  card:   '#FFFFFF',
  border: '#E0E0E0',
  text:   '#111111',
  sub:    '#777777',
};

export default function MeScreen() {
  const { stats, habits } = useHabits();
  const { settings } = useSettings();
  const router = useRouter();
  const C = settings.lightMode ? LIGHT : DARK;

  const levelInfo = getLevelInfo(stats.totalPoints);
  const today = todayStr();
  const todayHabits = habits.filter(isHabitActiveToday);
  const doneToday = todayHabits.filter(h => h.completedDates.includes(today)).length;

  const allDates = new Set(habits.flatMap(h => h.completedDates));
  const daysActive = allDates.size;

  const bestStreak = habits.reduce(
    (best, h) => Math.max(best, getLongestStreak(h.completedDates)),
    0,
  );

  const memberSince = (() => {
    if (!habits.length) return 'now';
    const earliest = habits.map(h => h.createdAt).sort()[0];
    const [y, m] = earliest.split('-');
    const month = new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'short' });
    return `since ${month.toLowerCase()} ${y}`;
  })();

  const levelLabel = `L${levelInfo.level} ${levelInfo.name.toLowerCase()}`;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={settings.lightMode ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top bar ──────────────────────────────────────── */}
          <View style={s.topBar}>
            <View style={s.profileRow}>
              <View style={[s.avatarWrap, { backgroundColor: C.card, borderColor: C.border }]}>
                <Image
                  source={require('@/assets/images/mood/happy.png')}
                  style={s.avatarImg}
                  resizeMode="contain"
                />
              </View>
              <View style={s.profileInfo}>
                <Text style={[s.username, { color: C.text }]}>Sam</Text>
                <Text style={[s.meta, { color: C.sub }]}>
                  {memberSince} · {levelLabel}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.settingsBtn, { backgroundColor: C.card, borderColor: C.border }]}
                activeOpacity={0.7}
                onPress={() => router.push('/settings')}
              >
                <Text style={[s.settingsIcon, { color: C.sub }]}>⚙</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Stat cards ───────────────────────────────────── */}
          <View style={s.statsGrid}>
            {([
              ['days active',  String(daysActive)],
              ['habits kept',  `${doneToday} of ${todayHabits.length}`],
              ['XP total',     stats.totalPoints.toLocaleString()],
              ['best streak',  `${bestStreak} d`],
            ] as [string, string][]).map(([label, value]) => (
              <View key={label} style={[s.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[s.statLabel, { color: C.sub }]}>{label}</Text>
                <Text style={[s.statValue, { color: C.text }]}>{value}</Text>
              </View>
            ))}
          </View>

          {/* ── Habits section ───────────────────────────────── */}
          <Text style={[s.sectionTitle, { color: C.text }]}>Habits</Text>

          {habits.length === 0 ? (
            <View style={s.empty}>
              <Text style={[s.emptyText, { color: C.sub }]}>
                No habits yet — add one to get started!
              </Text>
            </View>
          ) : (
            <View style={s.habitList}>
              {habits.map(habit => {
                const streak = getCurrentStreak(habit.completedDates);
                return (
                  <View
                    key={habit.id}
                    style={[s.habitRow, { backgroundColor: C.card, borderColor: C.border }]}
                  >
                    <View style={s.habitLeft}>
                      <Text style={s.habitEmoji}>{habit.emoji}</Text>
                      <Text style={[s.habitName, { color: C.text }]}>{habit.name}</Text>
                    </View>
                    {streak > 0 && (
                      <Text style={[s.habitStreak, { color: C.sub }]}>{streak}d</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  topBar:     { marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg:   { width: 64, height: 64 },
  profileInfo: { flex: 1, marginLeft: 14 },
  username:    { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  meta:        { fontSize: 12, fontWeight: '500', marginTop: 2 },
  settingsBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  settingsIcon: { fontSize: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard:  { width: '47%', borderRadius: 16, borderWidth: 1, padding: 18 },
  statLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  statValue: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  habitList:    { gap: 10 },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 14, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16,
  },
  habitLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  habitEmoji:  { fontSize: 20 },
  habitName:   { fontSize: 15, fontWeight: '500' },
  habitStreak: { fontSize: 13, fontWeight: '600' },

  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
