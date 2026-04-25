import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchDepartmentProgress } from "@/lib/api-client";
import { departmentNav } from "@/lib/nav";

export default function DepartmentReportsScreen() {
  const { data } = useQuery({ queryKey: ["department-reports"], queryFn: fetchDepartmentProgress });

  return (
    <DashboardShell navItems={departmentNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineSmall">Department Reports</Text>
        <Card>
          <Card.Content style={{ gap: 8 }}>
            <Text>Total teachers: {(data?.teachers ?? []).length}</Text>
            <Text>Completion rate: {data?.completion_rate ?? 0}%</Text>
            <Text>Pending reviews: {data?.pending_reviews ?? 0}</Text>
          </Card.Content>
        </Card>
      </View>
    </DashboardShell>
  );
}
