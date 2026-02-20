import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold_Italic,
} from "@expo-google-fonts/cormorant-garamond";
import {
  IBMPlexMono_300Light,
  IBMPlexMono_400Regular,
  IBMPlexMono_600SemiBold,
} from "@expo-google-fonts/ibm-plex-mono";
import { MartiniProvider } from "@/contexts/MartiniContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { theme, hasOnboarded } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log('[RootLayout] hasOnboarded:', hasOnboarded, 'segments:', segments);
    if (hasOnboarded === null) return;

    const inOnboarding = (segments[0] as string) === 'onboarding';

    if (!hasOnboarded && !inOnboarding) {
      console.log('[RootLayout] Redirecting to onboarding');
      router.replace('/onboarding' as never);
    } else if (hasOnboarded && inOnboarding) {
      console.log('[RootLayout] Onboarding complete, redirecting to tabs');
      router.replace('/(tabs)' as never);
    }
  }, [hasOnboarded, segments, router]);

  return (
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
  );
}

function AppContent() {
  const { hasOnboarded, isLoading, theme } = useTheme();

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold_Italic,
    IBMPlexMono_300Light,
    IBMPlexMono_400Regular,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    if (!isLoading && hasOnboarded !== null && fontsLoaded) {
      console.log('[RootLayout] Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [isLoading, hasOnboarded, fontsLoaded]);

  if (isLoading || hasOnboarded === null || !fontsLoaded) {
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
