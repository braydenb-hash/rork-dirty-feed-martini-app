import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🍸</Text>
        <Text style={styles.title}>This page doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to the feed</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.dark,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.gold,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "600",
  },
});
