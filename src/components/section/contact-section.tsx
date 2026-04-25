import Link from "next/link";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { DATA } from "@/data/resume";
import { Icons } from "@/components/icons";

export default function ContactSection() {
  return (
    <div className="border rounded-xl p-8 sm:p-10 relative">
      <style>{`
        @keyframes x-flicker {
          0%, 18%, 22%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.42; }
        }
        .x-flicker { animation: x-flicker 2.6s infinite; }
        .x-glow { filter: drop-shadow(0 0 7px rgba(29, 155, 240, 0.15)) drop-shadow(0 0 15px rgba(29, 155, 240, 0.24)); }
      `}</style>
      
      <div className="absolute -top-4 border bg-primary z-10 rounded-xl px-4 py-1 left-1/2 -translate-x-1/2">
        <span className="text-background text-sm font-medium">Contact</span>
      </div>
      <div className="absolute inset-0 top-0 left-0 right-0 h-1/2 rounded-xl overflow-hidden">
        <FlickeringGrid
          className="h-full w-full"
          squareSize={3}
          gridGap={3}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="mx-auto max-w-3xl text-base sm:text-sm text-muted-foreground leading-relaxed">
          <span>Available for freelance or full-time roles. Slide into my </span>
          <Link
            href="https://x.com/curious__Anand"
            target="_blank"
            rel="noopener noreferrer"
            className="x-flicker x-glow inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            <Icons.x className="size-3.5" />
            <span>DMs</span>
          </Link>
          <span> or </span>
          <Link
            href={`mailto:${DATA.contact.email}`}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            <Icons.email className="size-3.5" />
            <span>Email</span>
          </Link>
          <span> me.</span>
        </div>

        <div className="mx-auto max-w-3xl text-base sm:text-sm text-muted-foreground leading-relaxed">
          <Link
            href={DATA.contact.social.GitHub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            <Icons.github className="size-3.5" />
            <span>GitHub</span>
          </Link>
          <span>, </span>
          <Link
            href={DATA.contact.social.LinkedIn.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            <Icons.linkedin className="size-3.5" />
            <span>LinkedIn</span>
          </Link>
          <span>, </span>
          <Link
            href="/resume"
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            <span>Resume</span>
          </Link>
          <span> ? Yeah, they&apos;re all open if you&apos;re curious.</span>
        </div>
      </div>
    </div>
  );
}

