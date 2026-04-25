import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTeacherProgress, fetchTeachingNote } from "@/lib/api-client";
import { teacherNav } from "@/lib/nav";

export default function TeacherTeachingNotesScreen() {
  const { data } = useQuery({ queryKey: ["teacher-note-sessions"], queryFn: fetchTeacherProgress });
  const firstSession = data?.sessions?.[0];
  const { data: note } = useQuery({
    queryKey: ["teacher-note-preview", firstSession?.id],
    queryFn: () => fetchTeachingNote(firstSession!.id),
    enabled: Boolean(firstSession?.id)
  });

  return (
    <DashboardShell navItems={teacherNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineSmall">Teaching Notes</Text>
        <Text variant="bodyMedium">In-class scripts and explanations to support lesson delivery.</Text>
        <Card>
          <Card.Title title={firstSession?.title ?? "Session note preview"} />
          <Card.Content style={{ gap: 8 }}>
            <Text variant="labelLarge">Stepwise explanation</Text>
            <Text variant="bodySmall">{note?.stepwise_explanation ?? "Open a session to generate a teaching note."}</Text>
            <Text variant="labelLarge">Worked examples</Text>
            <Text variant="bodySmall">{note?.worked_examples ?? "No examples yet."}</Text>
          </Card.Content>
        </Card>
      </View>
    </DashboardShell>
  );
}
