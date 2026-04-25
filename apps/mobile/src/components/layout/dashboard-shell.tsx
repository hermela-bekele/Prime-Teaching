import { useMemo, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Drawer, Icon, Menu, Modal, Portal, Text } from "react-native-paper";
import { usePathname, useRouter } from "expo-router";

import type { UserRole } from "@/lib/api-types";
import { useAuthStore } from "@/stores/authStore";
import { primeColors } from "@/theme/primeTheme";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

type DashboardShellProps = {
  navItems: NavItem[];
  children: React.ReactNode;
};

function roleSwitcherLabel(role: UserRole | null): string {
  switch (role) {
    case "department_head":
      return "Department Head";
    case "school_leader":
      return "School Leader";
    case "admin":
      return "Admin";
    default:
      return "Teacher";
  }
}

function homeHrefForRole(role: UserRole): string {
  switch (role) {
    case "department_head":
      return "/(department)";
    case "school_leader":
      return "/(leader)";
    case "admin":
      return "/(admin)/calendars";
    default:
      return "/(teacher)";
  }
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "teacher", label: "Teacher" },
  { value: "department_head", label: "Department Head" },
  { value: "school_leader", label: "School Leader" },
  { value: "admin", label: "Admin" }
];

function Sidebar({ navItems, onNavigate }: { navItems: NavItem[]; onNavigate: (href: string) => void }) {
  const pathname = usePathname();
  const { name, email, role } = useAuthStore();

  const initials = useMemo(() => {
    const source = name || email || "?";
    return source
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [email, name]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B1120", paddingTop: 18 }}>
      <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" }}>
        <Text style={{ color: "white", fontWeight: "700", fontSize: 18 }}>PRIME Teaching</Text>
        <Text style={{ color: "#94a3b8", marginTop: 2, fontSize: 12 }}>AI for educators</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 12 }}>
        <Drawer.Section title="Workspace" theme={{ colors: { onSurfaceVariant: "#94a3b8" } }}>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Pressable
                key={item.href}
                onPress={() => onNavigate(item.href)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 10,
                  backgroundColor: active ? "#1d4ed8" : "transparent",
                  marginVertical: 2,
                  paddingVertical: 10,
                  paddingHorizontal: 12
                }}
              >
                <Icon source={item.icon} size={18} color={active ? "white" : "#94a3b8"} />
                <Text style={{ color: active ? "white" : "#cbd5e1", fontWeight: "600" }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </Drawer.Section>
      </ScrollView>

      <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Avatar.Text size={34} label={initials} style={{ backgroundColor: "#2563eb" }} color="white" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontWeight: "600" }}>{name || "PRIME User"}</Text>
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>{roleSwitcherLabel(role)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function DashboardShell({ navItems, children }: DashboardShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = useAuthStore((s) => s.role);
  const name = useAuthStore((s) => s.name);
  const email = useAuthStore((s) => s.email);
  const setRole = useAuthStore((s) => s.setRole);
  const logout = useAuthStore((s) => s.logout);

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = useMemo(() => {
    const source = name || email || "?";
    return source
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [email, name]);

  const handleNavigate = (href: string) => {
    setMobileOpen(false);
    router.push(href as never);
  };

  const switchDemoRole = async (next: UserRole) => {
    setRoleMenuOpen(false);
    if (next === role) return;
    await setRole(next);
    router.replace(homeHrefForRole(next) as never);
  };

  const goMyDashboard = () => {
    setUserMenuOpen(false);
    if (!role) return;
    router.replace(homeHrefForRole(role) as never);
  };

  const doLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.replace("/(auth)/login" as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: primeColors.bg, flexDirection: "row" }}>
      {isWide ? (
        <View style={{ width: 280 }}>
          <Sidebar navItems={navItems} onNavigate={handleNavigate} />
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: insets.top,
            backgroundColor: "white",
            borderBottomWidth: 1,
            borderBottomColor: primeColors.border,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            gap: 10
          }}
        >
          {!isWide ? (
            <Pressable
              onPress={() => setMobileOpen(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: primeColors.border,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white"
              }}
            >
              <Icon source="menu" size={20} color="#475569" />
            </Pressable>
          ) : null}

          <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontWeight: "700", fontSize: 14, color: primeColors.text }}>
              Addis Prep Academy
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: "#eff6ff",
              borderWidth: 1,
              borderColor: "#bfdbfe"
            }}
          >
            <Text style={{ color: "#1d4ed8", fontSize: 12, fontWeight: "600" }}>Demo</Text>
          </View>

          <Menu
            visible={roleMenuOpen}
            onDismiss={() => setRoleMenuOpen(false)}
            anchor={
              <Pressable
                onPress={() => setRoleMenuOpen(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  borderWidth: 1,
                  borderColor: primeColors.border,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: "white"
                }}
              >
                <Text style={{ fontWeight: "600", color: primeColors.text, fontSize: 13 }}>{roleSwitcherLabel(role)}</Text>
                <Icon source="chevron-down" size={18} color="#64748b" />
              </Pressable>
            }
          >
            <Menu.Item title="Switch role (demo)" disabled titleStyle={{ fontSize: 12, color: "#64748b" }} />
            {ROLE_OPTIONS.map((opt) => (
              <Menu.Item
                key={opt.value}
                title={opt.label}
                disabled={role === opt.value}
                onPress={() => switchDemoRole(opt.value)}
              />
            ))}
          </Menu>

          <Pressable
            onPress={() => {}}
            style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Icon source="bell-outline" size={22} color="#0f172a" />
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#f43f5e",
                borderWidth: 2,
                borderColor: "white"
              }}
            />
          </Pressable>

          <Menu
            visible={userMenuOpen}
            onDismiss={() => setUserMenuOpen(false)}
            anchor={
              <Pressable onPress={() => setUserMenuOpen(true)}>
                <Avatar.Text size={36} label={initials} style={{ backgroundColor: "#2563eb" }} color="white" />
              </Pressable>
            }
          >
            <Menu.Item title="My dashboard" onPress={goMyDashboard} />
            <Menu.Item title="Log out" titleStyle={{ color: "#e11d48" }} onPress={doLogout} />
          </Menu>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>{children}</ScrollView>
      </View>

      {!isWide ? (
        <Portal>
          <Modal visible={mobileOpen} onDismiss={() => setMobileOpen(false)} contentContainerStyle={{ margin: 0, height: "100%" }}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View style={{ width: "82%", maxWidth: 320 }}>
                <Sidebar navItems={navItems} onNavigate={handleNavigate} />
              </View>
              <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={() => setMobileOpen(false)} />
            </View>
          </Modal>
        </Portal>
      ) : null}
    </View>
  );
}
