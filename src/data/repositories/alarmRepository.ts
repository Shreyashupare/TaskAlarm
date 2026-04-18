import { openDatabase } from "../db/sqlite";
import { DEBUG } from "../../constants/AppConstants";
import type { Alarm } from "../../constants/types";

type AlarmRow = {
  id: string;
  time: string;
  weekdays: string;
  enabled: number;
  label: string | null;
  sound_type: string;
  sound_name: string;
  sound_uri: string | null;
  vibration: number;
  task_type: string;
  task_count: number;
  created_at: number;
  updated_at: number;
};

function weekdaysToString(weekdays: number[]): string {
  return weekdays.join(",");
}

function stringToWeekdays(str: string): number[] {
  if (!str) return [];
  return str.split(",").map(Number).filter(n => !isNaN(n));
}

export async function getAllAlarms(): Promise<Alarm[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<AlarmRow>("SELECT * FROM alarms ORDER BY time");

  return rows.map((row: AlarmRow) => ({
    id: row.id,
    time: row.time,
    weekdays: stringToWeekdays(row.weekdays),
    enabled: Boolean(row.enabled),
    label: row.label ?? undefined,
    soundType: row.sound_type as Alarm["soundType"],
    soundName: row.sound_name,
    soundUri: row.sound_uri ?? undefined,
    vibration: Boolean(row.vibration),
    taskType: row.task_type as Alarm["taskType"],
    taskCount: row.task_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAlarmById(id: string): Promise<Alarm | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    time: string;
    weekdays: string;
    enabled: number;
    label: string | null;
    sound_type: string;
    sound_name: string;
    sound_uri: string | null;
    vibration: number;
    task_type: string;
    task_count: number;
    created_at: number;
    updated_at: number;
  }>("SELECT * FROM alarms WHERE id = ?", id);

  if (!row) return null;

  return {
    id: row.id,
    time: row.time,
    weekdays: stringToWeekdays(row.weekdays),
    enabled: Boolean(row.enabled),
    label: row.label ?? undefined,
    soundType: row.sound_type as Alarm["soundType"],
    soundName: row.sound_name,
    soundUri: row.sound_uri ?? undefined,
    vibration: Boolean(row.vibration),
    taskType: row.task_type as Alarm["taskType"],
    taskCount: row.task_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertAlarm(alarm: Alarm): Promise<void> {
  try {
    const db = await openDatabase();
    if (DEBUG) console.log("Inserting alarm:", alarm.id, alarm.time, alarm.soundType, alarm.soundName);
    await db.runAsync(
      `INSERT INTO alarms (id, time, weekdays, enabled, label, sound_type, sound_name, sound_uri, vibration, task_type, task_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      alarm.id,
      alarm.time,
      weekdaysToString(alarm.weekdays),
      alarm.enabled ? 1 : 0,
      alarm.label ?? null,
      alarm.soundType,
      alarm.soundName,
      alarm.soundUri ?? null,
      alarm.vibration ? 1 : 0,
      alarm.taskType,
      alarm.taskCount,
      alarm.createdAt,
      alarm.updatedAt
    );
    if (DEBUG) console.log("Alarm inserted successfully:", alarm.id);
  } catch (err) {
    if (DEBUG) console.error("Failed to insert alarm:", err);
    if (DEBUG) console.error("Alarm data:", JSON.stringify(alarm, null, 2));
    throw err;
  }
}

export async function updateAlarm(alarm: Alarm): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE alarms SET time = ?, weekdays = ?, enabled = ?, label = ?, sound_type = ?, sound_name = ?, sound_uri = ?, vibration = ?, task_type = ?, task_count = ?, updated_at = ?
     WHERE id = ?`,
    alarm.time,
    weekdaysToString(alarm.weekdays),
    alarm.enabled ? 1 : 0,
    alarm.label ?? null,
    alarm.soundType,
    alarm.soundName,
    alarm.soundUri ?? null,
    alarm.vibration ? 1 : 0,
    alarm.taskType,
    alarm.taskCount,
    alarm.updatedAt,
    alarm.id
  );
}

export async function deleteAlarm(id: string): Promise<void> {
  const db = await openDatabase();
  await db.runAsync("DELETE FROM alarms WHERE id = ?", id);
}
