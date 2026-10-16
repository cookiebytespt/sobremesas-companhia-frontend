import type { Metadata } from "next";
import { SettingsPage } from "@/components/site/pages/SettingsPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("pt", "/conta/definicoes", "Definições");

export default function Page() {
  return <SettingsPage locale="pt" />;
}
