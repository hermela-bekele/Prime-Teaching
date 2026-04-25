import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { primeTheme } from "@/theme/primeTheme";

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
    <SafeAreaProvider>
      <PaperProvider theme={primeTheme}>
        <QueryClientProvider client={queryClient}>
          {children}
          <StatusBar style="dark" />
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
