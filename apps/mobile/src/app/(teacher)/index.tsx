import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { format, isFuture, isPast, isToday } from "date-fns";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { Button, Card, Chip, Divider, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTeacherProgress } from "@/lib/api-client";
import type { SessionDto } from "@/lib/api-types";
import { teacherNav } from "@/lib/nav";
import { useAuthStore } from "@/stores/authStore";
import { primeColors } from "@/theme/primeTheme";

type SessionTab = "today" | "upcoming" | "overdue";

function inTab(session: SessionDto, tab: SessionTab) {
  const date = new Date(session.planned_date);
  if (tab === "today") return isToday(date);
  if (tab === "upcoming") return isFuture(date);
  return isPast(date) && session.status !== "delivered";
}

export default function TeacherHomeScreen() {
  const [tab, setTab] = useState<SessionTab>("today");
  const { data } = useQuery({ queryKey: ["teacher-progress"], queryFn: fetchTeacherProgress });

  const sessions = useMemo(() => (data?.sessions ?? []).filter((s) => inTab(s, tab)), [data, tab]);
  const cards = [
    { label: "Today's", value: data?.today_count ?? 0 },
    { label: "Upcoming", value: data?.upcoming_count ?? 0 },
    { label: "Completed", value: data?.completed_count ?? 0 },
    { label: "Pending", value: data?.pending_count ?? 0 }
  ];

  return (
    <DashboardShell navItems={teacherNav}>
      <View style={{ gap: 6, marginBottom: 12 }}>
        <Text style={{ color: "#2563eb", fontWeight: "600" }}>Welcome back</Text>
        <Text variant="headlineMedium" style={{ fontWeight: "700", color: primeColors.text }}>
          Good day, Teacher.
        </Text>
        <Text style={{ color: primeColors.muted }}>
          You have {data?.today_count ?? 0} sessions today and {data?.pending_count ?? 0} pending. Stay on track with AI-generated plans.
        </Text>
      </View>
      <Link href="/(teacher)/calendar" asChild>
        <Button mode="contained" buttonColor={primeColors.primary} contentStyle={{ paddingVertical: 4 }} icon="calendar-blank-outline">
          View calendar
        </Button>
      </Link>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
        {cards.map((item) => (
          <Card key={item.label} style={{ width: "48%", borderWidth: 1, borderColor: primeColors.border, backgroundColor: "white" }}>
            <Card.Content style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text variant="labelMedium" style={{ color: primeColors.muted }}>
                  {item.label}
                </Text>
                <Text variant="headlineMedium" style={{ fontWeight: "700", color: primeColors.text, marginTop: 4 }}>
                  {item.value}
                </Text>
              </View>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: item.label === "Completed" ? "#dcfce7" : item.label === "Pending" ? "#ffe4e6" : "#e0f2fe"
                }}
              >
                <Text style={{ color: item.label === "Completed" ? "#047857" : item.label === "Pending" ? "#e11d48" : "#0284c7" }}>
                  {item.label === "Completed" ? "✓" : item.label === "Pending" ? "!" : "◴"}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
      <Card style={{ borderWidth: 1, borderColor: primeColors.border, marginTop: 12, backgroundColor: "white" }}>
        <Card.Title title="Sessions" subtitle="Today / Upcoming / Overdue" />
        <Card.Content>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <Chip selected={tab === "today"} onPress={() => setTab("today")}>
              Today
            </Chip>
            <Chip selected={tab === "upcoming"} onPress={() => setTab("upcoming")}>
              Upcoming
            </Chip>
            <Chip selected={tab === "overdue"} onPress={() => setTab("overdue")}>
              Overdue
            </Chip>
          </View>
          {sessions.map((session) => (
            <Link href={`/(teacher)/session/${session.id}`} key={session.id} asChild>
              <Card style={{ marginBottom: 8, borderWidth: 1, borderColor: primeColors.border, backgroundColor: "white" }}>
                <Card.Content>
                  <Text variant="titleMedium">
                    Session {session.session_number}: {session.title}
                  </Text>
                  <Text style={{ color: primeColors.muted }}>{format(new Date(session.planned_date), "EEE, dd MMM")}</Text>
                  <Text variant="bodySmall" style={{ color: primeColors.muted }}>
                    {session.learning_goal_summary}
                  </Text>
                </Card.Content>
              </Card>
            </Link>
          ))}
          {!sessions.length ? <Text style={{ color: primeColors.muted }}>Nothing in this tab.</Text> : null}
        </Card.Content>
      </Card>
      <Divider style={{ marginVertical: 8 }} />
      <Link href="/(teacher)/profile" asChild>
        <Button mode="outlined" textColor={primeColors.primary}>
          Open Progress Tracking
        </Button>
      </Link>
    </DashboardShell>
  );
}
