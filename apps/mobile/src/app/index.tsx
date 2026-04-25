import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/stores/authStore";

export default function IndexScreen() {
  const { token, role, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!token || !role) return <Redirect href="/(auth)/login" />;
  if (role === "teacher") return <Redirect href="/(teacher)" />;
  if (role === "department_head") return <Redirect href="/(department)" />;
  if (role === "school_leader") return <Redirect href="/(leader)" />;
  return <Redirect href="/(admin)/calendars" />;
}
