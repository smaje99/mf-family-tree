import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export function getDatabasePath() {
  return (
    process.env.DATABASE_URL ??
    path.join(process.cwd(), "storage", "casa-maje-franco.sqlite")
  );
}

export function openSqliteDatabase() {
  const databasePath = getDatabasePath();
  mkdirSync(path.dirname(databasePath), { recursive: true });

  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  return sqlite;
}
