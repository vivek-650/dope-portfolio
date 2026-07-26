"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hsvToHex, scoreGuess, TARGET_COLOR, type ScoreTier } from "@/lib/color";
import confetti from "canvas-confetti";
import { Lightbulb } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const IMAGE_SRC = "/pikachu-fur-overlay.webp";
const SUBMIT_COOLDOWN_MS = 1000;
const HINT_PENALTY = 15;

type Screen = "playing" | "results";

type RoundResult = {
  score: number;
  tier: ScoreTier;
  durationMs: number;
  guessHue: number;
  guessSat: number;
  guessBright: number;
};

interface ColorMatchGameProps {
  variant?: "full" | "mini";
}

function randomStart() {
  return {
    h: Math.floor(Math.random() * 360),
    s: 25 + Math.floor(Math.random() * 55),
    v: 25 + Math.floor(Math.random() * 55),
  };
}

function PikachuPreview({ hex, size }: { hex: string; size: number }) {
  return (
    <div
      style={{ backgroundColor: hex, width: size, height: size }}
      className="relative shrink-0 overflow-hidden rounded-xl border border-border"
    >
      <Image src={IMAGE_SRC} alt="Pikachu fur preview" fill sizes={`${size}px`} className="object-cover" />
    </div>
  );
}

function ColorSlider({
  label,
  value,
  max,
  onChange,
  trackStyle,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  trackStyle: React.CSSProperties;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cm-slider"
        style={trackStyle}
      />
    </div>
  );
}

export default function ColorMatchGame({ variant = "full" }: ColorMatchGameProps) {
  const isMini = variant === "mini";
  const previewSize = isMini ? 180 : 300;

  const [screen, setScreen] = useState<Screen>("playing");
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(50);
  const [bright, setBright] = useState(50);
  const [hintUsed, setHintUsed] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startedAtRef = useRef<number | null>(null);
  const submitCooldownRef = useRef<number | null>(null);

  const resetRound = useCallback(() => {
    const start = randomStart();
    setHue(start.h);
    setSat(start.s);
    setBright(start.v);
    setHintUsed(false);
    setRoundResult(null);
    setScreen("playing");
    setUsername("");
    setSubmitting(false);
    setSubmitted(false);
    setError(null);
    startedAtRef.current = performance.now();
  }, []);

  useEffect(() => {
    resetRound();
    return () => {
      if (submitCooldownRef.current) {
        window.clearTimeout(submitCooldownRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guessHex = useMemo(() => hsvToHex(hue, sat, bright), [hue, sat, bright]);
  const targetHex = useMemo(
    () => hsvToHex(TARGET_COLOR.h, TARGET_COLOR.s, TARGET_COLOR.v),
    []
  );

  const hueTrackStyle: React.CSSProperties = {
    background:
      "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
  };
  const satTrackStyle: React.CSSProperties = {
    background: `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`,
  };
  const brightTrackStyle: React.CSSProperties = {
    background: `linear-gradient(to right, #000000, hsl(${hue}, ${sat}%, 50%))`,
  };

  const handleHint = () => setHintUsed(true);

  const handleSubmitGuess = () => {
    const startedAt = startedAtRef.current ?? performance.now();
    const durationMs = Math.max(500, Math.round(performance.now() - startedAt));
    const { score, tier } = scoreGuess({ h: hue, s: sat, v: bright }, TARGET_COLOR, hintUsed);

    setRoundResult({ score, tier, durationMs, guessHue: hue, guessSat: sat, guessBright: bright });
    setScreen("results");

    if (score >= 90) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const safeUsername = useMemo(() => {
    const normalized = username.trim();
    return normalized.length > 0 ? normalized.slice(0, 24) : "anonymous";
  }, [username]);

  const submitScore = async () => {
    if (submitting || submitted || !roundResult) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "colormatch",
          username: safeUsername,
          score: roundResult.score,
          accuracy: roundResult.score,
          durationMs: roundResult.durationMs,
        }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to submit score.");
      }

      window.localStorage.setItem("game:lastUsername", safeUsername);
      window.localStorage.setItem("game:lastUsername:colormatch", safeUsername);
      setSubmitted(true);

      submitCooldownRef.current = window.setTimeout(() => {
        setSubmitting(false);
      }, SUBMIT_COOLDOWN_MS);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  if (screen === "results" && roundResult) {
    return (
      <div className={cn("space-y-5", isMini ? "" : "")}>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-4xl font-bold tabular-nums">{roundResult.score}</p>
          <p className="text-sm font-medium text-muted-foreground">{roundResult.tier}</p>
          {hintUsed ? (
            <p className="text-xs text-amber-400">Hint used: -{HINT_PENALTY} pts applied</p>
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center gap-2">
            <PikachuPreview hex={guessHex} size={isMini ? 120 : 160} />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Your Guess</p>
              <p className="font-mono text-sm">{guessHex}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PikachuPreview hex={targetHex} size={isMini ? 120 : 160} />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Original</p>
              <p className="font-mono text-sm">{targetHex}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="colormatch-username" className="text-sm text-muted-foreground">
            Username
          </label>
          <input
            id="colormatch-username"
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
            <Link href="/color-match/leaderboard">View Leaderboard</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={resetRound} className="cursor-pointer">
            Play Again
          </Button>
        </div>

        <style>{`
          .cm-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            border-radius: 9999px;
            outline: none;
            cursor: pointer;
          }
          .cm-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            background: #ffffff;
            border: 2px solid rgba(0, 0, 0, 0.35);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
            cursor: pointer;
          }
          .cm-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            background: #ffffff;
            border: 2px solid rgba(0, 0, 0, 0.35);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-5", !isMini && "md:flex-row md:items-start")}>
      <div className="flex flex-col items-center gap-2">
        <PikachuPreview hex={guessHex} size={previewSize} />
        <p className="font-mono text-xs text-muted-foreground">{guessHex}</p>
      </div>

      <div className="flex-1 space-y-4">
        <ColorSlider label="HUE" value={hue} max={360} onChange={setHue} trackStyle={hueTrackStyle} />
        <ColorSlider label="SATURATION" value={sat} max={100} onChange={setSat} trackStyle={satTrackStyle} />
        <ColorSlider label="BRIGHTNESS" value={bright} max={100} onChange={setBright} trackStyle={brightTrackStyle} />

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" onClick={handleSubmitGuess} className="cursor-pointer">
            Submit Guess
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleHint}
            disabled={hintUsed}
            className="cursor-pointer gap-1.5"
          >
            <Lightbulb className="size-3.5" />
            {hintUsed ? `Hue is ${TARGET_COLOR.h}°` : "Hint (-15 pts)"}
          </Button>
        </div>
      </div>

      <style>{`
        .cm-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
        }
        .cm-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid rgba(0, 0, 0, 0.35);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        }
        .cm-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid rgba(0, 0, 0, 0.35);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
