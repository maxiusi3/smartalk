// PM2 配置文件 - 用于生产环境进程管理
// 使用方法: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      // 应用基本信息
      name: 'smartalk-web',
      script: 'server.js',
      
      // 实例配置
      instances: 'max', // 使用所有CPU核心
      exec_mode: 'cluster', // 集群模式
      
      // 环境配置
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
      },
      
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.smartalk.app',
      },
      
      // 性能配置
      max_memory_restart: '1G', // 内存超过1G时重启
      min_uptime: '10s', // 最小运行时间
      max_restarts: 10, // 最大重启次数
      
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 监控配置
      watch: false, // 生产环境不启用文件监控
      ignore_watch: [
        'node_modules',
        '.next',
        'logs',
        '.git'
      ],
      
      // 进程配置
      kill_timeout: 5000, // 强制杀死进程的超时时间
      wait_ready: true, // 等待应用准备就绪
      listen_timeout: 10000, // 监听超时时间
      
      // 自动重启配置
      autorestart: true,
      
      // 健康检查
      health_check_grace_period: 3000,
      
      // 环境变量
      source_map_support: true,
      
      // 合并日志
      merge_logs: true,
      
      // 时间戳
      time: true,
    }
  ],

  // 部署配置
  deploy: {
    // 生产环境部署配置
    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/smartalk-web.git',
      path: '/var/www/smartalk-web',
      'pre-deploy-local': '',
      'post-deploy': 'yarn install && yarn build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    },

    // 预发布环境部署配置
    staging: {
      user: 'deploy',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/smartalk-web.git',
      path: '/var/www/smartalk-web-staging',
      'pre-deploy-local': '',
      'post-deploy': 'yarn install && yarn build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    }
  }
}
