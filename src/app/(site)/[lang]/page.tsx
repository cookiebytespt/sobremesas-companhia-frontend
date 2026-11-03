import { notFound } from "next/navigation";
import { HomePage } from "@/components/site/pages/HomePage";
import { isLocale } from "@/i18n";

// Occasions, services and photos come from the API; refresh every 5 minutes.
export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <HomePage locale={lang} />;
}
