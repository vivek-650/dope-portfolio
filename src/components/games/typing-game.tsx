"use client";

import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const PHRASES = [
  "ship fast with clean architecture and measurable outcomes",
  "optimize user experience without sacrificing product velocity",
  "build scalable features and iterate with startup speed",
  "design reliable systems that feel simple and polished",
  "turn ambiguous ideas into production ready web products",
  "measure performance and improve each critical interaction",
  "write maintainable code that teams can evolve quickly",
  "craft delightful interfaces backed by robust engineering",
];

const SUBMIT_COOLDOWN_MS = 1000;

type GameStatus = "idle" | "running" | "finished";

function pickPhrase() {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

function computeAccuracy(input: string, phrase: string) {
  if (input.length === 0) {
    return 0;
  }

  let correct = 0;
  for (let i = 0; i < input.length; i += 1) {
    if (input[i] === phrase[i]) {
      correct += 1;
    }
  }

  return Math.max(0, Math.min(100, Math.round((correct / input.length) * 100)));
}

function computeWpm(startedAt: number, endedAt: number, phrase: string) {
  const elapsedMinutes = Math.max((endedAt - startedAt) / 60000, 1 / 60000);
  const words = phrase.trim().split(/\s+/).length;
  return Math.max(0, Math.round(words / elapsedMinutes));
}

export default function TypingGame() {
  const [phrase, setPhrase] = useState(pickPhrase());
  const [status, setStatus] = useState<GameStatus>("idle");
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accuracy = useMemo(() => computeAccuracy(typed, phrase), [typed, phrase]);
  const wpm = useMemo(() => {
    if (!startedAt || !endedAt) {
      return 0;
    }

    return computeWpm(startedAt, endedAt, phrase);
  }, [startedAt, endedAt, phrase]);

  const safeUsername = useMemo(() => {
    const normalized = username.trim();
    return normalized.length > 0 ? normalized.slice(0, 24) : "anonymous";
  }, [username]);

  const isModalOpen = status === "finished";

  const restartGame = () => {
    setPhrase(pickPhrase());
    setStatus("idle");
    setTyped("");
    setStartedAt(null);
    setEndedAt(null);
    setSubmitting(false);
    setSubmitted(false);
    setError(null);
  };

  const onType = (value: string) => {
    if (status === "finished") {
      return;
    }

    if (status === "idle") {
      setStatus("running");
      setStartedAt(Date.now());
    }

    const next = value.slice(0, phrase.length);
    setTyped(next);

    if (next === phrase) {
      setEndedAt(Date.now());
      setStatus("finished");
    }
  };

  const submitScore = async () => {
    if (submitting || submitted || !endedAt || !startedAt) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "typing",
          username: safeUsername,
          wpm,
          accuracy,
        }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to submit typing score.");
      }

      window.localStorage.setItem("game:lastUsername", safeUsername);
      window.localStorage.setItem("game:lastUsername:typing", safeUsername);
      setSubmitted(true);

      window.setTimeout(() => {
        setSubmitting(false);
      }, SUBMIT_COOLDOWN_MS);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.65)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Typing Speed Game</h1>
            <p className="text-sm text-muted-foreground">Finish the phrase with high speed and precision.</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-lg border border-border bg-background/60 px-3 py-2 text-right min-w-24">
              <p className="text-xs text-muted-foreground">WPM</p>
              <p className="text-xl font-semibold tabular-nums">{wpm}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 px-3 py-2 text-right min-w-24">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-xl font-semibold tabular-nums">{accuracy}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/50 p-4 leading-relaxed font-mono text-sm sm:text-base">
          {phrase.split("").map((char, idx) => {
            const typedChar = typed[idx];
            const isTyped = idx < typed.length;

            return (
              <span
                key={`${char}-${idx}`}
                className={
                  !isTyped
                    ? "text-muted-foreground"
                    : typedChar === char
                      ? "text-emerald-400"
                      : "text-red-400"
                }
              >
                {char}
              </span>
            );
          })}
        </div>

        <textarea
          value={typed}
          onChange={(e) => onType(e.target.value)}
          placeholder="Start typing here..."
          rows={4}
          className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          disabled={status === "finished"}
        />

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={restartGame} className="cursor-pointer">
            New Phrase
          </Button>
          <Button asChild className="cursor-pointer">
            <Link href="/typing/leaderboard">
              <Trophy className="size-4" />
              View Leaderboard
            </Link>
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/90 p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-semibold">Typing Complete</h2>
            <p className="text-sm text-muted-foreground">WPM: <span className="font-semibold text-foreground">{wpm}</span> • Accuracy: <span className="font-semibold text-foreground">{accuracy}%</span></p>

            <div className="space-y-2">
              <label htmlFor="typing-username" className="text-sm text-muted-foreground">Username</label>
              <input
                id="typing-username"
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
              <Button type="button" onClick={submitScore} disabled={submitting || submitted} className="cursor-pointer">
                {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit Score"}
              </Button>
              <Button type="button" asChild variant="outline" className="cursor-pointer">
                <Link href="/typing/leaderboard">View Leaderboard</Link>
              </Button>
              <Button type="button" variant="ghost" onClick={restartGame} className="cursor-pointer">
                Play Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
