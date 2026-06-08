import es from "./es.json";
import en from "./en.json";

export type Locale = "es" | "en";

export type Dictionary = typeof es;

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export const defaultLocale: Locale = "es";
export const locales: Locale[] = ["es", "en"];
