"use client";

import { useEffect, useMemo, useState } from "react";

type VisitorsResponse = {
  success?: boolean;
  visitors?: number | null;
};

function formatVisitors(value: number | null): string {
  if (value === null) {
    return "--";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export default function Footer() {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
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

        if (isMounted && typeof data.visitors === "number") {
          setVisitors(data.visitors);
          return;
        }

        if (isMounted && attempt < 3) {
          attempt += 1;
          retryTimer = window.setTimeout(() => {
            void loadVisitors();
          }, 1200 * attempt);
        }
      } catch {
        if (isMounted && attempt < 3) {
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

  const visitorText = useMemo(() => formatVisitors(visitors), [visitors]);

  return (
    <footer className="mt-10 border-t border-border/50 pt-5 text-xs text-muted-foreground">
      <div className="flex items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} Vivek Anand. All rights reserved.</span>
        <span aria-live="polite">Lifetime visitors: {visitorText}</span>
      </div>
    </footer>
  );
}
