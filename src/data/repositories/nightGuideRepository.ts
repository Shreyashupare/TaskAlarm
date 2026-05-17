import { openDatabase } from "../db/sqlite";
import { DEBUG } from "../../constants/AppConstants";
import type { NightGuide, NightGuideTask, NightGuideOccurrence, NightReflection } from "../../constants/types";

// ---- NightGuide CRUD ----

type NightGuideRow = {
  id: string;
  time: string;
  weekdays: string;
  enabled: number;
  label: string | null;
  sound_type: string;
  sound_name: string;
  sound_uri: string | null;
  created_at: number;
  updated_at: number;
};

function rowToNightGuide(row: NightGuideRow): NightGuide {
  return {
    id: row.id,
    time: row.time,
    weekdays: JSON.parse(row.weekdays) as number[],
    enabled: Boolean(row.enabled),
    label: row.label ?? undefined,
    soundType: row.sound_type as NightGuide["soundType"],
    soundName: row.sound_name,
    soundUri: row.sound_uri ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllNightGuides(): Promise<NightGuide[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<NightGuideRow>(
    "SELECT * FROM night_guides ORDER BY time"
  );
  return rows.map(rowToNightGuide);
}

export async function getNightGuideById(id: string): Promise<NightGuide | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<NightGuideRow>(
    "SELECT * FROM night_guides WHERE id = ?",
    id
  );
  return row ? rowToNightGuide(row) : null;
}

export async function insertNightGuide(guide: NightGuide): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT INTO night_guides (id, time, weekdays, enabled, label, sound_type, sound_name, sound_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    guide.id,
    guide.time,
    JSON.stringify(guide.weekdays),
    guide.enabled ? 1 : 0,
    guide.label ?? null,
    guide.soundType,
    guide.soundName,
    guide.soundUri ?? null,
    guide.createdAt,
    guide.updatedAt
  );
}

export async function updateNightGuide(guide: NightGuide): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE night_guides SET time = ?, weekdays = ?, enabled = ?, label = ?, sound_type = ?, sound_name = ?, sound_uri = ?, updated_at = ?
     WHERE id = ?`,
    guide.time,
    JSON.stringify(guide.weekdays),
    guide.enabled ? 1 : 0,
    guide.label ?? null,
    guide.soundType,
    guide.soundName,
    guide.soundUri ?? null,
    guide.updatedAt,
    guide.id
  );
}

export async function deleteNightGuide(id: string): Promise<void> {
  const db = await openDatabase();
  await db.runAsync("DELETE FROM night_guides WHERE id = ?", id);
}

// ---- NightGuideTask CRUD ----

type NightGuideTaskRow = {
  id: string;
  night_guide_id: string;
  text: string;
  order_num: number;
};

export async function getTasksForNightGuide(nightGuideId: string): Promise<NightGuideTask[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<NightGuideTaskRow>(
    "SELECT * FROM night_guide_tasks WHERE night_guide_id = ? ORDER BY order_num",
    nightGuideId
  );
  return rows.map((r) => ({
    id: r.id,
    nightGuideId: r.night_guide_id,
    text: r.text,
    order: r.order_num,
  }));
}

export async function replaceTasksForNightGuide(
  nightGuideId: string,
  tasks: NightGuideTask[]
): Promise<void> {
  const db = await openDatabase();
  await db.runAsync("DELETE FROM night_guide_tasks WHERE night_guide_id = ?", nightGuideId);
  for (const task of tasks) {
    await db.runAsync(
      "INSERT INTO night_guide_tasks (id, night_guide_id, text, order_num) VALUES (?, ?, ?, ?)",
      task.id,
      nightGuideId,
      task.text,
      task.order
    );
  }
}

// ---- NightGuideOccurrence CRUD ----

type OccurrenceRow = {

  id: string;
  night_guide_id: string;
  scheduled_date: string;
  status: string;
  completion_percentage: number;
  completed_task_ids: string;
  grace_deadline_at: number;
  created_at: number;
  completed_at: number | null;
};

function rowToOccurrence(row: OccurrenceRow): NightGuideOccurrence {
  return {
    id: row.id,
    nightGuideId: row.night_guide_id,
    scheduledDate: row.scheduled_date,
    status: row.status as NightGuideOccurrence["status"],
    completionPercentage: row.completion_percentage,
    completedTaskIds: JSON.parse(row.completed_task_ids),
    graceDeadlineAt: row.grace_deadline_at,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function getOccurrencesForNightGuide(
  nightGuideId: string
): Promise<NightGuideOccurrence[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<OccurrenceRow>(
    "SELECT * FROM night_guide_occurrences WHERE night_guide_id = ? ORDER BY scheduled_date DESC",
    nightGuideId
  );
  return rows.map(rowToOccurrence);
}

export async function getOccurrenceById(id: string): Promise<NightGuideOccurrence | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<OccurrenceRow>(
    "SELECT * FROM night_guide_occurrences WHERE id = ?",
    id
  );
  return row ? rowToOccurrence(row) : null;
}

export async function getOccurrenceForDate(
  nightGuideId: string,
  scheduledDate: string
): Promise<NightGuideOccurrence | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<OccurrenceRow>(
    "SELECT * FROM night_guide_occurrences WHERE night_guide_id = ? AND scheduled_date = ?",
    nightGuideId,
    scheduledDate
  );
  return row ? rowToOccurrence(row) : null;
}

export async function upsertOccurrence(occ: NightGuideOccurrence): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO night_guide_occurrences
     (id, night_guide_id, scheduled_date, status, completion_percentage, completed_task_ids, grace_deadline_at, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    occ.id,
    occ.nightGuideId,
    occ.scheduledDate,
    occ.status,
    occ.completionPercentage,
    JSON.stringify(occ.completedTaskIds ?? []),
    occ.graceDeadlineAt,
    occ.createdAt,
    occ.completedAt ?? null
  );
}

export async function updateOccurrenceStatus(
  id: string,
  status: NightGuideOccurrence["status"],
  completionPercentage: number, completedTaskIds: string[],
  completedAt?: number
): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE night_guide_occurrences SET status = ?, completion_percentage = ?, completed_task_ids = ?, completed_at = ? WHERE id = ?`,
    status,
    completionPercentage,
    JSON.stringify(completedTaskIds),
    completedAt ?? null,
    id
  );
}

export async function markMissedAfterGrace(nowEpoch: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE night_guide_occurrences SET status = 'missed'
     WHERE status = 'pending' AND grace_deadline_at <= ?`,
    nowEpoch
  );
}

export async function getAllPendingOccurrences(): Promise<NightGuideOccurrence[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<OccurrenceRow>(
    "SELECT * FROM night_guide_occurrences WHERE status = 'pending' ORDER BY scheduled_date DESC"
  );
  return rows.map(rowToOccurrence);
}

export async function getRecentOccurrences(limit: number = 60): Promise<NightGuideOccurrence[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<OccurrenceRow>(
    "SELECT * FROM night_guide_occurrences ORDER BY scheduled_date DESC LIMIT ?",
    limit
  );
  return rows.map(rowToOccurrence);
}

// ---- NightReflection CRUD ----

type ReflectionRow = {
  id: string;
  night_guide_id: string;
  occurrence_id: string;
  question: string;
  response: string;
  completion_percentage: number;
  created_at: number;
};



/**
 * Delete pending occurrences for a guide that no longer match its selected weekdays.
 * Only affects future-dated pending occurrences (past ones + completed/missed are kept).
 */
export async function deleteStalePendingOccurrences(
  guideId: string,
  activeWeekdays: number[]
): Promise<void> {
  const db = await openDatabase();
  const todayStr = new Date().toISOString().split("T")[0];
  // Get all pending occurrences for this guide
  const rows = await db.getAllAsync<OccurrenceRow>(
    "SELECT * FROM night_guide_occurrences WHERE night_guide_id = ? AND status = 'pending' AND scheduled_date > ?",
    guideId,
    todayStr
  );
  for (const row of rows) {
    const [y, m, d] = row.scheduled_date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const weekday = date.getDay();
    // If this date's weekday is not in the active weekdays, delete it
    if (!activeWeekdays.includes(weekday)) {
      await db.runAsync("DELETE FROM night_guide_occurrences WHERE id = ?", row.id);
      if (DEBUG) console.log(`Deleted stale pending occurrence ${row.id} for ${row.scheduled_date}`);
    }
  }
}
export async function saveNightReflection(reflection: NightReflection): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT INTO night_reflections (id, night_guide_id, occurrence_id, question, response, completion_percentage, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    reflection.id,
    reflection.nightGuideId,
    reflection.occurrenceId,
    reflection.question,
    reflection.response,
    reflection.completionPercentage,
    reflection.createdAt
  );
}

export async function getNightReflectionForOccurrence(
  occurrenceId: string
): Promise<NightReflection | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<ReflectionRow>(
    "SELECT * FROM night_reflections WHERE occurrence_id = ?",
    occurrenceId
  );
  if (!row) return null;
  return {
    id: row.id,
    nightGuideId: row.night_guide_id,
    occurrenceId: row.occurrence_id,
    question: row.question,
    response: row.response,
    completionPercentage: row.completion_percentage,
    createdAt: row.created_at,
  };
}

export async function getNightReflectionsForGuide(
  nightGuideId: string,
  limit: number = 30
): Promise<NightReflection[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<ReflectionRow>(
    "SELECT * FROM night_reflections WHERE night_guide_id = ? ORDER BY created_at DESC LIMIT ?",
    nightGuideId,
    limit
  );
  return rows.map((r) => ({
    id: r.id,
    nightGuideId: r.night_guide_id,
    occurrenceId: r.occurrence_id,
    question: r.question,
    response: r.response,
    completionPercentage: r.completion_percentage,
    createdAt: r.created_at,
  }));
}

// ---- Get all night reflections grouped by date ----

export async function getAllNightReflections(limit: number = 100): Promise<NightReflection[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<ReflectionRow>(
    "SELECT * FROM night_reflections ORDER BY created_at DESC LIMIT ?",
    limit
  );
  return rows.map((r) => ({
    id: r.id,
    nightGuideId: r.night_guide_id,
    occurrenceId: r.occurrence_id,
    question: r.question,
    response: r.response,
    completionPercentage: r.completion_percentage,
    createdAt: r.created_at,
  }));
}

export async function getNightReflectionsGroupedByDate(): Promise<
  { date: string; reflections: NightReflection[] }[]
> {
  const reflections = await getAllNightReflections(100);
  const grouped = new Map<string, NightReflection[]>();
  for (const reflection of reflections) {
    const date = new Date(reflection.createdAt);
    const dateKey = date.toISOString().split("T")[0];
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(reflection);
  }
  return Array.from(grouped.entries())
    .map(([date, reflections]) => ({ date, reflections }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ---- Weekday conflict helper ----

/**
 * Enable a single guide and disable any other enabled guides
 * that share ANY weekday with this guide, or are also one-time.
 */
export async function setNightGuideEnabled(guideId: string, enabled: boolean): Promise<void> {
  const db = await openDatabase();

  if (!enabled) {
    // Just disable this guide
    await db.runAsync("UPDATE night_guides SET enabled = 0, updated_at = ? WHERE id = ?", Date.now(), guideId);
    return;
  }

  // Get the guide being enabled
  const row = await db.getFirstAsync<NightGuideRow>(
    "SELECT * FROM night_guides WHERE id = ?",
    guideId
  );
  if (!row) return;

  const enablingWeekdays = JSON.parse(row.weekdays) as number[];
  const now = Date.now();

  // Disable other guides that share weekdays (or are also one-time if this is one-time)
  const allGuides = await db.getAllAsync<NightGuideRow>("SELECT * FROM night_guides WHERE id != ?", guideId);
  for (const other of allGuides) {
    const otherWeekdays = JSON.parse(other.weekdays) as number[];
    const hasConflict =
      enablingWeekdays.length === 0 && otherWeekdays.length === 0
        ? true // both one-time
        : enablingWeekdays.some((d) => otherWeekdays.includes(d));

    if (hasConflict && other.enabled) {
      await db.runAsync(
        "UPDATE night_guides SET enabled = 0, updated_at = ? WHERE id = ?",
        now,
        other.id
      );
    }
  }

  // Enable the target guide
  await db.runAsync(
    "UPDATE night_guides SET enabled = 1, updated_at = ? WHERE id = ?",
    now,
    guideId
  );
}

// ---- One-time auto-disable ----

export async function autoDisableOneTimeGuideIfCompleted(guideId: string): Promise<void> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<NightGuideRow>(
    "SELECT * FROM night_guides WHERE id = ?",
    guideId
  );
  if (!row) return;

  const weekdays = JSON.parse(row.weekdays) as number[];
  if (weekdays.length > 0) return; // not one-time

  // Check if there's a completed occurrence
  const occ = await db.getFirstAsync<OccurrenceRow>(
    "SELECT * FROM night_guide_occurrences WHERE night_guide_id = ? AND status = 'completed' ORDER BY scheduled_date DESC LIMIT 1",
    guideId
  );

  if (occ) {
    await db.runAsync(
      "UPDATE night_guides SET enabled = 0, updated_at = ? WHERE id = ?",
      Date.now(),
      guideId
    );
    if (DEBUG) console.log("Auto-disabled one-time night guide:", guideId);
  }
}
