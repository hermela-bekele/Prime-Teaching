import { Stack, useLocalSearchParams } from "expo-router";
import { Text, YStack } from "tamagui";

import { LessonPlanView } from "@/components/LessonPlanView";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <YStack flex={1} padding="$lg" gap="$md" backgroundColor="$background">
      <Stack.Screen options={{ title: `Session ${id ?? ""}` }} />
      <Text fontSize={18} fontWeight="600">
        Session {id}
      </Text>
      <LessonPlanView sessionId={String(id ?? "")} />
    </YStack>
  );
}
