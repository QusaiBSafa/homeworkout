"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today", icon: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { href: "/plan", label: "Plan", icon: "M4 5h16v15H4zM4 9h16M9 3v4M15 3v4" },
  { href: "/exercises", label: "Exercises", icon: "M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" },
  { href: "/posture", label: "Posture", icon: "M12 3v18M9 6h6M8.5 10h7M9 14h6M10 18h4" },
  { href: "/progress", label: "Progress", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { href: "/science", label: "Science", icon: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-accent-ink">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
          <circle cx="13" cy="4.5" r="2" fill="currentColor" stroke="none" />
          <path d="M12 8l-2 6 4 2v5M10 14l-4 3M12 8l5 3" />
        </svg>
      </span>
      Home<span className="text-accent">Workout</span>
    </Link>
  );
}

export default function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  if (path.startsWith("/workout/")) return null;
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${active(l.href) ? "bg-surface-2 text-text" : "text-muted hover:text-text"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/plan" className="hidden md:inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:brightness-110">
            My plan
          </Link>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-bg/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-6">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active(l.href) ? "text-accent" : "text-muted"}`}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d={l.icon} />
              </svg>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
