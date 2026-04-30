"use client";

import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DATA, getWorkStatusBadge } from "@/data/resume";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import { getTechIconPath } from "@/components/tech-icon-label";

export default function WorkSection() {
  return (
    <Accordion type="single" collapsible className="w-full grid gap-6">
      {DATA.work.map((work, index) => {
        const statusBadge = getWorkStatusBadge(index);

        return (
          <AccordionItem key={work.company} value={work.company} className="w-full border-b-0 grid gap-2">
            <AccordionTrigger className="hover:no-underline p-0 cursor-pointer transition-colors rounded-none group [&>svg]:hidden">
              <div className="flex items-center gap-x-3 justify-between w-full text-left">
                <div className="flex items-center gap-x-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0 gap-0.5 flex flex-col">
                    <div className="font-semibold text-xs leading-none flex items-center gap-2">
                      <span>{work.company}</span>
                      {statusBadge && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                            statusBadge.className
                          )}
                        >
                          {statusBadge.label}
                        </span>
                      )}

                      <span className="relative inline-flex items-center w-3.5 h-3.5">
                        <ChevronRight
                          className={cn(
                            "absolute h-3.5 w-3.5 shrink-0 text-muted-foreground stroke-2 transition-all duration-300 ease-out",
                            "translate-x-0 opacity-0",
                            "group-hover:translate-x-1 group-hover:opacity-100",
                            "group-data-[state=open]:opacity-0 group-data-[state=open]:translate-x-0"
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            "absolute h-3.5 w-3.5 shrink-0 text-muted-foreground stroke-2 transition-all duration-200",
                            "opacity-0 rotate-0",
                            "group-data-[state=open]:opacity-100 group-data-[state=open]:rotate-180"
                          )}
                        />
                      </span>
                    </div>
                    <div className="font-sans text-xs text-muted-foreground">{work.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none">
                  <span>
                    {work.start} - {work.end}
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="p-0 text-xs sm:text-sm text-muted-foreground">
              {work.technologies?.length ? (
                <div className="mt-3 space-y-2.5">
                  <p className="text-xs font-semibold text-foreground">Technologies &amp; Tools</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {work.technologies.map((tech) => (
                      <span
                        key={`${work.company}-${tech}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-background/60"
                        title={tech}
                      >
                        <Image
                          src={getTechIconPath(tech)}
                          alt={`${tech} icon`}
                          width={16}
                          height={16}
                          className="h-4 w-4 object-contain"
                        />
                        <span className="sr-only">{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="prose prose-sm max-w-full font-sans leading-relaxed text-muted-foreground dark:prose-invert">
                <Markdown>{work.description}</Markdown>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

