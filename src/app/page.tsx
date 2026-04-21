/* eslint-disable @next/next/no-img-element */
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import ContactSection from "@/components/section/contact-section";
import ClickGameSection from "@/components/section/click-game-section";
import ProjectsSection from "@/components/section/projects-section";
import TypingGameSection from "@/components/section/typing-game-section";
import WorkSection from "@/components/section/work-section";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
  const summaryParagraphs = DATA.summary
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const firstSummaryParagraph = summaryParagraphs[0] ?? "";
  const remainingSummaryParagraphs = summaryParagraphs.slice(1).join("\n\n");

  return (
    <main className="min-h-dvh flex flex-col gap-14 relative">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="gap-2 gap-y-6 flex flex-col md:flex-row justify-between">
            <div className="gap-2 flex flex-col order-2 md:order-1">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-semibold tracking-tighter sm:text-4xl lg:text-5xl"
                yOffset={8}
                text={DATA.name}
              />
              <BlurFadeText
                className="text-muted-foreground max-w-[650px] md:text-lg lg:text-sm"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
            </div>
            <BlurFade delay={BLUR_FADE_DELAY} className="order-1 md:order-2">
              <Avatar className="size-24 md:size-32 border rounded-full shadow-lg ring-4 ring-muted">
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>
      <section id="about">
        <div className="flex min-h-0 flex-col gap-y-4">
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <h2 className="text-xl font-bold">About</h2>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
              <Markdown>{firstSummaryParagraph}</Markdown>
              {remainingSummaryParagraphs ? (
                <details className="mt-2 group">
                  <summary className="cursor-pointer text-sm font-medium text-foreground/90 marker:text-muted-foreground">
                    Read more
                  </summary>
                  <div className="mt-3">
                    <Markdown>{remainingSummaryParagraphs}</Markdown>
                  </div>
                </details>
              ) : null}
            </div>
          </BlurFade>
        </div>
      </section>
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-6">
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

      <section id="games">
        <div className="flex min-h-0 flex-col gap-y-4">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className="text-xl font-bold">Mini Games</h2>
          </BlurFade>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <BlurFade delay={BLUR_FADE_DELAY * 10}>
              <TypingGameSection />
            </BlurFade>
            <BlurFade delay={BLUR_FADE_DELAY * 10.5}>
              <ClickGameSection />
            </BlurFade>
          </div>
        </div>
      </section>
      <section id="projects">
        <BlurFade delay={BLUR_FADE_DELAY * 11}>
          <ProjectsSection />
        </BlurFade>
      </section>
      <section id="contact">
        <BlurFade delay={BLUR_FADE_DELAY * 16}>
          <ContactSection />
        </BlurFade>
      </section>
    </main>
  );
}
