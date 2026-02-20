import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";

export default function LeaderboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.dark },
        headerTintColor: Colors.white,
        contentStyle: { backgroundColor: Colors.dark },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Rankings",
          headerTitleStyle: { color: Colors.gold, fontWeight: '700' },
        }}
      />
    </Stack>
  );
}
