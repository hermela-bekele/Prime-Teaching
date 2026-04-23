import { Stack } from "expo-router";
import { Text, YStack } from "tamagui";

export default function LoginScreen() {
  return (
    <YStack flex={1} padding="$lg" gap="$md" backgroundColor="$background">
      <Stack.Screen options={{ title: "Login" }} />
      <Text fontSize={20} fontWeight="600">
        Sign in
      </Text>
      <Text color="$color">Connect credentials or Supabase session here.</Text>
    </YStack>
  );
}
