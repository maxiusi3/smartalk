#!/bin/bash

# SmarTalk Backend 测试启动脚本
echo "🧪 Testing SmarTalk Backend Setup..."

# 检查Node.js版本
echo "📋 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

if [[ "$node_version" < "v18" ]]; then
    echo "❌ Node.js version must be >= 18.0.0"
    exit 1
fi

# 检查依赖是否安装
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# 检查环境变量文件
echo "🔧 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your database configuration"
fi

# 运行TypeScript编译检查
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# 运行测试
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed"
else
    echo "❌ Some tests failed"
    exit 1
fi

# 运行代码检查
echo "🔍 Running linter..."
npm run lint

if [ $? -eq 0 ]; then
    echo "✅ Code linting passed"
else
    echo "⚠️  Linting issues found (non-blocking)"
fi

echo ""
echo "🎉 Backend setup test completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env file with your PostgreSQL database URL"
echo "2. Run 'npm run db:push' to create database schema"
echo "3. Run 'npm run db:seed' to populate initial data"
echo "4. Run 'npm run dev' to start development server"
echo ""
