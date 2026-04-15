import { ThemeTokens, sharedTokens } from "./tokens";

export const darkTheme: ThemeTokens = {
  bg: {
    app: "#121212",
    surface: "#1B1C1E",
    surfaceElevated: "#232428",
  },
  text: {
    primary: "#F5F5F5",
    secondary: "#C8C8CC",
    inverse: "#111111",
  },
  border: {
    default: "#313236",
    subtle: "#28292C",
  },
  icon: {
    primary: "#F5F5F5",
    secondary: "#C8C8CC",
  },
  action: {
    primaryBg: "#F5F5F5",
    primaryText: "#111111",
    secondaryBg: "#2B2C30",
    secondaryText: "#F5F5F5",
    dangerBg: "#E06666",
    dangerText: "#111111",
  },
  state: {
    success: "#46B873",
    warning: "#E0A13A",
    error: "#F07A7A",
  },
  accent: {
    softSky: "#1E2A36",
  },
  ...sharedTokens,
};
