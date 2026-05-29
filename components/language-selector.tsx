"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { locales, type Locale } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="language-selector">
      <label className="language-selector-label" htmlFor="lang-select">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </label>
      <select
        id="lang-select"
        className="language-selector-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t.language.label}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {t.language[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
