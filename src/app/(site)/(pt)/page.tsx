import { HomePage } from "@/components/site/pages/HomePage";

// Occasions, services and photos come from the API; refresh every 5 minutes.
export const revalidate = 300;

export default function Page() {
  return <HomePage locale="pt" />;
}
