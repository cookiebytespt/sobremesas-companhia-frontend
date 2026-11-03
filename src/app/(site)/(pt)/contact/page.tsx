import type { Metadata } from "next";
import { ContactPage } from "@/components/site/pages/ContactPage";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("pt", "/contact", getDictionary("pt").contact.title);

export default function Page() {
  return <ContactPage locale="pt" />;
}
