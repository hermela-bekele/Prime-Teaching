import { Text, YStack } from "tamagui";

type CalendarShellProps = {
  title?: string;
};

export function CalendarShell({ title = "Month view" }: CalendarShellProps) {
  return (
    <YStack
      minHeight={200}
      padding="$md"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
      gap="$sm"
    >
      <Text fontWeight="600">{title}</Text>
      <Text fontSize="$2" opacity={0.65}>
        Calendar UI placeholder — wire to your sessions API.
      </Text>
    </YStack>
  );
}
