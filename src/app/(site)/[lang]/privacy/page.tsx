import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyPage } from "@/components/site/pages/PrivacyPage";
import { isLocale } from "@/i18n";
import { getPrivacy } from "@/i18n/privacy";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "/privacy", getPrivacy(lang).title) : {};
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <PrivacyPage locale={lang} />;
}
