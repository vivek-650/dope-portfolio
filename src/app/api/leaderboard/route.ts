import { ensureGameScoresTable, query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type GameType = "click" | "typing";

type LeaderboardRow = {
  username: string;
  score: number | null;
  wpm: number | null;
  accuracy: number | null;
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
  if (value === "click" || value === "typing") {
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
    return {
      username,
      score: getRandomInt(18, 95),
      wpm: null,
      accuracy: getRandomInt(75, 100),
      created_at: new Date().toISOString(),
    };
  }

  return {
    username,
    score: null,
    wpm: getRandomInt(45, 120),
    accuracy: getRandomInt(80, 100),
    created_at: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const game = normalizeGameType(request.nextUrl.searchParams.get("game"));

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid game query. Use click or typing." },
        { status: 400 }
      );
    }

    await ensureGameScoresTable();

    const rows = await query<LeaderboardRow>(
      game === "click"
        ? `
          SELECT username, score, wpm, accuracy, created_at
          FROM game_scores
          WHERE game_type = 'click'
          ORDER BY score DESC NULLS LAST, created_at ASC
          LIMIT 10;
        `
        : `
          SELECT username, score, wpm, accuracy, created_at
          FROM game_scores
          WHERE game_type = 'typing'
          ORDER BY wpm DESC NULLS LAST, created_at ASC
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
