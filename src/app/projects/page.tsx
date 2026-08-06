import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const BLUR_FADE_DELAY = 0.04;

export const metadata: Metadata = {
  title: "Projects",
  description: "All products and projects built by Vivek Anand.",
};

export default function ProjectsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter">Projects</h1>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <p className="text-muted-foreground max-w-2xl">
            Product-focused builds across AI automation, retrieval systems, and full-stack
            platforms designed for reliability, speed, and measurable utility.
          </p>
        </BlurFade>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {DATA.projects.map((project, id) => (
          <BlurFade key={project.title} delay={BLUR_FADE_DELAY * 3 + id * 0.05} className="h-full">
            <ProjectCard
              href={project.href}
              title={project.title}
              description={project.description}
              dates={project.dates}
              tags={project.technologies}
              image={project.image}
              video={project.video}
              links={project.links}
            />
          </BlurFade>
        ))}
      </section>
    </main>
  );
}
