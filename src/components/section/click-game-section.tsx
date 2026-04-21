"use client";

import { Button } from "@/components/ui/button";
import { RippleButton } from "@/components/ui/ripple-button";
import { Maximize2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const DURATION_MS = 5000;

type Status = "idle" | "running" | "finished";

export default function ClickGameSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [clicks, setClicks] = useState(0);
  const [remaining, setRemaining] = useState(5);
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const submitCooldownRef = useRef<number | null>(null);

  const isResultOpen = status === "finished";

  const safeUsername = useMemo(() => {
    const normalized = username.trim();
    return normalized.length > 0 ? normalized.slice(0, 24) : "anonymous";
  }, [username]);

  const stop = () => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const tick = (timestamp: number) => {
    if (!startRef.current) {
      return;
    }

    const elapsed = timestamp - startRef.current;
    const left = Math.max(0, DURATION_MS - elapsed);
    setRemaining(Number((left / 1000).toFixed(2)));

    if (left <= 0) {
      setStatus("finished");
      stop();
      return;
    }

    frameRef.current = window.requestAnimationFrame(tick);
  };

  const restart = () => {
    stop();
    setStatus("idle");
    setClicks(0);
    setRemaining(5);
    setUsername("");
    setSubmitting(false);
    setSubmitted(false);
    setError(null);
    startRef.current = null;

    if (submitCooldownRef.current) {
      window.clearTimeout(submitCooldownRef.current);
      submitCooldownRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stop();
      if (submitCooldownRef.current) {
        window.clearTimeout(submitCooldownRef.current);
      }
    };
  }, []);

  const onClick = () => {
    if (status === "finished") {
      return;
    }

    if (status === "idle") {
      setStatus("running");
      startRef.current = performance.now();
      frameRef.current = window.requestAnimationFrame(tick);
      setSubmitted(false);
      setError(null);
      setClicks(1);
      return;
    }

    setClicks((prev) => prev + 1);
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
        <Link href="/click" aria-label="Open click game">
          <Maximize2 className="size-3.5" />
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg text-muted-foreground font-medium pr-14">Click as many times as possible in 5 seconds.</p>

        </div>

        <RippleButton
          type="button"
          onClick={onClick}
          rippleColor="#34d399"
          duration="500ms"
          className="w-full h-24 rounded-lg border border-border bg-background/60 text-lg font-semibold transition-all cursor-pointer hover:bg-background/80 active:scale-[0.99]"
        >
          {status === "finished" ? "Finished" : "Click Here"}
        </RippleButton>

        {status !== "idle" ? (
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Score: <span className="font-semibold text-foreground tabular-nums">{clicks}</span>
            </p>
            <p className="font-mono tabular-nums">{remaining.toFixed(2)}</p>
          </div>
        ) : null}

        {status === "finished" ? (
          <button
            type="button"
            onClick={restart}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            tap to reset preview
          </button>
        ) : null}
      </div>

      {isResultOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/90 p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-semibold">Round Complete</h2>
            <p className="text-sm text-muted-foreground">
              Your click score: <span className="font-semibold text-foreground">{clicks}</span>
            </p>

            <div className="space-y-2">
              <label htmlFor="click-preview-username" className="text-sm text-muted-foreground">
                Username
              </label>
              <input
                id="click-preview-username"
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
                <Link href="/click/leaderboard">View Leaderboard</Link>
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
