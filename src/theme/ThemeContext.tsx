import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import type { ThemeTokens } from "./tokens";
import { lightTheme } from "./lightTheme";
import { darkTheme } from "./darkTheme";
import { useSettingsStore } from "../stores/useSettingsStore";
import type { ThemePreference } from "../constants/types";

const ThemeContext = createContext<ThemeTokens>(lightTheme);

function getTheme(preference: ThemePreference, systemScheme: "light" | "dark" | null | undefined): ThemeTokens {
  if (preference === "system") {
    return systemScheme === "dark" ? darkTheme : lightTheme;
  }
  return preference === "dark" ? darkTheme : lightTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { theme: themePreference, loadSettings } = useSettingsStore();
  const [theme, setTheme] = useState<ThemeTokens>(lightTheme);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setTheme(getTheme(themePreference, systemScheme));
  }, [themePreference, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeTokens(): ThemeTokens {
  return useContext(ThemeContext);
}
