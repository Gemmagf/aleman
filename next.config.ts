import type { NextConfig } from "next";

const isExport = process.env.EXPORT === "1";
// When deploying to GitHub Pages under https://<user>.github.io/<repo>,
// the basePath must match the repo name.
const basePath = isExport ? process.env.PAGES_BASE_PATH ?? "/aleman" : undefined;

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: isExport },
  trailingSlash: isExport,
};

export default nextConfig;
