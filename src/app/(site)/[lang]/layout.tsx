import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Document } from "@/components/site/Document";
import { SiteFrame } from "@/components/site/SiteFrame";
import { defaultLocale, isLocale, locales } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ lang: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.filter((l) => l !== defaultLocale).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang) : {};
}

export default async function LocaleLayout({ children, params }: Props & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <Document locale={lang}>
      <SiteFrame locale={lang}>{children}</SiteFrame>
    </Document>
  );
}
