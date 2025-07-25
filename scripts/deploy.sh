#!/bin/bash

# SmarTalk 一键部署脚本
# 使用方法: ./scripts/deploy.sh [环境]
# 环境选项: development, staging, production

set -e

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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 命令未找到，请先安装"
        exit 1
    fi
}

# 检查环境变量
check_env_var() {
    if [ -z "${!1}" ]; then
        log_error "环境变量 $1 未设置"
        exit 1
    fi
}

# 获取部署环境
ENVIRONMENT=${1:-production}

log_info "开始部署 SmarTalk 到 $ENVIRONMENT 环境"

# 检查必需的命令
log_info "检查必需的工具..."
check_command "node"
check_command "npm"
check_command "git"

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ $NODE_VERSION -lt 18 ]; then
    log_error "Node.js 版本需要 >= 18，当前版本: $(node -v)"
    exit 1
fi

log_success "工具检查完成"

# 检查 Git 状态
log_info "检查 Git 状态..."
if [ -n "$(git status --porcelain)" ]; then
    log_warning "工作目录有未提交的更改"
    read -p "是否继续部署? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "部署已取消"
        exit 0
    fi
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
log_info "当前分支: $CURRENT_BRANCH"

# 安装依赖
log_info "安装项目依赖..."
npm install
log_success "依赖安装完成"

# 运行测试
log_info "运行测试..."
if npm test; then
    log_success "测试通过"
else
    log_error "测试失败，部署终止"
    exit 1
fi

# 构建项目
log_info "构建项目..."
if npm run build; then
    log_success "项目构建完成"
else
    log_error "项目构建失败"
    exit 1
fi

# 根据环境选择部署方式
case $ENVIRONMENT in
    "development")
        log_info "部署到开发环境..."
        # 本地开发环境
        npm run dev
        ;;
        
    "staging")
        log_info "部署到测试环境..."
        
        # 检查 Vercel CLI
        if command -v vercel &> /dev/null; then
            log_info "部署前端到 Vercel (staging)..."
            cd web
            vercel --confirm
            cd ..
        else
            log_warning "Vercel CLI 未安装，跳过前端部署"
        fi
        
        # 检查 Railway CLI
        if command -v railway &> /dev/null; then
            log_info "部署后端到 Railway (staging)..."
            cd backend
            railway up
            cd ..
        else
            log_warning "Railway CLI 未安装，跳过后端部署"
        fi
        ;;
        
    "production")
        log_info "部署到生产环境..."
        
        # 确认生产部署
        log_warning "即将部署到生产环境！"
        read -p "确认继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
        
        # 推送到主分支
        if [ "$CURRENT_BRANCH" != "main" ]; then
            log_warning "当前不在 main 分支，是否切换到 main 分支?"
            read -p "切换到 main 分支? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git checkout main
                git pull origin main
            fi
        fi
        
        # 推送代码触发自动部署
        log_info "推送代码到 GitHub..."
        git push origin main
        
        # 等待 GitHub Actions 完成
        log_info "GitHub Actions 将自动处理部署..."
        log_info "请访问 https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions 查看部署状态"
        
        # 检查 Vercel CLI
        if command -v vercel &> /dev/null; then
            log_info "部署前端到 Vercel (production)..."
            cd web
            vercel --prod --confirm
            cd ..
        fi
        
        # 检查 Railway CLI
        if command -v railway &> /dev/null; then
            log_info "部署后端到 Railway (production)..."
            cd backend
            railway up --environment production
            cd ..
        fi
        ;;
        
    *)
        log_error "未知的环境: $ENVIRONMENT"
        log_info "支持的环境: development, staging, production"
        exit 1
        ;;
esac

# 部署后检查
log_info "执行部署后检查..."

# 等待服务启动
sleep 10

# 检查前端
if [ "$ENVIRONMENT" = "production" ]; then
    FRONTEND_URL="https://smartalk.vercel.app"
    BACKEND_URL="https://smartalk-backend.railway.app"
else
    FRONTEND_URL="http://localhost:3000"
    BACKEND_URL="http://localhost:3001"
fi

log_info "检查前端服务..."
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    log_success "前端服务正常: $FRONTEND_URL"
else
    log_warning "前端服务检查失败: $FRONTEND_URL"
fi

log_info "检查后端服务..."
if curl -f -s "$BACKEND_URL/api/v1/health" > /dev/null; then
    log_success "后端服务正常: $BACKEND_URL"
else
    log_warning "后端服务检查失败: $BACKEND_URL"
fi

# 显示部署信息
log_success "部署完成！"
echo
echo "🌐 访问地址:"
echo "  前端: $FRONTEND_URL"
echo "  后端: $BACKEND_URL"
echo "  API 文档: $BACKEND_URL/api-docs"
echo
echo "📊 监控地址:"
echo "  Vercel Dashboard: https://vercel.com/dashboard"
echo "  Railway Dashboard: https://railway.app/dashboard"
echo
echo "📝 部署信息:"
echo "  环境: $ENVIRONMENT"
echo "  分支: $CURRENT_BRANCH"
echo "  时间: $(date)"
echo "  提交: $(git rev-parse --short HEAD)"

log_info "部署脚本执行完成"
