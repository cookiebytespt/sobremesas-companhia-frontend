// The business's public details, shown in the header, footer, home page and request form.
// Brought over from the presentation site (../landing/src/content/site.ts), which this platform replaces.
// The offering itself (occasions, services, menu items, gallery) lives in the API and is edited in the backoffice.

export const site = {
  name: "Sobremesas & Companhia",
  location: "Santo Tirso",
  instagram: "https://www.instagram.com/sobremesas.e.companhia/",
  facebook: "https://www.facebook.com/profile.php?id=1087851201236726",
  /** Digits only, with country code — used for wa.me links. */
  whatsapp: "351961906158",
  whatsappDisplay: "961 906 158",
  /** Delivery and set-up area, kitchen first. */
  serviceArea: ["Santo Tirso", "Porto", "Gaia", "Braga", "Guimarães", "Viana do Castelo"],
};

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** Line icon for a service when the backoffice has not set one (slugs from the landing import). */
export const serviceIcons: Record<string, string> = {
  "bolo-decorado": "cake",
  bolachas: "cookie",
  "mesa-de-doces": "cupcake",
  catering: "platter",
};
