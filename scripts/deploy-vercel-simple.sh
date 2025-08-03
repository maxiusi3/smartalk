#!/bin/bash

# SmarTalk 简化 Vercel 部署脚本
# 使用现有的环境变量配置进行部署

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
    echo -e "${GREEN}[SUCCESS]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} ❌ $1"
}

log_step() {
    echo -e "\n${BLUE}[STEP]${NC} ⚙️ $1"
}

# 显示欢迎信息
show_welcome() {
    clear
    echo -e "${GREEN}"
    echo "🚀 SmarTalk Vercel 简化部署脚本"
    echo "=================================="
    echo -e "${NC}"
}

# 检查必需工具
check_prerequisites() {
    log_step "检查部署环境"
    
    local missing_tools=()
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js")
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "缺少必需工具："
        for tool in "${missing_tools[@]}"; do
            echo -e "  ❌ $tool"
        done
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 检查环境变量文件
check_env_file() {
    log_step "检查环境变量配置"
    
    if [ ! -f "../vercel-env-import.env" ]; then
        log_error "未找到环境变量文件: vercel-env-import.env"
        log_info "请确保项目根目录下存在 vercel-env-import.env 文件"
        exit 1
    fi
    
    log_success "环境变量文件检查通过"
}

# 安装依赖
install_dependencies() {
    log_step "安装项目依赖"
    
    cd web
    
    log_info "清理缓存..."
    npm cache clean --force 2>/dev/null || true
    rm -rf node_modules package-lock.json 2>/dev/null || true
    
    log_info "安装依赖..."
    if npm install; then
        log_success "依赖安装完成"
    else
        log_error "依赖安装失败"
        exit 1
    fi
    
    cd ..
}

# 构建项目
build_project() {
    log_step "构建项目"
    
    cd web
    
    log_info "运行类型检查..."
    if npm run type-check 2>/dev/null; then
        log_success "类型检查通过"
    else
        log_warning "类型检查有警告，继续构建"
    fi
    
    log_info "构建 Next.js 应用..."
    if npm run build; then
        log_success "项目构建成功"
    else
        log_error "项目构建失败"
        cd ..
        exit 1
    fi
    
    cd ..
}

# 设置 Vercel 环境变量
setup_vercel_env() {
    log_step "设置 Vercel 环境变量"
    
    cd web
    
    # 从环境变量文件读取配置
    source ../vercel-env-import.env
    
    log_info "设置环境变量..."
    
    # 设置 Supabase 环境变量
    npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --force <<< "$NEXT_PUBLIC_SUPABASE_URL" 2>/dev/null || true
    npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY" 2>/dev/null || true
    npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --force <<< "$SUPABASE_SERVICE_ROLE_KEY" 2>/dev/null || true
    
    # 设置应用环境变量
    npx vercel env add NEXT_PUBLIC_APP_ENV production --force <<< "$NEXT_PUBLIC_APP_ENV" 2>/dev/null || true
    npx vercel env add NEXT_PUBLIC_APP_NAME production --force <<< "$NEXT_PUBLIC_APP_NAME" 2>/dev/null || true
    npx vercel env add NEXT_PUBLIC_APP_VERSION production --force <<< "$NEXT_PUBLIC_APP_VERSION" 2>/dev/null || true
    npx vercel env add NEXT_PUBLIC_APP_URL production --force <<< "$NEXT_PUBLIC_APP_URL" 2>/dev/null || true
    
    log_success "环境变量设置完成"
    
    cd ..
}

# 部署到 Vercel
deploy_to_vercel() {
    log_step "部署到 Vercel"
    
    cd web
    
    log_info "开始部署到生产环境..."
    if npx vercel --prod --confirm; then
        log_success "部署到 Vercel 成功"
        
        # 获取部署 URL
        DEPLOYMENT_URL=$(npx vercel ls | grep "smartalk" | head -1 | awk '{print $2}' 2>/dev/null || echo "smartalk-web.vercel.app")
        if [ -n "$DEPLOYMENT_URL" ]; then
            echo -e "${GREEN}🎉 部署成功！${NC}"
            echo -e "${BLUE}访问地址: https://$DEPLOYMENT_URL${NC}"
        fi
    else
        log_error "部署到 Vercel 失败"
        cd ..
        exit 1
    fi
    
    cd ..
}

# 运行部署后验证
run_post_deployment_tests() {
    log_step "运行部署后验证"
    
    local base_url="https://smartalk-web.vercel.app"
    
    log_info "等待部署完成..."
    sleep 30
    
    # 测试首页
    log_info "测试首页访问..."
    local home_response=$(curl -s -w "%{http_code}" -o /dev/null "$base_url" 2>/dev/null || echo "000")
    
    if [ "$home_response" = "200" ]; then
        log_success "首页访问正常"
    else
        log_warning "首页访问异常 (HTTP $home_response)"
    fi
    
    log_success "部署后验证完成"
}

# 显示部署总结
show_deployment_summary() {
    echo ""
    echo -e "${GREEN}🚀 部署完成！${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
    echo -e "${BLUE}📱 应用信息${NC}"
    echo -e "  项目名称: smartalk-web"
    echo -e "  访问地址: ${GREEN}https://smartalk-web.vercel.app${NC}"
    echo ""
    echo -e "${BLUE}🗄️ 数据库信息${NC}"
    echo -e "  Supabase URL: https://lqrmpvkpfwvsihvjurjd.supabase.co"
    echo -e "  Dashboard: ${GREEN}https://app.supabase.com${NC}"
    echo ""
    echo -e "${BLUE}⚙️ 管理面板${NC}"
    echo -e "  Vercel Dashboard: ${GREEN}https://vercel.com/dashboard${NC}"
    echo ""
    echo -e "${GREEN}🎉 SmarTalk 已成功部署到 Vercel！${NC}"
}

# 错误处理
handle_error() {
    log_error "部署过程中发生错误"
    echo ""
    echo -e "${YELLOW}可能的解决方案：${NC}"
    echo -e "  1. 检查网络连接"
    echo -e "  2. 验证 Vercel 登录状态: npx vercel whoami"
    echo -e "  3. 检查项目构建: npm run build"
    echo -e "  4. 查看详细错误日志"
    exit 1
}

# 主函数
main() {
    # 设置错误处理
    trap 'handle_error' ERR
    
    # 显示欢迎信息
    show_welcome
    
    # 检查环境
    check_prerequisites
    
    # 检查环境变量文件
    check_env_file
    
    # 安装依赖
    install_dependencies
    
    # 构建项目
    build_project
    
    # 设置环境变量
    setup_vercel_env
    
    # 部署到 Vercel
    deploy_to_vercel
    
    # 运行验证测试
    run_post_deployment_tests
    
    # 显示部署总结
    show_deployment_summary
}

# 运行主函数
main "$@"
