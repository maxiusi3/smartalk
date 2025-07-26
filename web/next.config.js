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
  // 完全禁用 styled-jsx 以避免 React Context 错误
  compiler: {
    styledComponents: false,
    // 禁用 styled-jsx
    styledJsx: false,
  },
  experimental: {
    // 禁用所有可能导致问题的实验性功能
    esmExternals: false,
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig
