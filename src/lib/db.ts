import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;

function getSqlClient() {
  if (!sqlClient) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("Missing DATABASE_URL environment variable.");
    }

    sqlClient = neon(connectionString);
  }

  return sqlClient;
}

export async function query<T extends Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const sql = getSqlClient();
  const result = await sql.query(text, params);

  if (Array.isArray(result)) {
    return result as T[];
  }

  if (result && typeof result === "object" && "rows" in result) {
    return result.rows as T[];
  }

  return [];
}

let initPromise: Promise<void> | null = null;

export async function ensureGameScoresTable() {
  if (!initPromise) {
    initPromise = (async () => {
      await query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
      await query(`
        CREATE TABLE IF NOT EXISTS game_scores (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          game_type TEXT NOT NULL,
          username TEXT NOT NULL DEFAULT 'anonymous',
          score INTEGER,
          wpm INTEGER,
          accuracy INTEGER,
          duration_ms INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await query(`
        ALTER TABLE game_scores
        ADD COLUMN IF NOT EXISTS duration_ms INTEGER;
      `);

      await query(`
        ALTER TABLE game_scores
        DROP CONSTRAINT IF EXISTS game_scores_game_type_check;
      `);

      await query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'game_scores_game_type_check'
          ) THEN
            ALTER TABLE game_scores
            ADD CONSTRAINT game_scores_game_type_check
            CHECK (game_type IN ('click', 'typing', 'aimlab'));
          END IF;
        END
        $$;
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_game_scores_click
        ON game_scores (game_type, score DESC, created_at ASC);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_game_scores_click_speed
        ON game_scores (game_type, duration_ms ASC, score DESC, created_at ASC);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_game_scores_typing
        ON game_scores (game_type, wpm DESC, created_at ASC);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_game_scores_aimlab
        ON game_scores (game_type, score DESC, accuracy DESC, created_at ASC);
      `);
    })();
  }

  await initPromise;
}
