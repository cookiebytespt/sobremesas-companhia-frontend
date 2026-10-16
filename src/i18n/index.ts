import type { Locale } from "./config";
import en from "./dictionaries/en";
import es from "./dictionaries/es";
import fr from "./dictionaries/fr";
import pt, { type Dictionary } from "./dictionaries/pt";

export type { Dictionary };
export * from "./config";

const dictionaries: Record<Locale, Dictionary> = { pt, en, es, fr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
