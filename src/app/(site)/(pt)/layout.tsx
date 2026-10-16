import type { Metadata } from "next";
import { Document } from "@/components/site/Document";
import { SiteFrame } from "@/components/site/SiteFrame";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("pt");

export default function PortugueseLayout({ children }: { children: React.ReactNode }) {
  return (
    <Document locale="pt">
      <SiteFrame locale="pt">{children}</SiteFrame>
    </Document>
  );
}
