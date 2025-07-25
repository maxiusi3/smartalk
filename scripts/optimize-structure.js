#!/usr/bin/env node

/**
 * 目录结构优化脚本
 * 清理临时文件，优化目录结构，确保项目整洁
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 需要清理的文件模式
 */
const CLEANUP_PATTERNS = [
  // 临时文件
  '**/*.tmp',
  '**/*.temp',
  '**/temp/**',
  
  // 日志文件
  '**/*.log',
  '**/logs/**',
  
  // 缓存文件
  '**/.cache/**',
  '**/dist/**',
  '**/build/**',
  
  // 系统文件
  '**/.DS_Store',
  '**/Thumbs.db',
  
  // 编辑器文件
  '**/*.swp',
  '**/*.swo',
  '**/*~',
  
  // 测试覆盖率
  '**/coverage/**',
  '**/.nyc_output/**',
];

/**
 * 需要保留的重要目录
 */
const IMPORTANT_DIRS = [
  'node_modules',
  '.git',
  'backend/src',
  'mobile/src',
  'web/src',
  'shared',
  'content',
  'docs',
];

/**
 * 标准目录结构
 */
const STANDARD_STRUCTURE = {
  'backend': {
    'src': {
      'controllers': {},
      'services': {},
      'models': {},
      'routes': {},
      'middleware': {},
      'utils': {},
      'config': {},
      'types': {},
    },
    'tests': {
      'unit': {},
      'integration': {},
      'api': {},
    },
    'docs': {},
  },
  'mobile': {
    'src': {
      'components': {},
      'screens': {},
      'navigation': {},
      'services': {},
      'utils': {},
      'constants': {},
      'types': {},
      'hooks': {},
    },
    'tests': {},
    'docs': {},
  },
  'web': {
    'src': {
      'components': {},
      'pages': {},
      'services': {},
      'utils': {},
      'constants': {},
      'types': {},
      'hooks': {},
      'styles': {},
    },
    'tests': {},
    'docs': {},
  },
  'shared': {
    'components': {},
    'utils': {},
    'constants': {},
    'types': {},
    'config': {},
    'services': {},
  },
  'content': {
    'stories': {},
    'videos': {},
    'images': {},
    'audio': {},
  },
  'docs': {
    'api': {},
    'architecture': {},
    'guides': {},
    'examples': {},
  },
  'scripts': {},
  'tests': {
    'e2e': {},
    'performance': {},
    'integration': {},
  },
};

/**
 * 检查并创建标准目录结构
 */
function ensureDirectoryStructure() {
  log('\n📁 检查并创建标准目录结构...', 'cyan');
  
  function createDirs(structure, basePath = '.') {
    for (const [dirName, subStructure] of Object.entries(structure)) {
      const dirPath = path.join(basePath, dirName);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`✅ 创建目录: ${dirPath}`, 'green');
      }
      
      if (typeof subStructure === 'object' && Object.keys(subStructure).length > 0) {
        createDirs(subStructure, dirPath);
      }
    }
  }
  
  createDirs(STANDARD_STRUCTURE);
}

/**
 * 清理空目录
 */
function cleanupEmptyDirectories(dirPath = '.') {
  if (!fs.existsSync(dirPath)) return;
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // 跳过重要目录
      if (IMPORTANT_DIRS.some(important => itemPath.includes(important))) {
        continue;
      }
      
      // 递归清理子目录
      cleanupEmptyDirectories(itemPath);
      
      // 检查目录是否为空
      try {
        const subItems = fs.readdirSync(itemPath);
        if (subItems.length === 0) {
          fs.rmdirSync(itemPath);
          log(`🗑️  删除空目录: ${itemPath}`, 'yellow');
        }
      } catch (error) {
        // 目录可能已被删除或无权限
      }
    }
  }
}

/**
 * 创建 .gitignore 文件
 */
function ensureGitignore() {
  log('\n📝 检查 .gitignore 文件...', 'cyan');
  
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
.nyc_output/

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp
temp/

# Performance reports
performance-report-*.json

# Test files
test-results/
playwright-report/
`;

  const gitignorePath = '.gitignore';
  
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    log(`✅ 创建 .gitignore 文件`, 'green');
  } else {
    log(`ℹ️  .gitignore 文件已存在`, 'blue');
  }
}

/**
 * 创建项目根目录的 README
 */
function ensureRootReadme() {
  log('\n📖 检查根目录 README.md...', 'cyan');
  
  const readmeContent = `# SmarTalk - 神经沉浸式英语学习平台

## 项目概述

SmarTalk 是一个创新的英语学习平台，采用神经沉浸式学习方法，通过故事情境和视频内容帮助用户自然习得英语。

## 技术架构

### 项目结构
\`\`\`
├── backend/          # 后端服务 (Node.js + Express + Prisma)
├── mobile/           # 移动端应用 (React Native)
├── web/              # Web端应用 (Next.js)
├── shared/           # 共享代码和组件
├── content/          # 内容资源 (故事、视频、音频)
├── docs/             # 项目文档
├── scripts/          # 构建和部署脚本
└── tests/            # 端到端测试
\`\`\`

### 技术栈
- **后端**: Node.js, Express, Prisma, PostgreSQL
- **前端**: React, Next.js, TypeScript
- **移动端**: React Native, TypeScript
- **数据库**: PostgreSQL
- **部署**: Docker, AWS/阿里云

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 8
- PostgreSQL >= 14

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 环境配置
1. 复制环境变量模板：
\`\`\`bash
cp .env.example .env
\`\`\`

2. 配置数据库连接和其他环境变量

### 启动开发环境
\`\`\`bash
# 启动后端服务
npm run dev:backend

# 启动Web端
npm run dev:web

# 启动移动端
npm run dev:mobile
\`\`\`

## 开发指南

- [API 文档](./docs/api/README.md)
- [架构设计](./docs/architecture/README.md)
- [开发规范](./docs/guides/coding-standards.md)
- [部署指南](./docs/guides/deployment.md)

## 贡献指南

请阅读 [贡献指南](./docs/guides/contributing.md) 了解如何参与项目开发。

## 许可证

MIT License
`;

  const readmePath = 'README.md';
  
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, readmeContent);
    log(`✅ 创建根目录 README.md`, 'green');
  } else {
    log(`ℹ️  README.md 已存在`, 'blue');
  }
}

/**
 * 生成项目统计信息
 */
function generateProjectStats() {
  log('\n📊 生成项目统计信息...', 'cyan');
  
  function countFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    if (!fs.existsSync(dir)) return 0;
    
    let count = 0;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.includes('node_modules')) {
        count += countFiles(itemPath, extensions);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          count++;
        }
      }
    }
    
    return count;
  }
  
  const stats = {
    backend: countFiles('backend/src'),
    mobile: countFiles('mobile/src'),
    web: countFiles('web/src'),
    shared: countFiles('shared'),
    total: 0,
  };
  
  stats.total = stats.backend + stats.mobile + stats.web + stats.shared;
  
  log(`📈 项目统计:`, 'blue');
  log(`   后端文件: ${stats.backend}`, 'green');
  log(`   移动端文件: ${stats.mobile}`, 'green');
  log(`   Web端文件: ${stats.web}`, 'green');
  log(`   共享文件: ${stats.shared}`, 'green');
  log(`   总计: ${stats.total}`, 'cyan');
  
  return stats;
}

/**
 * 主函数
 */
async function main() {
  log('🚀 开始优化项目目录结构...', 'cyan');
  
  try {
    // 1. 确保标准目录结构
    ensureDirectoryStructure();
    
    // 2. 清理空目录
    cleanupEmptyDirectories();
    
    // 3. 确保 .gitignore 文件
    ensureGitignore();
    
    // 4. 确保根目录 README
    ensureRootReadme();
    
    // 5. 生成项目统计
    generateProjectStats();
    
    log('\n✅ 目录结构优化完成！', 'green');
    
  } catch (error) {
    log(`❌ 优化过程中出现错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  ensureDirectoryStructure,
  cleanupEmptyDirectories,
  ensureGitignore,
  ensureRootReadme,
  generateProjectStats,
};
