#!/bin/bash

# SmarTalk 开发环境一键启动脚本
# 支持启动后端、移动端、Web端或全部服务

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

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 16+"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    # 检查 Node.js 版本
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js 版本过低，需要 16+，当前版本: $(node -v)"
        exit 1
    fi
    
    log_success "系统依赖检查通过"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 根目录依赖
    if [ -f "package.json" ]; then
        log_info "安装根目录依赖..."
        npm install
    fi
    
    # 后端依赖
    if [ -f "backend/package.json" ]; then
        log_info "安装后端依赖..."
        cd backend && npm install && cd ..
    fi
    
    # 移动端依赖
    if [ -f "mobile/package.json" ]; then
        log_info "安装移动端依赖..."
        cd mobile && npm install && cd ..
    fi
    
    # Web端依赖
    if [ -f "web/package.json" ]; then
        log_info "安装Web端依赖..."
        cd web && npm install && cd ..
    fi
    
    log_success "依赖安装完成"
}

# 环境检查
check_environment() {
    log_info "检查环境配置..."
    
    # 检查后端环境变量
    if [ ! -f "backend/.env" ]; then
        log_warning "后端 .env 文件不存在，从模板创建..."
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            log_info "请编辑 backend/.env 文件配置数据库连接"
        else
            log_error "backend/.env.example 模板文件不存在"
        fi
    fi
    
    # 检查数据库连接
    if [ -f "backend/.env" ]; then
        if grep -q "DATABASE_URL" backend/.env; then
            log_success "数据库配置已设置"
        else
            log_warning "数据库配置未设置，请检查 backend/.env 文件"
        fi
    fi
    
    log_success "环境检查完成"
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    cd backend
    
    # 数据库迁移
    if [ -f "prisma/schema.prisma" ]; then
        log_info "运行数据库迁移..."
        npx prisma generate
        npx prisma db push
    fi
    
    # 启动开发服务器
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    log_success "后端服务已启动 (PID: $BACKEND_PID)"
}

# 启动移动端服务
start_mobile() {
    log_info "启动移动端服务..."
    cd mobile
    
    # 启动 Expo 开发服务器
    npm start &
    MOBILE_PID=$!
    cd ..
    
    log_success "移动端服务已启动 (PID: $MOBILE_PID)"
}

# 启动Web端服务
start_web() {
    log_info "启动Web端服务..."
    cd web
    
    # 启动 Next.js 开发服务器
    npm run dev &
    WEB_PID=$!
    cd ..
    
    log_success "Web端服务已启动 (PID: $WEB_PID)"
}

# 显示帮助信息
show_help() {
    echo "SmarTalk 开发环境启动脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  all       启动所有服务 (默认)"
    echo "  backend   仅启动后端服务"
    echo "  mobile    仅启动移动端服务"
    echo "  web       仅启动Web端服务"
    echo "  install   仅安装依赖"
    echo "  check     仅检查环境"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 all      # 启动所有服务"
    echo "  $0 backend  # 仅启动后端"
    echo "  $0 install  # 仅安装依赖"
}

# 清理函数
cleanup() {
    log_info "正在停止服务..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$MOBILE_PID" ]; then
        kill $MOBILE_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
    fi
    
    log_success "服务已停止"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 主函数
main() {
    local command=${1:-all}
    
    case $command in
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        "install")
            check_dependencies
            install_dependencies
            exit 0
            ;;
        "check")
            check_dependencies
            check_environment
            exit 0
            ;;
        "backend")
            check_dependencies
            check_environment
            start_backend
            ;;
        "mobile")
            check_dependencies
            install_dependencies
            start_mobile
            ;;
        "web")
            check_dependencies
            install_dependencies
            start_web
            ;;
        "all")
            check_dependencies
            install_dependencies
            check_environment
            start_backend
            sleep 3
            start_mobile
            sleep 3
            start_web
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
    
    # 如果启动了服务，等待用户中断
    if [ "$command" != "install" ] && [ "$command" != "check" ]; then
        log_success "所有服务已启动完成"
        log_info "按 Ctrl+C 停止所有服务"
        
        # 显示服务地址
        echo ""
        echo "服务地址:"
        [ ! -z "$BACKEND_PID" ] && echo "  后端 API: http://localhost:3001"
        [ ! -z "$WEB_PID" ] && echo "  Web 应用: http://localhost:3000"
        [ ! -z "$MOBILE_PID" ] && echo "  移动端: 请查看 Expo 控制台"
        echo ""
        
        # 等待信号
        wait
    fi
}

# 执行主函数
main "$@"
