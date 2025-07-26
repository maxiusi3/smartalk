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

  // 暂时禁用静态导出以测试构建
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,

  // Webpack 配置以完全排除 styled-jsx
  webpack: (config, { isServer }) => {
    // 完全忽略 styled-jsx
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('styled-jsx');
    }

    // 添加 alias 以防止 styled-jsx 被引用
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-jsx': false,
      'styled-jsx/style': false,
    };

    return config;
  },
}

module.exports = nextConfig
