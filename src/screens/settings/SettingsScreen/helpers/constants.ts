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
  { value: "mixed", label: "All Types" },
];

// V2.0: All task types including mini tasks
export const TASK_TYPE_OPTIONS_V2: { value: AlarmTaskType; label: string }[] = [
  { value: "math", label: "Math" },
  { value: "color", label: "Color Match" },
  { value: "shape", label: "Shape Match" },
  { value: "icon_match", label: "Icon Match" },
  { value: "position_tap", label: "Position Tap" },
  { value: "order_tap", label: "Order Tap" },
  { value: "count_objects", label: "Count Objects" },
  { value: "mixed", label: "All Types" },
];

export const SNOOZE_OPTIONS: { value: "afterCompletionOnly" | "always"; label: string }[] = [
  { value: "afterCompletionOnly", label: "After completing tasks only" },
  { value: "always", label: "Always allow" },
];

export const TIME_FORMAT_OPTIONS: { value: "12h" | "24h"; label: string }[] = [
  { value: "12h", label: "12-hour (AM/PM)" },
  { value: "24h", label: "24-hour" },
];

export const REFLECTION_INFO_BODY =
  "Reflection is an open-ended question that appears as your final task. It helps you start the day with mindfulness. Any response is accepted and saved to your reflection history.\n\nWhen reflection is on, you also get Read Out Loud: a short set of affirmations to read before you finish the alarm. Each line is marked with the circle beside it, in order. Spoken playback is included automatically.";
