import { ensureGameScoresTable, query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type GameType = "click" | "typing" | "aimlab";

type ScorePayload = {
  gameType?: string;
  username?: string;
  score?: number;
  wpm?: number;
  accuracy?: number;
  durationMs?: number;
};

type ScoreRow = {
  id: string;
  game_type: string;
  username: string;
  score: number | null;
  wpm: number | null;
  accuracy: number | null;
  duration_ms: number | null;
  created_at: string;
};

function asInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.round(value);
}

function sanitizeUsername(raw: unknown) {
  if (typeof raw !== "string") {
    return "anonymous";
  }

  const cleaned = raw.trim().slice(0, 24);
  return cleaned.length > 0 ? cleaned : "anonymous";
}

function normalizeGameType(value: unknown): GameType | null {
  if (value === "click" || value === "typing" || value === "aimlab") {
    return value;
  }

  return null;
}

function validatePayload(payload: ScorePayload) {
  const gameType = normalizeGameType(payload.gameType);
  if (!gameType) {
    return { error: "Invalid gameType. Use 'click', 'typing', or 'aimlab'." };
  }

  const username = sanitizeUsername(payload.username);
  const accuracyRaw = payload.accuracy === undefined ? null : asInt(payload.accuracy);

  if (accuracyRaw !== null && (accuracyRaw < 0 || accuracyRaw > 100)) {
    return { error: "accuracy must be between 0 and 100." };
  }

  if (gameType === "click") {
    const score = asInt(payload.score);
    const durationMs = asInt(payload.durationMs);

    if (score === null || score < 0) {
      return { error: "score is required for click game and must be >= 0." };
    }

    if (durationMs === null || durationMs < 250 || durationMs > 60000) {
      return { error: "durationMs is required for click game and must be between 250 and 60000." };
    }

    return {
      value: {
        gameType,
        username,
        score,
        wpm: null,
        accuracy: null,
        durationMs,
      },
    };
  }

  if (gameType === "aimlab") {
    const score = asInt(payload.score);
    const durationMs = asInt(payload.durationMs);

    if (score === null || score < 0) {
      return { error: "score is required for aimlab game and must be >= 0." };
    }

    if (durationMs === null || durationMs < 1000 || durationMs > 120000) {
      return { error: "durationMs is required for aimlab game and must be between 1000 and 120000." };
    }

    return {
      value: {
        gameType,
        username,
        score,
        wpm: null,
        accuracy: accuracyRaw,
        durationMs,
      },
    };
  }

  const wpm = asInt(payload.wpm);
  if (wpm === null || wpm < 0) {
    return { error: "wpm is required for typing game and must be >= 0." };
  }

  return {
    value: {
      gameType,
      username,
      score: null,
      wpm,
      accuracy: accuracyRaw,
      durationMs: null,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScorePayload;
    const validated = validatePayload(body);

    if ("error" in validated) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    await ensureGameScoresTable();

    const rows = await query<ScoreRow>(
      `
        INSERT INTO game_scores (game_type, username, score, wpm, accuracy, duration_ms)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, game_type, username, score, wpm, accuracy, duration_ms, created_at;
      `,
      [
        validated.value.gameType,
        validated.value.username,
        validated.value.score,
        validated.value.wpm,
        validated.value.accuracy,
        validated.value.durationMs,
      ]
    );

    return NextResponse.json({ success: true, score: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/score error", error);
    return NextResponse.json(
      { success: false, error: "Unable to save score right now." },
      { status: 500 }
    );
  }
}
