import { Stack } from "expo-router";
import { Text, YStack } from "tamagui";

import { ProgressForm } from "@/components/ProgressForm";

export default function TeacherProfileScreen() {
  return (
    <YStack flex={1} padding="$lg" gap="$md" backgroundColor="$background">
      <Stack.Screen options={{ title: "Profile" }} />
      <Text fontSize={18} fontWeight="600">
        Profile
      </Text>
      <ProgressForm />
    </YStack>
  );
}
