import { Stack } from "expo-router";

export default function DepartmentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="teacher-progress" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="reports" />
    </Stack>
  );
}
