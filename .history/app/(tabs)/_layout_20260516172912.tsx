import { HapticTab } from "@/components/haptic-tab";
import { useSettings } from "@/contexts/settings-context";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DARK_C = {
  bg: "#0D1117",
  border: "#21293D",
  accent: "#5B8AF0",
  muted: "#6B7A99",
  white: "#FFFFFF",
};

const LIGHT_C = {
  bg: "#F5F5F5",
  border: "#E0E0E0",
  accent: "#5B8AF0",
  muted: "#999999",
  white: "#FFFFFF",
};

// White icons for dark mode, black icons for light mode
const DARK_ICONS = {
  habit: require("@/assets/images/tabs/WhiteOutlineHabit128.png"),
  calendar: require("@/assets/images/tabs/WhiteOutlineCalendar128.png"),
  rewards: require("@/assets/images/tabs/WhiteOutlineRewards128.png"),
  profile: require("@/assets/images/tabs/WhiteOutlineProfile128.png"),
};

const LIGHT_ICONS = {
  habit: require("@/assets/images/tabs/BlackOutlineHabit128.png"),
  calendar: require("@/assets/images/tabs/BlackOutlineCalendar128.png"),
  rewards: require("@/assets/images/tabs/BlackOutlineRewards128.png"),
  profile: require("@/assets/images/tabs/BlackOutlineProfile128.png"),
};

function TabIcon({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) {
  return (
    <Image
      source={source}
      style={{ width: 25, height: 25, opacity: focused ? 1 : 0.4 }}
      resizeMode="contain"
    />
  );
}

function AddButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/(tabs)/add" })}
      activeOpacity={0.85}
      style={s.addWrap}
    >
      <View style={s.addCircle}>
        <Text style={s.addPlus}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const bottomPad = Math.max(insets.bottom, 10);
  const C = settings.lightMode ? LIGHT_C : DARK_C;
  const ICONS = settings.lightMode ? LIGHT_ICONS : DARK_ICONS;

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
          height: 64 + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Habits",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.habit} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Streaks",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.calendar} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarButton: () => <AddButton />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.rewards} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.profile} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  addWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "ios" ? 10 : 0,
  },
  addCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: DARK_C.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: DARK_C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addPlus: {
    color: DARK_C.white,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 32,
    marginTop: -2,
  },
});
