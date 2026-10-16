import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsPage } from "@/components/site/pages/SettingsPage";
import { getDictionary, isLocale } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "/conta/definicoes", getDictionary(lang).account.settings) : {};
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <SettingsPage locale={lang} />;
}
