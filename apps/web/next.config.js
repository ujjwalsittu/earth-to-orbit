/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@e2o/types'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
