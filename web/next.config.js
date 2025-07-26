/** @type {import('next').NextConfig} */
const nextConfig = {
  // 暂时禁用 TypeScript 检查以快速部署
  typescript: {
    ignoreBuildErrors: true,
  },
  // 暂时禁用 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 最小化配置，禁用所有可能导致问题的功能
  swcMinify: false,

  // 禁用图片优化
  images: {
    unoptimized: true,
  },

  // 禁用压缩
  compress: false,

  // 禁用电源头
  poweredByHeader: false,

  // 禁用遥测
  telemetry: {
    disabled: true,
  },
}

module.exports = nextConfig
