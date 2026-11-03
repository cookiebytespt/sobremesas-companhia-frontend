import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequestSentPage } from "@/components/site/pages/RequestSentPage";
import { getDictionary, isLocale } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ number?: string; email?: string; phone?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { ...pageMetadata(lang, "/request/sent", getDictionary(lang).sent.title), robots: { index: false } } : {};
}

export default async function Page({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { number = "", email = "", phone = "" } = await searchParams;
  return <RequestSentPage locale={lang} number={number} email={email} phone={phone} />;
}
