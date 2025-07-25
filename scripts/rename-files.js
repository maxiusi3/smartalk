#!/usr/bin/env node

/**
 * 文件重命名脚本
 * 根据命名规范重命名不符合标准的文件
 */

const fs = require('fs');
const path = require('path');

// 需要重命名的文件映射
const RENAME_MAP = {
  // 移动端组件文件
  'mobile/src/components/vtpr/vTPRScreen.tsx': 'mobile/src/components/vtpr/VTPRScreen.tsx',
  'mobile/src/components/vtpr/vTPRScreenOptimized.tsx': 'mobile/src/components/vtpr/VTPRScreenOptimized.tsx',
  
  // 类型文件（如果需要）
  'mobile/src/types/vtpr.types.ts': 'mobile/src/types/vtpr.types.ts', // 已符合规范
  
  // 工具函数文件（如果需要）
  'mobile/src/utils/ErrorHandler.ts': 'mobile/src/utils/errorHandler.ts',
  'backend/src/utils/validation.ts': 'backend/src/utils/validation.ts', // 已符合规范
};

// 需要更新导入的文件列表
const IMPORT_UPDATE_FILES = [
  'mobile/src/screens/LearningScreen.tsx',
  'mobile/src/navigation/AppNavigator.tsx',
  'mobile/src/components/vtpr/index.ts',
];

/**
 * 重命名单个文件
 */
function renameFile(oldPath, newPath) {
  const fullOldPath = path.join(__dirname, '..', oldPath);
  const fullNewPath = path.join(__dirname, '..', newPath);
  
  if (!fs.existsSync(fullOldPath)) {
    console.log(`⚠️  File not found: ${oldPath}`);
    return false;
  }
  
  if (fs.existsSync(fullNewPath)) {
    console.log(`⚠️  Target file already exists: ${newPath}`);
    return false;
  }
  
  try {
    // 确保目标目录存在
    const targetDir = path.dirname(fullNewPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 重命名文件
    fs.renameSync(fullOldPath, fullNewPath);
    console.log(`✅ Renamed: ${oldPath} → ${newPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to rename ${oldPath}:`, error.message);
    return false;
  }
}

/**
 * 更新文件中的导入语句
 */
function updateImports(filePath, oldImport, newImport) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found for import update: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // 更新相对导入
    content = content.replace(
      new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      newImport
    );
    
    // 更新别名导入
    const oldAlias = oldImport.replace(/^\.\//, '@/components/vtpr/');
    const newAlias = newImport.replace(/^\.\//, '@/components/vtpr/');
    content = content.replace(
      new RegExp(oldAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      newAlias
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated imports in: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No imports to update in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to update imports in ${filePath}:`, error.message);
    return false;
  }
}

/**
 * 扫描并更新所有相关的导入语句
 */
function updateAllImports() {
  console.log('\n📝 Updating import statements...\n');
  
  const updates = [
    {
      files: ['mobile/src/screens/LearningScreen.tsx'],
      oldImport: './components/vtpr/vTPRScreen',
      newImport: './components/vtpr/VTPRScreen'
    },
    {
      files: ['mobile/src/components/vtpr/index.ts'],
      oldImport: './vTPRScreen',
      newImport: './VTPRScreen'
    }
  ];
  
  updates.forEach(({ files, oldImport, newImport }) => {
    files.forEach(file => {
      updateImports(file, oldImport, newImport);
    });
  });
}

/**
 * 验证重命名结果
 */
function validateRenames() {
  console.log('\n🔍 Validating rename results...\n');
  
  let allValid = true;
  
  Object.entries(RENAME_MAP).forEach(([oldPath, newPath]) => {
    const fullOldPath = path.join(__dirname, '..', oldPath);
    const fullNewPath = path.join(__dirname, '..', newPath);
    
    if (fs.existsSync(fullOldPath)) {
      console.log(`❌ Old file still exists: ${oldPath}`);
      allValid = false;
    }
    
    if (!fs.existsSync(fullNewPath)) {
      console.log(`❌ New file not found: ${newPath}`);
      allValid = false;
    } else {
      console.log(`✅ Verified: ${newPath}`);
    }
  });
  
  return allValid;
}

/**
 * 主函数
 */
function main() {
  console.log('📁 SmarTalk File Renaming Script\n');
  console.log('=' * 40 + '\n');
  
  let renamedCount = 0;
  
  // 执行重命名
  console.log('🔄 Renaming files...\n');
  Object.entries(RENAME_MAP).forEach(([oldPath, newPath]) => {
    if (oldPath !== newPath && renameFile(oldPath, newPath)) {
      renamedCount++;
    }
  });
  
  // 更新导入语句
  updateAllImports();
  
  // 验证结果
  const isValid = validateRenames();
  
  // 总结
  console.log('\n📊 Summary');
  console.log('===========');
  console.log(`Files renamed: ${renamedCount}`);
  console.log(`Validation: ${isValid ? 'PASSED' : 'FAILED'}`);
  
  if (isValid && renamedCount > 0) {
    console.log('\n✅ File renaming completed successfully!');
    console.log('💡 Remember to:');
    console.log('   1. Run tests to ensure no breaking changes');
    console.log('   2. Update any remaining import statements manually');
    console.log('   3. Commit the changes to version control');
  } else if (renamedCount === 0) {
    console.log('\nℹ️  No files needed renaming - all files already follow naming conventions!');
  } else {
    console.log('\n❌ Some issues occurred during renaming. Please check the logs above.');
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { renameFile, updateImports, validateRenames };
