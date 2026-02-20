import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { MartiniProvider } from "@/contexts/MartiniContext";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.dark },
        headerTintColor: Colors.white,
        contentStyle: { backgroundColor: Colors.dark },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="bar/[id]"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="user/[id]"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MartiniProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.dark }}>
          <StatusBar style="light" />
          <RootLayoutNav />
        </GestureHandlerRootView>
      </MartiniProvider>
    </QueryClientProvider>
  );
}
