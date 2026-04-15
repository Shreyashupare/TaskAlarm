import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("taskalarm.db");
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await openDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS alarms (
      id TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      weekdays TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      label TEXT,
      sound_type TEXT NOT NULL DEFAULT 'default',
      sound_name TEXT NOT NULL DEFAULT 'default',
      sound_uri TEXT,
      vibration INTEGER NOT NULL DEFAULT 1,
      task_type TEXT NOT NULL DEFAULT 'math',
      task_count INTEGER NOT NULL DEFAULT 4,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'system',
      default_task_count INTEGER NOT NULL DEFAULT 4,
      default_task_type TEXT NOT NULL DEFAULT 'math',
      snooze_policy TEXT NOT NULL DEFAULT 'afterCompletionOnly'
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      author TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );

    INSERT OR IGNORE INTO settings (id, theme, default_task_count, default_task_type, snooze_policy)
    VALUES (1, 'system', 4, 'math', 'afterCompletionOnly');
  `);
}
