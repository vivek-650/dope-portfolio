import { ModeToggle } from "@/components/mode-toggle";
import { DATA } from "@/data/resume";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/resume", label: "Resume" },
] as const;

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-auto bg-background/10 backdrop-blur">
      <div className="max-w-2xl mx-auto h-14 px-6 flex items-center justify-between gap-6">
        
        <nav className="flex items-center gap-5 sm:gap-7">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ModeToggle className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
      </div>
    </header>
  );
}
