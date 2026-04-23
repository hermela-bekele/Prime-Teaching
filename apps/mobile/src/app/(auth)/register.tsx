import { Stack } from "expo-router";
import { Text, YStack } from "tamagui";

export default function RegisterScreen() {
  return (
    <YStack flex={1} padding="$lg" gap="$md" backgroundColor="$background">
      <Stack.Screen options={{ title: "Register" }} />
      <Text fontSize={20} fontWeight="600">
        Create account
      </Text>
      <Text color="$color">Registration flow placeholder.</Text>
    </YStack>
  );
}
