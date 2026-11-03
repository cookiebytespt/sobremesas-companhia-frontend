import type { Metadata } from "next";
import { RequestSentPage } from "@/components/site/pages/RequestSentPage";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = { ...pageMetadata("pt", "/request/sent", getDictionary("pt").sent.title), robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ number?: string; email?: string }> }) {
  const { number = "", email = "" } = await searchParams;
  return <RequestSentPage locale="pt" number={number} email={email} />;
}
