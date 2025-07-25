#!/usr/bin/env node

/**
 * 路径别名更新脚本
 * 自动更新项目中的导入语句以使用新的路径别名
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
 * 路径别名映射规则
 */
const ALIAS_MAPPINGS = {
  backend: {
    // 内部模块别名
    './controllers/': '@controllers/',
    './services/': '@services/',
    './models/': '@models/',
    './middleware/': '@middleware/',
    './routes/': '@routes/',
    './utils/': '@utils/',
    './config/': '@config/',
    './types/': '@types/',
    '../controllers/': '@controllers/',
    '../services/': '@services/',
    '../models/': '@models/',
    '../middleware/': '@middleware/',
    '../routes/': '@routes/',
    '../utils/': '@utils/',
    '../config/': '@config/',
    '../types/': '@types/',
    
    // 共享模块别名
    '../shared/': '@shared/',
    '../shared/components/': '@shared/components/',
    '../shared/utils/': '@shared/utils/',
    '../shared/types/': '@shared/types/',
    '../shared/constants/': '@shared/constants/',
    '../shared/config/': '@shared/config/',
    '../shared/services/': '@shared/services/',
    
    // 内容模块别名
    '../content/': '@content/',
    '../content/stories/': '@content/stories/',
    '../content/videos/': '@content/videos/',
    '../content/images/': '@content/images/',
    '../content/audio/': '@content/audio/',
  },
  
  mobile: {
    // 内部模块别名
    './components/': '@components/',
    './screens/': '@screens/',
    './navigation/': '@navigation/',
    './services/': '@services/',
    './utils/': '@utils/',
    './hooks/': '@hooks/',
    './constants/': '@constants/',
    './types/': '@types/',
    './store/': '@store/',
    '../components/': '@components/',
    '../screens/': '@screens/',
    '../navigation/': '@navigation/',
    '../services/': '@services/',
    '../utils/': '@utils/',
    '../hooks/': '@hooks/',
    '../constants/': '@constants/',
    '../types/': '@types/',
    '../store/': '@store/',
    
    // 资源别名
    '../assets/': '@assets/',
    './assets/': '@assets/',
    
    // 共享模块别名
    '../shared/': '@shared/',
    '../shared/components/': '@shared/components/',
    '../shared/utils/': '@shared/utils/',
    '../shared/types/': '@shared/types/',
    '../shared/constants/': '@shared/constants/',
    '../shared/config/': '@shared/config/',
    '../shared/services/': '@shared/services/',
    
    // 内容模块别名
    '../content/': '@content/',
    '../content/stories/': '@content/stories/',
    '../content/videos/': '@content/videos/',
    '../content/images/': '@content/images/',
    '../content/audio/': '@content/audio/',
  },
  
  web: {
    // 内部模块别名
    './components/': '@components/',
    './pages/': '@pages/',
    './hooks/': '@hooks/',
    './services/': '@services/',
    './utils/': '@utils/',
    './styles/': '@styles/',
    './types/': '@types/',
    '../components/': '@components/',
    '../pages/': '@pages/',
    '../hooks/': '@hooks/',
    '../services/': '@services/',
    '../utils/': '@utils/',
    '../styles/': '@styles/',
    '../types/': '@types/',
    
    // 公共资源别名
    '../public/': '@public/',
    './public/': '@public/',
    
    // 共享模块别名
    '../shared/': '@shared/',
    '../shared/components/': '@shared/components/',
    '../shared/utils/': '@shared/utils/',
    '../shared/types/': '@shared/types/',
    '../shared/constants/': '@shared/constants/',
    '../shared/config/': '@shared/config/',
    '../shared/services/': '@shared/services/',
    
    // 内容模块别名
    '../content/': '@content/',
    '../content/stories/': '@content/stories/',
    '../content/videos/': '@content/videos/',
    '../content/images/': '@content/images/',
    '../content/audio/': '@content/audio/',
  },
};

/**
 * 扫描文件并更新导入语句
 */
function updateImportsInFile(filePath, projectType) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    const mappings = ALIAS_MAPPINGS[projectType];
    if (!mappings) {
      log(`No mappings defined for project type: ${projectType}`, 'yellow');
      return false;
    }
    
    // 更新 import 语句
    for (const [oldPath, newPath] of Object.entries(mappings)) {
      // 匹配各种导入格式
      const patterns = [
        // import ... from '...'
        new RegExp(`(import\\s+.*?from\\s+['"])${escapeRegex(oldPath)}([^'"]*['"])`, 'g'),
        // import('...')
        new RegExp(`(import\\s*\\(\\s*['"])${escapeRegex(oldPath)}([^'"]*['"]\\s*\\))`, 'g'),
        // require('...')
        new RegExp(`(require\\s*\\(\\s*['"])${escapeRegex(oldPath)}([^'"]*['"]\\s*\\))`, 'g'),
      ];
      
      for (const pattern of patterns) {
        if (pattern.test(updatedContent)) {
          updatedContent = updatedContent.replace(pattern, `$1${newPath}$2`);
          hasChanges = true;
        }
      }
    }
    
    // 写回文件
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent);
      log(`✅ Updated imports in: ${path.relative(process.cwd(), filePath)}`, 'green');
      return true;
    }
    
    return false;
  } catch (error) {
    log(`❌ Error updating ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 扫描目录中的文件
 */
function scanDirectory(directory, projectType, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const updatedFiles = [];
  
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // 跳过特定目录
        if (['node_modules', '.git', 'dist', 'build', '.next', 'android', 'ios'].includes(item)) {
          continue;
        }
        scan(itemPath);
      } else if (stat.isFile()) {
        // 检查文件扩展名
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (updateImportsInFile(itemPath, projectType)) {
            updatedFiles.push(itemPath);
          }
        }
      }
    }
  }
  
  scan(directory);
  return updatedFiles;
}

/**
 * 分析导入依赖关系
 */
function analyzeImportDependencies(directory, projectType) {
  log('\n📊 Analyzing import dependencies...', 'cyan');
  
  const dependencies = new Map();
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  function analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(directory, filePath);
      
      // 提取所有导入语句
      const importRegex = /(?:import\s+.*?from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
      const imports = [];
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2] || match[3];
        if (importPath) {
          imports.push(importPath);
        }
      }
      
      dependencies.set(relativePath, imports);
    } catch (error) {
      log(`Error analyzing ${filePath}: ${error.message}`, 'red');
    }
  }
  
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next', 'android', 'ios'].includes(item)) {
          scan(itemPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          analyzeFile(itemPath);
        }
      }
    }
  }
  
  scan(directory);
  
  // 生成依赖关系报告
  const report = {
    totalFiles: dependencies.size,
    aliasUsage: new Map(),
    relativeImports: [],
    externalImports: [],
  };
  
  for (const [file, imports] of dependencies) {
    for (const importPath of imports) {
      if (importPath.startsWith('@')) {
        // 别名导入
        const aliasPrefix = importPath.split('/')[0];
        report.aliasUsage.set(aliasPrefix, (report.aliasUsage.get(aliasPrefix) || 0) + 1);
      } else if (importPath.startsWith('.')) {
        // 相对导入
        report.relativeImports.push({ file, import: importPath });
      } else {
        // 外部导入
        report.externalImports.push({ file, import: importPath });
      }
    }
  }
  
  return report;
}

/**
 * 生成依赖关系报告
 */
function generateDependencyReport(report, projectType) {
  log('\n📈 Import Dependency Report', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  log(`\n📁 Project: ${projectType}`, 'blue');
  log(`📄 Total files analyzed: ${report.totalFiles}`, 'blue');
  
  // 别名使用统计
  if (report.aliasUsage.size > 0) {
    log('\n🔗 Path alias usage:', 'blue');
    for (const [alias, count] of [...report.aliasUsage.entries()].sort((a, b) => b[1] - a[1])) {
      log(`  ${alias}: ${count} imports`, 'green');
    }
  }
  
  // 相对导入统计
  if (report.relativeImports.length > 0) {
    log(`\n📂 Relative imports: ${report.relativeImports.length}`, 'yellow');
    if (report.relativeImports.length <= 10) {
      report.relativeImports.forEach(({ file, import: imp }) => {
        log(`  ${file}: ${imp}`, 'yellow');
      });
    } else {
      log(`  (showing first 10 of ${report.relativeImports.length})`, 'yellow');
      report.relativeImports.slice(0, 10).forEach(({ file, import: imp }) => {
        log(`  ${file}: ${imp}`, 'yellow');
      });
    }
  }
  
  // 外部导入统计
  const externalPackages = new Map();
  report.externalImports.forEach(({ import: imp }) => {
    const packageName = imp.split('/')[0];
    externalPackages.set(packageName, (externalPackages.get(packageName) || 0) + 1);
  });
  
  if (externalPackages.size > 0) {
    log(`\n📦 External packages: ${externalPackages.size}`, 'blue');
    const topPackages = [...externalPackages.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    topPackages.forEach(([pkg, count]) => {
      log(`  ${pkg}: ${count} imports`, 'blue');
    });
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const projectType = args[1];
  
  log('🔗 SmarTalk Path Alias Updater', 'cyan');
  
  if (!command || !['update', 'analyze'].includes(command)) {
    log('Usage: node update-path-aliases.js <command> <project-type>', 'yellow');
    log('Commands:', 'yellow');
    log('  update <backend|mobile|web> - Update import statements', 'yellow');
    log('  analyze <backend|mobile|web> - Analyze import dependencies', 'yellow');
    return;
  }
  
  if (!projectType || !['backend', 'mobile', 'web'].includes(projectType)) {
    log('Error: Please specify project type (backend, mobile, web)', 'red');
    return;
  }
  
  const projectDir = path.join(process.cwd(), projectType);
  
  if (!fs.existsSync(projectDir)) {
    log(`Error: Project directory not found: ${projectDir}`, 'red');
    return;
  }
  
  log(`📂 Working on: ${projectType}`, 'blue');
  log(`📁 Directory: ${projectDir}`, 'blue');
  
  if (command === 'update') {
    log('\n🔄 Updating import statements...', 'cyan');
    const updatedFiles = scanDirectory(projectDir, projectType);
    
    if (updatedFiles.length > 0) {
      log(`\n✅ Updated ${updatedFiles.length} files`, 'green');
      log('💡 Remember to test your application after these changes', 'blue');
    } else {
      log('\n✅ No files needed updating', 'green');
    }
  } else if (command === 'analyze') {
    const report = analyzeImportDependencies(projectDir, projectType);
    generateDependencyReport(report, projectType);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  ALIAS_MAPPINGS,
  updateImportsInFile,
  scanDirectory,
  analyzeImportDependencies,
  generateDependencyReport,
};
