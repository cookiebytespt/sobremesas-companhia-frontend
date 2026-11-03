import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequestPage } from "@/components/site/pages/RequestPage";
import { getDictionary, isLocale } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ occasion?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "/request", getDictionary(lang).request.title) : {};
}

export default async function Page({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { occasion } = await searchParams;
  return <RequestPage locale={lang} occasion={occasion} />;
}
