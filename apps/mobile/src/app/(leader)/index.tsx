import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchSchoolProgress } from "@/lib/api-client";
import { leaderNav } from "@/lib/nav";
import { primeColors } from "@/theme/primeTheme";

export default function LeaderHomeScreen() {
  const { data } = useQuery({ queryKey: ["school-progress"], queryFn: fetchSchoolProgress });

  return (
    <DashboardShell navItems={leaderNav}>
      <View style={{ gap: 3, marginBottom: 10 }}>
        <Text style={{ color: "#1d4ed8", fontWeight: "600" }}>School Leader</Text>
        <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
          Addis Prep Academy
        </Text>
        <Text style={{ color: primeColors.muted }}>School-wide teaching health across all departments.</Text>
      </View>
      <Card style={{ borderWidth: 1, borderColor: primeColors.border, backgroundColor: "white" }}>
        <Card.Title title="School-wide Statistics" />
        <Card.Content>
          <Text>Total teachers: {data?.total_teachers ?? 0}</Text>
          <Text>Completion rate: {data?.completion_rate ?? 0}%</Text>
          <Text>Average confidence: {data?.avg_confidence ?? 0}</Text>
        </Card.Content>
      </Card>
      <Card style={{ borderWidth: 1, borderColor: primeColors.border, marginTop: 10, backgroundColor: "white" }}>
        <Card.Title title="Department Comparison" />
        <Card.Content>
          {data?.departments.map((d) => (
            <Text key={d.department}>
              {d.department}: {d.completion}%
            </Text>
          ))}
        </Card.Content>
      </Card>
      <Card style={{ borderWidth: 1, borderColor: primeColors.border, marginTop: 10, backgroundColor: "white" }}>
        <Card.Title title="Teachers Needing Support" />
        <Card.Content>
          {data?.teachers_needing_support.map((row) => (
            <Text key={row.name}>
              {row.name}: {row.reason}
            </Text>
          ))}
        </Card.Content>
      </Card>
    </DashboardShell>
  );
}
