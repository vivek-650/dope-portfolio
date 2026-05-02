"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

const MILESTONE_KEY = "portfolio-visitor-milestone";

type VisitorsResponse = {
  success?: boolean;
  visitors?: number | null;
};

function fireConfetti() {
  const end = Date.now() + 3 * 1000;
  const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

export default function VisitorMilestoneDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    let retryTimer: number | undefined;
    let attempt = 0;

    const loadVisitors = async () => {
      try {
        const response = await fetch("/api/analytics/umami/visitors", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as VisitorsResponse;

        if (!isMounted || typeof data.visitors !== "number") {
          return;
        }

        const milestone = data.visitors > 0 && data.visitors % 100 === 0 ? data.visitors : null;
        const lastMilestone = Number.parseInt(sessionStorage.getItem(MILESTONE_KEY) ?? "0", 10) || 0;

        if (milestone && milestone !== lastMilestone) {
          sessionStorage.setItem(MILESTONE_KEY, String(milestone));
          setVisitorCount(milestone);
          setIsOpen(true);
        }
      } catch {
        if (isMounted && attempt < 2) {
          attempt += 1;
          retryTimer = window.setTimeout(() => {
            void loadVisitors();
          }, 1200 * attempt);
        }
      }
    };

    void loadVisitors();

    return () => {
      isMounted = false;
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fireConfetti();
    setSecondsLeft(6);

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsOpen(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isOpen]);

  if (!isOpen || visitorCount === null) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-background/95 p-6 shadow-2xl">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Milestone Moment</p>
          <h2 className="text-2xl font-semibold">You just unlocked visitor #{visitorCount}!</h2>
          <p className="text-sm text-muted-foreground">
            That is a big number, and you are the one who hit it. Enjoy the confetti and the good vibes.
          </p>
          <p className="text-xs text-muted-foreground">
            Celebration closes in <span className="font-semibold text-foreground">{secondsLeft}s</span>
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
