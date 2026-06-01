const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const rootEnvCandidates = [
  path.resolve(__dirname, '..', '.env.local'),
  path.resolve(__dirname, '..', '.env')
];

const passThroughKeys = new Set(['INTERNAL_API_BASE_URL']);

for (const envPath of rootEnvCandidates) {
  if (!fs.existsSync(envPath)) {
    continue;
  }

  const parsed = dotenv.parse(fs.readFileSync(envPath));

  for (const [key, value] of Object.entries(parsed)) {
    if (
      !(key.startsWith('NEXT_PUBLIC_') || passThroughKeys.has(key)) ||
      process.env[key] !== undefined
    ) {
      continue;
    }

    process.env[key] = value;
  }
}


const internalApiBaseUrl = (process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');

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
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${internalApiBaseUrl}/api/v1/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
