import { openDatabase } from "../db/sqlite";
import { MIN_TASK_COUNT, MAX_TASK_COUNT } from "../../constants/AppConstants";
import type { AppSettings, ThemePreference, AlarmTaskType, TimeFormat, CustomQuestion } from "../../constants/types";

type SettingsRow = {
  theme: ThemePreference;
  time_format: TimeFormat;
  default_task_count: number;
  default_task_types: string;
  snooze_policy: "afterCompletionOnly";
  snooze_interval: number;
  snooze_max_count: number;
  ringtone_type: "default" | "custom";
  ringtone_name: string;
  ringtone_uri?: string;
  enable_reflection: number;
  enable_custom_questions: number;
  custom_questions: string;
};

export async function getSettings(): Promise<AppSettings> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<SettingsRow>(
    "SELECT theme, time_format, default_task_count, default_task_types, snooze_policy, snooze_interval, snooze_max_count, ringtone_type, ringtone_name, ringtone_uri, enable_reflection, enable_custom_questions, custom_questions FROM settings WHERE id = 1"
  );

  if (!row) {
    throw new Error("Settings not initialized");
  }

  let taskTypes: AlarmTaskType[] = ["math", "color", "shape"];
  try {
    const parsed = JSON.parse(row.default_task_types);
    if (Array.isArray(parsed)) {
      taskTypes = parsed;
    }
  } catch {
    // Fallback to default if JSON parsing fails
  }

  // V2.0: Parse custom questions JSON
  let customQuestions: CustomQuestion[] = [];
  try {
    const parsed = JSON.parse(row.custom_questions);
    if (Array.isArray(parsed)) {
      customQuestions = parsed;
    }
  } catch {
    // Fallback to empty array if JSON parsing fails
  }

  return {
    theme: row.theme,
    timeFormat: row.time_format ?? "12h",
    defaultTaskCount: row.default_task_count,
    minTaskCount: MIN_TASK_COUNT,
    maxTaskCount: MAX_TASK_COUNT,
    defaultTaskTypes: taskTypes,
    snoozePolicy: row.snooze_policy,
    snoozeInterval: row.snooze_interval ?? 5,
    snoozeMaxCount: row.snooze_max_count ?? 3,
    ringtoneType: row.ringtone_type ?? "default",
    ringtoneName: row.ringtone_name ?? "Default",
    ringtoneUri: row.ringtone_uri,
    enableReflection: row.enable_reflection === 1,
    enableCustomQuestions: row.enable_custom_questions === 1,
    customQuestions,
  };
}

export async function updateSettings(settings: Partial<Omit<AppSettings, "minTaskCount" | "maxTaskCount">>): Promise<void> {
  const db = await openDatabase();

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (settings.theme !== undefined) {
    updates.push("theme = ?");
    values.push(settings.theme);
  }
  if (settings.defaultTaskCount !== undefined) {
    updates.push("default_task_count = ?");
    values.push(settings.defaultTaskCount);
  }
  if (settings.defaultTaskTypes !== undefined) {
    updates.push("default_task_types = ?");
    values.push(JSON.stringify(settings.defaultTaskTypes));
  }
  if (settings.snoozePolicy !== undefined) {
    updates.push("snooze_policy = ?");
    values.push(settings.snoozePolicy);
  }
  if (settings.timeFormat !== undefined) {
    updates.push("time_format = ?");
    values.push(settings.timeFormat);
  }
  if (settings.ringtoneType !== undefined) {
    updates.push("ringtone_type = ?");
    values.push(settings.ringtoneType);
  }
  if (settings.ringtoneName !== undefined) {
    updates.push("ringtone_name = ?");
    values.push(settings.ringtoneName);
  }
  if (settings.ringtoneUri !== undefined) {
    updates.push("ringtone_uri = ?");
    values.push(settings.ringtoneUri);
  }
  if (settings.snoozeInterval !== undefined) {
    updates.push("snooze_interval = ?");
    values.push(settings.snoozeInterval);
  }
  if (settings.snoozeMaxCount !== undefined) {
    updates.push("snooze_max_count = ?");
    values.push(settings.snoozeMaxCount);
  }
  if (settings.enableReflection !== undefined) {
    updates.push("enable_reflection = ?");
    values.push(settings.enableReflection ? 1 : 0);
  }
  if (settings.enableCustomQuestions !== undefined) {
    updates.push("enable_custom_questions = ?");
    values.push(settings.enableCustomQuestions ? 1 : 0);
  }
  if (settings.customQuestions !== undefined) {
    updates.push("custom_questions = ?");
    values.push(JSON.stringify(settings.customQuestions));
  }

  if (updates.length === 0) return;

  const query = `UPDATE settings SET ${updates.join(", ")} WHERE id = 1`;
  await db.runAsync(query, ...values);
}
