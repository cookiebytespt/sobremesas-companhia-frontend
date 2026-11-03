import type { Metadata, Viewport } from "next";
import { Document } from "@/components/site/Document";
import { SiteFrame } from "@/components/site/SiteFrame";
import { pageMetadata } from "@/lib/metadata";

// Phones: the browser bar takes the hero's powder blue; content can use the notch/home-bar areas via env(safe-area-inset-*).
export const viewport: Viewport = { themeColor: "#d6e5f0", viewportFit: "cover" };

export const metadata: Metadata = pageMetadata("pt");

export default function PortugueseLayout({ children }: { children: React.ReactNode }) {
  return (
    <Document locale="pt">
      <SiteFrame locale="pt">{children}</SiteFrame>
    </Document>
  );
}
