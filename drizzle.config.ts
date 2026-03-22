import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations/generated",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "./storage/casa-maje-franco.sqlite"
  }
} satisfies Config;
