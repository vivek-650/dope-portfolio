import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "AimLab Game",
  description: "Redirects to AimLab precision game.",
};

export default function ClickGamePage() {
  redirect("/aimlab");
}
