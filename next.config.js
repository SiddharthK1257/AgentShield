/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@moss-dev/moss', '@moss-dev/moss-core'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), '@moss-dev/moss', '@moss-dev/moss-core'];
    }
    return config;
  },
};

module.exports = nextConfig;
