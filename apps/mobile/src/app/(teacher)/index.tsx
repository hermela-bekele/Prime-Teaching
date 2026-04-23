import { Link, Stack } from "expo-router";
import { Text, YStack } from "tamagui";

import { SessionCard } from "@/components/SessionCard";

export default function TeacherHomeScreen() {
  return (
    <YStack flex={1} padding="$lg" gap="$md" backgroundColor="$background">
      <Stack.Screen options={{ title: "Teacher" }} />
      <Text fontSize={20} fontWeight="600">
        Teacher dashboard
      </Text>
      <SessionCard title="Sample session" subtitle="Open calendar or a session below" />
      <Link href="/(teacher)/calendar">
        <Text textDecorationLine="underline">Calendar</Text>
      </Link>
      <Link href="/(teacher)/session/1">
        <Text textDecorationLine="underline">Session #1</Text>
      </Link>
      <Link href="/(teacher)/profile">
        <Text textDecorationLine="underline">Profile</Text>
      </Link>
    </YStack>
  );
}
