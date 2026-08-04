const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'quotes.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS catalogue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    rate REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'day',
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL DEFAULT '',
    project_name TEXT NOT NULL DEFAULT '',
    quote_ref TEXT NOT NULL DEFAULT '',
    quote_date TEXT NOT NULL,
    day_multiplier REAL NOT NULL DEFAULT 1,
    gst_enabled INTEGER NOT NULL DEFAULT 1,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quote_line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    catalogue_id INTEGER,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    rate REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'day',
    qty REAL NOT NULL DEFAULT 1,
    days REAL NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS preset_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    preset_id INTEGER NOT NULL REFERENCES presets(id) ON DELETE CASCADE,
    catalogue_id INTEGER NOT NULL REFERENCES catalogue(id),
    qty REAL NOT NULL DEFAULT 1,
    days REAL NOT NULL DEFAULT 1
  );
`);

module.exports = db;
