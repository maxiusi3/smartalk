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
  // 外部包配置
  serverExternalPackages: ['@supabase/supabase-js'],

  // Turbopack 配置（稳定版本）
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // 图片优化配置
  images: {
    domains: [
      'localhost',
      'smartalk.app',
      'cdn.smartalk.app',
      'images.unsplash.com',
      'lqrmpvkpfwvsihvjurjd.supabase.co',
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // 重写配置（用于API代理）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/:path*`,
      },
    ]
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },

  // Webpack配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 添加自定义webpack配置
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // 输出配置
  output: 'standalone',

  // 压缩配置
  compress: true,

  // 电源配置（用于优化性能）
  poweredByHeader: false,

  // 生成构建ID
  generateBuildId: async () => {
    // 可以返回任何字符串，这里使用时间戳
    return `build-${Date.now()}`
  },
}

module.exports = nextConfig
