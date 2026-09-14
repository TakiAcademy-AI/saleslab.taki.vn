import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a minimal server + traced node_modules so the
  // runtime image stays small and does not need a second `npm install`.
  output: "standalone",
  // better-sqlite3 is a native addon; keep it external instead of bundled.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
