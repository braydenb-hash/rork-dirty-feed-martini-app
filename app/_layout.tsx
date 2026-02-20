import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { MartiniProvider } from "@/contexts/MartiniContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { theme, hasOnboarded } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.textPrimary,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, animation: 'none' }}
        />
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
      {hasOnboarded === false && <Redirect href={'/onboarding' as any} />}
    </>
  );
}

function AppContent() {
  const { hasOnboarded, isLoading, theme } = useTheme();

  useEffect(() => {
    if (!isLoading && hasOnboarded !== null) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, hasOnboarded]);

  if (isLoading || hasOnboarded === null) {
    return <View style={{ flex: 1, backgroundColor: '#020202' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MartiniProvider>
          <AppContent />
        </MartiniProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
