import { HapticTab } from "@/components/haptic-tab";
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

const C = {
  bg: "#0D1117",
  border: "#21293D",
  accent: "#5B8AF0",
  muted: "#6B7A99",
  white: "#FFFFFF",
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
      style={{
        width: 100,
        height: 100,
        opacity: focused ? 1 : 0.4,
        tintColor: C.white,
      }}
      resizeMode="contain"
    />
  );
}

// Separate component so useRouter hook works inside it
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
          height: Platform.OS === "ios" ? 84 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 26 : 10,
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
            <TabIcon
              source={require("@/assets/images/tabs/WhiteOutlineHabit.png")}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Streaks",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={require("@/assets/images/tabs/WhiteOutlineCalendar.png")}
              focused={focused}
            />
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
            <TabIcon
              source={require("@/assets/images/tabs/WhiteOutlineRewards.png")}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={require("@/assets/images/tabs/WhiteOutlineProfile.png")}
              focused={focused}
            />
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
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addPlus: {
    color: C.white,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 32,
    marginTop: -2,
  },
});
