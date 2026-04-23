import { Stack } from "expo-router";

import { RootProviders } from "../../App";

export default function RootLayout() {
  return (
    <RootProviders>
      <Stack screenOptions={{ headerShown: true }} />
    </RootProviders>
  );
}
