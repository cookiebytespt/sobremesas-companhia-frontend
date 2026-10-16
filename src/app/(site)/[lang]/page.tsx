import { notFound } from "next/navigation";
import { HomePage } from "@/components/site/pages/HomePage";
import { isLocale } from "@/i18n";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <HomePage locale={lang} />;
}
