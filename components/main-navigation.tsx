"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { CorpusSummary } from "@/lib/corpora";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSelector } from "./language-selector";

type MainNavigationProps = {
  corpus: CorpusSummary;
};

type NavKey = "home" | "metaphors" | "domains" | "concordance" | "map" | "stats" | "about" | "api";

const navItems: { key: NavKey; href: string }[] = [
  { key: "home", href: "/dashboard" },
  { key: "metaphors", href: "/metaphors" },
  { key: "domains", href: "/domains" },
  { key: "concordance", href: "/concordance" },
  { key: "map", href: "/map" },
  { key: "stats", href: "/stats" },
  { key: "about", href: "/about" },
  { key: "api", href: "/api" },
];

export function MainNavigation({ corpus }: MainNavigationProps) {
  const pathname = usePathname();
  const basePath = `/corpus/${corpus.slug}`;
  const { t } = useLanguage();

  return (
    <header className="main-navigation">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-brand">
          <Link href="/" className="brand-link">
            <span className="brand-meta">Meta</span>
            <span className="brand-corpus">Corpus</span>
            <span className="brand-explorer">EXPLORER</span>
            <span className="brand-version">v1.0</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          {navItems.map((item) => {
            const itemPath = `${basePath}${item.href}`;
            const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`);

            return (
              <Link
                key={item.href}
                href={itemPath}
                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
              >
                {t.nav[item.key]}
              </Link>
            );
          })}
        </nav>

        {/* Active Corpus Card + Language */}
        <div className="nav-right-group">
          <LanguageSelector />
          <div className="nav-corpus-card">
            <div className="nav-corpus-info">
              <p className="nav-corpus-name">{corpus.name}</p>
              <p className="nav-corpus-version">v{corpus.version}</p>
            </div>
            <Link href="/" className="nav-corpus-change">
              <span>{t.nav.changeCorpus}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0-12 4 4m-4-4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Separator line */}
      <div className="nav-separator" />
    </header>
  );
}
