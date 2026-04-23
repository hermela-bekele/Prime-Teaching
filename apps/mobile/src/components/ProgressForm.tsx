import { useState } from "react";
import { Button, Input, Text, YStack } from "tamagui";

export function ProgressForm() {
  const [note, setNote] = useState("");

  return (
    <YStack gap="$md">
      <Text fontWeight="600">Progress note</Text>
      <Input placeholder="Add a short reflection" value={note} onChangeText={setNote} />
      <Button size="$4" theme="active">
        Save (placeholder)
      </Button>
    </YStack>
  );
}
