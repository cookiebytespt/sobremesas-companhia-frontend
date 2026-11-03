import type { Metadata } from "next";
import { PrivacyPage } from "@/components/site/pages/PrivacyPage";
import { getPrivacy } from "@/i18n/privacy";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("pt", "/privacy", getPrivacy("pt").title);

export default function Page() {
  return <PrivacyPage locale="pt" />;
}
