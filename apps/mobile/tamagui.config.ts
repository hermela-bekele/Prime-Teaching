import { createTamagui, createTokens } from "tamagui";

const tokens = createTokens({
  color: {
    background: "#ffffff",
    text: "#0f172a",
    primary: "#0f172a"
  },
  space: {
    true: 0,
    sm: 8,
    md: 12,
    lg: 16
  },
  size: {
    true: 0,
    sm: 14,
    md: 16,
    lg: 20
  },
  radius: {
    true: 0,
    sm: 6,
    md: 10,
    lg: 14
  }
});

const tamaguiConfig = createTamagui({
  tokens,
  themes: {
    light: {
      background: tokens.color.background,
      color: tokens.color.text
    }
  },
  defaultTheme: "light"
});

export type AppTamaguiConfig = typeof tamaguiConfig;
export default tamaguiConfig;
