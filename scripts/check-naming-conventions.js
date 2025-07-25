#!/usr/bin/env node

/**
 * 命名规范检查脚本
 * 检查项目中的文件和代码是否符合命名规范
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
 * 命名规范检查规则
 */
const namingRules = {
  // React 组件文件应该使用 PascalCase
  reactComponents: {
    pattern: /\.(tsx|jsx)$/,
    check: (filename) => {
      const baseName = path.basename(filename, path.extname(filename));
      return /^[A-Z][a-zA-Z0-9]*$/.test(baseName);
    },
    message: 'React component files should use PascalCase',
    directories: ['components', 'screens', 'pages'],
  },

  // 工具和服务文件应该使用 camelCase
  utilities: {
    pattern: /\.(ts|js)$/,
    check: (filename) => {
      const baseName = path.basename(filename, path.extname(filename));
      // 排除特殊文件
      if (['index', 'config'].includes(baseName)) return true;
      return /^[a-z][a-zA-Z0-9]*$/.test(baseName);
    },
    message: 'Utility files should use camelCase',
    directories: ['utils', 'services', 'hooks', 'lib'],
  },

  // 类型文件应该使用 camelCase.types
  typeFiles: {
    pattern: /\.types\.(ts|js)$/,
    check: (filename) => {
      const baseName = path.basename(filename, '.types.ts') || path.basename(filename, '.types.js');
      return /^[a-z][a-zA-Z0-9]*$/.test(baseName);
    },
    message: 'Type files should use camelCase.types.ts',
    directories: ['types', 'src'],
  },

  // 测试文件应该与源文件命名一致
  testFiles: {
    pattern: /\.(test|spec)\.(tsx?|jsx?)$/,
    check: (filename) => {
      const parts = filename.split('.');
      const baseName = parts[0];
      const extension = parts.slice(1).join('.');
      
      if (extension.includes('tsx') || extension.includes('jsx')) {
        return /^[A-Z][a-zA-Z0-9]*$/.test(baseName);
      } else {
        return /^[a-z][a-zA-Z0-9]*$/.test(baseName);
      }
    },
    message: 'Test files should match their source file naming convention',
    directories: ['__tests__', 'tests', 'src'],
  },

  // 目录应该使用 kebab-case
  directories: {
    check: (dirname) => {
      // 排除特殊目录
      const excluded = ['node_modules', '.git', '.next', 'dist', 'build', '__tests__'];
      if (excluded.includes(dirname)) return true;
      
      return /^[a-z][a-z0-9-]*$/.test(dirname);
    },
    message: 'Directories should use kebab-case',
  },
};

/**
 * 扫描文件和目录
 */
function scanDirectory(directory, issues = []) {
  if (!fs.existsSync(directory)) {
    log(`Directory not found: ${directory}`, 'red');
    return issues;
  }

  const items = fs.readdirSync(directory);

  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // 检查目录命名
      if (!namingRules.directories.check(item)) {
        issues.push({
          type: 'directory',
          path: itemPath,
          issue: namingRules.directories.message,
          suggestion: convertToKebabCase(item),
        });
      }

      // 递归检查子目录
      scanDirectory(itemPath, issues);
    } else if (stat.isFile()) {
      // 检查文件命名
      checkFileNaming(itemPath, item, issues);
    }
  }

  return issues;
}

/**
 * 检查文件命名
 */
function checkFileNaming(filePath, filename, issues) {
  for (const [ruleName, rule] of Object.entries(namingRules)) {
    if (ruleName === 'directories') continue;

    if (rule.pattern && rule.pattern.test(filename)) {
      // 检查是否在目标目录中
      const inTargetDir = !rule.directories || rule.directories.some(dir =>
        filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)
      );

      if (inTargetDir && !rule.check(filename)) {
        issues.push({
          type: 'file',
          path: filePath,
          issue: rule.message,
          suggestion: getSuggestion(filename, ruleName),
        });
      }
    }
  }
}

/**
 * 获取命名建议
 */
function getSuggestion(filename, ruleName) {
  const baseName = path.basename(filename, path.extname(filename));
  const extension = path.extname(filename);

  switch (ruleName) {
    case 'reactComponents':
      return toPascalCase(baseName) + extension;
    case 'utilities':
      return toCamelCase(baseName) + extension;
    case 'typeFiles':
      const typeBaseName = baseName.replace(/\.types$/, '');
      return toCamelCase(typeBaseName) + '.types' + extension;
    case 'testFiles':
      const parts = filename.split('.');
      const testBaseName = parts[0];
      const testExtension = parts.slice(1).join('.');
      
      if (testExtension.includes('tsx') || testExtension.includes('jsx')) {
        return toPascalCase(testBaseName) + '.' + testExtension;
      } else {
        return toCamelCase(testBaseName) + '.' + testExtension;
      }
    default:
      return filename;
  }
}

/**
 * 命名转换函数
 */
function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^(.)/, (_, char) => char.toUpperCase());
}

function toCamelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}

function convertToKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 检查代码中的命名规范
 */
function checkCodeNaming(filePath, issues) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // 检查变量命名
      const varMatches = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
      if (varMatches) {
        varMatches.forEach(match => {
          const varName = match.split(/\s+/)[1];
          if (!/^[a-z][a-zA-Z0-9]*$/.test(varName) && !/^[A-Z][A-Z0-9_]*$/.test(varName)) {
            issues.push({
              type: 'variable',
              path: filePath,
              line: index + 1,
              issue: `Variable "${varName}" should use camelCase or SCREAMING_SNAKE_CASE for constants`,
              suggestion: toCamelCase(varName),
            });
          }
        });
      }

      // 检查函数命名
      const funcMatches = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
      if (funcMatches) {
        funcMatches.forEach(match => {
          const funcName = match.split(/\s+/)[1];
          if (!/^[a-z][a-zA-Z0-9]*$/.test(funcName)) {
            issues.push({
              type: 'function',
              path: filePath,
              line: index + 1,
              issue: `Function "${funcName}" should use camelCase`,
              suggestion: toCamelCase(funcName),
            });
          }
        });
      }

      // 检查组件命名
      const componentMatches = line.match(/(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)\s*=.*?(?:React\.FC|=>)/);
      if (componentMatches) {
        const componentName = componentMatches[1];
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
          issues.push({
            type: 'component',
            path: filePath,
            line: index + 1,
            issue: `Component "${componentName}" should use PascalCase`,
            suggestion: toPascalCase(componentName),
          });
        }
      }
    });
  } catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`, 'red');
  }
}

/**
 * 生成报告
 */
function generateReport(issues) {
  log('\n📊 Naming Convention Check Report', 'cyan');
  log('=' .repeat(50), 'cyan');

  if (issues.length === 0) {
    log('✅ No naming convention issues found!', 'green');
    return;
  }

  // 按类型分组
  const groupedIssues = issues.reduce((groups, issue) => {
    const type = issue.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(issue);
    return groups;
  }, {});

  // 显示统计
  log(`\n📈 Summary: ${issues.length} issues found`, 'yellow');
  for (const [type, typeIssues] of Object.entries(groupedIssues)) {
    log(`  ${type}: ${typeIssues.length} issues`, 'blue');
  }

  // 显示详细问题
  for (const [type, typeIssues] of Object.entries(groupedIssues)) {
    log(`\n🔍 ${type.toUpperCase()} Issues:`, 'yellow');
    
    typeIssues.forEach((issue, index) => {
      log(`\n${index + 1}. ${issue.path}`, 'red');
      if (issue.line) {
        log(`   Line ${issue.line}`, 'blue');
      }
      log(`   Issue: ${issue.issue}`, 'yellow');
      if (issue.suggestion) {
        log(`   Suggestion: ${issue.suggestion}`, 'green');
      }
    });
  }

  log('\n💡 Tips:', 'cyan');
  log('  - Use the rename-files.js script to fix file naming issues', 'blue');
  log('  - Configure ESLint rules to catch naming issues during development', 'blue');
  log('  - Review the naming conventions guide: docs/guides/naming-conventions.md', 'blue');
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const targetDirectory = args[0] || '.';
  const checkCode = args.includes('--check-code');

  log('🔍 SmarTalk Naming Convention Checker', 'cyan');
  log(`📂 Checking directory: ${path.resolve(targetDirectory)}`, 'blue');

  const issues = [];

  // 扫描文件和目录命名
  log('\n📁 Checking file and directory names...', 'cyan');
  scanDirectory(targetDirectory, issues);

  // 检查代码命名（可选）
  if (checkCode) {
    log('\n💻 Checking code naming conventions...', 'cyan');
    
    function checkCodeInDirectory(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
          checkCodeInDirectory(itemPath);
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
          checkCodeNaming(itemPath, issues);
        }
      }
    }
    
    checkCodeInDirectory(targetDirectory);
  }

  // 生成报告
  generateReport(issues);

  // 退出码
  process.exit(issues.length > 0 ? 1 : 0);
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  namingRules,
  scanDirectory,
  checkFileNaming,
  checkCodeNaming,
  generateReport,
};
