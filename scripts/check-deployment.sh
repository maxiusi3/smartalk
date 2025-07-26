#!/bin/bash

# SmarTalk 部署状态检查脚本
# 用于验证 Vercel + Supabase 部署是否正常工作

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
CHECKMARK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
DATABASE="🗄️"
GLOBE="🌐"

# 默认配置
DEFAULT_TIMEOUT=30
VERBOSE=false

# 显示帮助信息
show_help() {
    echo -e "${CYAN}SmarTalk 部署状态检查工具${NC}"
    echo ""
    echo -e "${BLUE}用法:${NC}"
    echo "  $0 [选项] <应用URL>"
    echo ""
    echo -e "${BLUE}选项:${NC}"
    echo "  -h, --help     显示帮助信息"
    echo "  -v, --verbose  显示详细输出"
    echo "  -t, --timeout  设置超时时间（秒，默认30）"
    echo ""
    echo -e "${BLUE}示例:${NC}"
    echo "  $0 https://smartalk.vercel.app"
    echo "  $0 -v -t 60 https://your-domain.com"
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -t|--timeout)
                DEFAULT_TIMEOUT="$2"
                shift 2
                ;;
            -*)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
            *)
                APP_URL="$1"
                shift
                ;;
        esac
    done

    if [ -z "$APP_URL" ]; then
        echo -e "${RED}错误: 请提供应用 URL${NC}"
        show_help
        exit 1
    fi
}

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} ${INFO} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} ${CHECKMARK} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} ${WARNING} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} ${CROSS} $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${PURPLE}[VERBOSE]${NC} $1"
    fi
}

# 检查工具是否存在
check_tools() {
    local missing_tools=()
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warning "jq 未安装，JSON 响应将以原始格式显示"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "缺少必需工具: ${missing_tools[*]}"
        exit 1
    fi
}

# HTTP 请求函数
make_request() {
    local url="$1"
    local expected_status="${2:-200}"
    local timeout="${3:-$DEFAULT_TIMEOUT}"
    
    log_verbose "请求 URL: $url"
    log_verbose "期望状态码: $expected_status"
    log_verbose "超时时间: ${timeout}s"
    
    local response
    local http_code
    local temp_file=$(mktemp)
    
    # 发送请求并获取状态码
    http_code=$(curl -s -w "%{http_code}" \
        --max-time "$timeout" \
        --connect-timeout 10 \
        -H "User-Agent: SmarTalk-HealthCheck/1.0" \
        -o "$temp_file" \
        "$url" 2>/dev/null || echo "000")
    
    # 读取响应内容
    if [ -f "$temp_file" ]; then
        response=$(cat "$temp_file")
        rm -f "$temp_file"
    fi
    
    log_verbose "HTTP 状态码: $http_code"
    
    # 检查状态码
    if [ "$http_code" = "$expected_status" ]; then
        echo "$response"
        return 0
    else
        log_verbose "响应内容: $response"
        return 1
    fi
}

# 检查首页
check_homepage() {
    log_info "检查首页访问..."
    
    if response=$(make_request "$APP_URL" 200); then
        log_success "首页访问正常"
        
        # 检查页面内容
        if echo "$response" | grep -q "SmarTalk" || echo "$response" | grep -q "开芯说"; then
            log_success "页面内容包含应用标识"
        else
            log_warning "页面内容可能不正确"
        fi
        
        return 0
    else
        log_error "首页访问失败"
        return 1
    fi
}

# 检查健康检查端点
check_health_endpoint() {
    log_info "检查健康检查端点..."
    
    local health_url="$APP_URL/api/health"
    
    if response=$(make_request "$health_url" 200); then
        log_success "健康检查端点正常"
        
        # 解析 JSON 响应
        if command -v jq &> /dev/null; then
            local status=$(echo "$response" | jq -r '.status // "unknown"')
            local db_status=$(echo "$response" | jq -r '.checks.database // false')
            
            if [ "$status" = "healthy" ]; then
                log_success "应用状态: 健康"
            else
                log_warning "应用状态: $status"
            fi
            
            if [ "$db_status" = "true" ]; then
                log_success "数据库连接: 正常"
            else
                log_error "数据库连接: 异常"
            fi
        else
            log_verbose "健康检查响应: $response"
        fi
        
        return 0
    else
        log_error "健康检查端点访问失败"
        return 1
    fi
}

# 检查 API 端点
check_api_endpoints() {
    log_info "检查 API 端点..."
    
    local endpoints=(
        "/api/stories:200"
        "/api/auth/session:401"  # 未认证应该返回 401
    )
    
    local failed_count=0
    
    for endpoint_config in "${endpoints[@]}"; do
        local endpoint=$(echo "$endpoint_config" | cut -d':' -f1)
        local expected_status=$(echo "$endpoint_config" | cut -d':' -f2)
        local full_url="$APP_URL$endpoint"
        
        log_verbose "检查端点: $endpoint"
        
        if make_request "$full_url" "$expected_status" >/dev/null; then
            log_success "API 端点 $endpoint 正常"
        else
            log_error "API 端点 $endpoint 异常"
            ((failed_count++))
        fi
    done
    
    if [ $failed_count -eq 0 ]; then
        log_success "所有 API 端点检查通过"
        return 0
    else
        log_warning "$failed_count 个 API 端点检查失败"
        return 1
    fi
}

# 检查静态资源
check_static_resources() {
    log_info "检查静态资源..."
    
    local resources=(
        "/favicon.ico"
        "/_next/static/css"  # Next.js CSS
    )
    
    local failed_count=0
    
    for resource in "${resources[@]}"; do
        local full_url="$APP_URL$resource"
        
        log_verbose "检查资源: $resource"
        
        # 对于 CSS 目录，我们期望 404 或重定向
        if [[ "$resource" == *"css"* ]]; then
            if make_request "$full_url" 404 >/dev/null || make_request "$full_url" 301 >/dev/null; then
                log_success "静态资源路径 $resource 配置正常"
            else
                log_warning "静态资源路径 $resource 可能有问题"
                ((failed_count++))
            fi
        else
            if make_request "$full_url" 200 >/dev/null; then
                log_success "静态资源 $resource 正常"
            else
                log_warning "静态资源 $resource 访问失败"
                ((failed_count++))
            fi
        fi
    done
    
    if [ $failed_count -eq 0 ]; then
        log_success "静态资源检查通过"
        return 0
    else
        log_warning "$failed_count 个静态资源检查失败"
        return 1
    fi
}

# 检查响应时间
check_response_time() {
    log_info "检查响应时间..."
    
    local start_time=$(date +%s%N)
    
    if make_request "$APP_URL" 200 >/dev/null; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))  # 转换为毫秒
        
        if [ $response_time -lt 1000 ]; then
            log_success "响应时间: ${response_time}ms (优秀)"
        elif [ $response_time -lt 3000 ]; then
            log_success "响应时间: ${response_time}ms (良好)"
        elif [ $response_time -lt 5000 ]; then
            log_warning "响应时间: ${response_time}ms (一般)"
        else
            log_warning "响应时间: ${response_time}ms (较慢)"
        fi
        
        return 0
    else
        log_error "无法测量响应时间"
        return 1
    fi
}

# 检查 SSL 证书
check_ssl_certificate() {
    if [[ "$APP_URL" == https://* ]]; then
        log_info "检查 SSL 证书..."
        
        local domain=$(echo "$APP_URL" | sed 's|https://||' | sed 's|/.*||')
        
        if command -v openssl &> /dev/null; then
            local cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
            
            if [ $? -eq 0 ]; then
                log_success "SSL 证书有效"
                
                local not_after=$(echo "$cert_info" | grep "notAfter" | cut -d'=' -f2)
                if [ -n "$not_after" ]; then
                    log_verbose "证书过期时间: $not_after"
                fi
            else
                log_warning "SSL 证书检查失败"
            fi
        else
            log_verbose "openssl 未安装，跳过 SSL 证书检查"
        fi
    else
        log_info "HTTP 站点，跳过 SSL 证书检查"
    fi
}

# 生成检查报告
generate_report() {
    local total_checks=$1
    local passed_checks=$2
    local failed_checks=$((total_checks - passed_checks))
    
    echo ""
    echo -e "${CYAN}===========================================${NC}"
    echo -e "${CYAN}           部署状态检查报告${NC}"
    echo -e "${CYAN}===========================================${NC}"
    echo ""
    
    echo -e "${BLUE}应用信息:${NC}"
    echo -e "  URL: $APP_URL"
    echo -e "  检查时间: $(date)"
    echo ""
    
    echo -e "${BLUE}检查结果:${NC}"
    echo -e "  总检查项: $total_checks"
    echo -e "  通过: ${GREEN}$passed_checks${NC}"
    echo -e "  失败: ${RED}$failed_checks${NC}"
    echo ""
    
    local success_rate=$((passed_checks * 100 / total_checks))
    
    if [ $success_rate -ge 90 ]; then
        echo -e "${GREEN}${ROCKET} 部署状态: 优秀 (${success_rate}%)${NC}"
        echo -e "${GREEN}应用运行正常，可以投入使用！${NC}"
    elif [ $success_rate -ge 70 ]; then
        echo -e "${YELLOW}${WARNING} 部署状态: 良好 (${success_rate}%)${NC}"
        echo -e "${YELLOW}应用基本正常，建议修复警告项${NC}"
    else
        echo -e "${RED}${CROSS} 部署状态: 需要修复 (${success_rate}%)${NC}"
        echo -e "${RED}应用存在问题，请检查错误项${NC}"
    fi
    
    echo ""
}

# 主函数
main() {
    echo -e "${CYAN}${ROCKET} SmarTalk 部署状态检查${NC}"
    echo -e "${BLUE}检查目标: $APP_URL${NC}"
    echo ""
    
    # 检查必需工具
    check_tools
    
    local total_checks=0
    local passed_checks=0
    
    # 执行各项检查
    local checks=(
        "check_homepage"
        "check_health_endpoint"
        "check_api_endpoints"
        "check_static_resources"
        "check_response_time"
        "check_ssl_certificate"
    )
    
    for check_func in "${checks[@]}"; do
        ((total_checks++))
        if $check_func; then
            ((passed_checks++))
        fi
        echo ""  # 添加空行分隔
    done
    
    # 生成报告
    generate_report $total_checks $passed_checks
    
    # 返回适当的退出码
    local success_rate=$((passed_checks * 100 / total_checks))
    if [ $success_rate -ge 70 ]; then
        exit 0
    else
        exit 1
    fi
}

# 解析参数并运行
parse_args "$@"
main
