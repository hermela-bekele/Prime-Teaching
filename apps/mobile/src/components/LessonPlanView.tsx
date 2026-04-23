import { Text, YStack } from "tamagui";

type LessonPlanViewProps = {
  sessionId: string;
};

export function LessonPlanView({ sessionId }: LessonPlanViewProps) {
  return (
    <YStack gap="$sm" padding="$md" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
      <Text fontWeight="600">Lesson plan</Text>
      <Text opacity={0.8}>Session id: {sessionId}</Text>
      <Text fontSize="$2" opacity={0.65}>
        Replace with fetched lesson content from the API.
      </Text>
    </YStack>
  );
}
