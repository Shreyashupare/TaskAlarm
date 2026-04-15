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
      time_format TEXT NOT NULL DEFAULT '12h',
      default_task_count INTEGER NOT NULL DEFAULT 4,
      default_task_types TEXT NOT NULL DEFAULT '["math","color","shape"]',
      snooze_policy TEXT NOT NULL DEFAULT 'afterCompletionOnly',
      snooze_interval INTEGER NOT NULL DEFAULT 5,
      snooze_max_count INTEGER NOT NULL DEFAULT 3,
      ringtone_type TEXT NOT NULL DEFAULT 'default',
      ringtone_name TEXT NOT NULL DEFAULT 'Default',
      ringtone_uri TEXT
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      author TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );

  `);

  // Migration: handle missing columns
  try {
    const tableInfo = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(settings)"
    );
    const columns = tableInfo.map(col => col.name);

    // Add time_format column if missing
    if (!columns.includes("time_format")) {
      await database.execAsync(
        "ALTER TABLE settings ADD COLUMN time_format TEXT NOT NULL DEFAULT '12h'"
      );
    }

    // Handle default_task_type -> default_task_types migration
    if (columns.includes("default_task_type") && !columns.includes("default_task_types")) {
      await database.execAsync(`
        ALTER TABLE settings RENAME COLUMN default_task_type TO default_task_types;
        UPDATE settings SET default_task_types = '["math","color","shape"]' WHERE default_task_types = 'mixed' OR default_task_types IS NULL;
        UPDATE settings SET default_task_types = '["' || default_task_types || '"]'
          WHERE default_task_types NOT LIKE '[%';
      `);
    }

    // Add default_task_types column if both old and new are missing
    if (!columns.includes("default_task_types") && !columns.includes("default_task_type")) {
      await database.execAsync(
        'ALTER TABLE settings ADD COLUMN default_task_types TEXT NOT NULL DEFAULT \'["math","color","shape"]\''
      );
    }

    // Add snooze columns if missing
    if (!columns.includes("snooze_interval")) {
      await database.execAsync(
        "ALTER TABLE settings ADD COLUMN snooze_interval INTEGER NOT NULL DEFAULT 5"
      );
    }
    if (!columns.includes("snooze_max_count")) {
      await database.execAsync(
        "ALTER TABLE settings ADD COLUMN snooze_max_count INTEGER NOT NULL DEFAULT 3"
      );
    }

    // Add ringtone columns if missing
    if (!columns.includes("ringtone_type")) {
      await database.execAsync(
        "ALTER TABLE settings ADD COLUMN ringtone_type TEXT NOT NULL DEFAULT 'default'"
      );
    }
    if (!columns.includes("ringtone_name")) {
      await database.execAsync(
        "ALTER TABLE settings ADD COLUMN ringtone_name TEXT NOT NULL DEFAULT 'Default'"
      );
    }
    if (!columns.includes("ringtone_uri")) {
      await database.execAsync(
        "ALTER TABLE settings ADD COLUMN ringtone_uri TEXT"
      );
    }

    // Ensure default row exists with all columns
    await database.execAsync(`
      INSERT OR IGNORE INTO settings (id, theme, time_format, default_task_count, default_task_types, snooze_policy, snooze_interval, snooze_max_count, ringtone_type, ringtone_name)
      VALUES (1, 'system', '12h', 4, '["math","color","shape"]', 'afterCompletionOnly', 5, 3, 'default', 'Default');
    `);
  } catch (migrationErr) {
    console.log("Migration check (non-critical):", migrationErr);
  }
}
