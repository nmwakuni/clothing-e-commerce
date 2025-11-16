import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mteja/database', '@mteja/ai-engine', '@mteja/linkedin-scraper', '@mteja/payments'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
