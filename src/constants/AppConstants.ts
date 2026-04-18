import type { AlarmTaskType } from "./types";

// Debug flag - set to false for production builds
export const DEBUG = __DEV__; // Only true in development

// Ringtone type
export type Ringtone = {
  type: "default" | "notification" | "reminder" | "custom" | "device";
  name: string;
  uri?: string;
};

// Task count limits
export const MIN_TASK_COUNT = 3;
export const MAX_TASK_COUNT = 12;
export const DEFAULT_TASK_COUNT = 5;

// Default settings
export const DEFAULT_TASK_TYPES: AlarmTaskType[] = ["math", "color", "shape"];
export const DEFAULT_THEME = "system";
export const DEFAULT_SNOOZE_POLICY = "afterCompletionOnly";
export const DEFAULT_SNOOZE_INTERVAL = 5; // minutes
export const DEFAULT_SNOOZE_MAX = 3; // max snoozes
export const DEFAULT_TIME_FORMAT = "12h";
export const DEFAULT_RINGTONE = {
  type: "default" as const,
  name: "Default",
  uri: undefined as string | undefined,
};

// Default ringtones using system sounds
export const DEFAULT_RINGTONES = [
  { type: "default" as const, name: "Default Alarm", uri: undefined },
  { type: "reminder" as const, name: "Reminder", uri: undefined },
];
