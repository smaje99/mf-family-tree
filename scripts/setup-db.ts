import { applyMigrations } from "../db/migrate";
import { getDatabasePath, openSqliteDatabase } from "../lib/sqlite";

const sqlite = openSqliteDatabase();

try {
  const executed = applyMigrations(sqlite);

  if (executed.length === 0) {
    console.log(`Base lista en ${getDatabasePath()}. No había migraciones pendientes.`);
  } else {
    console.log(`Base lista en ${getDatabasePath()}.`);
    console.log(`Migraciones aplicadas: ${executed.join(", ")}`);
  }
} finally {
  sqlite.close();
}
