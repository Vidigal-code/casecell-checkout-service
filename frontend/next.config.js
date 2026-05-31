/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.placeholders.dev'
      }
    ]
  }
};

module.exports = nextConfig;
