import { Stack } from "expo-router";
import { Text, YStack } from "tamagui";

export default function LeaderHomeScreen() {
  return (
    <YStack flex={1} padding="$lg" gap="$md" backgroundColor="$background">
      <Stack.Screen options={{ title: "School leader" }} />
      <Text fontSize={20} fontWeight="600">
        School leader
      </Text>
      <Text color="$color">Reports and school-wide metrics (placeholder).</Text>
    </YStack>
  );
}
