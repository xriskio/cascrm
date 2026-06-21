/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/((?!_next/static|_next/image|favicon\\.ico).*)",
          headers: [
            { key: "Clear-Site-Data", value: '"cache"' },
            { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
            { key: "Pragma", value: "no-cache" },
            { key: "Expires", value: "0" },
          ],
        },
        {
          source: "/_next/static/(.*)",
          headers: [
            { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
            { key: "Pragma", value: "no-cache" },
            { key: "Expires", value: "0" },
          ],
        },
      ]
    }
    return []
  },
}

export default nextConfig
