/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mtaa/ui', '@mtaa/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

module.exports = nextConfig;
