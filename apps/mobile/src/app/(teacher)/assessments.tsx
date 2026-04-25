import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAssessment, fetchTeacherProgress } from "@/lib/api-client";
import { teacherNav } from "@/lib/nav";

export default function TeacherAssessmentsScreen() {
  const { data } = useQuery({ queryKey: ["teacher-assessment-sessions"], queryFn: fetchTeacherProgress });
  const firstSession = data?.sessions?.[0];
  const { data: assessment } = useQuery({
    queryKey: ["teacher-assessment-preview", firstSession?.id],
    queryFn: () => fetchAssessment(firstSession!.id),
    enabled: Boolean(firstSession?.id)
  });

  return (
    <DashboardShell navItems={teacherNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineSmall">Assessments</Text>
        <Text variant="bodyMedium">Quizzes, unit tests, and practice sets ready to use.</Text>
        <Card>
          <Card.Title title={`${assessment?.assessment_type ?? "Quiz"} Preview`} />
          <Card.Content style={{ gap: 8 }}>
            <Text variant="labelLarge">Questions</Text>
            <Text variant="bodySmall">{assessment?.question_set ?? "Generate a quiz from session detail."}</Text>
            <Text variant="labelLarge">Answer key</Text>
            <Text variant="bodySmall">{assessment?.answer_key ?? "Answer key will appear here."}</Text>
          </Card.Content>
        </Card>
      </View>
    </DashboardShell>
  );
}
