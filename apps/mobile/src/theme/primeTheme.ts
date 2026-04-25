import { MD3LightTheme } from "react-native-paper";

export const primeColors = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#475569",
  primary: "#1d4ed8",
  primaryDark: "#1e40af",
  danger: "#e11d48",
  success: "#059669",
  warning: "#d97706"
};

export const primeTheme = {
  ...MD3LightTheme,
  roundness: 14,
  colors: {
    ...MD3LightTheme.colors,
    primary: primeColors.primary,
    secondary: "#0ea5e9",
    background: primeColors.bg,
    surface: primeColors.card,
    onBackground: primeColors.text,
    onSurface: primeColors.text,
    outline: primeColors.border
  }
};
