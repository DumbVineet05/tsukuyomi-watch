"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { ProfileButton } from "@/components/layout/ProfileButton";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(5,7,13,0.88)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base text-[var(--crimson-bright)]">月</span>
            <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--gold-soft)] transition group-hover:text-[var(--gold)] sm:text-xl">
              {APP_NAME}
            </span>
          </div>
          <span className="truncate text-[10px] uppercase tracking-[0.28em] text-[var(--mist)] sm:text-xs">
            The Samurai&apos;s Celestial Guide
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav
            aria-label="Primary"
            className="hidden sm:flex flex-wrap items-center justify-end gap-1 sm:gap-2"
          >
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-sm px-2.5 py-1.5 text-xs tracking-wide transition sm:text-sm ${
                    active
                      ? "bg-[rgba(196,163,90,0.12)] text-[var(--gold-soft)]"
                      : "text-[var(--mist)] hover:bg-[rgba(232,238,248,0.04)] hover:text-[var(--moonlight)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Profile Section on top right */}
          <ProfileButton />
        </div>
      </div>
    </header>
  );
}
