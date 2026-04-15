import { openDatabase } from "../db/sqlite";
import type { AppSettings, ThemePreference, AlarmTaskType } from "../../constants/types";

type SettingsRow = {
  theme: ThemePreference;
  default_task_count: number;
  default_task_type: AlarmTaskType;
  snooze_policy: "afterCompletionOnly";
};

export async function getSettings(): Promise<AppSettings> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<SettingsRow>(
    "SELECT theme, default_task_count, default_task_type, snooze_policy FROM settings WHERE id = 1"
  );

  if (!row) {
    throw new Error("Settings not initialized");
  }

  return {
    theme: row.theme,
    defaultTaskCount: row.default_task_count,
    minTaskCount: 3,
    maxTaskCount: 10,
    defaultTaskType: row.default_task_type,
    snoozePolicy: row.snooze_policy,
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
  if (settings.defaultTaskType !== undefined) {
    updates.push("default_task_type = ?");
    values.push(settings.defaultTaskType);
  }
  if (settings.snoozePolicy !== undefined) {
    updates.push("snooze_policy = ?");
    values.push(settings.snoozePolicy);
  }

  if (updates.length === 0) return;

  const query = `UPDATE settings SET ${updates.join(", ")} WHERE id = 1`;
  await db.runAsync(query, ...values);
}
