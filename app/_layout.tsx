import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
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
    CormorantGaramond_400Regular: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.ttf',
    CormorantGaramond_400Regular_Italic: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3WmX5slCNuHLi8bLeY9MK7whWMhyjYrEPjuw-N.ttf',
    CormorantGaramond_600SemiBold_Italic: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3VmX5slCNuHLi8bLeY9MK7whWMhyjYrHtPkyuF7w6C.ttf',
    IBMPlexMono_300Light: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F6pfjptAgt5VM-kVkqdyU8n3kwq0n1hj-sNFQ.ttf',
    IBMPlexMono_400Regular: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n5ig.ttf',
    IBMPlexMono_600SemiBold: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F6pfjptAgt5VM-kVkqdyU8n3vAu0n1hj-sNFQ.ttf',
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
