"use client";

import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  const timerRef = useRef<number | null>(null);
  const submitCooldownRef = useRef<number | null>(null);

  const isResultOpen = status === "finished";
  const currentCharIndex = useMemo(() => Math.min(input.length, phrase.length - 1), [input.length, phrase.length]);

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
    setMounted(true);
  }, []);

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

  const getCharState = (index: number): "pending" | "active" | "correct" | "wrong" => {
    if (index < input.length) {
      return input[index] === phrase[index] ? "correct" : "wrong";
    }

    if (status !== "finished" && index === input.length) {
      return "active";
    }

    return "pending";
  };

  const charClassName = (state: "pending" | "active" | "correct" | "wrong") => {
    if (state === "correct") {
      return "text-emerald-300 bg-emerald-500/12";
    }

    if (state === "wrong") {
      return "text-rose-300 bg-rose-500/12";
    }

    if (state === "active") {
      return "text-sky-200 bg-sky-500/15 ring-1 ring-sky-400/40";
    }

    return "text-muted-foreground";
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
    <div className="rounded-xl border border-white/10 backdrop-blur-xl p-4 sm:p-6 shadow-[0_12px_34px_-24px_rgba(0,0,0,0.45)] relative">
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
        <div className="flex items-center justify-between gap-3 mb-3" />

        <div className="mb-3 rounded-lg p-3 min-h-23">
          <div className="whitespace-pre-wrap wrap-break-word rounded-md font-mono text-sm sm:text-base leading-7">
            {phrase.split("").map((char, index) => (
              <span
                key={`${char}-${index}`}
                className={`inline-block rounded px-0.5 transition-all duration-150 ${
                  index === currentCharIndex && status !== "finished" ? "animate-pulse" : ""
                } ${charClassName(getCharState(index))}`}
              >
                {char}
              </span>
            ))}
          </div>
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
          className="w-full rounded-lg border border-border bg-background/45 px-4 py-4 text-lg outline-none focus:ring-2 focus:ring-ring"
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

      {mounted && isResultOpen
        ? createPortal(
            <div className="fixed inset-0 z-120 bg-black/55 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-2xl border border-border bg-popover/95 text-popover-foreground p-6 space-y-4 shadow-[0_26px_70px_-30px_rgba(0,0,0,0.5)] dark:shadow-[0_26px_70px_-30px_rgba(0,0,0,0.7)]">
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
                    className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
