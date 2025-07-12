import React from "react";
import { Tabs } from "expo-router";
import { useSettingsStore } from "../../store/settingsStore";
import colors from "../../constants/colors";
import { Home, Cloud, Lock, Settings } from "lucide-react-native";

export default function TabLayout() {
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        // Hide the header to give more UI space
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cloud"
        options={{
          title: "Cloud",
          tabBarIcon: ({ color, size }) => <Cloud size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="secure"
        options={{
          title: "Secure",
          tabBarIcon: ({ color, size }) => <Lock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}