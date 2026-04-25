import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchDepartmentProgress } from "@/lib/api-client";
import { departmentNav } from "@/lib/nav";

export default function DepartmentReviewsScreen() {
  const { data } = useQuery({ queryKey: ["department-reviews"], queryFn: fetchDepartmentProgress });

  return (
    <DashboardShell navItems={departmentNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineSmall">Lesson Plan Reviews</Text>
        <Card>
          <Card.Title title="Pending Reviews" subtitle={`${data?.pending_reviews ?? 0} items`} />
          <Card.Content style={{ gap: 10 }}>
            {(data?.teachers ?? []).slice(0, 3).map((teacher) => (
              <View key={teacher.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text>{teacher.name}</Text>
                <Button mode="outlined">Review</Button>
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>
    </DashboardShell>
  );
}
