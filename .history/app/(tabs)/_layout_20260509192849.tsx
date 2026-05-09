import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";

const C = {
  bg: "#0D1117",
  border: "#21293D",
  accent: "#5B8AF0",
  muted: "#2D3A52",
};

function Icon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{glyph}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 84 : 60,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 26 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => <Icon glyph="☀️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Progress",
          tabBarIcon: ({ focused }) => <Icon glyph="📊" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
