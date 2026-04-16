/**
 * Reflection Repository
 * V2.0 Feature: Store and retrieve reflection responses
 */

import { openDatabase } from "../db/sqlite";

export interface Reflection {
  id: string;
  alarmId: string;
  question: string;
  response: string;
  createdAt: number;
}

/**
 * Save a reflection response to the database
 */
export async function saveReflection(
  alarmId: string,
  question: string,
  response: string
): Promise<Reflection> {
  const database = await openDatabase();

  const id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = Date.now();

  await database.runAsync(
    `INSERT INTO reflections (id, alarm_id, question, response, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, alarmId, question, response, createdAt]
  );

  return {
    id,
    alarmId,
    question,
    response,
    createdAt,
  };
}

/**
 * Get recent reflections, optionally limited by count
 */
export async function getRecentReflections(limit: number = 50): Promise<Reflection[]> {
  const database = await openDatabase();

  const rows = await database.getAllAsync<{
    id: string;
    alarm_id: string;
    question: string;
    response: string;
    created_at: number;
  }>(
    `SELECT id, alarm_id, question, response, created_at
     FROM reflections
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    alarmId: row.alarm_id,
    question: row.question,
    response: row.response,
    createdAt: row.created_at,
  }));
}

/**
 * Get reflections grouped by date (for display in ReflectionsScreen)
 */
export async function getReflectionsGroupedByDate(): Promise<
  { date: string; reflections: Reflection[] }[]
> {
  const reflections = await getRecentReflections(100);

  // Group by date (YYYY-MM-DD)
  const grouped = new Map<string, Reflection[]>();

  for (const reflection of reflections) {
    const date = new Date(reflection.createdAt);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(reflection);
  }

  // Convert to array and sort by date (newest first)
  return Array.from(grouped.entries())
    .map(([date, reflections]) => ({ date, reflections }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Delete a reflection by ID
 */
export async function deleteReflection(id: string): Promise<void> {
  const database = await openDatabase();
  await database.runAsync("DELETE FROM reflections WHERE id = ?", [id]);
}

/**
 * Delete all reflections (use with caution)
 */
export async function deleteAllReflections(): Promise<void> {
  const database = await openDatabase();
  await database.runAsync("DELETE FROM reflections");
}

/**
 * Get reflection count
 */
export async function getReflectionCount(): Promise<number> {
  const database = await openDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM reflections"
  );
  return result?.count ?? 0;
}
