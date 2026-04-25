import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, ProgressBar, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTeacherProgress } from "@/lib/api-client";
import { teacherNav } from "@/lib/nav";

export default function TeacherProfileScreen() {
  const { data } = useQuery({ queryKey: ["teacher-progress-tracking"], queryFn: fetchTeacherProgress });
  const completionRate = data ? data.completed_count / Math.max(data.sessions.length, 1) : 0;

  return (
    <DashboardShell navItems={teacherNav}>
      <Card>
        <Card.Title title="Progress Tracking" subtitle="Delivery and completion trends" />
        <Card.Content style={{ gap: 10 }}>
          <Text>Session completion rate: {Math.round(completionRate * 100)}%</Text>
          <ProgressBar progress={completionRate} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text>Completed: {data?.completed_count ?? 0}</Text>
            <Text>Pending: {data?.pending_count ?? 0}</Text>
            <Text>Upcoming: {data?.upcoming_count ?? 0}</Text>
          </View>
        </Card.Content>
      </Card>
    </DashboardShell>
  );
}
