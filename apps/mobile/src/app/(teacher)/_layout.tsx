import { Stack } from "expo-router";

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="lesson-plans" />
      <Stack.Screen name="teaching-notes" />
      <Stack.Screen name="assessments" />
      <Stack.Screen name="session/[id]" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
