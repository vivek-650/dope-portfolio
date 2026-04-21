import BlurFade from "@/components/magicui/blur-fade";
import LeaderboardClient from "@/components/games/leaderboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Click Leaderboard",
  description: "Top 10 click speed scores.",
};

export default function ClickLeaderboardPage() {
  return (
    <main className="min-h-dvh pt-2">
      <BlurFade delay={0.04}>
        <LeaderboardClient gameType="click" />
      </BlurFade>
    </main>
  );
}
