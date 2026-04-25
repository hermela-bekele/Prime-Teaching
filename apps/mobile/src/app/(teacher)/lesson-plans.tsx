import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTeacherProgress } from "@/lib/api-client";
import { teacherNav } from "@/lib/nav";

export default function TeacherLessonPlansScreen() {
  const { data } = useQuery({ queryKey: ["teacher-lesson-plan-sessions"], queryFn: fetchTeacherProgress });

  return (
    <DashboardShell navItems={teacherNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineSmall">Lesson Plans</Text>
        <Text variant="bodyMedium">Browse and review your AI-generated lesson plans by session.</Text>
        {(data?.sessions ?? []).map((session) => (
          <Link key={session.id} href={`/(teacher)/session/${session.id}`} asChild>
            <Card>
              <Card.Title title={session.title} subtitle={`Session ${session.session_number}`} />
              <Card.Content>
                <Text variant="bodySmall">{session.learning_goal_summary}</Text>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </View>
    </DashboardShell>
  );
}
