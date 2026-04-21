import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

const sql = neon(connectionString);

export async function query<T extends Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  return sql.query<T>(text, params);
}

let initPromise: Promise<void> | null = null;

export async function ensureGameScoresTable() {
  if (!initPromise) {
    initPromise = (async () => {
      await query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
      await query(`
        CREATE TABLE IF NOT EXISTS game_scores (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          game_type TEXT NOT NULL CHECK (game_type IN ('click', 'typing')),
          username TEXT NOT NULL DEFAULT 'anonymous',
          score INTEGER,
          wpm INTEGER,
          accuracy INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_game_scores_click
        ON game_scores (game_type, score DESC, created_at ASC);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_game_scores_typing
        ON game_scores (game_type, wpm DESC, created_at ASC);
      `);
    })();
  }

  await initPromise;
}
