"use client";

import AimLab from "@/components/games/aimlab-game";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import Link from "next/link";

export default function AimLabGameSection() {
  return (
    <div className="rounded-xl border border-white/10 bg-card/30 backdrop-blur-xl p-4 sm:p-6 shadow-[0_12px_34px_-24px_rgba(0,0,0,0.45)] relative overflow-hidden">
      <Button
        asChild
        size="sm"
        variant="ghost"
        className="absolute top-3 right-3 h-7 rounded-md px-2 text-xs z-20"
      >
        <Link href="/aimlab" aria-label="Open AimLab game">
          <Maximize2 className="size-3.5" />
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 pr-14">
          <p className="text-base text-muted-foreground font-medium">
            AIM.LAB mini session. Train precision and reaction with the same core mechanics.
          </p>
        </div>

        <AimLab variant="mini" />
      </div>
    </div>
  );
}
