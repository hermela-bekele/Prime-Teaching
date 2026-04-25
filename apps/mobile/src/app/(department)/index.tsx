import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchDepartmentProgress } from "@/lib/api-client";
import { departmentNav } from "@/lib/nav";
import { primeColors } from "@/theme/primeTheme";

export default function DepartmentHomeScreen() {
  const { data } = useQuery({ queryKey: ["department-progress"], queryFn: fetchDepartmentProgress });

  return (
    <DashboardShell navItems={departmentNav}>
      <View style={{ gap: 3, marginBottom: 10 }}>
        <Text style={{ color: "#1d4ed8", fontWeight: "600" }}>Department Head</Text>
        <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
          Mathematics Department
        </Text>
        <Text style={{ color: primeColors.muted }}>Monitor teacher progress and review lesson plans.</Text>
      </View>
      <Card style={{ borderWidth: 1, borderColor: primeColors.border, backgroundColor: "white" }}>
        <Card.Title title="Department Overview" />
        <Card.Content>
          <Text>Completion rate: {data?.completion_rate ?? 0}%</Text>
          <Text>Pending lesson plan reviews: {data?.pending_reviews ?? 0}</Text>
        </Card.Content>
      </Card>
      <Card style={{ borderWidth: 1, borderColor: primeColors.border, marginTop: 10, backgroundColor: "white" }}>
        <Card.Title title="Teacher List & Progress" />
        <Card.Content style={{ gap: 8 }}>
          {data?.teachers.map((teacher) => (
            <Card key={teacher.id} style={{ borderWidth: 1, borderColor: primeColors.border, backgroundColor: "white" }}>
              <Card.Content>
                <Text variant="titleMedium">{teacher.name}</Text>
                <Text style={{ color: primeColors.muted }}>{teacher.email}</Text>
                <Text>
                  Delivered {teacher.delivered}/{teacher.planned} ({teacher.completion_rate}%)
                </Text>
                <Text variant="bodySmall">View teacher sessions and review lesson plans from this profile panel.</Text>
              </Card.Content>
            </Card>
          ))}
        </Card.Content>
      </Card>
      <Divider />
      <Text variant="bodySmall">
        Review interface: tap any teacher card to open sessions and lesson plan review workflow in the next iteration.
      </Text>
    </DashboardShell>
  );
}
