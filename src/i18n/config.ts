// Languages the site is published in. Portuguese is the default and lives at "/";
// the others are static copies at "/en/", "/es/" and "/fr/".
export const locales = ["pt", "en", "es", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export const localeInfo: Record<Locale, { htmlLang: string; ogLocale: string; name: string; short: string }> = {
  pt: { htmlLang: "pt-PT", ogLocale: "pt_PT", name: "Português", short: "PT" },
  en: { htmlLang: "en", ogLocale: "en_GB", name: "English", short: "EN" },
  es: { htmlLang: "es", ogLocale: "es_ES", name: "Español", short: "ES" },
  fr: { htmlLang: "fr", ogLocale: "fr_FR", name: "Français", short: "FR" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Path of the home page for a locale, without the base path (Next.js <Link> adds it).
export function homePath(locale: Locale) {
  return locale === defaultLocale ? "/" : `/${locale}/`;
}

// Replaces {name} placeholders, e.g. fmt("A mostrar {count}", { count: 3 }).
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}
