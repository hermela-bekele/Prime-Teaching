import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, ProgressBar, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchDepartmentProgress } from "@/lib/api-client";
import { departmentNav } from "@/lib/nav";

export default function DepartmentTeacherProgressScreen() {
  const { data } = useQuery({ queryKey: ["department-teacher-progress"], queryFn: fetchDepartmentProgress });

  return (
    <DashboardShell navItems={departmentNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineSmall">Teacher Progress</Text>
        {(data?.teachers ?? []).map((teacher) => {
          const progress = Math.min(1, Math.max(0, teacher.completion_rate / 100));
          return (
            <Card key={teacher.id}>
              <Card.Title title={teacher.name} subtitle={teacher.email} />
              <Card.Content style={{ gap: 6 }}>
                <Text>{teacher.completion_rate}% completion</Text>
                <ProgressBar progress={progress} />
              </Card.Content>
            </Card>
          );
        })}
      </View>
    </DashboardShell>
  );
}
