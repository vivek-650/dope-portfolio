"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function NekoLoader({ enabled }: { enabled: boolean }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (enabled && loaded) {
      // @ts-ignore
      window.startOneko?.("/oneko/oneko.gif");
    }
  }, [enabled, loaded]);

  if (!enabled) {
    return null;
  }

  return (
    <Script
      src="/oneko/oneko.js"
      strategy="afterInteractive"
      onLoad={() => setLoaded(true)}
    />
  );
}