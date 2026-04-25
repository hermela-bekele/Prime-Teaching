import { Stack } from "expo-router";

export default function LeaderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}
