import { createContext, useContext } from "react";
import type { ThemeTokens } from "./tokens";
import { lightTheme } from "./lightTheme";

// MVP: Hardcoded to light theme. Will connect to settings store in future.
const ThemeContext = createContext<ThemeTokens>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // MVP default: always light theme
  // TODO: Connect to settings store for light/dark/system selection
  const theme = lightTheme;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeTokens(): ThemeTokens {
  return useContext(ThemeContext);
}
