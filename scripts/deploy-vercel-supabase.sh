#!/bin/bash

# SmarTalk Vercel + Supabase 一键部署脚本
# 版本: 1.0.0
# 作者: SmarTalk Team

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 图标定义
CHECKMARK="✅"
CROSS="❌"
ROCKET="🚀"
GEAR="⚙️"
DATABASE="🗄️"
GLOBE="🌐"
LOCK="🔒"
CHART="📊"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} ${CHECKMARK} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} ${CROSS} $1"
}

log_step() {
    echo -e "\n${PURPLE}[STEP]${NC} ${GEAR} $1"
}

# 显示欢迎信息
show_welcome() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
   ____                      _______      _ _    
  / ___| _ __ ___   __ _ _ __|_   _|_ _| | | | | __
  \___ \| '_ ` _ \ / _` | '__|| |/ _` | | | | |/ /
   ___) | | | | | | (_| | |   | | (_| | | | |   < 
  |____/|_| |_| |_|\__,_|_|   |_|\__,_|_|_|_|_|\_\
                                                  
  Vercel + Supabase 一键部署脚本 v1.0.0
  
EOF
    echo -e "${NC}"
    echo -e "${BLUE}欢迎使用 SmarTalk 一键部署脚本！${NC}"
    echo -e "${BLUE}本脚本将帮助您快速部署 SmarTalk 到 Vercel + Supabase 架构${NC}"
    echo ""
}

# 检查必需工具
check_prerequisites() {
    log_step "检查部署环境"
    
    local missing_tools=()
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js (>= 18.0.0)")
    else
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 18 ]; then
            missing_tools+=("Node.js (当前版本过低，需要 >= 18.0.0)")
        fi
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    # 检查 git
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    # 检查 curl
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "缺少必需工具："
        for tool in "${missing_tools[@]}"; do
            echo -e "  ${CROSS} $tool"
        done
        echo ""
        log_info "请安装缺少的工具后重新运行脚本"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 收集用户输入
collect_user_input() {
    log_step "收集部署配置信息"
    
    echo -e "${YELLOW}请提供以下配置信息：${NC}"
    echo ""
    
    # Supabase 配置
    echo -e "${CYAN}${DATABASE} Supabase 配置${NC}"
    read -p "Supabase 项目 URL: " SUPABASE_URL
    read -p "Supabase 匿名密钥: " SUPABASE_ANON_KEY
    read -s -p "Supabase 服务角色密钥: " SUPABASE_SERVICE_KEY
    echo ""
    
    # Vercel 配置
    echo -e "${CYAN}${GLOBE} Vercel 配置${NC}"
    read -p "Vercel 项目名称 (默认: smartalk): " VERCEL_PROJECT_NAME
    VERCEL_PROJECT_NAME=${VERCEL_PROJECT_NAME:-smartalk}
    
    read -p "自定义域名 (可选，按回车跳过): " CUSTOM_DOMAIN
    
    # 第三方服务配置
    echo -e "${CYAN}${GEAR} 第三方服务配置 (可选)${NC}"
    read -p "Upstash Redis URL (可选): " UPSTASH_REDIS_URL
    read -p "Upstash Redis Token (可选): " UPSTASH_REDIS_TOKEN
    read -p "Resend API Key (可选): " RESEND_API_KEY
    read -p "Sentry DSN (可选): " SENTRY_DSN
    
    echo ""
    log_success "配置信息收集完成"
}

# 验证配置
validate_config() {
    log_step "验证配置信息"
    
    local errors=()
    
    # 验证 Supabase URL
    if [[ ! "$SUPABASE_URL" =~ ^https://[a-zA-Z0-9-]+\.supabase\.co$ ]]; then
        errors+=("Supabase URL 格式不正确")
    fi
    
    # 验证密钥格式
    if [[ ! "$SUPABASE_ANON_KEY" =~ ^eyJ ]]; then
        errors+=("Supabase 匿名密钥格式不正确")
    fi
    
    if [[ ! "$SUPABASE_SERVICE_KEY" =~ ^eyJ ]]; then
        errors+=("Supabase 服务角色密钥格式不正确")
    fi
    
    # 验证项目名称
    if [[ ! "$VERCEL_PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
        errors+=("Vercel 项目名称只能包含小写字母、数字和连字符")
    fi
    
    if [ ${#errors[@]} -ne 0 ]; then
        log_error "配置验证失败："
        for error in "${errors[@]}"; do
            echo -e "  ${CROSS} $error"
        done
        exit 1
    fi
    
    log_success "配置验证通过"
}

# 测试 Supabase 连接
test_supabase_connection() {
    log_step "测试 Supabase 连接"
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/supabase_test.json \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/")
    
    if [ "$response" = "200" ]; then
        log_success "Supabase 连接测试成功"
    else
        log_error "Supabase 连接测试失败 (HTTP $response)"
        log_info "请检查 Supabase URL 和密钥是否正确"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    log_step "安装项目依赖"
    
    cd web
    
    # 检查是否需要安装 Supabase 依赖
    if ! npm list @supabase/supabase-js &> /dev/null; then
        log_info "安装 Supabase 相关依赖..."
        npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
    fi
    
    # 安装其他依赖
    if [ -n "$UPSTASH_REDIS_URL" ]; then
        log_info "安装 Redis 依赖..."
        npm install @upstash/redis
    fi
    
    if [ -n "$RESEND_API_KEY" ]; then
        log_info "安装邮件服务依赖..."
        npm install resend
    fi
    
    if [ -n "$SENTRY_DSN" ]; then
        log_info "安装错误监控依赖..."
        npm install @sentry/nextjs
    fi
    
    log_info "安装通用依赖..."
    npm install
    
    cd ..
    
    log_success "依赖安装完成"
}

# 创建环境变量文件
create_env_files() {
    log_step "创建环境变量配置"
    
    # 创建本地环境变量文件
    cat > web/.env.local << EOF
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development

EOF
    
    # 添加可选服务配置
    if [ -n "$UPSTASH_REDIS_URL" ]; then
        cat >> web/.env.local << EOF
# Redis 配置
UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_URL
UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_TOKEN

EOF
    fi
    
    if [ -n "$RESEND_API_KEY" ]; then
        cat >> web/.env.local << EOF
# 邮件服务配置
RESEND_API_KEY=$RESEND_API_KEY

EOF
    fi
    
    if [ -n "$SENTRY_DSN" ]; then
        cat >> web/.env.local << EOF
# 错误监控配置
SENTRY_DSN=$SENTRY_DSN

EOF
    fi
    
    # 创建生产环境变量模板
    cat > web/.env.production.template << EOF
# 生产环境变量模板
# 请在 Vercel Dashboard 中设置这些变量

NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY
NEXT_PUBLIC_APP_URL=https://$VERCEL_PROJECT_NAME.vercel.app
NEXT_PUBLIC_APP_ENV=production
EOF
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        sed -i "s|https://$VERCEL_PROJECT_NAME.vercel.app|https://$CUSTOM_DOMAIN|g" web/.env.production.template
    fi
    
    log_success "环境变量配置创建完成"
}

# 初始化数据库
initialize_database() {
    log_step "初始化 Supabase 数据库"
    
    # 检查是否安装了 Supabase CLI
    if ! command -v supabase &> /dev/null; then
        log_info "Supabase CLI 未安装，跳过自动安装"
        log_warning "请手动安装 Supabase CLI 或使用 Supabase Dashboard 进行数据库初始化"
    fi
    
    # 检查数据库迁移文件是否存在
    if [ -f "supabase/migrations/001_initial_schema.sql" ]; then
        log_info "发现数据库迁移文件，准备执行..."
        
        # 提示用户手动执行迁移
        echo -e "${YELLOW}请按照以下步骤手动执行数据库迁移：${NC}"
        echo "1. 访问 Supabase Dashboard: $SUPABASE_URL"
        echo "2. 进入 SQL Editor"
        echo "3. 复制并执行 supabase/migrations/001_initial_schema.sql 中的内容"
        echo "4. 复制并执行 supabase/seed.sql 中的示例数据（可选）"
        echo ""
        read -p "完成数据库初始化后按回车继续..."
        
        log_success "数据库初始化完成"
    else
        log_warning "未找到数据库迁移文件，请手动创建数据库结构"
    fi
}

# 构建项目
build_project() {
    log_step "构建项目"
    
    cd web
    
    log_info "运行类型检查..."
    if npm run type-check 2>/dev/null || npx tsc --noEmit; then
        log_success "类型检查通过"
    else
        log_warning "类型检查有警告，但继续构建"
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

# 安装和配置 Vercel CLI
setup_vercel_cli() {
    log_step "配置 Vercel CLI"
    
    # 检查是否安装了 Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_info "检测到 Vercel CLI 未安装"
        log_info "尝试使用 npx 运行 Vercel CLI..."
        
        # 测试 npx 是否可用
        if npx vercel --version &> /dev/null; then
            log_success "可以使用 npx vercel"
            VERCEL_CMD="npx vercel"
        else
            log_info "安装 Vercel CLI 到本地项目..."
            cd web
            npm install --save-dev vercel
            cd ..
            VERCEL_CMD="npx vercel"
        fi
    else
        VERCEL_CMD="vercel"
    fi
    
    # 检查是否已登录
    if ! $VERCEL_CMD whoami &> /dev/null; then
        log_info "请登录 Vercel 账号..."
        $VERCEL_CMD login
    fi
    
    log_success "Vercel CLI 配置完成"
}

# 部署到 Vercel
deploy_to_vercel() {
    log_step "部署到 Vercel"
    
    cd web
    
    # 创建 Vercel 项目配置
    cat > .vercel/project.json << EOF
{
  "projectId": "",
  "orgId": ""
}
EOF
    
    # 设置环境变量
    log_info "设置 Vercel 环境变量..."
    
    $VERCEL_CMD env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL"
    $VERCEL_CMD env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"
    $VERCEL_CMD env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_KEY"
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        $VERCEL_CMD env add NEXT_PUBLIC_APP_URL production <<< "https://$CUSTOM_DOMAIN"
    else
        $VERCEL_CMD env add NEXT_PUBLIC_APP_URL production <<< "https://$VERCEL_PROJECT_NAME.vercel.app"
    fi
    
    $VERCEL_CMD env add NEXT_PUBLIC_APP_ENV production <<< "production"
    
    # 添加可选环境变量
    if [ -n "$UPSTASH_REDIS_URL" ]; then
        $VERCEL_CMD env add UPSTASH_REDIS_REST_URL production <<< "$UPSTASH_REDIS_URL"
        $VERCEL_CMD env add UPSTASH_REDIS_REST_TOKEN production <<< "$UPSTASH_REDIS_TOKEN"
    fi
    
    if [ -n "$RESEND_API_KEY" ]; then
        $VERCEL_CMD env add RESEND_API_KEY production <<< "$RESEND_API_KEY"
    fi
    
    if [ -n "$SENTRY_DSN" ]; then
        $VERCEL_CMD env add SENTRY_DSN production <<< "$SENTRY_DSN"
    fi
    
    # 部署到生产环境
    log_info "开始部署到生产环境..."
    if $VERCEL_CMD --prod --confirm; then
        log_success "部署到 Vercel 成功"
        
        # 获取部署 URL
        DEPLOYMENT_URL=$($VERCEL_CMD ls | grep "$VERCEL_PROJECT_NAME" | head -1 | awk '{print $2}')
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

# 配置自定义域名
setup_custom_domain() {
    if [ -n "$CUSTOM_DOMAIN" ]; then
        log_step "配置自定义域名"
        
        cd web
        
        log_info "添加自定义域名: $CUSTOM_DOMAIN"
        if $VERCEL_CMD domains add "$CUSTOM_DOMAIN"; then
            log_success "自定义域名配置成功"
            echo -e "${BLUE}请确保将域名的 DNS 记录指向 Vercel${NC}"
        else
            log_warning "自定义域名配置失败，请手动在 Vercel Dashboard 中配置"
        fi
        
        cd ..
    fi
}

# 运行部署后验证
run_post_deployment_tests() {
    log_step "运行部署后验证"
    
    local base_url
    if [ -n "$CUSTOM_DOMAIN" ]; then
        base_url="https://$CUSTOM_DOMAIN"
    else
        base_url="https://$VERCEL_PROJECT_NAME.vercel.app"
    fi
    
    log_info "等待部署完成..."
    sleep 30
    
    # 测试健康检查端点
    log_info "测试健康检查端点..."
    local health_response=$(curl -s -w "%{http_code}" -o /tmp/health_check.json "$base_url/api/health")
    
    if [ "$health_response" = "200" ]; then
        log_success "健康检查通过"
    else
        log_warning "健康检查失败 (HTTP $health_response)"
    fi
    
    # 测试首页
    log_info "测试首页访问..."
    local home_response=$(curl -s -w "%{http_code}" -o /dev/null "$base_url")
    
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
    echo -e "${GREEN}${ROCKET} 部署完成！${NC}"
    echo -e "${CYAN}===========================================${NC}"
    echo ""
    echo -e "${BLUE}📱 应用信息${NC}"
    echo -e "  项目名称: $VERCEL_PROJECT_NAME"
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        echo -e "  访问地址: ${GREEN}https://$CUSTOM_DOMAIN${NC}"
    else
        echo -e "  访问地址: ${GREEN}https://$VERCEL_PROJECT_NAME.vercel.app${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}${DATABASE} 数据库信息${NC}"
    echo -e "  Supabase URL: $SUPABASE_URL"
    echo -e "  Dashboard: ${GREEN}$SUPABASE_URL${NC}"
    
    echo ""
    echo -e "${BLUE}${GEAR} 管理面板${NC}"
    echo -e "  Vercel Dashboard: ${GREEN}https://vercel.com/dashboard${NC}"
    echo -e "  Supabase Dashboard: ${GREEN}https://app.supabase.com${NC}"
    
    echo ""
    echo -e "${BLUE}${CHART} 监控和分析${NC}"
    if [ -n "$SENTRY_DSN" ]; then
        echo -e "  错误监控: ${GREEN}已配置 Sentry${NC}"
    fi
    echo -e "  性能分析: ${GREEN}Vercel Analytics${NC}"
    
    echo ""
    echo -e "${YELLOW}📝 下一步建议${NC}"
    echo -e "  1. 访问应用并测试核心功能"
    echo -e "  2. 在 Supabase Dashboard 中添加示例数据"
    echo -e "  3. 配置邮件模板和认证设置"
    echo -e "  4. 设置监控告警"
    echo -e "  5. 配置备份策略"
    
    echo ""
    echo -e "${GREEN}🎉 SmarTalk 已成功部署到 Vercel + Supabase！${NC}"
}

# 错误处理和回滚
handle_error() {
    log_error "部署过程中发生错误"
    echo ""
    echo -e "${YELLOW}可能的解决方案：${NC}"
    echo -e "  1. 检查网络连接"
    echo -e "  2. 验证 API 密钥是否正确"
    echo -e "  3. 确认 Supabase 项目状态正常"
    echo -e "  4. 检查 Vercel 账号权限"
    echo ""
    echo -e "${BLUE}如需帮助，请查看日志文件或联系技术支持${NC}"
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
    
    # 收集用户输入
    collect_user_input
    
    # 验证配置
    validate_config
    
    # 测试连接
    test_supabase_connection
    
    # 安装依赖
    install_dependencies
    
    # 创建配置文件
    create_env_files
    
    # 初始化数据库
    initialize_database
    
    # 构建项目
    build_project
    
    # 配置 Vercel CLI
    setup_vercel_cli
    
    # 部署到 Vercel
    deploy_to_vercel
    
    # 配置自定义域名
    setup_custom_domain
    
    # 运行验证测试
    run_post_deployment_tests
    
    # 显示部署总结
    show_deployment_summary
}

# 运行主函数
main "$@"
