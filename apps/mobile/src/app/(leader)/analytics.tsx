import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, ProgressBar, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchSchoolProgress } from "@/lib/api-client";
import { leaderNav } from "@/lib/nav";

export default function LeaderAnalyticsScreen() {
  const { data } = useQuery({ queryKey: ["leader-analytics"], queryFn: fetchSchoolProgress });
  const completionProgress = Math.min(1, Math.max(0, (data?.completion_rate ?? 0) / 100));

  return (
    <DashboardShell navItems={leaderNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineSmall">School Analytics</Text>
        <Card>
          <Card.Title title="Completion Trend" />
          <Card.Content style={{ gap: 10 }}>
            <Text>Overall completion: {data?.completion_rate ?? 0}%</Text>
            <ProgressBar progress={completionProgress} />
            <Text>Average confidence: {data?.avg_confidence ?? 0}</Text>
          </Card.Content>
        </Card>
      </View>
    </DashboardShell>
  );
}
