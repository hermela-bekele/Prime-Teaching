import { View } from "react-native";
import { Card, Text } from "react-native-paper";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/nav";
import { primeColors } from "@/theme/primeTheme";

export default function AdminCalendarsScreen() {
  return (
    <DashboardShell navItems={adminNav}>
      <View style={{ gap: 12 }}>
        <Text variant="headlineMedium" style={{ fontWeight: "700", color: primeColors.text }}>
          Calendars
        </Text>
        <Text style={{ color: primeColors.muted }}>Manage school calendars (demo).</Text>
        <Card style={{ borderWidth: 1, borderColor: primeColors.border }}>
          <Card.Content>
            <Text>No calendars connected in this MVP build — mock admin workspace.</Text>
          </Card.Content>
        </Card>
      </View>
    </DashboardShell>
  );
}
