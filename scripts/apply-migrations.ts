import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(rootDir, "prisma", "migrations");
const envPath = path.join(rootDir, ".env");

function loadEnvFile() {
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function ensureMigrationTable(client: pg.Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY NOT NULL,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);
}

async function appliedMigrations(client: pg.Client) {
  const result = await client.query<{ migration_name: string }>(
    `SELECT "migration_name" FROM "_prisma_migrations" WHERE "rolled_back_at" IS NULL;`
  );

  return new Set(result.rows.map((row) => row.migration_name));
}

async function main() {
  loadEnvFile();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL nao foi definido. Copie .env.example para .env ou exporte a variavel."
    );
  }

  const client = new Client({ connectionString: databaseUrl });

  await client.connect();
  await ensureMigrationTable(client);

  const applied = await appliedMigrations(client);
  const migrationNames = (await readdir(migrationsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const migrationName of migrationNames) {
    if (applied.has(migrationName)) {
      continue;
    }

    const migrationPath = path.join(migrationsDir, migrationName, "migration.sql");
    const sql = await readFile(migrationPath, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");

    await client.query("BEGIN");

    try {
      await client.query(sql);
      await client.query(
        `
          INSERT INTO "_prisma_migrations" (
            "id",
            "checksum",
            "finished_at",
            "migration_name",
            "applied_steps_count"
          )
          VALUES (gen_random_uuid()::text, $1, now(), $2, 1);
        `,
        [checksum, migrationName]
      );
      await client.query("COMMIT");
      console.log(`Applied migration ${migrationName}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  await client.end();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
