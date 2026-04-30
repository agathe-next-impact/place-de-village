import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import { db } from "./client";

async function main() {
  await migrate(db, {
    migrationsFolder: path.resolve(process.cwd(), "drizzle"),
  });
  console.log("✓ migrations applied");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
