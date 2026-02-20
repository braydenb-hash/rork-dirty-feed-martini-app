import { Tabs } from "expo-router";
import React from "react";
import CustomTabBar from "@/components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props: Record<string, unknown>) => <CustomTabBar {...props as any} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="(feed)" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="log" />
      <Tabs.Screen name="leaderboard" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
