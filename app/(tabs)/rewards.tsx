import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits, getLevelInfo } from '@/contexts/habits-context';
import { useSettings } from '@/contexts/settings-context';
import { useTheme } from '@/hooks/useTheme';
import BadgeGrid from '@/components/habits/BadgeGrid';
import LevelBar from '@/components/habits/LevelBar';

export default function RewardsScreen() {
  const { stats } = useHabits();
  const { settings } = useSettings();
  const C = useTheme();
  const levelInfo = getLevelInfo(stats.totalPoints);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={settings.lightMode ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[s.title, { color: C.text }]}>Rewards</Text>

          <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <LevelBar info={levelInfo} points={stats.totalPoints} />
          </View>

          <Text style={[s.sectionHeader, { color: C.sub }]}>ACHIEVEMENTS</Text>
          <BadgeGrid earnedBadges={stats.earnedBadges} />

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1 },
  scroll:        { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 48 },
  title:         { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 20 },
  card:          { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  sectionHeader: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
});
