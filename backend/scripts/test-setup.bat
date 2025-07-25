@echo off
REM SmarTalk Backend 测试启动脚本 (Windows)
echo 🧪 Testing SmarTalk Backend Setup...

REM 检查Node.js版本
echo 📋 Checking Node.js version...
node -v
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    exit /b 1
)

REM 检查依赖是否安装
echo 📦 Checking dependencies...
if not exist "node_modules" (
    echo 📥 Installing dependencies...
    npm install
)

REM 检查环境变量文件
echo 🔧 Checking environment configuration...
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update .env file with your database configuration
)

REM 运行TypeScript编译检查
echo 🔍 Checking TypeScript compilation...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ TypeScript compilation failed
    exit /b 1
)
echo ✅ TypeScript compilation successful

REM 运行测试
echo 🧪 Running tests...
npm test
if %errorlevel% neq 0 (
    echo ❌ Some tests failed
    exit /b 1
)
echo ✅ All tests passed

REM 运行代码检查
echo 🔍 Running linter...
npm run lint
if %errorlevel% neq 0 (
    echo ⚠️  Linting issues found (non-blocking)
) else (
    echo ✅ Code linting passed
)

echo.
echo 🎉 Backend setup test completed successfully!
echo.
echo 📝 Next steps:
echo 1. Update .env file with your PostgreSQL database URL
echo 2. Run 'npm run db:push' to create database schema
echo 3. Run 'npm run db:seed' to populate initial data
echo 4. Run 'npm run dev' to start development server
echo.
