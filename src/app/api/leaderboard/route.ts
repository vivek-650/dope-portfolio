import { ensureGameScoresTable, query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type GameType = "click" | "typing" | "aimlab";

type LeaderboardRow = {
  username: string;
  score: number | null;
  wpm: number | null;
  accuracy: number | null;
  duration_ms: number | null;
  cps: number | null;
  leaderboard_score: number | null;
  created_at: string;
};

const FAKE_USERS = [
  "SpeedRunner99",
  "TypeStorm",
  "ReflexNinja",
  "PixelTapper",
  "VelocityVive",
  "TurboKeys",
  "RapidRhythm",
  "ByteBlazer",
  "NeonPhantom",
  "ZenClicker",
  "NovaTyper",
  "ArcaneHands",
  "CodeSprinter",
  "ShiftMaster",
  "PulsePilot",
];

function normalizeGameType(value: string | null): GameType | null {
  if (value === "click" || value === "typing" || value === "aimlab") {
    return value;
  }

  return null;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fakeEntry(gameType: GameType, index: number): LeaderboardRow {
  const username = `${FAKE_USERS[index % FAKE_USERS.length]}_${index + 1}`;

  if (gameType === "click") {
    const score = getRandomInt(24, 92);
    const durationMs = getRandomInt(4300, 5600);
    const cps = Number(((score * 1000) / durationMs).toFixed(2));
    const leaderboardScore = Math.round((score * score * 1000) / durationMs);

    return {
      username,
      score,
      wpm: null,
      accuracy: null,
      duration_ms: durationMs,
      cps,
      leaderboard_score: leaderboardScore,
      created_at: new Date().toISOString(),
    };
  }

  if (gameType === "aimlab") {
    const score = getRandomInt(220, 760);
    const durationMs = 30000;
    const cps = Number(((score * 1000) / durationMs).toFixed(2));

    return {
      username,
      score,
      wpm: null,
      accuracy: getRandomInt(60, 100),
      duration_ms: durationMs,
      cps,
      leaderboard_score: score,
      created_at: new Date().toISOString(),
    };
  }

  return {
    username,
    score: null,
    wpm: getRandomInt(45, 120),
    accuracy: getRandomInt(80, 100),
    duration_ms: null,
    cps: null,
    leaderboard_score: null,
    created_at: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const game = normalizeGameType(request.nextUrl.searchParams.get("game"));

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid game query. Use click, typing, or aimlab." },
        { status: 400 }
      );
    }

    await ensureGameScoresTable();

    const rows = await query<LeaderboardRow>(
      game === "click"
        ? `
          SELECT
            username,
            score,
            wpm,
            NULL::INTEGER AS accuracy,
            duration_ms,
            ROUND((score::NUMERIC * 1000) / GREATEST(duration_ms, 1), 2) AS cps,
            ROUND((score::NUMERIC * score::NUMERIC * 1000) / GREATEST(duration_ms, 1), 0)::INTEGER AS leaderboard_score,
            created_at
          FROM game_scores
          WHERE game_type = 'click' AND score IS NOT NULL AND duration_ms IS NOT NULL
          ORDER BY leaderboard_score DESC NULLS LAST, cps DESC NULLS LAST, duration_ms ASC, created_at ASC
          LIMIT 10;
        `
        : game === "typing"
          ? `
          SELECT
            username,
            score,
            wpm,
            accuracy,
            NULL::INTEGER AS duration_ms,
            NULL::NUMERIC AS cps,
            NULL::INTEGER AS leaderboard_score,
            created_at
          FROM game_scores
          WHERE game_type = 'typing'
          ORDER BY wpm DESC NULLS LAST, created_at ASC
          LIMIT 10;
        `
          : `
          SELECT
            username,
            score,
            NULL::INTEGER AS wpm,
            accuracy,
            duration_ms,
            ROUND((score::NUMERIC * 1000) / GREATEST(duration_ms, 1), 2) AS cps,
            score::INTEGER AS leaderboard_score,
            created_at
          FROM game_scores
          WHERE game_type = 'aimlab' AND score IS NOT NULL
          ORDER BY score DESC NULLS LAST, accuracy DESC NULLS LAST, duration_ms ASC NULLS LAST, created_at ASC
          LIMIT 10;
        `
    );

    const leaderboard = [...rows];

    let fakeIndex = 0;
    while (leaderboard.length < 10) {
      leaderboard.push(fakeEntry(game, fakeIndex));
      fakeIndex += 1;
    }

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    console.error("GET /api/leaderboard error", error);
    return NextResponse.json(
      { success: false, error: "Unable to fetch leaderboard right now." },
      { status: 500 }
    );
  }
}
