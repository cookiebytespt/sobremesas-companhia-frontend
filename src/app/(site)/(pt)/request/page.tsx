import type { Metadata } from "next";
import { RequestPage } from "@/components/site/pages/RequestPage";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("pt", "/request", getDictionary("pt").request.title);

export default async function Page({ searchParams }: { searchParams: Promise<{ occasion?: string; service?: string }> }) {
  const { occasion, service } = await searchParams;
  return <RequestPage locale="pt" occasion={occasion} service={service} />;
}
