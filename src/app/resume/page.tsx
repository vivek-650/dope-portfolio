import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";

const BLUR_FADE_DELAY = 0.04;
const RESUME_FILE = "/VivekAnandSDE.pdf";

export default function ResumePage() {
  return (
    <main className="min-h-dvh flex flex-col gap-8 relative">
      <section className="space-y-2">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resume</h1>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <p className="text-sm text-muted-foreground">
            View and download my professional resume.
          </p>
        </BlurFade>
      </section>

      <BlurFade delay={BLUR_FADE_DELAY * 3}>
        <section className="border border-border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-end gap-2 border-b border-border px-3 py-2">
            <Button asChild variant="outline" size="sm" className="h-8">
              <Link href={RESUME_FILE} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="size-3.5" />
                Open
              </Link>
            </Button>
            <Button asChild size="sm" className="h-8">
              <a href={RESUME_FILE} download>
                <Download className="size-3.5" />
                Download
              </a>
            </Button>
          </div>

          <iframe
            title="Vivek Anand Resume"
            src='https://drive.google.com/file/d/1xpODNTrdQof-jVRVlM4zBebrYlxtwUJ-/preview'
            className="w-full h-[76vh] min-h-[720px] border-0 bg-background"
          />
        </section>
      </BlurFade>
    </main>
  );
}
