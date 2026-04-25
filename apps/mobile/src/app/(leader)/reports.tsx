import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchSchoolProgress } from "@/lib/api-client";
import { leaderNav } from "@/lib/nav";

export default function LeaderReportsScreen() {
  const { data } = useQuery({ queryKey: ["leader-reports"], queryFn: fetchSchoolProgress });

  return (
    <DashboardShell navItems={leaderNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineSmall">Department Reports</Text>
        {(data?.departments ?? []).map((dept) => (
          <Card key={dept.department}>
            <Card.Title title={dept.department} subtitle={`${dept.completion}% completion`} />
            <Card.Content>
              <Text>Department performance report ready for download and review.</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </DashboardShell>
  );
}
