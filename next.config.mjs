/** @type {import('next').NextConfig} */
const basePath = process.env.PUBLIC_BASE_PATH || undefined;

const nextConfig = {
  // Enable static export
  output: 'export',
  // GH pages path
  basePath: basePath,
  assetPrefix: basePath
};

export default nextConfig;
