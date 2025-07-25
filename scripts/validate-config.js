#!/usr/bin/env node

/**
 * 配置验证脚本
 * 验证环境变量配置的完整性和正确性
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
 * 必需的环境变量
 */
const REQUIRED_VARS = {
  development: [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ],
  production: [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_URL',
    'SENTRY_DSN',
  ],
  staging: [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_URL',
  ],
  test: [
    'TEST_DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ],
};

/**
 * 配置验证规则
 */
const VALIDATION_RULES = {
  // URL 格式验证
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // 邮箱格式验证
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // 端口号验证
  port: (value) => {
    const port = parseInt(value);
    return !isNaN(port) && port > 0 && port <= 65535;
  },

  // JWT 密钥长度验证
  jwtSecret: (value) => {
    return typeof value === 'string' && value.length >= 32;
  },

  // 布尔值验证
  boolean: (value) => {
    return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
  },

  // 数字验证
  number: (value) => {
    return !isNaN(parseFloat(value));
  },

  // 非空验证
  notEmpty: (value) => {
    return value && value.trim().length > 0;
  },
};

/**
 * 环境变量验证配置
 */
const ENV_VALIDATIONS = {
  // 数据库配置
  DATABASE_URL: ['url', 'notEmpty'],
  TEST_DATABASE_URL: ['url'],
  
  // 服务器配置
  PORT: ['port'],
  HOST: ['notEmpty'],
  BASE_URL: ['url'],
  
  // JWT 配置
  JWT_SECRET: ['jwtSecret', 'notEmpty'],
  JWT_REFRESH_SECRET: ['jwtSecret', 'notEmpty'],
  
  // Redis 配置
  REDIS_URL: ['url'],
  REDIS_PORT: ['port'],
  
  // 邮件配置
  EMAIL_FROM: ['email'],
  SMTP_PORT: ['port'],
  
  // 监控配置
  SENTRY_DSN: ['url'],
  SENTRY_TRACES_SAMPLE_RATE: ['number'],
  
  // 功能开关
  FEATURE_REGISTRATION: ['boolean'],
  FEATURE_EMAIL_VERIFICATION: ['boolean'],
  FEATURE_SOCIAL_LOGIN: ['boolean'],
  FEATURE_ANALYTICS: ['boolean'],
  FEATURE_MAINTENANCE: ['boolean'],
  
  // 其他配置
  MONITORING_ENABLED: ['boolean'],
  DEBUG: ['boolean'],
  HOT_RELOAD: ['boolean'],
};

/**
 * 加载环境变量
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

/**
 * 验证单个环境变量
 */
function validateEnvVar(key, value, rules) {
  const errors = [];

  if (!value) {
    return ['Value is required but not provided'];
  }

  for (const rule of rules) {
    if (VALIDATION_RULES[rule]) {
      if (!VALIDATION_RULES[rule](value)) {
        errors.push(`Failed ${rule} validation`);
      }
    }
  }

  return errors;
}

/**
 * 验证配置完整性
 */
function validateConfig(env, environment = 'development') {
  log(`\n🔍 Validating configuration for ${environment} environment...`, 'cyan');

  const errors = [];
  const warnings = [];

  // 检查必需的环境变量
  const requiredVars = REQUIRED_VARS[environment] || REQUIRED_VARS.development;
  
  for (const varName of requiredVars) {
    if (!env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // 验证环境变量格式
  for (const [varName, rules] of Object.entries(ENV_VALIDATIONS)) {
    if (env[varName]) {
      const varErrors = validateEnvVar(varName, env[varName], rules);
      if (varErrors.length > 0) {
        errors.push(`${varName}: ${varErrors.join(', ')}`);
      }
    }
  }

  // 环境特定检查
  if (environment === 'production') {
    // 生产环境安全检查
    if (env.JWT_SECRET && env.JWT_SECRET.includes('your-') || env.JWT_SECRET === 'secret') {
      errors.push('JWT_SECRET appears to be a placeholder value in production');
    }

    if (env.DATABASE_URL && env.DATABASE_URL.includes('localhost')) {
      warnings.push('DATABASE_URL points to localhost in production environment');
    }

    if (!env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN not configured for production error tracking');
    }
  }

  // 开发环境检查
  if (environment === 'development') {
    if (!env.DEBUG || env.DEBUG !== 'true') {
      warnings.push('DEBUG mode is not enabled for development');
    }

    if (!env.API_DOCS_ENABLED || env.API_DOCS_ENABLED !== 'true') {
      warnings.push('API documentation is not enabled for development');
    }
  }

  return { errors, warnings };
}

/**
 * 检查配置文件
 */
function checkConfigFiles() {
  log('\n📁 Checking configuration files...', 'cyan');

  const files = [
    { path: '.env', required: false, description: 'Main environment file' },
    { path: '.env.example', required: true, description: 'Environment template' },
    { path: '.env.local', required: false, description: 'Local overrides' },
    { path: '.env.development', required: false, description: 'Development config' },
    { path: '.env.production', required: false, description: 'Production config' },
  ];

  const results = [];

  for (const file of files) {
    const exists = fs.existsSync(file.path);
    results.push({
      ...file,
      exists,
      status: exists ? '✅' : (file.required ? '❌' : '⚠️'),
    });
  }

  // 显示结果
  results.forEach(result => {
    log(`${result.status} ${result.path} - ${result.description}`, 
        result.exists ? 'green' : (result.required ? 'red' : 'yellow'));
  });

  return results;
}

/**
 * 生成配置报告
 */
function generateReport(env, validationResult, configFiles) {
  log('\n📊 Configuration Validation Report', 'cyan');
  log('=' .repeat(50), 'cyan');

  // 文件状态
  log('\n📁 Configuration Files:', 'blue');
  configFiles.forEach(file => {
    const status = file.exists ? 'Found' : 'Missing';
    const color = file.exists ? 'green' : (file.required ? 'red' : 'yellow');
    log(`  ${file.path}: ${status}`, color);
  });

  // 环境变量统计
  const envCount = Object.keys(env).length;
  log(`\n📈 Environment Variables: ${envCount} defined`, 'blue');

  // 验证结果
  const { errors, warnings } = validationResult;
  
  if (errors.length === 0 && warnings.length === 0) {
    log('\n✅ Configuration validation passed!', 'green');
  } else {
    if (errors.length > 0) {
      log(`\n❌ Errors (${errors.length}):`, 'red');
      errors.forEach(error => log(`  • ${error}`, 'red'));
    }

    if (warnings.length > 0) {
      log(`\n⚠️  Warnings (${warnings.length}):`, 'yellow');
      warnings.forEach(warning => log(`  • ${warning}`, 'yellow'));
    }
  }

  // 建议
  log('\n💡 Recommendations:', 'cyan');
  
  if (!fs.existsSync('.env')) {
    log('  • Copy .env.example to .env and fill in your values', 'blue');
  }
  
  if (errors.length > 0) {
    log('  • Fix all errors before deploying to production', 'blue');
  }
  
  if (warnings.length > 0) {
    log('  • Review warnings for potential issues', 'blue');
  }
  
  log('  • Use different .env files for different environments', 'blue');
  log('  • Never commit .env files to version control', 'blue');

  return {
    passed: errors.length === 0,
    errors: errors.length,
    warnings: warnings.length,
    envCount,
  };
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || process.env.NODE_ENV || 'development';
  const envFile = args[1] || '.env';

  log('🔧 SmarTalk Configuration Validator', 'cyan');
  log(`🌍 Environment: ${environment}`, 'blue');
  log(`📄 Config file: ${envFile}`, 'blue');

  // 检查配置文件
  const configFiles = checkConfigFiles();

  // 加载环境变量
  const env = {
    ...process.env,
    ...loadEnvFile(envFile),
  };

  // 验证配置
  const validationResult = validateConfig(env, environment);

  // 生成报告
  const report = generateReport(env, validationResult, configFiles);

  // 退出码
  process.exit(report.passed ? 0 : 1);
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  REQUIRED_VARS,
  VALIDATION_RULES,
  ENV_VALIDATIONS,
  validateConfig,
  checkConfigFiles,
  loadEnvFile,
};
