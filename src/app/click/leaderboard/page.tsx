import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "AimLab Leaderboard",
  description: "Redirects to AimLab leaderboard.",
};

export default function ClickLeaderboardPage() {
  redirect("/aimlab/leaderboard");
}
