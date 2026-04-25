import { addDays, format, isToday } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import { Badge, Card, Divider, IconButton, Text } from "react-native-paper";

import type { SessionDto } from "@/lib/api-types";
import { primeColors } from "@/theme/primeTheme";

type CalendarShellProps = { sessions: SessionDto[] };

function dateLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  const tmr = addDays(new Date(), 1);
  if (format(date, "yyyy-MM-dd") === format(tmr, "yyyy-MM-dd")) return "Tomorrow";
  const diff = Math.max(1, Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return `In ${diff} days`;
}

export function CalendarShell({ sessions }: CalendarShellProps) {
  const sorted = useMemo(() => [...sessions].sort((a, b) => a.session_number - b.session_number), [sessions]);

  return (
    <View style={{ gap: 10 }}>
      {sorted.map((s) => (
        <Card key={s.id} style={{ borderWidth: 1, borderColor: primeColors.border, backgroundColor: "white" }}>
          <Card.Content style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: "#e0f2fe",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ color: "#0369a1", fontWeight: "700", fontSize: 12 }}>#{s.session_number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <Text variant="titleSmall" style={{ flex: 1 }}>
                    {s.title}
                  </Text>
                  <Badge style={{ backgroundColor: s.status === "delivered" ? "#dcfce7" : "#e2e8f0" }}>
                    {s.status === "delivered" ? "Delivered" : "Planned"}
                  </Badge>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Badge style={{ backgroundColor: "#dbeafe" }}>Teaching</Badge>
                </View>
                <Text variant="bodySmall" style={{ color: primeColors.muted, marginTop: 4 }}>
                  {s.unit_name} · {s.subtopic_name}
                </Text>
              </View>
            </View>
            <Divider />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <IconButton icon="calendar-blank-outline" size={14} style={{ margin: 0 }} />
                <Text variant="bodySmall" style={{ color: "#334155" }}>
                  {dateLabel(s.planned_date)}
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <IconButton icon="file-document-outline" size={16} style={{ margin: 0 }} />
                <IconButton icon="pencil-outline" size={16} style={{ margin: 0 }} />
                <IconButton icon="format-list-bulleted" size={16} style={{ margin: 0 }} />
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}
