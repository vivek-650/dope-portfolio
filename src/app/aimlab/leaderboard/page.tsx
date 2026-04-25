import BlurFade from "@/components/magicui/blur-fade";
import LeaderboardClient from "@/components/games/leaderboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AimLab Leaderboard",
  description: "Top 10 AimLab scores.",
};

export default function AimLabLeaderboardPage() {
  return (
    <main className="min-h-dvh pt-2">
      <BlurFade delay={0.04}>
        <LeaderboardClient gameType="aimlab" />
      </BlurFade>
    </main>
  );
}
