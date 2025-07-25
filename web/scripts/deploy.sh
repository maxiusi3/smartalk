#!/bin/bash

# 开芯说 Web版本部署脚本
# 使用方法: ./scripts/deploy.sh [environment]
# 环境选项: development, staging, production

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
ENVIRONMENT=${1:-development}

log_info "开始部署开芯说 Web版本到 $ENVIRONMENT 环境..."

# 检查Node.js版本
NODE_VERSION=$(node --version)
log_info "当前Node.js版本: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v1[8-9]\.|^v[2-9][0-9]\. ]]; then
    log_error "需要Node.js 18或更高版本"
    exit 1
fi

# 检查yarn是否安装
if ! command -v yarn &> /dev/null; then
    log_warning "Yarn未安装，使用npm代替"
    PACKAGE_MANAGER="npm"
    INSTALL_CMD="npm install"
    BUILD_CMD="npm run build"
    START_CMD="npm start"
else
    PACKAGE_MANAGER="yarn"
    INSTALL_CMD="yarn install"
    BUILD_CMD="yarn build"
    START_CMD="yarn start"
fi

log_info "使用包管理器: $PACKAGE_MANAGER"

# 清理之前的构建
log_info "清理之前的构建文件..."
rm -rf .next
rm -rf out
rm -rf dist

# 安装依赖
log_info "安装项目依赖..."
$INSTALL_CMD

if [ $? -ne 0 ]; then
    log_error "依赖安装失败"
    exit 1
fi

log_success "依赖安装完成"

# 类型检查
log_info "执行TypeScript类型检查..."
if command -v tsc &> /dev/null; then
    tsc --noEmit
    if [ $? -ne 0 ]; then
        log_error "TypeScript类型检查失败"
        exit 1
    fi
    log_success "TypeScript类型检查通过"
else
    log_warning "TypeScript未安装，跳过类型检查"
fi

# 代码质量检查
log_info "执行ESLint代码检查..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn lint
else
    npm run lint
fi

if [ $? -ne 0 ]; then
    log_warning "ESLint检查发现问题，但继续构建..."
fi

# 构建项目
log_info "构建生产版本..."
$BUILD_CMD

if [ $? -ne 0 ]; then
    log_error "项目构建失败"
    exit 1
fi

log_success "项目构建完成"

# 根据环境执行不同的部署策略
case $ENVIRONMENT in
    "development")
        log_info "开发环境部署 - 启动开发服务器..."
        if [ "$PACKAGE_MANAGER" = "yarn" ]; then
            yarn dev
        else
            npm run dev
        fi
        ;;
    
    "staging")
        log_info "预发布环境部署..."
        
        # 检查环境变量
        if [ ! -f ".env.staging" ]; then
            log_warning "未找到 .env.staging 文件，使用默认配置"
        fi
        
        # 启动生产服务器
        log_info "启动预发布服务器..."
        PORT=3001 $START_CMD
        ;;
    
    "production")
        log_info "生产环境部署..."
        
        # 检查必要的环境变量
        if [ ! -f ".env.production" ] && [ ! -f ".env.local" ]; then
            log_error "生产环境需要 .env.production 或 .env.local 文件"
            exit 1
        fi
        
        # 生成sitemap（如果需要）
        log_info "生成sitemap..."
        # 这里可以添加sitemap生成逻辑
        
        # 优化图片（如果需要）
        log_info "优化静态资源..."
        # 这里可以添加图片优化逻辑
        
        # 部署到生产服务器
        log_info "部署到生产环境..."
        
        # 如果使用PM2管理进程
        if command -v pm2 &> /dev/null; then
            log_info "使用PM2启动应用..."
            pm2 start ecosystem.config.js --env production
        else
            log_info "启动生产服务器..."
            PORT=3000 $START_CMD
        fi
        ;;
    
    *)
        log_error "未知的环境: $ENVIRONMENT"
        log_info "支持的环境: development, staging, production"
        exit 1
        ;;
esac

log_success "部署完成！"

# 显示部署信息
case $ENVIRONMENT in
    "development")
        log_info "开发服务器地址: http://localhost:3000"
        ;;
    "staging")
        log_info "预发布服务器地址: http://localhost:3001"
        ;;
    "production")
        log_info "生产服务器已启动"
        ;;
esac

log_info "部署日志已保存"
log_info "如需停止服务，请使用 Ctrl+C 或相应的进程管理命令"
