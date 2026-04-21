"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, TimerReset } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GAME_DURATION_SECONDS = 5;
const SUBMIT_COOLDOWN_MS = 1000;

type GameStatus = "idle" | "running" | "finished";

export default function ClickGame() {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [clicks, setClicks] = useState(0);
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const isModalOpen = status === "finished";

  const resetGame = useCallback(() => {
    setStatus("idle");
    setTimeLeft(GAME_DURATION_SECONDS);
    setClicks(0);
    setSubmitting(false);
    setSubmitted(false);
    setError(null);
  }, []);

  const startGame = useCallback(() => {
    setStatus("running");
    setTimeLeft(GAME_DURATION_SECONDS);
    setClicks(0);
    setSubmitted(false);
    setError(null);

    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
    }

    countdownRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setStatus("finished");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleTap = () => {
    if (status === "idle") {
      startGame();
      setClicks(1);
      return;
    }

    if (status !== "running") {
      return;
    }

    setClicks((prev) => prev + 1);
  };

  const safeUsername = useMemo(() => {
    const normalized = username.trim();
    return normalized.length > 0 ? normalized.slice(0, 24) : "anonymous";
  }, [username]);

  const handleSubmit = async () => {
    if (submitted || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "click",
          username: safeUsername,
          score: clicks,
        }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to submit score.");
      }

      window.localStorage.setItem("game:lastUsername", safeUsername);
      window.localStorage.setItem("game:lastUsername:click", safeUsername);
      setSubmitted(true);

      timeoutRef.current = window.setTimeout(() => {
        setSubmitting(false);
      }, SUBMIT_COOLDOWN_MS);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.65)] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Click Speed Game</h1>
            <p className="text-sm text-muted-foreground">Tap as fast as you can in 5 seconds.</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 px-3 py-2 text-right">
            <p className="text-xs text-muted-foreground">Time left</p>
            <p className="text-xl font-semibold tabular-nums">{timeLeft}s</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/70 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Live score</p>
            <p className="text-3xl font-bold tabular-nums">{clicks}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium capitalize">{status}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTap}
          className={cn(
            "w-full h-56 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
            "transition-all duration-150 active:scale-[0.99] hover:bg-emerald-400/20",
            "text-lg font-semibold cursor-pointer"
          )}
        >
          {status === "running" ? "CLICK!" : "Tap to Start"}
        </button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={resetGame} className="cursor-pointer">
            <TimerReset className="size-4" />
            Reset
          </Button>
          <Button asChild className="cursor-pointer">
            <Link href="/click/leaderboard">
              <Trophy className="size-4" />
              View Leaderboard
            </Link>
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/90 p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-semibold">Round Complete</h2>
            <p className="text-sm text-muted-foreground">Your click score: <span className="font-semibold text-foreground">{clicks}</span></p>

            <div className="space-y-2">
              <label htmlFor="click-username" className="text-sm text-muted-foreground">Username</label>
              <input
                id="click-username"
                value={username}
                maxLength={24}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="anonymous"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            {submitted ? <p className="text-xs text-emerald-400">Score submitted successfully.</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleSubmit} disabled={submitting || submitted} className="cursor-pointer">
                {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit Score"}
              </Button>
              <Button type="button" asChild variant="outline" className="cursor-pointer">
                <Link href="/click/leaderboard">View Leaderboard</Link>
              </Button>
              <Button type="button" variant="ghost" onClick={resetGame} className="cursor-pointer">
                Play Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
