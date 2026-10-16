import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountPage } from "@/components/site/pages/AccountPage";
import { getDictionary, isLocale } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "/conta", getDictionary(lang).account.title) : {};
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AccountPage locale={lang} />;
}
