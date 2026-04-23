import { Stack } from "expo-router";
import { Text, YStack } from "tamagui";

import { CalendarShell } from "@/components/calendar/CalendarShell";

export default function TeacherCalendarScreen() {
  return (
    <YStack flex={1} padding="$lg" gap="$md" backgroundColor="$background">
      <Stack.Screen options={{ title: "Calendar" }} />
      <Text fontSize={18} fontWeight="600">
        Calendar
      </Text>
      <CalendarShell />
    </YStack>
  );
}
