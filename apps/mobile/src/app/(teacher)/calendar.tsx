import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CalendarShell } from "@/components/calendar/CalendarShell";
import { fetchTeacherProgress } from "@/lib/api-client";
import { teacherNav } from "@/lib/nav";
import { primeColors } from "@/theme/primeTheme";

export default function TeacherCalendarScreen() {
  const { data } = useQuery({ queryKey: ["teacher-calendar-list"], queryFn: fetchTeacherProgress });

  return (
    <DashboardShell navItems={teacherNav}>
      <View style={{ gap: 12 }}>
        <View style={{ gap: 2 }}>
          <Text variant="headlineMedium" style={{ fontWeight: "700", color: primeColors.text }}>
            My Calendar
          </Text>
          <Text style={{ color: primeColors.muted }}>All your upcoming and past sessions in one place.</Text>
        </View>
        <Card style={{ borderWidth: 1, borderColor: primeColors.border, backgroundColor: "white" }}>
          <Card.Content style={{ paddingVertical: 12 }}>
            <Text>All sessions</Text>
          </Card.Content>
        </Card>
        <Card style={{ borderWidth: 0, backgroundColor: "transparent", elevation: 0 }}>
          <Card.Content style={{ paddingHorizontal: 0 }}>
            <CalendarShell sessions={data?.sessions ?? []} />
          </Card.Content>
        </Card>
      </View>
    </DashboardShell>
  );
}
