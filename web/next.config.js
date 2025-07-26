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

  // 禁用静态生成以避免预渲染错误
  output: 'standalone',

  // 跳过中间件处理以避免预渲染错误
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,

  // Webpack 配置以完全排除 styled-jsx
  webpack: (config, { dev }) => {
    // 在生产环境中完全忽略 styled-jsx
    if (!dev) {
      config.externals = config.externals || [];
      config.externals.push('styled-jsx');
      config.externals.push('styled-jsx/style');

      // 添加 alias 以防止 styled-jsx 被引用
      config.resolve.alias = {
        ...config.resolve.alias,
        'styled-jsx': false,
        'styled-jsx/style': false,
      };
    }

    return config;
  },
}

module.exports = nextConfig
