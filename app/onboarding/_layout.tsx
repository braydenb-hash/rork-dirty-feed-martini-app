import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#020202' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="preference" />
    </Stack>
  );
}
