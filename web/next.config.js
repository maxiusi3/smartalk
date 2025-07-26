/** @type {import('next').NextConfig} */
const nextConfig = {
  // 最简单的配置
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
}

module.exports = nextConfig
