import BlurFade from "@/components/magicui/blur-fade";
import LeaderboardClient from "@/components/games/leaderboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Leaderboard",
  description: "Top 10 typing speed scores.",
};

export default function TypingLeaderboardPage() {
  return (
    <main className="min-h-dvh pt-2">
      <BlurFade delay={0.04}>
        <LeaderboardClient gameType="typing" />
      </BlurFade>
    </main>
  );
}
