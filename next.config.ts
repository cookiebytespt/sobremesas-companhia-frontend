import type { NextConfig } from "next";

// Hosts `next/image` may optimise: the API's uploads (prod + local).
const apiHost = (() => {
  try {
    return new URL(process.env.BACKEND_URL ?? "http://localhost:8080").hostname;
  } catch {
    return "localhost";
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.sobremesasecompanhia.pt" },
      { protocol: "https", hostname: apiHost },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
