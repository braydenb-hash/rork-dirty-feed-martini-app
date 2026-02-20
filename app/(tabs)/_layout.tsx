import { Tabs } from "expo-router";
import { Wine, PlusCircle, Trophy, User, Map } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.warmBlack,
          borderTopColor: Colors.darkBorder,
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(feed)"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => <Wine size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Rankings",
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
