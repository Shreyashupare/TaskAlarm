import { ThemeTokens, sharedTokens } from "./tokens";

export const lightTheme: ThemeTokens = {
  bg: {
    app: "#FFFFFF",
    surface: "#F7F7F8",
    surfaceElevated: "#FFFFFF",
  },
  text: {
    primary: "#111111",
    secondary: "#4A4A4A",
    inverse: "#FFFFFF",
  },
  border: {
    default: "#E4E4E7",
    subtle: "#F0F0F2",
  },
  icon: {
    primary: "#111111",
    secondary: "#5A5A60",
  },
  action: {
    primaryBg: "#111111",
    primaryText: "#FFFFFF",
    secondaryBg: "#F1F1F3",
    secondaryText: "#111111",
    dangerBg: "#D14343",
    dangerText: "#FFFFFF",
  },
  state: {
    success: "#1F8A4C",
    warning: "#C27A00",
    error: "#C73434",
  },
  accent: {
    softSky: "#EAF4FF",
  },
  ...sharedTokens,
};
