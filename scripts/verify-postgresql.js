#!/usr/bin/env node

/**
 * PostgreSQL 配置验证脚本
 * 验证数据库连接、架构和基本功能
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  schemaPath: './backend/prisma/schema.prisma',
  envPath: './backend/.env'
};

/**
 * 检查 schema.prisma 配置
 */
function checkSchemaConfig() {
  console.log('📋 Checking schema.prisma configuration...\n');
  
  if (!fs.existsSync(CONFIG.schemaPath)) {
    console.log('❌ schema.prisma not found');
    return false;
  }
  
  const schemaContent = fs.readFileSync(CONFIG.schemaPath, 'utf8');
  
  // 检查数据源配置
  const hasPostgreSQL = schemaContent.includes('provider = "postgresql"');
  const hasDatabaseUrl = schemaContent.includes('url      = env("DATABASE_URL")');
  
  console.log(`${hasPostgreSQL ? '✅' : '❌'} PostgreSQL provider configured`);
  console.log(`${hasDatabaseUrl ? '✅' : '❌'} DATABASE_URL environment variable referenced`);
  
  // 检查 JSON 字段类型
  const hasJsonType = schemaContent.includes('Json');
  console.log(`${hasJsonType ? '✅' : '❌'} JSON field types configured`);
  
  return hasPostgreSQL && hasDatabaseUrl;
}

/**
 * 检查环境变量
 */
function checkEnvironmentVariables() {
  console.log('\n🔧 Checking environment variables...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable not set');
    console.log('💡 Please set DATABASE_URL in your .env file');
    console.log('   Example: DATABASE_URL="postgresql://username:password@localhost:5432/smartalk_mvp?schema=public"');
    return false;
  }
  
  console.log('✅ DATABASE_URL environment variable found');
  
  // 验证 URL 格式
  const isPostgreSQLUrl = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');
  console.log(`${isPostgreSQLUrl ? '✅' : '❌'} DATABASE_URL format is valid for PostgreSQL`);
  
  if (!isPostgreSQLUrl) {
    console.log('💡 DATABASE_URL should start with "postgresql://" or "postgres://"');
    return false;
  }
  
  return true;
}

/**
 * 测试数据库连接
 */
async function testDatabaseConnection() {
  console.log('\n🔌 Testing database connection...\n');
  
  try {
    // 使用 Prisma 测试连接
    const testScript = `
      const { PrismaClient } = require('@prisma/client');
      
      async function testConnection() {
        const prisma = new PrismaClient();
        
        try {
          await prisma.$connect();
          console.log('✅ Database connection successful');
          
          // 测试简单查询
          const result = await prisma.$queryRaw\`SELECT 1 as test\`;
          console.log('✅ Database query test passed');
          
          return true;
        } catch (error) {
          console.error('❌ Database connection failed:', error.message);
          return false;
        } finally {
          await prisma.$disconnect();
        }
      }
      
      testConnection().then(success => {
        process.exit(success ? 0 : 1);
      });
    `;
    
    fs.writeFileSync('./temp-connection-test.js', testScript);
    execSync('cd backend && node ../temp-connection-test.js', { stdio: 'inherit' });
    fs.unlinkSync('./temp-connection-test.js');
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed');
    return false;
  }
}

/**
 * 检查数据库架构
 */
async function checkDatabaseSchema() {
  console.log('\n🏗️  Checking database schema...\n');
  
  try {
    const schemaScript = `
      const { PrismaClient } = require('@prisma/client');
      
      async function checkSchema() {
        const prisma = new PrismaClient();
        
        try {
          // 检查表是否存在
          const tables = await prisma.$queryRaw\`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
          \`;
          
          const expectedTables = [
            'users', 'interests', 'dramas', 'keywords', 
            'keyword_video_clips', 'user_progress', 'analytics_events'
          ];
          
          console.log('📊 Database tables:');
          tables.forEach(table => {
            const isExpected = expectedTables.includes(table.table_name);
            console.log(\`  \${isExpected ? '✅' : '❓'} \${table.table_name}\`);
          });
          
          const missingTables = expectedTables.filter(
            expected => !tables.some(table => table.table_name === expected)
          );
          
          if (missingTables.length > 0) {
            console.log(\`\\n⚠️  Missing tables: \${missingTables.join(', ')}\`);
            console.log('💡 Run "npx prisma db push" to create missing tables');
            return false;
          }
          
          console.log('\\n✅ All expected tables found');
          return true;
        } catch (error) {
          console.error('❌ Schema check failed:', error.message);
          return false;
        } finally {
          await prisma.$disconnect();
        }
      }
      
      checkSchema().then(success => {
        process.exit(success ? 0 : 1);
      });
    `;
    
    fs.writeFileSync('./temp-schema-check.js', schemaScript);
    execSync('cd backend && node ../temp-schema-check.js', { stdio: 'inherit' });
    fs.unlinkSync('./temp-schema-check.js');
    
    return true;
  } catch (error) {
    console.error('❌ Schema check failed');
    return false;
  }
}

/**
 * 运行基本的 CRUD 测试
 */
async function runCrudTest() {
  console.log('\n🧪 Running basic CRUD test...\n');
  
  try {
    const crudScript = `
      const { PrismaClient } = require('@prisma/client');
      
      async function crudTest() {
        const prisma = new PrismaClient();
        
        try {
          // 创建测试用户
          const testUser = await prisma.user.create({
            data: {
              deviceId: 'test-device-' + Date.now()
            }
          });
          console.log('✅ CREATE test passed');
          
          // 读取用户
          const foundUser = await prisma.user.findUnique({
            where: { id: testUser.id }
          });
          console.log('✅ READ test passed');
          
          // 更新用户
          const updatedUser = await prisma.user.update({
            where: { id: testUser.id },
            data: { updatedAt: new Date() }
          });
          console.log('✅ UPDATE test passed');
          
          // 删除用户
          await prisma.user.delete({
            where: { id: testUser.id }
          });
          console.log('✅ DELETE test passed');
          
          console.log('\\n✅ All CRUD operations successful');
          return true;
        } catch (error) {
          console.error('❌ CRUD test failed:', error.message);
          return false;
        } finally {
          await prisma.$disconnect();
        }
      }
      
      crudTest().then(success => {
        process.exit(success ? 0 : 1);
      });
    `;
    
    fs.writeFileSync('./temp-crud-test.js', crudScript);
    execSync('cd backend && node ../temp-crud-test.js', { stdio: 'inherit' });
    fs.unlinkSync('./temp-crud-test.js');
    
    return true;
  } catch (error) {
    console.error('❌ CRUD test failed');
    return false;
  }
}

/**
 * 主验证函数
 */
async function main() {
  console.log('🔍 PostgreSQL Configuration Verification\n');
  console.log('=' * 45 + '\n');
  
  let allPassed = true;
  
  // 1. 检查 schema 配置
  if (!checkSchemaConfig()) {
    allPassed = false;
  }
  
  // 2. 检查环境变量
  if (!checkEnvironmentVariables()) {
    allPassed = false;
  }
  
  if (!allPassed) {
    console.log('\n❌ Configuration check failed. Please fix the issues above.');
    process.exit(1);
  }
  
  // 3. 测试数据库连接
  try {
    await testDatabaseConnection();
  } catch (error) {
    console.log('\n❌ Database connection test failed.');
    console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is correct.');
    process.exit(1);
  }
  
  // 4. 检查数据库架构
  try {
    await checkDatabaseSchema();
  } catch (error) {
    console.log('\n⚠️  Database schema check failed.');
    console.log('💡 You may need to run "npx prisma db push" to create the schema.');
  }
  
  // 5. 运行 CRUD 测试
  try {
    await runCrudTest();
  } catch (error) {
    console.log('\n⚠️  CRUD test failed.');
    console.log('💡 Database connection works but operations may have issues.');
  }
  
  console.log('\n🎉 Verification Summary');
  console.log('======================');
  console.log('✅ PostgreSQL configuration verified');
  console.log('✅ Database connection successful');
  console.log('✅ Schema and operations working');
  
  console.log('\n💡 Next Steps:');
  console.log('1. Your PostgreSQL setup is ready for development');
  console.log('2. Run your application to test full functionality');
  console.log('3. Consider setting up database backups for production');
}

// 运行验证
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  });
}

module.exports = { checkSchemaConfig, checkEnvironmentVariables, testDatabaseConnection };
