import type { Metadata } from "next";
import { getDictionary, localeInfo, locales, type Locale } from "@/i18n";
import { localizedPath } from "@/lib/locale";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/** Title/description + canonical/hreflang for a public page of the platform. */
export function pageMetadata(locale: Locale, path = "/", title?: string): Metadata {
  const t = getDictionary(locale);
  const url = (l: Locale) => `${siteUrl}${localizedPath(l, path)}`;
  return {
    title: title ? `${title} · ${t.common.brand}` : t.meta.title,
    description: t.meta.description,
    alternates: siteUrl
      ? {
          canonical: url(locale),
          languages: {
            ...Object.fromEntries(locales.map((l) => [localeInfo[l].htmlLang, url(l)])),
            "x-default": url("pt"),
          },
        }
      : undefined,
    openGraph: { title: t.common.brand, description: t.meta.description, locale: localeInfo[locale].ogLocale, type: "website" },
    robots: path.startsWith("/conta") ? { index: false, follow: false } : undefined,
  };
}
