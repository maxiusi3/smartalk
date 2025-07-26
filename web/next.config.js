/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
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
    styledJsx: false,
  },
}

module.exports = nextConfig
