"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type GameType = "click" | "typing" | "aimlab";

type LeaderboardEntry = {
  username: string;
  score: number | null;
  wpm: number | null;
  accuracy: number | null;
  duration_ms: number | null;
  cps: number | null;
  leaderboard_score: number | null;
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
              {gameType === "click" ? "Click" : gameType === "typing" ? "Typing" : "AimLab"} Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground">
              {gameType === "click"
                ? "Top 10 by time-weighted speed score"
                : gameType === "typing"
                  ? "Top 10 players"
                  : "Top 10 AimLab scores"}
            </p>
          </div>

          <Button asChild variant="outline" className="cursor-pointer">
            <Link href={gameType === "click" ? "/click" : gameType === "typing" ? "/typing" : "/aimlab"}>Play Game</Link>
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
              const rank = index + 1;
              const isTopThree = rank <= 3;

              const medalRowClass =
                rank === 1
                  ? "border-amber-300/60 bg-linear-to-r from-amber-500/14 via-amber-300/8 to-transparent"
                  : rank === 2
                    ? "border-slate-300/60 bg-linear-to-r from-slate-300/18 via-slate-200/8 to-transparent"
                    : "border-orange-300/60 bg-linear-to-r from-orange-400/15 via-orange-300/8 to-transparent";

              const medalBadgeClass =
                rank === 1
                  ? "border-amber-300/70 bg-amber-400/20 text-amber-100"
                  : rank === 2
                    ? "border-slate-300/70 bg-slate-300/20 text-slate-100"
                    : "border-orange-300/70 bg-orange-400/20 text-orange-100";

              return (
                <div
                  key={`${row.username}-${index}`}
                  className={cn(
                    "grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-xl border px-4 py-3",
                    isTopThree && medalRowClass,
                    isCurrentUser
                      ? "border-emerald-400/60 bg-emerald-400/10"
                      : "border-border bg-background/50"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm tabular-nums text-muted-foreground",
                      isTopThree && "inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                      isTopThree && medalBadgeClass
                    )}
                  >
                    {isTopThree ? rank : `#${rank}`}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.username}</p>
                    {gameType === "click" ? (
                      <p className="text-xs text-muted-foreground">
                        {(row.duration_ms ?? 0) > 0 ? `${((row.duration_ms ?? 0) / 1000).toFixed(2)}s` : "-"}
                        {" • "}
                        {(row.cps ?? 0).toFixed(2)} cps
                        {" • "}
                        {row.score ?? 0} clicks
                      </p>
                    ) : gameType === "typing" ? (
                      <p className="text-xs text-muted-foreground">
                        {row.accuracy !== null ? `Accuracy ${row.accuracy}%` : "Accuracy -"}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {row.accuracy !== null ? `Accuracy ${row.accuracy}%` : "Accuracy -"}
                        {" • "}
                        {(row.duration_ms ?? 0) > 0 ? `${((row.duration_ms ?? 0) / 1000).toFixed(0)}s session` : "session -"}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold tabular-nums">
                      {gameType === "click" ? row.leaderboard_score ?? 0 : gameType === "typing" ? row.wpm ?? 0 : row.score ?? 0}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {gameType === "click" ? "speed score" : gameType === "typing" ? "wpm" : "points"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
