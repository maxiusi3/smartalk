#!/bin/bash

# SmarTalk 构建脚本
# 支持构建后端、Web端或全部项目

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

# 检查环境
check_environment() {
    log_info "检查构建环境..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    log_success "构建环境检查通过"
}

# 清理构建目录
clean_build() {
    log_info "清理构建目录..."
    
    # 清理后端构建
    if [ -d "backend/dist" ]; then
        rm -rf backend/dist
        log_info "已清理 backend/dist"
    fi
    
    # 清理Web端构建
    if [ -d "web/.next" ]; then
        rm -rf web/.next
        log_info "已清理 web/.next"
    fi
    
    if [ -d "web/out" ]; then
        rm -rf web/out
        log_info "已清理 web/out"
    fi
    
    log_success "构建目录清理完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装构建依赖..."
    
    # 后端依赖
    if [ -f "backend/package.json" ]; then
        log_info "安装后端依赖..."
        cd backend && npm ci && cd ..
    fi
    
    # Web端依赖
    if [ -f "web/package.json" ]; then
        log_info "安装Web端依赖..."
        cd web && npm ci && cd ..
    fi
    
    log_success "依赖安装完成"
}

# 构建后端
build_backend() {
    log_info "构建后端项目..."
    cd backend
    
    # 生成 Prisma 客户端
    if [ -f "prisma/schema.prisma" ]; then
        log_info "生成 Prisma 客户端..."
        npx prisma generate
    fi
    
    # TypeScript 编译
    log_info "编译 TypeScript..."
    npm run build
    
    cd ..
    log_success "后端构建完成"
}

# 构建Web端
build_web() {
    log_info "构建Web端项目..."
    cd web
    
    # Next.js 构建
    log_info "构建 Next.js 应用..."
    npm run build
    
    cd ..
    log_success "Web端构建完成"
}

# 构建移动端 (准备发布包)
build_mobile() {
    log_info "准备移动端发布包..."
    cd mobile
    
    # 检查 Expo CLI
    if ! command -v expo &> /dev/null; then
        log_warning "Expo CLI 未安装，正在安装..."
        npm install -g @expo/cli
    fi
    
    # 构建 APK (Android)
    if [ "$1" = "android" ] || [ "$1" = "all" ]; then
        log_info "构建 Android APK..."
        expo build:android --type apk
    fi
    
    # 构建 IPA (iOS)
    if [ "$1" = "ios" ] || [ "$1" = "all" ]; then
        log_info "构建 iOS IPA..."
        expo build:ios
    fi
    
    cd ..
    log_success "移动端构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试套件..."
    
    # 后端测试
    if [ -f "backend/package.json" ] && grep -q "test" backend/package.json; then
        log_info "运行后端测试..."
        cd backend && npm test && cd ..
    fi
    
    # Web端测试
    if [ -f "web/package.json" ] && grep -q "test" web/package.json; then
        log_info "运行Web端测试..."
        cd web && npm test && cd ..
    fi
    
    log_success "测试完成"
}

# 代码质量检查
run_linting() {
    log_info "运行代码质量检查..."
    
    # 后端 ESLint
    if [ -f "backend/.eslintrc.js" ]; then
        log_info "检查后端代码质量..."
        cd backend && npm run lint && cd ..
    fi
    
    # Web端 ESLint
    if [ -f "web/eslint.config.mjs" ]; then
        log_info "检查Web端代码质量..."
        cd web && npm run lint && cd ..
    fi
    
    # 移动端 ESLint
    if [ -f "mobile/.eslintrc.js" ]; then
        log_info "检查移动端代码质量..."
        cd mobile && npm run lint && cd ..
    fi
    
    log_success "代码质量检查完成"
}

# 生成构建报告
generate_report() {
    log_info "生成构建报告..."
    
    local report_file="build-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "SmarTalk 构建报告"
        echo "=================="
        echo "构建时间: $(date)"
        echo "Node.js 版本: $(node -v)"
        echo "npm 版本: $(npm -v)"
        echo ""
        
        echo "构建产物:"
        echo "--------"
        
        if [ -d "backend/dist" ]; then
            echo "后端: backend/dist/ ($(du -sh backend/dist | cut -f1))"
        fi
        
        if [ -d "web/.next" ]; then
            echo "Web端: web/.next/ ($(du -sh web/.next | cut -f1))"
        fi
        
        echo ""
        echo "构建完成时间: $(date)"
        
    } > "$report_file"
    
    log_success "构建报告已生成: $report_file"
}

# 显示帮助信息
show_help() {
    echo "SmarTalk 构建脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  all       构建所有项目 (默认)"
    echo "  backend   仅构建后端"
    echo "  web       仅构建Web端"
    echo "  mobile    构建移动端 [android|ios|all]"
    echo "  clean     清理构建目录"
    echo "  test      运行测试"
    echo "  lint      代码质量检查"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 all              # 构建所有项目"
    echo "  $0 backend          # 仅构建后端"
    echo "  $0 mobile android   # 构建 Android APK"
    echo "  $0 clean            # 清理构建目录"
}

# 主函数
main() {
    local command=${1:-all}
    local platform=${2:-all}
    
    case $command in
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        "clean")
            clean_build
            exit 0
            ;;
        "test")
            check_environment
            install_dependencies
            run_tests
            exit 0
            ;;
        "lint")
            check_environment
            install_dependencies
            run_linting
            exit 0
            ;;
        "backend")
            check_environment
            install_dependencies
            build_backend
            generate_report
            ;;
        "web")
            check_environment
            install_dependencies
            build_web
            generate_report
            ;;
        "mobile")
            check_environment
            install_dependencies
            build_mobile "$platform"
            generate_report
            ;;
        "all")
            check_environment
            clean_build
            install_dependencies
            run_linting
            run_tests
            build_backend
            build_web
            generate_report
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
    
    log_success "构建完成！"
}

# 执行主函数
main "$@"
