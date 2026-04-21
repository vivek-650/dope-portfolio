import BlurFade from "@/components/magicui/blur-fade";
import ClickGame from "@/components/games/click-game";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Click Speed Game",
  description: "5-second click challenge with realtime score and leaderboard.",
};

export default function ClickGamePage() {
  return (
    <main className="min-h-dvh pt-2">
      <BlurFade delay={0.04}>
        <ClickGame />
      </BlurFade>
    </main>
  );
}
