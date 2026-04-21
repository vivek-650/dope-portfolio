import BlurFade from "@/components/magicui/blur-fade";
import TypingGame from "@/components/games/typing-game";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Speed Game",
  description: "Type the phrase quickly and accurately to climb the leaderboard.",
};

export default function TypingGamePage() {
  return (
    <main className="min-h-dvh pt-2">
      <BlurFade delay={0.04}>
        <TypingGame />
      </BlurFade>
    </main>
  );
}
