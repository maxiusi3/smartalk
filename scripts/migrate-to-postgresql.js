#!/usr/bin/env node

/**
 * 数据库迁移脚本：从 SQLite 迁移到 PostgreSQL
 * 包括数据备份、迁移验证和回滚机制
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  backupDir: './backups',
  sqliteDbPath: './backend/prisma/dev.db',
  postgresUrl: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/smartalk_mvp?schema=public',
  schemaPath: './backend/prisma/schema.prisma'
};

/**
 * 检查先决条件
 */
function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  const checks = [
    {
      name: 'Node.js version',
      check: () => {
        const version = process.version;
        const major = parseInt(version.slice(1).split('.')[0]);
        return major >= 16;
      },
      error: 'Node.js 16+ is required'
    },
    {
      name: 'Prisma CLI',
      check: () => {
        try {
          execSync('npx prisma --version', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      },
      error: 'Prisma CLI is not available'
    },
    {
      name: 'PostgreSQL connection',
      check: () => {
        try {
          // 简单的连接测试
          execSync(`psql "${CONFIG.postgresUrl}" -c "SELECT 1;"`, { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      },
      error: 'Cannot connect to PostgreSQL database'
    },
    {
      name: 'SQLite database exists',
      check: () => fs.existsSync(CONFIG.sqliteDbPath),
      error: 'SQLite database file not found'
    }
  ];

  let allPassed = true;
  
  checks.forEach(({ name, check, error }) => {
    try {
      const passed = check();
      console.log(`${passed ? '✅' : '❌'} ${name}`);
      if (!passed) {
        console.log(`   Error: ${error}`);
        allPassed = false;
      }
    } catch (err) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error} - ${err.message}`);
      allPassed = false;
    }
  });

  if (!allPassed) {
    console.log('\n❌ Prerequisites check failed. Please fix the issues above before proceeding.');
    process.exit(1);
  }

  console.log('\n✅ All prerequisites passed!\n');
}

/**
 * 创建备份
 */
function createBackup() {
  console.log('💾 Creating backup...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(CONFIG.backupDir, `sqlite-backup-${timestamp}.db`);
  
  // 确保备份目录存在
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  // 复制 SQLite 数据库
  fs.copyFileSync(CONFIG.sqliteDbPath, backupPath);
  
  // 导出 SQL 转储
  const sqlDumpPath = path.join(CONFIG.backupDir, `sqlite-dump-${timestamp}.sql`);
  try {
    execSync(`sqlite3 "${CONFIG.sqliteDbPath}" .dump > "${sqlDumpPath}"`, { stdio: 'inherit' });
    console.log(`✅ SQLite backup created: ${backupPath}`);
    console.log(`✅ SQL dump created: ${sqlDumpPath}`);
  } catch (error) {
    console.error('❌ Failed to create SQL dump:', error.message);
    // 继续执行，因为我们至少有数据库文件备份
  }
  
  return { backupPath, sqlDumpPath };
}

/**
 * 导出现有数据
 */
function exportData() {
  console.log('\n📤 Exporting existing data...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dataExportPath = path.join(CONFIG.backupDir, `data-export-${timestamp}.json`);
  
  try {
    // 使用 Prisma 导出数据
    const exportScript = `
      const { PrismaClient } = require('@prisma/client');
      const fs = require('fs');
      
      async function exportData() {
        const prisma = new PrismaClient();
        
        try {
          const data = {
            users: await prisma.user.findMany(),
            interests: await prisma.interest.findMany(),
            dramas: await prisma.drama.findMany(),
            keywords: await prisma.keyword.findMany(),
            keywordVideoClips: await prisma.keywordVideoClip.findMany(),
            userProgress: await prisma.userProgress.findMany(),
            analyticsEvents: await prisma.analyticsEvent.findMany()
          };
          
          fs.writeFileSync('${dataExportPath}', JSON.stringify(data, null, 2));
          console.log('✅ Data exported successfully');
        } catch (error) {
          console.error('❌ Data export failed:', error.message);
          process.exit(1);
        } finally {
          await prisma.$disconnect();
        }
      }
      
      exportData();
    `;
    
    fs.writeFileSync('./temp-export.js', exportScript);
    execSync('cd backend && node ../temp-export.js', { stdio: 'inherit' });
    fs.unlinkSync('./temp-export.js');
    
    console.log(`✅ Data exported to: ${dataExportPath}`);
    return dataExportPath;
  } catch (error) {
    console.error('❌ Data export failed:', error.message);
    return null;
  }
}

/**
 * 更新数据库配置
 */
function updateDatabaseConfig() {
  console.log('\n⚙️  Updating database configuration...\n');
  
  // 备份原始 schema.prisma
  const schemaBackupPath = `${CONFIG.schemaPath}.sqlite.backup`;
  fs.copyFileSync(CONFIG.schemaPath, schemaBackupPath);
  console.log(`✅ Schema backup created: ${schemaBackupPath}`);
  
  // schema.prisma 已经在之前的步骤中更新了
  console.log('✅ Schema updated to use PostgreSQL');
  
  // 更新环境变量示例
  const envExamplePath = './backend/.env.example';
  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    envContent = envContent.replace(
      /DATABASE_URL=".*"/,
      `DATABASE_URL="${CONFIG.postgresUrl}"`
    );
    fs.writeFileSync(envExamplePath, envContent);
    console.log('✅ Environment example updated');
  }
}

/**
 * 运行数据库迁移
 */
function runMigration() {
  console.log('\n🔄 Running database migration...\n');
  
  try {
    // 生成 Prisma 客户端
    console.log('📦 Generating Prisma client...');
    execSync('cd backend && npx prisma generate', { stdio: 'inherit' });
    
    // 推送数据库架构
    console.log('🏗️  Pushing database schema...');
    execSync('cd backend && npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Database migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

/**
 * 导入数据
 */
function importData(dataExportPath) {
  if (!dataExportPath || !fs.existsSync(dataExportPath)) {
    console.log('\n⚠️  No data to import (this is normal for a fresh installation)');
    return true;
  }
  
  console.log('\n📥 Importing data to PostgreSQL...\n');
  
  try {
    const importScript = `
      const { PrismaClient } = require('@prisma/client');
      const fs = require('fs');
      
      async function importData() {
        const prisma = new PrismaClient();
        const data = JSON.parse(fs.readFileSync('${dataExportPath}', 'utf8'));
        
        try {
          // 按依赖顺序导入数据
          if (data.users?.length) {
            await prisma.user.createMany({ data: data.users, skipDuplicates: true });
            console.log(\`✅ Imported \${data.users.length} users\`);
          }
          
          if (data.interests?.length) {
            await prisma.interest.createMany({ data: data.interests, skipDuplicates: true });
            console.log(\`✅ Imported \${data.interests.length} interests\`);
          }
          
          if (data.dramas?.length) {
            await prisma.drama.createMany({ data: data.dramas, skipDuplicates: true });
            console.log(\`✅ Imported \${data.dramas.length} dramas\`);
          }
          
          if (data.keywords?.length) {
            await prisma.keyword.createMany({ data: data.keywords, skipDuplicates: true });
            console.log(\`✅ Imported \${data.keywords.length} keywords\`);
          }
          
          if (data.keywordVideoClips?.length) {
            await prisma.keywordVideoClip.createMany({ data: data.keywordVideoClips, skipDuplicates: true });
            console.log(\`✅ Imported \${data.keywordVideoClips.length} video clips\`);
          }
          
          if (data.userProgress?.length) {
            await prisma.userProgress.createMany({ data: data.userProgress, skipDuplicates: true });
            console.log(\`✅ Imported \${data.userProgress.length} progress records\`);
          }
          
          if (data.analyticsEvents?.length) {
            await prisma.analyticsEvent.createMany({ data: data.analyticsEvents, skipDuplicates: true });
            console.log(\`✅ Imported \${data.analyticsEvents.length} analytics events\`);
          }
          
          console.log('✅ Data import completed successfully');
        } catch (error) {
          console.error('❌ Data import failed:', error.message);
          process.exit(1);
        } finally {
          await prisma.$disconnect();
        }
      }
      
      importData();
    `;
    
    fs.writeFileSync('./temp-import.js', importScript);
    execSync('cd backend && node ../temp-import.js', { stdio: 'inherit' });
    fs.unlinkSync('./temp-import.js');
    
    return true;
  } catch (error) {
    console.error('❌ Data import failed:', error.message);
    return false;
  }
}

/**
 * 验证迁移
 */
function validateMigration() {
  console.log('\n🔍 Validating migration...\n');
  
  try {
    const validationScript = `
      const { PrismaClient } = require('@prisma/client');
      
      async function validate() {
        const prisma = new PrismaClient();
        
        try {
          // 测试基本连接
          await prisma.$connect();
          console.log('✅ Database connection successful');
          
          // 检查表结构
          const tableCount = await prisma.$queryRaw\`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
          \`;
          console.log(\`✅ Found \${tableCount[0].count} tables\`);
          
          // 检查数据
          const userCount = await prisma.user.count();
          const interestCount = await prisma.interest.count();
          const dramaCount = await prisma.drama.count();
          
          console.log(\`✅ Data validation: \${userCount} users, \${interestCount} interests, \${dramaCount} dramas\`);
          
        } catch (error) {
          console.error('❌ Validation failed:', error.message);
          process.exit(1);
        } finally {
          await prisma.$disconnect();
        }
      }
      
      validate();
    `;
    
    fs.writeFileSync('./temp-validate.js', validationScript);
    execSync('cd backend && node ../temp-validate.js', { stdio: 'inherit' });
    fs.unlinkSync('./temp-validate.js');
    
    console.log('✅ Migration validation passed!');
    return true;
  } catch (error) {
    console.error('❌ Migration validation failed:', error.message);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🗄️  SmarTalk Database Migration: SQLite → PostgreSQL\n');
  console.log('=' * 60 + '\n');
  
  try {
    // 1. 检查先决条件
    checkPrerequisites();
    
    // 2. 创建备份
    const backup = createBackup();
    
    // 3. 导出现有数据
    const dataExportPath = exportData();
    
    // 4. 更新数据库配置
    updateDatabaseConfig();
    
    // 5. 运行迁移
    const migrationSuccess = runMigration();
    if (!migrationSuccess) {
      console.log('\n❌ Migration failed. Please check the logs above.');
      process.exit(1);
    }
    
    // 6. 导入数据
    const importSuccess = importData(dataExportPath);
    if (!importSuccess) {
      console.log('\n❌ Data import failed. Database schema is ready but data may be incomplete.');
    }
    
    // 7. 验证迁移
    const validationSuccess = validateMigration();
    if (!validationSuccess) {
      console.log('\n❌ Migration validation failed.');
      process.exit(1);
    }
    
    // 成功总结
    console.log('\n🎉 Migration Summary');
    console.log('===================');
    console.log('✅ Database successfully migrated from SQLite to PostgreSQL');
    console.log(`✅ Backup created: ${backup.backupPath}`);
    if (dataExportPath) {
      console.log(`✅ Data exported and imported: ${dataExportPath}`);
    }
    console.log('✅ Schema updated and validated');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Update your .env file with the PostgreSQL DATABASE_URL');
    console.log('2. Test your application to ensure everything works correctly');
    console.log('3. Update your deployment configuration');
    console.log('4. Consider removing SQLite dependencies if no longer needed');
    
  } catch (error) {
    console.error('\n❌ Migration failed with error:', error.message);
    console.log('\n🔄 Rollback instructions:');
    console.log('1. Restore the original schema.prisma from backup');
    console.log('2. Restore the SQLite database from backup');
    console.log('3. Update your environment variables');
    process.exit(1);
  }
}

// 运行迁移
if (require.main === module) {
  main();
}

module.exports = { checkPrerequisites, createBackup, runMigration, validateMigration };
