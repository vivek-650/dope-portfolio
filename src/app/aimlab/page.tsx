import BlurFade from "@/components/magicui/blur-fade";
import AimLab from "@/components/games/aimlab-game";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AimLab Game",
  description: "Precision target trainer with combo scoring, speed metrics, and session grading.",
};

export default function AimLabPage() {
  return (
    <main className="min-h-dvh pt-2">
      <div className="mb-3 flex justify-end">
        <Button asChild variant="outline" size="sm" className="rounded-full px-4">
          <Link href="/aimlab/leaderboard">View Leaderboard</Link>
        </Button>
      </div>

      <BlurFade delay={0.04}>
        <AimLab variant="full" />
      </BlurFade>
    </main>
  );
}
