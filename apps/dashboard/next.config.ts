import type { NextConfig } from "next";
import path from "node:path";

/** Raiz do monorepo `plx-transcribe-stack` (pasta `contracts/` ao lado de `apps/`). */
const contractsRoot = path.join(process.cwd(), "..", "..", "contracts");

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "https://plx-synapse.tail8a195c.ts.net",
    "http://plx-synapse.tail8a195c.ts.net",
    "https://plx-synapse.tail8a195c.ts.net:3099",
    "http://plx-synapse.tail8a195c.ts.net:3099",
  ],
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string | false | string[]>),
      "@contracts": contractsRoot,
    };
    return config;
  },
  experimental: {
    // Monorepo: imports de `contracts/` fora de `apps/dashboard`.
    externalDir: true,
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Next 15.2: Turbopack (`next dev --turbopack`) usa `experimental.turbo`, não a chave `turbopack` do Next 16+.
    turbo: {
      resolveAlias: {
        "@contracts": contractsRoot,
      },
    },
  },
};

export default nextConfig;
