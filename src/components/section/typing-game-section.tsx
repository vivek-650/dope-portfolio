"use client";

import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const PHRASES = [
  "The quick brown fox jumps over the lazy dog.",
  "Speed follows clarity when your focus is consistent.",
  "Build once, refine daily, and ship with confidence.",
  "Great interfaces feel effortless but are deeply engineered.",
];

function pickPhrase() {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

export default function TypingGameSection() {
  const [phrase, setPhrase] = useState(PHRASES[0]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const submitCooldownRef = useRef<number | null>(null);

  const isComplete = useMemo(() => input === phrase, [input, phrase]);
  const isResultOpen = status === "finished";

  const accuracy = useMemo(() => {
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
  }, [input, phrase]);

  const wpm = useMemo(() => {
    if (!startedAt || !endedAt) {
      return 0;
    }

    const elapsedMinutes = Math.max((endedAt - startedAt) / 60000, 1 / 60000);
    const words = phrase.trim().split(/\s+/).length;
    return Math.max(0, Math.round(words / elapsedMinutes));
  }, [startedAt, endedAt, phrase]);

  const safeUsername = useMemo(() => {
    const normalized = username.trim();
    return normalized.length > 0 ? normalized.slice(0, 24) : "anonymous";
  }, [username]);

  const restart = () => {
    setPhrase(pickPhrase());
    setInput("");
    setStatus("idle");
    setStartedAt(null);
    setEndedAt(null);
    setElapsedMs(0);
    setIsInputFocused(false);
    setUsername("");
    setSubmitting(false);
    setSubmitted(false);
    setError(null);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (submitCooldownRef.current) {
      window.clearTimeout(submitCooldownRef.current);
      submitCooldownRef.current = null;
    }
  };

  useEffect(() => {
    if (!startedAt || status !== "running") {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setElapsedMs(performance.now() - startedAt);
    }, 50);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (submitCooldownRef.current) {
        window.clearTimeout(submitCooldownRef.current);
        submitCooldownRef.current = null;
      }
    };
  }, [startedAt, status]);

  const handleInputChange = (value: string) => {
    if (status === "finished") {
      return;
    }

    if (status === "idle" && value.length > 0) {
      setStatus("running");
      setStartedAt(performance.now());
    }

    const next = value.slice(0, phrase.length);
    setInput(next);

    if (next === phrase && startedAt) {
      const now = performance.now();
      setEndedAt(now);
      setElapsedMs(now - startedAt);
      setStatus("finished");
      setIsInputFocused(false);
    }
  };

  const submitScore = async () => {
    if (submitting || submitted || status !== "finished") {
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
        throw new Error(result.error ?? "Unable to submit score.");
      }

      window.localStorage.setItem("game:lastUsername", safeUsername);
      window.localStorage.setItem("game:lastUsername:typing", safeUsername);
      setSubmitted(true);

      submitCooldownRef.current = window.setTimeout(() => {
        setSubmitting(false);
      }, 1000);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-card/30 backdrop-blur-xl p-4 sm:p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.8)] relative overflow-hidden">
      <Button
        asChild
        size="sm"
        variant="ghost"
        className="absolute top-3 right-3 h-7 rounded-md px-2 text-xs z-10"
      >
        <Link href="/typing" aria-label="Open typing game">
          <Maximize2 className="size-3.5" />
        </Link>
      </Button>

      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-xl text-muted-foreground font-medium pr-14">{phrase}</p>
          
        </div>

        <input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              event.preventDefault();
              restart();
            }
          }}
          placeholder="Start typing here..."
          disabled={status === "finished"}
          className="w-full rounded-lg border border-border bg-background/60 px-4 py-4 text-lg outline-none focus:ring-2 focus:ring-ring"
        />

        {isInputFocused ? (
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              <span className="inline-flex items-center rounded-md border border-border bg-background/50 px-2 py-0.5 mr-2 text-xs font-semibold text-foreground">
                TAB
              </span>
              - restart
            </p>
            <p className="font-mono tabular-nums">{(elapsedMs / 1000).toFixed(3)}</p>
          </div>
        ) : null}
      </div>

      {isResultOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/90 p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-semibold">Typing Complete</h2>
            <p className="text-sm text-muted-foreground">
              WPM: <span className="font-semibold text-foreground">{wpm}</span> • Accuracy:{" "}
              <span className="font-semibold text-foreground">{accuracy}%</span>
            </p>

            <div className="space-y-2">
              <label htmlFor="typing-preview-username" className="text-sm text-muted-foreground">
                Username
              </label>
              <input
                id="typing-preview-username"
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
              <Button type="button" variant="ghost" onClick={restart} className="cursor-pointer">
                Play Again
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
