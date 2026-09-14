import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

/**
 * Opens (once per process) the SQLite file backing the app and applies any
 * pending migration from `drizzle/`. Migrating on first use keeps the container
 * self-healing: a fresh volume becomes a usable database on boot.
 */
export function getDb(): Db {
  if (cached) return cached;

  const file = resolve(process.env.DATABASE_PATH ?? "./data/saleslab.sqlite");
  mkdirSync(dirname(file), { recursive: true });

  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const database = drizzle(sqlite, { schema });
  migrate(database, {
    migrationsFolder: resolve(process.env.MIGRATIONS_PATH ?? "./drizzle"),
  });

  cached = database;
  return cached;
}
