import { Stack } from "expo-router";
import { useEffect } from "react";

import { RootProviders } from "../../App";
import { useAuthStore } from "@/stores/authStore";

function AuthBootstrap() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <Stack screenOptions={{ headerShown: true }} />;
}

export default function RootLayout() {
  return (
    <RootProviders>
      <AuthBootstrap />
    </RootProviders>
  );
}
