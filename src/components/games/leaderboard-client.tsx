"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type GameType = "click" | "typing";

type LeaderboardEntry = {
  username: string;
  score: number | null;
  wpm: number | null;
  accuracy: number | null;
  created_at: string;
};

type Props = {
  gameType: GameType;
};

export default function LeaderboardClient({ gameType }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);

  const currentUser = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      window.localStorage.getItem(`game:lastUsername:${gameType}`) ||
      window.localStorage.getItem("game:lastUsername") ||
      ""
    );
  }, [gameType]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/leaderboard?game=${gameType}`, {
          cache: "no-store",
        });

        const result = (await response.json()) as
          | LeaderboardEntry[]
          | { error?: string };

        if (!response.ok || !Array.isArray(result)) {
          const errorMessage =
            typeof result === "object" && result !== null && "error" in result
              ? result.error
              : "Unable to fetch leaderboard.";

          throw new Error(errorMessage ?? "Unable to fetch leaderboard.");
        }

        setRows(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [gameType]);

  return (
    <section className="w-full max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.65)] p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {gameType === "click" ? "Click" : "Typing"} Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground">Top 10 players</p>
          </div>

          <Button asChild variant="outline" className="cursor-pointer">
            <Link href={gameType === "click" ? "/click" : "/typing"}>Play Game</Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => {
              const isCurrentUser =
                currentUser.length > 0 &&
                row.username.toLowerCase() === currentUser.toLowerCase();

              return (
                <div
                  key={`${row.username}-${index}`}
                  className={cn(
                    "grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-xl border px-4 py-3",
                    isCurrentUser
                      ? "border-emerald-400/60 bg-emerald-400/10"
                      : "border-border bg-background/50"
                  )}
                >
                  <span className="text-sm tabular-nums text-muted-foreground">#{index + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.accuracy !== null ? `Accuracy ${row.accuracy}%` : "Accuracy -"}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {gameType === "click" ? row.score ?? 0 : row.wpm ?? 0}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {gameType === "click" ? "clicks" : "wpm"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
