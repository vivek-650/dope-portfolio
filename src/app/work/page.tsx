import BlurFade from "@/components/magicui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DATA, getWorkStatusBadge } from "@/data/resume";
import { TechIconLabel } from "@/components/tech-icon-label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const BLUR_FADE_DELAY = 0.04;

function getHighlights(description: string) {
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
}

function getIntro(description: string) {
  return (
    description
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith("- ")) ?? ""
  );
}

export default function WorkPage() {
  return (
    <main className="min-h-dvh flex flex-col gap-10 relative">
      <section className="space-y-4">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <Button asChild variant="ghost" className="px-0 h-auto text-muted-foreground hover:text-foreground">
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter">Work Experience</h1>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <p className="text-muted-foreground max-w-2xl">
            My work experiences across startup products, AI-powered systems, and high-ownership engineering roles.
          </p>
        </BlurFade>
      </section>

      <section className="space-y-8">
        {DATA.work.map((work, index) => {
          const highlights = getHighlights(work.description);
          const intro = getIntro(work.description);
          const statusBadge = getWorkStatusBadge(index);

          return (
            <BlurFade key={work.company} delay={BLUR_FADE_DELAY * 3 + index * 0.08}>
              <article className="border-b border-border pb-8 last:border-b-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs inline-flex items-center gap-1">
                        {work.company}
                      </span>
                      {statusBadge && <Badge className={statusBadge.className}>{statusBadge.label}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{work.title}</p>
                  </div>
                  <div className="text-sm text-muted-foreground text-left sm:text-right">
                    <p>{work.start} - {work.end}</p>
                    <p>{work.location}</p>
                  </div>
                </div>

                {"technologies" in work && work.technologies && work.technologies.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <h3 className="text-sm font-semibold">Technologies & Tools</h3>
                    <div className="flex flex-wrap gap-2">
                      {work.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground inline-flex items-center"
                        >
                          <TechIconLabel
                            label={tech}
                            textClassName="text-xs font-medium text-foreground"
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <h3 className="text-sm font-semibold">What I&apos;ve done</h3>
                  {intro && <p className="text-sm text-muted-foreground leading-relaxed">{intro}</p>}
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    {highlights.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </BlurFade>
          );
        })}
      </section>
    </main>
  );
}
