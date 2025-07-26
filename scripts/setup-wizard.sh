#!/bin/bash

# SmarTalk 配置向导脚本
# 帮助用户快速配置 Vercel + Supabase 部署所需的参数

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 图标定义
WIZARD="🧙‍♂️"
CHECKMARK="✅"
QUESTION="❓"
LIGHTBULB="💡"
GEAR="⚙️"
DATABASE="🗄️"
GLOBE="🌐"

# 配置文件路径
CONFIG_FILE=".smartalk-config"

# 显示欢迎信息
show_welcome() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
   ____            __ _         __        ___                  _ 
  / ___|___  _ __  / _(_) __ _   \ \      / (_)______ _ _ __ __| |
 | |   / _ \| '_ \| |_| |/ _` |   \ \ /\ / /| |_  / _` | '__/ _` |
 | |__| (_) | | | |  _| | (_| |    \ V  V / | |/ / (_| | | | (_| |
  \____\___/|_| |_|_| |_|\__, |     \_/\_/  |_/___\__,_|_|  \__,_|
                         |___/                                    
EOF
    echo -e "${NC}"
    echo -e "${BLUE}${WIZARD} SmarTalk 配置向导 v1.0.0${NC}"
    echo -e "${BLUE}本向导将帮助您配置 Vercel + Supabase 部署所需的参数${NC}"
    echo ""
}

# 显示帮助信息
show_help() {
    echo -e "${YELLOW}${LIGHTBULB} 配置向导说明：${NC}"
    echo ""
    echo -e "${BLUE}本向导将引导您完成以下配置：${NC}"
    echo -e "  1. ${DATABASE} Supabase 项目设置"
    echo -e "  2. ${GLOBE} Vercel 项目配置"
    echo -e "  3. ${GEAR} 第三方服务集成"
    echo -e "  4. 🔒 安全和监控配置"
    echo ""
    echo -e "${YELLOW}准备工作：${NC}"
    echo -e "  • 确保已注册 Supabase 账号 (https://supabase.com)"
    echo -e "  • 确保已注册 Vercel 账号 (https://vercel.com)"
    echo -e "  • 准备好项目的 GitHub 仓库"
    echo ""
    read -p "按回车键继续..."
}

# 加载现有配置
load_existing_config() {
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "${BLUE}发现现有配置文件，正在加载...${NC}"
        source "$CONFIG_FILE"
        echo -e "${GREEN}${CHECKMARK} 配置文件加载完成${NC}"
        echo ""
        
        echo -e "${YELLOW}当前配置：${NC}"
        echo -e "  Supabase URL: ${SUPABASE_URL:-未设置}"
        echo -e "  Vercel 项目: ${VERCEL_PROJECT_NAME:-未设置}"
        echo -e "  自定义域名: ${CUSTOM_DOMAIN:-未设置}"
        echo ""
        
        read -p "是否使用现有配置？(y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi
    return 1
}

# Supabase 配置向导
configure_supabase() {
    echo -e "${PURPLE}${DATABASE} Supabase 配置${NC}"
    echo ""
    
    echo -e "${YELLOW}步骤 1: 创建 Supabase 项目${NC}"
    echo -e "  1. 访问 https://app.supabase.com"
    echo -e "  2. 点击 'New Project'"
    echo -e "  3. 选择组织和区域（推荐：Singapore 或 Tokyo）"
    echo -e "  4. 设置项目名称和数据库密码"
    echo ""
    
    read -p "已完成 Supabase 项目创建？(y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}请先完成 Supabase 项目创建后再继续${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}步骤 2: 获取项目配置${NC}"
    echo -e "  1. 在 Supabase Dashboard 中进入项目"
    echo -e "  2. 点击左侧菜单的 'Settings' > 'API'"
    echo -e "  3. 复制以下信息："
    echo ""
    
    # 获取 Supabase URL
    while true; do
        read -p "Project URL (格式: https://xxx.supabase.co): " SUPABASE_URL
        if [[ "$SUPABASE_URL" =~ ^https://[a-zA-Z0-9-]+\.supabase\.co$ ]]; then
            break
        else
            echo -e "${RED}URL 格式不正确，请重新输入${NC}"
        fi
    done
    
    # 获取匿名密钥
    while true; do
        read -p "anon/public key (以 eyJ 开头): " SUPABASE_ANON_KEY
        if [[ "$SUPABASE_ANON_KEY" =~ ^eyJ ]]; then
            break
        else
            echo -e "${RED}密钥格式不正确，请重新输入${NC}"
        fi
    done
    
    # 获取服务角色密钥
    while true; do
        read -s -p "service_role key (以 eyJ 开头): " SUPABASE_SERVICE_KEY
        echo ""
        if [[ "$SUPABASE_SERVICE_KEY" =~ ^eyJ ]]; then
            break
        else
            echo -e "${RED}密钥格式不正确，请重新输入${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}${CHECKMARK} Supabase 配置完成${NC}"
}

# Vercel 配置向导
configure_vercel() {
    echo ""
    echo -e "${PURPLE}${GLOBE} Vercel 配置${NC}"
    echo ""
    
    # 项目名称
    read -p "Vercel 项目名称 (默认: smartalk): " VERCEL_PROJECT_NAME
    VERCEL_PROJECT_NAME=${VERCEL_PROJECT_NAME:-smartalk}
    
    # 验证项目名称格式
    while [[ ! "$VERCEL_PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; do
        echo -e "${RED}项目名称只能包含小写字母、数字和连字符${NC}"
        read -p "请重新输入项目名称: " VERCEL_PROJECT_NAME
    done
    
    # 自定义域名
    echo ""
    echo -e "${YELLOW}自定义域名配置 (可选)${NC}"
    echo -e "  如果您有自己的域名，可以在这里配置"
    echo -e "  否则将使用 Vercel 提供的默认域名"
    echo ""
    
    read -p "自定义域名 (可选，按回车跳过): " CUSTOM_DOMAIN
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        # 验证域名格式
        while [[ ! "$CUSTOM_DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; do
            echo -e "${RED}域名格式不正确${NC}"
            read -p "请重新输入域名 (或按回车跳过): " CUSTOM_DOMAIN
            if [ -z "$CUSTOM_DOMAIN" ]; then
                break
            fi
        done
    fi
    
    echo -e "${GREEN}${CHECKMARK} Vercel 配置完成${NC}"
}

# 第三方服务配置向导
configure_third_party_services() {
    echo ""
    echo -e "${PURPLE}${GEAR} 第三方服务配置 (可选)${NC}"
    echo ""
    
    echo -e "${YELLOW}这些服务可以增强应用功能，但不是必需的：${NC}"
    echo ""
    
    # Redis 缓存
    echo -e "${BLUE}1. Upstash Redis (缓存服务)${NC}"
    echo -e "   用途: 提高 API 响应速度，缓存用户会话"
    echo -e "   免费额度: 10,000 请求/天"
    echo -e "   注册地址: https://upstash.com"
    echo ""
    
    read -p "是否配置 Redis 缓存？(y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Upstash Redis REST URL: " UPSTASH_REDIS_URL
        read -p "Upstash Redis REST Token: " UPSTASH_REDIS_TOKEN
    fi
    
    echo ""
    
    # 邮件服务
    echo -e "${BLUE}2. Resend (邮件服务)${NC}"
    echo -e "   用途: 发送注册确认、密码重置等邮件"
    echo -e "   免费额度: 3,000 邮件/月"
    echo -e "   注册地址: https://resend.com"
    echo ""
    
    read -p "是否配置邮件服务？(y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Resend API Key: " RESEND_API_KEY
    fi
    
    echo ""
    
    # 错误监控
    echo -e "${BLUE}3. Sentry (错误监控)${NC}"
    echo -e "   用途: 监控应用错误，提高稳定性"
    echo -e "   免费额度: 5,000 错误/月"
    echo -e "   注册地址: https://sentry.io"
    echo ""
    
    read -p "是否配置错误监控？(y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Sentry DSN: " SENTRY_DSN
    fi
    
    echo -e "${GREEN}${CHECKMARK} 第三方服务配置完成${NC}"
}

# 安全配置建议
show_security_recommendations() {
    echo ""
    echo -e "${PURPLE}🔒 安全配置建议${NC}"
    echo ""
    
    echo -e "${YELLOW}重要安全提醒：${NC}"
    echo -e "  1. ${RED}不要${NC}在代码中硬编码 API 密钥"
    echo -e "  2. ${RED}不要${NC}将 service_role key 暴露给前端"
    echo -e "  3. 定期轮换 API 密钥"
    echo -e "  4. 启用 Supabase 行级安全策略 (RLS)"
    echo -e "  5. 配置适当的 CORS 策略"
    echo ""
    
    echo -e "${BLUE}推荐的安全设置：${NC}"
    echo -e "  • 在 Supabase 中启用邮箱验证"
    echo -e "  • 设置强密码策略"
    echo -e "  • 配置 API 速率限制"
    echo -e "  • 启用审计日志"
    echo ""
}

# 保存配置
save_config() {
    echo ""
    echo -e "${BLUE}正在保存配置...${NC}"
    
    cat > "$CONFIG_FILE" << EOF
# SmarTalk 部署配置
# 生成时间: $(date)

# Supabase 配置
SUPABASE_URL="$SUPABASE_URL"
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY"

# Vercel 配置
VERCEL_PROJECT_NAME="$VERCEL_PROJECT_NAME"
CUSTOM_DOMAIN="$CUSTOM_DOMAIN"

# 第三方服务配置
UPSTASH_REDIS_URL="$UPSTASH_REDIS_URL"
UPSTASH_REDIS_TOKEN="$UPSTASH_REDIS_TOKEN"
RESEND_API_KEY="$RESEND_API_KEY"
SENTRY_DSN="$SENTRY_DSN"
EOF
    
    echo -e "${GREEN}${CHECKMARK} 配置已保存到 $CONFIG_FILE${NC}"
}

# 显示配置总结
show_config_summary() {
    echo ""
    echo -e "${CYAN}📋 配置总结${NC}"
    echo -e "================================"
    echo ""
    
    echo -e "${BLUE}${DATABASE} Supabase 配置${NC}"
    echo -e "  项目 URL: $SUPABASE_URL"
    echo -e "  匿名密钥: ${SUPABASE_ANON_KEY:0:20}..."
    echo -e "  服务密钥: ${SUPABASE_SERVICE_KEY:0:20}..."
    echo ""
    
    echo -e "${BLUE}${GLOBE} Vercel 配置${NC}"
    echo -e "  项目名称: $VERCEL_PROJECT_NAME"
    if [ -n "$CUSTOM_DOMAIN" ]; then
        echo -e "  自定义域名: $CUSTOM_DOMAIN"
    else
        echo -e "  默认域名: $VERCEL_PROJECT_NAME.vercel.app"
    fi
    echo ""
    
    echo -e "${BLUE}${GEAR} 第三方服务${NC}"
    if [ -n "$UPSTASH_REDIS_URL" ]; then
        echo -e "  Redis 缓存: ${GREEN}已配置${NC}"
    else
        echo -e "  Redis 缓存: ${YELLOW}未配置${NC}"
    fi
    
    if [ -n "$RESEND_API_KEY" ]; then
        echo -e "  邮件服务: ${GREEN}已配置${NC}"
    else
        echo -e "  邮件服务: ${YELLOW}未配置${NC}"
    fi
    
    if [ -n "$SENTRY_DSN" ]; then
        echo -e "  错误监控: ${GREEN}已配置${NC}"
    else
        echo -e "  错误监控: ${YELLOW}未配置${NC}"
    fi
    echo ""
}

# 显示下一步操作
show_next_steps() {
    echo -e "${YELLOW}🚀 下一步操作${NC}"
    echo -e "================================"
    echo ""
    
    echo -e "${BLUE}1. 运行部署脚本${NC}"
    echo -e "   ./scripts/deploy-vercel-supabase.sh"
    echo ""
    
    echo -e "${BLUE}2. 或者手动部署${NC}"
    echo -e "   • 使用保存的配置文件中的参数"
    echo -e "   • 按照实施文档进行部署"
    echo ""
    
    echo -e "${BLUE}3. 部署后配置${NC}"
    echo -e "   • 在 Supabase 中执行数据库迁移"
    echo -e "   • 配置认证设置和邮件模板"
    echo -e "   • 测试应用功能"
    echo ""
    
    echo -e "${GREEN}${CHECKMARK} 配置向导完成！${NC}"
}

# 主函数
main() {
    show_welcome
    show_help
    
    # 尝试加载现有配置
    if ! load_existing_config; then
        # 配置各个服务
        configure_supabase
        configure_vercel
        configure_third_party_services
        
        # 显示安全建议
        show_security_recommendations
        
        # 保存配置
        save_config
    fi
    
    # 显示配置总结
    show_config_summary
    
    # 显示下一步操作
    show_next_steps
}

# 运行主函数
main "$@"
