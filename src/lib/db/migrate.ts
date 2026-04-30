import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./client";
import path from "node:path";

migrate(db, {
  migrationsFolder: path.resolve(process.cwd(), "drizzle"),
});

console.log("✓ migrations applied");
