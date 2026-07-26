import BlurFade from "@/components/magicui/blur-fade";
import ColorMatchGame from "@/components/games/color-match-game";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Color Match Game",
  description: "Match Pikachu's true fur color using Hue, Saturation, and Brightness sliders.",
};

export default function ColorMatchPage() {
  return (
    <main className="min-h-dvh pt-2">
      <div className="mb-3 flex justify-end">
        <Button asChild variant="outline" size="sm" className="rounded-full px-4">
          <Link href="/color-match/leaderboard">View Leaderboard</Link>
        </Button>
      </div>

      <BlurFade delay={0.04}>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.65)] p-6 sm:p-8">
          <ColorMatchGame variant="full" />
        </div>
      </BlurFade>
    </main>
  );
}
