import { Link, Stack } from "expo-router";
import { Text, YStack } from "tamagui";

export default function IndexScreen() {
  return (
    <YStack flex={1} padding="$lg" gap="$md" justifyContent="center" backgroundColor="$background">
      <Stack.Screen options={{ title: "PRIME EduAI" }} />
      <Text fontSize={24} fontWeight="700">
        PRIME EduAI
      </Text>
      <Text color="$color">Choose a section</Text>
      <Link href="/login">
        <Text textDecorationLine="underline">Login</Text>
      </Link>
      <Link href="/register">
        <Text textDecorationLine="underline">Register</Text>
      </Link>
      <Link href="/(teacher)">
        <Text textDecorationLine="underline">Teacher</Text>
      </Link>
      <Link href="/(department)">
        <Text textDecorationLine="underline">Department</Text>
      </Link>
      <Link href="/(leader)">
        <Text textDecorationLine="underline">Leader</Text>
      </Link>
    </YStack>
  );
}
