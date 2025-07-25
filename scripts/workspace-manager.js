#!/usr/bin/env node

/**
 * 工作区管理脚本
 * 管理 Monorepo 中各个工作区的依赖和构建
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * 工作区配置
 */
const WORKSPACES = {
  backend: {
    name: 'Backend Service',
    path: './backend',
    dependencies: ['shared'],
    scripts: {
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm run test',
      lint: 'npm run lint',
    },
  },
  web: {
    name: 'Web Application',
    path: './web',
    dependencies: ['shared'],
    scripts: {
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm run test',
      lint: 'npm run lint',
    },
  },
  mobile: {
    name: 'Mobile Application',
    path: './mobile',
    dependencies: ['shared'],
    scripts: {
      dev: 'npm run start',
      build: 'npm run build',
      test: 'npm run test',
      lint: 'npm run lint',
    },
  },
  shared: {
    name: 'Shared Components',
    path: './shared',
    dependencies: [],
    scripts: {
      build: 'npm run build',
      test: 'npm run test',
      lint: 'npm run lint',
    },
  },
};

/**
 * 执行命令
 */
function execCommand(command, cwd = process.cwd()) {
  try {
    log(`Executing: ${command}`, 'blue');
    const result = execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8' 
    });
    return { success: true, result };
  } catch (error) {
    log(`Command failed: ${error.message}`, 'red');
    return { success: false, error };
  }
}

/**
 * 检查工作区状态
 */
function checkWorkspaceStatus() {
  log('\n🔍 Checking workspace status...', 'cyan');
  
  const status = {};
  
  for (const [name, config] of Object.entries(WORKSPACES)) {
    const workspacePath = config.path;
    const packageJsonPath = path.join(workspacePath, 'package.json');
    
    status[name] = {
      exists: fs.existsSync(workspacePath),
      hasPackageJson: fs.existsSync(packageJsonPath),
      dependencies: config.dependencies,
    };
    
    if (status[name].exists && status[name].hasPackageJson) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        status[name].version = packageJson.version;
        status[name].scripts = Object.keys(packageJson.scripts || {});
      } catch (error) {
        status[name].error = error.message;
      }
    }
  }
  
  // 显示状态
  for (const [name, info] of Object.entries(status)) {
    const statusIcon = info.exists && info.hasPackageJson ? '✅' : '❌';
    log(`${statusIcon} ${WORKSPACES[name].name} (${name})`);
    
    if (info.version) {
      log(`   Version: ${info.version}`, 'blue');
    }
    
    if (info.scripts && info.scripts.length > 0) {
      log(`   Scripts: ${info.scripts.join(', ')}`, 'blue');
    }
    
    if (info.error) {
      log(`   Error: ${info.error}`, 'red');
    }
  }
  
  return status;
}

/**
 * 安装依赖
 */
function installDependencies(workspace = null) {
  log('\n📦 Installing dependencies...', 'cyan');
  
  if (workspace) {
    const config = WORKSPACES[workspace];
    if (!config) {
      log(`Unknown workspace: ${workspace}`, 'red');
      return false;
    }
    
    log(`Installing dependencies for ${config.name}...`, 'blue');
    const result = execCommand('npm install', config.path);
    return result.success;
  } else {
    // 安装根依赖
    log('Installing root dependencies...', 'blue');
    let success = execCommand('npm install').success;
    
    // 安装各工作区依赖
    for (const [name, config] of Object.entries(WORKSPACES)) {
      if (fs.existsSync(config.path)) {
        log(`Installing dependencies for ${config.name}...`, 'blue');
        const result = execCommand('npm install', config.path);
        success = success && result.success;
      }
    }
    
    return success;
  }
}

/**
 * 构建工作区
 */
function buildWorkspaces(workspace = null) {
  log('\n🔨 Building workspaces...', 'cyan');
  
  const buildOrder = ['shared', 'backend', 'web', 'mobile'];
  const workspacesToBuild = workspace ? [workspace] : buildOrder;
  
  for (const name of workspacesToBuild) {
    const config = WORKSPACES[name];
    if (!config) {
      log(`Unknown workspace: ${name}`, 'red');
      continue;
    }
    
    if (!fs.existsSync(config.path)) {
      log(`Workspace not found: ${config.path}`, 'yellow');
      continue;
    }
    
    if (config.scripts.build) {
      log(`Building ${config.name}...`, 'blue');
      const result = execCommand(config.scripts.build, config.path);
      
      if (!result.success) {
        log(`Build failed for ${config.name}`, 'red');
        return false;
      }
    } else {
      log(`No build script for ${config.name}`, 'yellow');
    }
  }
  
  return true;
}

/**
 * 运行测试
 */
function runTests(workspace = null) {
  log('\n🧪 Running tests...', 'cyan');
  
  const workspacesToTest = workspace ? [workspace] : Object.keys(WORKSPACES);
  let allPassed = true;
  
  for (const name of workspacesToTest) {
    const config = WORKSPACES[name];
    if (!config || !fs.existsSync(config.path)) {
      continue;
    }
    
    if (config.scripts.test) {
      log(`Testing ${config.name}...`, 'blue');
      const result = execCommand(config.scripts.test, config.path);
      
      if (!result.success) {
        log(`Tests failed for ${config.name}`, 'red');
        allPassed = false;
      }
    }
  }
  
  return allPassed;
}

/**
 * 代码检查
 */
function lintCode(workspace = null) {
  log('\n🔍 Running code linting...', 'cyan');
  
  const workspacesToLint = workspace ? [workspace] : Object.keys(WORKSPACES);
  let allPassed = true;
  
  for (const name of workspacesToLint) {
    const config = WORKSPACES[name];
    if (!config || !fs.existsSync(config.path)) {
      continue;
    }
    
    if (config.scripts.lint) {
      log(`Linting ${config.name}...`, 'blue');
      const result = execCommand(config.scripts.lint, config.path);
      
      if (!result.success) {
        log(`Linting failed for ${config.name}`, 'red');
        allPassed = false;
      }
    }
  }
  
  return allPassed;
}

/**
 * 清理工作区
 */
function cleanWorkspaces(workspace = null) {
  log('\n🧹 Cleaning workspaces...', 'cyan');
  
  const workspacesToClean = workspace ? [workspace] : Object.keys(WORKSPACES);
  
  for (const name of workspacesToClean) {
    const config = WORKSPACES[name];
    if (!config || !fs.existsSync(config.path)) {
      continue;
    }
    
    log(`Cleaning ${config.name}...`, 'blue');
    
    // 清理常见的构建目录
    const dirsToClean = ['dist', 'build', '.next', 'coverage', 'node_modules'];
    
    for (const dir of dirsToClean) {
      const dirPath = path.join(config.path, dir);
      if (fs.existsSync(dirPath)) {
        execCommand(`rm -rf ${dir}`, config.path);
      }
    }
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const workspace = args[1];
  
  log('🚀 SmarTalk Workspace Manager', 'cyan');
  
  switch (command) {
    case 'status':
      checkWorkspaceStatus();
      break;
      
    case 'install':
      installDependencies(workspace);
      break;
      
    case 'build':
      buildWorkspaces(workspace);
      break;
      
    case 'test':
      runTests(workspace);
      break;
      
    case 'lint':
      lintCode(workspace);
      break;
      
    case 'clean':
      cleanWorkspaces(workspace);
      break;
      
    case 'ci':
      log('Running CI pipeline...', 'cyan');
      const success = installDependencies() && 
                     lintCode() && 
                     runTests() && 
                     buildWorkspaces();
      
      if (success) {
        log('✅ CI pipeline completed successfully', 'green');
        process.exit(0);
      } else {
        log('❌ CI pipeline failed', 'red');
        process.exit(1);
      }
      break;
      
    default:
      log('Usage: node workspace-manager.js <command> [workspace]', 'yellow');
      log('Commands:', 'yellow');
      log('  status              - Check workspace status', 'yellow');
      log('  install [workspace] - Install dependencies', 'yellow');
      log('  build [workspace]   - Build workspaces', 'yellow');
      log('  test [workspace]    - Run tests', 'yellow');
      log('  lint [workspace]    - Run linting', 'yellow');
      log('  clean [workspace]   - Clean workspaces', 'yellow');
      log('  ci                  - Run CI pipeline', 'yellow');
      log('', 'yellow');
      log('Workspaces: ' + Object.keys(WORKSPACES).join(', '), 'yellow');
      break;
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  WORKSPACES,
  checkWorkspaceStatus,
  installDependencies,
  buildWorkspaces,
  runTests,
  lintCode,
  cleanWorkspaces,
};
