import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { HabitsProvider } from "@/contexts/habits-context";
import { SettingsProvider, useSettings } from "@/contexts/settings-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppShell() {
  const { settings } = useSettings();
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style={settings.lightMode ? "dark" : "light"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <HabitsProvider>
        <AppShell />
      </HabitsProvider>
    </SettingsProvider>
  );
}
