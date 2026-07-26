import BlurFade from "@/components/magicui/blur-fade";
import LeaderboardClient from "@/components/games/leaderboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Match Leaderboard",
  description: "Top 10 closest color matches.",
};

export default function ColorMatchLeaderboardPage() {
  return (
    <main className="min-h-dvh pt-2">
      <BlurFade delay={0.04}>
        <LeaderboardClient gameType="colormatch" />
      </BlurFade>
    </main>
  );
}
