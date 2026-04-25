"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function NekoLoader({ enabled }: { enabled: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      startedRef.current = false;
      return;
    }

    let attempts = 0;
    let intervalId: number | undefined;

    const tryStart = () => {
      if (startedRef.current) return;

      // @ts-ignore
      const startOneko = window.startOneko;
      if (typeof startOneko === "function") {
        startedRef.current = true;
        startOneko("/oneko/oneko.gif");
      }

      attempts += 1;
      if (attempts >= 40 && intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };

    tryStart();
    intervalId = window.setInterval(tryStart, 50);

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [enabled, loaded]);

  if (!enabled) {
    return null;
  }

  return (
    <Script
      src="/oneko/oneko.js"
      strategy="afterInteractive"
      onLoad={() => {
        setLoaded(true);
        // @ts-ignore
        window.startOneko?.("/oneko/oneko.gif");
      }}
    />
  );
}