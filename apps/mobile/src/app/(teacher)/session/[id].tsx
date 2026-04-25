import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAssessment, fetchLessonPlan, fetchSession, fetchTeachingNote } from "@/lib/api-client";
import { teacherNav } from "@/lib/nav";
import { primeColors } from "@/theme/primeTheme";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = String(id ?? "");
  const [delivered, setDelivered] = useState(false);
  const [confidence, setConfidence] = useState(4);
  const [showLesson, setShowLesson] = useState(false);
  const [showTeaching, setShowTeaching] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const { data: session } = useQuery({ queryKey: ["session", sessionId], queryFn: () => fetchSession(sessionId), enabled: Boolean(sessionId) });
  const { data: lessonPlan } = useQuery({ queryKey: ["lesson", sessionId], queryFn: () => fetchLessonPlan(sessionId), enabled: showLesson });
  const { data: note } = useQuery({ queryKey: ["note", sessionId], queryFn: () => fetchTeachingNote(sessionId), enabled: showTeaching });
  const { data: assessment } = useQuery({ queryKey: ["quiz", sessionId], queryFn: () => fetchAssessment(sessionId), enabled: showQuiz });

  return (
    <DashboardShell navItems={teacherNav}>
      <Card style={{ borderWidth: 1, borderColor: primeColors.border }}>
        <Card.Title title={session?.title ?? "Session detail"} subtitle={`Session #${session?.session_number ?? "-"}`} />
        <Card.Content>
          <Text style={{ color: primeColors.muted }}>{session?.learning_goal_summary}</Text>
          <Text variant="bodySmall" style={{ color: primeColors.muted }}>
            Unit: {session?.unit_name}
          </Text>
          <Text variant="bodySmall" style={{ color: primeColors.muted }}>
            Subtopic: {session?.subtopic_name}
          </Text>
        </Card.Content>
      </Card>
      <Card style={{ borderWidth: 1, borderColor: primeColors.border }}>
        <Card.Content style={{ gap: 8 }}>
          <Button mode="contained-tonal" onPress={() => setShowLesson((s) => !s)}>
            Generate Lesson Plan
          </Button>
          {showLesson && lessonPlan ? <Text>{lessonPlan.delivery_steps.join("\n")}</Text> : null}
          <Button mode="contained-tonal" onPress={() => setShowTeaching((s) => !s)}>
            Generate Teaching Note
          </Button>
          {showTeaching && note ? <Text>{note.stepwise_explanation}</Text> : null}
          <Button mode="contained-tonal" onPress={() => setShowQuiz((s) => !s)}>
            Generate Quiz
          </Button>
          {showQuiz && assessment ? <Text>{assessment.question_set}</Text> : null}
        </Card.Content>
      </Card>
      <Divider />
      <Card style={{ borderWidth: 1, borderColor: primeColors.border }}>
        <Card.Title title="Mark Session as Delivered" />
        <Card.Content>
          <Text>Confidence Rating: {confidence}/5</Text>
          <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Button key={value} mode={confidence === value ? "contained" : "outlined"} onPress={() => setConfidence(value)}>
                {value}
              </Button>
            ))}
          </View>
          <Button mode="contained" onPress={() => setDelivered(true)}>
            Mark Delivered
          </Button>
          {delivered ? <Text style={{ marginTop: 8 }}>Session marked delivered with confidence {confidence}/5.</Text> : null}
        </Card.Content>
      </Card>
    </DashboardShell>
  );
}
