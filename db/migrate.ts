import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export function applyMigrations(
  sqlite: import("better-sqlite3").Database,
  migrationsDir = path.join(process.cwd(), "db", "migrations")
) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const appliedRows = sqlite
    .prepare("SELECT id FROM schema_migrations")
    .all() as Array<{ id: string }>;

  const applied = new Set(appliedRows.map((row) => row.id));
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const markMigration = sqlite.prepare(
    "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)"
  );

  const executed: string[] = [];

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = readFileSync(path.join(migrationsDir, file), "utf8");

    const transaction = sqlite.transaction(() => {
      sqlite.exec(sql);
      markMigration.run(file, new Date().toISOString());
    });

    transaction();
    executed.push(file);
  }

  return executed;
}
