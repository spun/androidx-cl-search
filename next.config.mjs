/** @type {import('next').NextConfig} */
const basePath = process.env.PUBLIC_BASE_PATH || undefined;

const nextConfig = {
  experimental: {
    // Required to work with TypeScript 7
    useTypeScriptCli: true,
  },
  // Enable static export
  output: 'export',
  // GH pages path
  basePath: basePath,
  assetPrefix: basePath
};

export default nextConfig;
