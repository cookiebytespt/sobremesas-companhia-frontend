// Self-hosted fonts (no Google Fonts request, GDPR-friendly)
import "@fontsource/young-serif/400.css";
import "@fontsource-variable/figtree/index.css";
import "@/app/globals.css";
import { localeInfo, type Locale } from "@/i18n";
import SiteProviders from "./SiteProviders";

// The <html> shell shared by every language's root layout on the public/client side.
export function Document({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={localeInfo[locale].htmlLang}>
      <body>
        <SiteProviders>{children}</SiteProviders>
      </body>
    </html>
  );
}
