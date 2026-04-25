"use client";

import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import UmamiAnalytics from "@/components/analytics/umami-analytics";
import NekoLoader from "@/components/neko-loader";
import Footer from "@/components/footer";
import { NekoProvider, useNeko } from "@/context/neko-context";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
});

function AppContent({ children }: { children: ReactNode }) {
  const { showNeko } = useNeko();

  return (
    <>
      {/* 🐱 Neko Loader */}
      <NekoLoader enabled={showNeko} />

      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider delayDuration={0}>
          <Navbar />
          
          {/* 🔥 Background Effect */}
          <div className="absolute inset-0 top-0 left-0 right-0 h-25 overflow-hidden z-0">
            <FlickeringGrid
              className="h-full w-full"
              squareSize={3}
              gridGap={3}
              style={{
                maskImage: "linear-gradient(to bottom, black, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black, transparent)",
              }}
            />
          </div>

          {/* 📦 Main Content */}
          <div className="relative z-10 max-w-2xl mx-auto pt-24 pb-16 sm:pt-28 sm:pb-20 px-6">
            {children}
            <Footer />
          </div>

          {/*  Analytics */}
          <UmamiAnalytics />
        </TooltipProvider>
      </ThemeProvider>
    </>
  );
}

export function RootLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <NekoProvider>
      <AppContent>{children}</AppContent>
    </NekoProvider>
  );
}
