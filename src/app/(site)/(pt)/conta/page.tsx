import type { Metadata } from "next";
import { AccountPage } from "@/components/site/pages/AccountPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("pt", "/conta", "A minha conta");

export default function Page() {
  return <AccountPage locale="pt" />;
}
