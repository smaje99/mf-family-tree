import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";
import { openSqliteDatabase } from "@/lib/sqlite";

const sqlite = openSqliteDatabase();

export const db = drizzle(sqlite, { schema });
export { sqlite };
