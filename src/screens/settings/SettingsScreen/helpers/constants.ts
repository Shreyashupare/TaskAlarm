import type { ThemePreference, AlarmTaskType } from "../../../../constants/types";

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System Default" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const TASK_TYPE_OPTIONS: { value: AlarmTaskType; label: string }[] = [
  { value: "math", label: "Math" },
  { value: "color", label: "Color Match" },
  { value: "shape", label: "Shape Match" },
  { value: "mixed", label: "Mixed" },
];

export const SNOOZE_OPTIONS: { value: "afterCompletionOnly" | "always"; label: string }[] = [
  { value: "afterCompletionOnly", label: "After completing tasks only" },
  { value: "always", label: "Always allow" },
];
