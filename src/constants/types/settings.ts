import type { AlarmTaskType } from "./alarm";
import {
  MIN_TASK_COUNT,
  MAX_TASK_COUNT,
  DEFAULT_TASK_COUNT,
  DEFAULT_TASK_TYPES,
  DEFAULT_THEME,
  DEFAULT_SNOOZE_POLICY,
  DEFAULT_SNOOZE_INTERVAL,
  DEFAULT_SNOOZE_MAX,
  DEFAULT_TIME_FORMAT,
  DEFAULT_RINGTONE,
} from "../AppConstants";

export type ThemePreference = "light" | "dark" | "system";
export type TimeFormat = "12h" | "24h";

export type RingtoneType = "default" | "custom";

export type AppSettings = {
  theme: ThemePreference;
  timeFormat: TimeFormat;
  defaultTaskCount: number;
  minTaskCount: number;
  maxTaskCount: number;
  defaultTaskTypes: AlarmTaskType[];
  snoozePolicy: typeof DEFAULT_SNOOZE_POLICY;
  snoozeInterval: number; // minutes
  snoozeMaxCount: number;
  ringtoneType: RingtoneType;
  ringtoneName: string;
  ringtoneUri?: string;
};

export const DEFAULT_SETTINGS: Omit<AppSettings, "minTaskCount" | "maxTaskCount"> = {
  theme: DEFAULT_THEME,
  timeFormat: DEFAULT_TIME_FORMAT,
  defaultTaskCount: DEFAULT_TASK_COUNT,
  defaultTaskTypes: DEFAULT_TASK_TYPES,
  snoozePolicy: DEFAULT_SNOOZE_POLICY,
  snoozeInterval: DEFAULT_SNOOZE_INTERVAL,
  snoozeMaxCount: DEFAULT_SNOOZE_MAX,
  ringtoneType: DEFAULT_RINGTONE.type,
  ringtoneName: DEFAULT_RINGTONE.name,
  ringtoneUri: DEFAULT_RINGTONE.uri,
};
