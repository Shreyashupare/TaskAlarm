import type { AlarmTaskType } from "./alarm";
import {
  MIN_TASK_COUNT,
  MAX_TASK_COUNT,
  DEFAULT_TASK_COUNT,
  DEFAULT_TASK_TYPE,
  DEFAULT_THEME,
  DEFAULT_SNOOZE_POLICY,
} from "../AppConstants";

export type ThemePreference = "light" | "dark" | "system";

export type AppSettings = {
  theme: ThemePreference;
  defaultTaskCount: number;
  minTaskCount: typeof MIN_TASK_COUNT;
  maxTaskCount: typeof MAX_TASK_COUNT;
  defaultTaskType: AlarmTaskType;
  snoozePolicy: typeof DEFAULT_SNOOZE_POLICY;
};

export const DEFAULT_SETTINGS: Omit<AppSettings, "minTaskCount" | "maxTaskCount"> = {
  theme: DEFAULT_THEME,
  defaultTaskCount: DEFAULT_TASK_COUNT,
  defaultTaskType: DEFAULT_TASK_TYPE,
  snoozePolicy: DEFAULT_SNOOZE_POLICY,
};
