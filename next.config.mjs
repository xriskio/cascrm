/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    if (dev) {
      config.output.chunkLoadTimeout = 300000
    }
    return config
  },
}

export default nextConfig

