"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import ContactSection from "@/components/section/contact-section";
import ProjectsSection from "@/components/section/projects-section";
import WorkSection from "@/components/section/work-section";
import { Button } from "@/components/ui/button";
import { useNeko } from "@/context/neko-context";
import { TechIconLabel } from "@/components/tech-icon-label";

const TypingGameSection = dynamic(
  () => import("@/components/section/typing-game-section"),
  { ssr: false },
);
const AimLabGameSection = dynamic(
  () => import("@/components/section/aimlab-game-section"),
  { ssr: false },
);
const SnakeGame = dynamic(() => import("@/components/games/snake-game"), {
  ssr: false,
});

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
  const [snakeActive, setSnakeActive] = useState(false);
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const { showNeko, setShowNeko } = useNeko();
  const isSnakeTriggerLocked = showNeko;

  const summaryParagraphs = DATA.summary
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const remainingSummaryParagraphs = summaryParagraphs.slice(1).join("\n\n");

  return (
    <main className="min-h-dvh flex flex-col gap-14 relative">
      {/* HERO */}
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="gap-2 gap-y-6 flex flex-col md:flex-row justify-between">
            <div className="gap-2 flex flex-col order-2 md:order-1">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-xl font-semibold tracking-tighter sm:text-2xl lg:text-2xl"
                yOffset={8}
                text={DATA.name}
              />
              <BlurFadeText
                className="text-muted-foreground max-w-162.5"
                delay={BLUR_FADE_DELAY * 1.5}
                text={DATA.description}
              />

              <BlurFade delay={BLUR_FADE_DELAY * 1.8}>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {Object.entries(DATA.contact.social)
                    .filter(([key, value]) => value.navbar && key.toLowerCase() !== "spotify")
                    .map(([key, value], index) => {
                      const Icon = value.icon;

                      return (
                        <BlurFade key={key} delay={BLUR_FADE_DELAY * (2 + index * 0.5)}>
                          <Link
                            href={value.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={value.name}
                            title={value.name}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-[0_0_0_4px_rgba(255,255,255,0.04)]"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="sr-only">{value.name}</span>
                          </Link>
                        </BlurFade>
                      );
                    })}
                </div>
              </BlurFade>
            </div>

            <BlurFade delay={BLUR_FADE_DELAY * 2}>
              <Avatar className="size-24 md:size-32 border rounded-full shadow-lg">
                <AvatarImage
                  alt={DATA.name}
                  src="/smiling-me.png"
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500 ease-out will-change-[opacity] dark:opacity-0"
                />
                <AvatarImage
                  alt={DATA.name}
                  src="/me.png"
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out will-change-[opacity] dark:opacity-100"
                />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="flex flex-col gap-y-4">
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <h2 className="text-xl font-bold">About</h2>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
              <p className="m-0 leading-[1.35]">
                <span>I build production-ready web and AI applications using </span>
                <span className="inline-flex h-7 items-center gap-1 align-middle rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0 text-[10px] leading-none font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <TechIconLabel
                    label="TypeScript"
                    className="gap-1 leading-none"
                    iconSize={10}
                    iconClassName="size-[10px]"
                    textClassName="text-inherit leading-none"
                  />
                </span>
                <span>, </span>
                <span className="inline-flex h-7 items-center gap-1 align-middle rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0 text-[10px] leading-none font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <TechIconLabel
                    label="React"
                    className="gap-1 leading-none"
                    iconSize={10}
                    iconClassName="size-[10px]"
                    textClassName="text-inherit leading-none"
                  />
                </span>
                <span>, </span>
                <span className="inline-flex h-7 items-center gap-1 align-middle rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0 text-[10px] leading-none font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <TechIconLabel
                    label="Next.js"
                    className="gap-1 leading-none"
                    iconSize={10}
                    iconClassName="size-[10px]"
                    textClassName="text-inherit leading-none"
                  />
                </span>
                <span>, </span>
                <span className="inline-flex h-7 items-center gap-1 align-middle rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0 text-[10px] leading-none font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <TechIconLabel
                    label="Node.js"
                    className="gap-1 leading-none"
                    iconSize={10}
                    iconClassName="size-[10px]"
                    textClassName="text-inherit leading-none"
                  />
                </span>
                {/* <span>, </span> */}
                {/* <span className="inline-flex h-7 items-center gap-1 align-middle rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0 text-[10px] leading-none font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <TechIconLabel
                    label="FastAPI"
                    className="gap-1 leading-none"
                    iconSize={10}
                    iconClassName="size-[10px]"
                    textClassName="text-inherit leading-none"
                  />
                </span> */}
                <span> & Gen AI - focused on clean UX and real user impact.</span>
              </p>

              {remainingSummaryParagraphs && (
                <div className="mt-4">
                  <button
                    onClick={() => setIsReadMoreOpen(!isReadMoreOpen)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground group"
                  >
                    <span>Read more</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ease-out ${
                        isReadMoreOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      isReadMoreOpen ? "max-h-250 opacity-100 mt-3" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="prose dark:prose-invert prose-sm text-muted-foreground">
                      <Markdown>{remainingSummaryParagraphs}</Markdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* WORK */}
      <section id="work">
        <div className="flex flex-col gap-y-6">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">Work Experience</h2>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 6}>
            <WorkSection />
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 6.5}>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/work">Show all work experience</Link>
            </Button>
          </BlurFade>
        </div>
      </section>

      {!showNeko && (
        <div className="text-xs text-muted-foreground/12">
          click here to see a surprise ↓
        </div>
      )}

      {/* MINI GAMES */}
      <section id="games">
        <div className="flex flex-col gap-y-4">
          <BlurFade delay={BLUR_FADE_DELAY * 8}>
            <h2
              onClick={() => {
                if (!snakeActive && !isSnakeTriggerLocked) {
                  setSnakeActive(true);
                }
              }}
              className={`inline-flex items-center gap-2 text-xl font-bold transition-opacity ${isSnakeTriggerLocked ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:opacity-70"}`}
            >
                            Speed Games
            </h2>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <TypingGameSection />
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 10}>
            <AimLabGameSection />
          </BlurFade>

          {/* Snake overlay */}
          {snakeActive ? (
            <SnakeGame
              isActive={snakeActive}
              onComplete={() => {
                setSnakeActive(false);
                setShowNeko(true);
              }}
            />
          ) : null}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects">
        <BlurFade delay={BLUR_FADE_DELAY * 11}>
          <ProjectsSection />
        </BlurFade>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <BlurFade delay={BLUR_FADE_DELAY * 12}>
          <ContactSection />
        </BlurFade>
      </section>
    </main>
  );
}
