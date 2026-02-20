import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function MapLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.warmBlack },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: Colors.dark },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Explore",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
