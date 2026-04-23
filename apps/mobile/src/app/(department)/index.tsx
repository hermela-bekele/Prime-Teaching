import { Stack } from "expo-router";
import { Text, YStack } from "tamagui";

export default function DepartmentHomeScreen() {
  return (
    <YStack flex={1} padding="$lg" gap="$md" backgroundColor="$background">
      <Stack.Screen options={{ title: "Department head" }} />
      <Text fontSize={20} fontWeight="600">
        Department head
      </Text>
      <Text color="$color">Oversight and teacher progress (placeholder).</Text>
    </YStack>
  );
}
