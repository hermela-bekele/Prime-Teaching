import { Card, Text, YStack } from "tamagui";

type SessionCardProps = {
  title: string;
  subtitle?: string;
};

export function SessionCard({ title, subtitle }: SessionCardProps) {
  return (
    <Card padding="$md" bordered elevate size="$4" backgroundColor="$background">
      <YStack gap="$xs">
        <Text fontWeight="600">{title}</Text>
        {subtitle ? <Text fontSize="$2" opacity={0.75}>{subtitle}</Text> : null}
      </YStack>
    </Card>
  );
}
