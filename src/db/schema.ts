// On-device SQLite: schema + connection. The events table is APPEND-ONLY (spec I3):
// corrections insert a new row that supersedes an earlier one; originals are never mutated.
import * as SQLite from "expo-sqlite";

const DB_NAME = "pawvac.db";
const SCHEMA_VERSION = 1;

let _db: SQLite.SQLiteDatabase | null = null;

export function db(): SQLite.SQLiteDatabase {
  if (!_db) _db = SQLite.openDatabaseSync(DB_NAME);
  return _db;
}

export function initSchema(): void {
  const d = db();
  d.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS pets (
      id          TEXT PRIMARY KEY NOT NULL,
      name        TEXT NOT NULL,
      species     TEXT NOT NULL,
      breed       TEXT,
      sex         TEXT,
      age_label   TEXT,
      weight_kg   REAL,
      risk_flags  TEXT NOT NULL DEFAULT '[]',  -- JSON array
      color       TEXT NOT NULL,
      created_at  INTEGER NOT NULL
    );

    -- Append-only event log. supersedes = id of the event this one corrects (NULL if original).
    -- A row is "current" when no other row supersedes it.
    CREATE TABLE IF NOT EXISTS events (
      id          TEXT PRIMARY KEY NOT NULL,
      pet_id      TEXT NOT NULL,
      kind        TEXT NOT NULL,
      summary     TEXT NOT NULL,
      date_label  TEXT NOT NULL,
      source      TEXT NOT NULL,
      confirmed   INTEGER NOT NULL DEFAULT 0,
      supersedes  TEXT,                          -- id of corrected event, or NULL
      created_at  INTEGER NOT NULL,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id              TEXT PRIMARY KEY NOT NULL,
      pet_id          TEXT NOT NULL,
      title           TEXT NOT NULL,
      schedule        TEXT NOT NULL,
      next_label      TEXT NOT NULL,
      remaining_label TEXT,
      done            INTEGER NOT NULL DEFAULT 0,
      created_at      INTEGER NOT NULL,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );

    CREATE TABLE IF NOT EXISTS calendar_items (
      id          TEXT PRIMARY KEY NOT NULL,
      pet_id      TEXT NOT NULL,
      date        TEXT NOT NULL,                 -- ISO YYYY-MM-DD
      kind        TEXT NOT NULL,
      title       TEXT NOT NULL,
      time_label  TEXT,
      done        INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_pet ON events(pet_id);
    CREATE INDEX IF NOT EXISTS idx_events_supersedes ON events(supersedes);
    CREATE INDEX IF NOT EXISTS idx_reminders_pet ON reminders(pet_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_pet ON calendar_items(pet_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_items(date);

    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
  `);
  d.runSync(`INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)`, [String(SCHEMA_VERSION)]);
}

export function isSeeded(): boolean {
  const row = db().getFirstSync<{ c: number }>(`SELECT COUNT(*) AS c FROM pets`);
  return (row?.c ?? 0) > 0;
}

/** Wipe everything (used by tests / dev reset). */
export function resetDb(): void {
  const d = db();
  d.execSync(`DELETE FROM events; DELETE FROM reminders; DELETE FROM calendar_items; DELETE FROM pets;`);
}
