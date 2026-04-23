import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { TamaguiProvider, YStack } from "tamagui";

import tamaguiConfig from "./tamagui.config";

export function RootProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false }
        }
      })
  );

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <QueryClientProvider client={queryClient}>
        <YStack flex={1} backgroundColor="$background">
          {children}
        </YStack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
