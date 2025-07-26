#!/bin/bash

# SmarTalk 项目清理脚本
# 清除临时文件、缓存文件和无用文件

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 图标定义
CHECKMARK="✅"
CROSS="❌"
BROOM="🧹"
TRASH="🗑️"

# 显示帮助信息
show_help() {
    echo -e "${BLUE}SmarTalk 项目清理工具${NC}"
    echo ""
    echo -e "${BLUE}用法:${NC}"
    echo "  $0 [选项]"
    echo ""
    echo -e "${BLUE}选项:${NC}"
    echo "  -h, --help     显示帮助信息"
    echo "  -v, --verbose  显示详细输出"
    echo "  -d, --dry-run  预览将要删除的文件（不实际删除）"
    echo "  -a, --all      清理所有文件（包括 node_modules）"
    echo ""
    echo -e "${BLUE}清理内容:${NC}"
    echo "  • 临时文件 (*.tmp, *.log, *.cache)"
    echo "  • 系统文件 (.DS_Store, Thumbs.db)"
    echo "  • 编辑器文件 (*.swp, *.swo, *~)"
    echo "  • 备份文件 (*.bak, *.backup)"
    echo "  • 构建缓存 (.next, dist, build)"
    echo "  • 依赖包 (node_modules) - 仅在 --all 模式"
}

# 默认配置
VERBOSE=false
DRY_RUN=false
CLEAN_ALL=false

# 解析命令行参数
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
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -a|--all)
            CLEAN_ALL=true
            shift
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

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

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1"
    fi
}

# 删除文件函数
remove_files() {
    local pattern="$1"
    local description="$2"
    local count=0
    
    log_info "清理 $description..."
    
    if [ "$DRY_RUN" = true ]; then
        # 预览模式
        while IFS= read -r -d '' file; do
            echo "  将删除: $file"
            ((count++))
        done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
    else
        # 实际删除
        while IFS= read -r -d '' file; do
            log_verbose "删除文件: $file"
            rm -f "$file"
            ((count++))
        done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
    fi
    
    if [ $count -gt 0 ]; then
        log_success "清理了 $count 个 $description"
    else
        log_verbose "没有找到 $description"
    fi
}

# 删除目录函数
remove_directories() {
    local pattern="$1"
    local description="$2"
    local count=0
    
    log_info "清理 $description..."
    
    if [ "$DRY_RUN" = true ]; then
        # 预览模式
        while IFS= read -r -d '' dir; do
            echo "  将删除目录: $dir"
            ((count++))
        done < <(find . -name "$pattern" -type d -print0 2>/dev/null)
    else
        # 实际删除
        while IFS= read -r -d '' dir; do
            log_verbose "删除目录: $dir"
            rm -rf "$dir"
            ((count++))
        done < <(find . -name "$pattern" -type d -print0 2>/dev/null)
    fi
    
    if [ $count -gt 0 ]; then
        log_success "清理了 $count 个 $description"
    else
        log_verbose "没有找到 $description"
    fi
}

# 清理特定路径下的文件
clean_build_artifacts() {
    local paths=(
        "web/.next"
        "web/out"
        "web/dist"
        "web/build"
        "backend/dist"
        "backend/build"
        "mobile/android/app/build"
        "mobile/ios/build"
    )
    
    log_info "清理构建产物..."
    local count=0
    
    for path in "${paths[@]}"; do
        if [ -d "$path" ]; then
            if [ "$DRY_RUN" = true ]; then
                echo "  将删除目录: $path"
            else
                log_verbose "删除构建目录: $path"
                rm -rf "$path"
            fi
            ((count++))
        fi
    done
    
    if [ $count -gt 0 ]; then
        log_success "清理了 $count 个构建目录"
    else
        log_verbose "没有找到构建目录"
    fi
}

# 清理 node_modules
clean_node_modules() {
    if [ "$CLEAN_ALL" = true ]; then
        log_info "清理 node_modules..."
        
        local paths=(
            "web/node_modules"
            "backend/node_modules"
            "mobile/node_modules"
            "node_modules"
        )
        
        local count=0
        for path in "${paths[@]}"; do
            if [ -d "$path" ]; then
                if [ "$DRY_RUN" = true ]; then
                    echo "  将删除目录: $path"
                else
                    log_verbose "删除 node_modules: $path"
                    rm -rf "$path"
                fi
                ((count++))
            fi
        done
        
        if [ $count -gt 0 ]; then
            log_success "清理了 $count 个 node_modules 目录"
        else
            log_verbose "没有找到 node_modules 目录"
        fi
    fi
}

# 清理空目录
clean_empty_directories() {
    log_info "清理空目录..."
    local count=0
    
    # 查找空目录（排除 .git 目录）
    while IFS= read -r -d '' dir; do
        # 跳过 .git 相关目录
        if [[ "$dir" == *".git"* ]]; then
            continue
        fi
        
        if [ "$DRY_RUN" = true ]; then
            echo "  将删除空目录: $dir"
        else
            log_verbose "删除空目录: $dir"
            rmdir "$dir" 2>/dev/null || true
        fi
        ((count++))
    done < <(find . -type d -empty -print0 2>/dev/null)
    
    if [ $count -gt 0 ]; then
        log_success "清理了 $count 个空目录"
    else
        log_verbose "没有找到空目录"
    fi
}

# 显示磁盘空间节省
show_disk_usage() {
    if [ "$DRY_RUN" = false ]; then
        log_info "计算磁盘空间使用情况..."
        
        local total_size=$(du -sh . 2>/dev/null | cut -f1)
        log_success "项目当前大小: $total_size"
    fi
}

# 主清理函数
main() {
    echo -e "${BLUE}${BROOM} SmarTalk 项目清理工具${NC}"
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "预览模式 - 不会实际删除文件"
        echo ""
    fi
    
    # 清理临时文件
    remove_files "*.tmp" "临时文件"
    remove_files "*.log" "日志文件"
    remove_files "*.cache" "缓存文件"
    
    # 清理系统文件
    remove_files ".DS_Store" "macOS 系统文件"
    remove_files "Thumbs.db" "Windows 系统文件"
    remove_files "desktop.ini" "Windows 桌面配置文件"
    
    # 清理编辑器文件
    remove_files "*.swp" "Vim 交换文件"
    remove_files "*.swo" "Vim 交换文件"
    remove_files "*~" "编辑器备份文件"
    remove_files "*.orig" "合并冲突文件"
    
    # 清理备份文件
    remove_files "*.bak" "备份文件"
    remove_files "*.backup" "备份文件"
    
    # 清理构建产物
    clean_build_artifacts
    
    # 清理包管理器缓存
    remove_files "package-lock.json.bak" "npm 锁文件备份"
    remove_files "yarn-error.log" "Yarn 错误日志"
    remove_files "npm-debug.log*" "npm 调试日志"
    
    # 清理测试覆盖率文件
    remove_directories "coverage" "测试覆盖率目录"
    remove_directories ".nyc_output" "NYC 输出目录"
    
    # 清理 IDE 配置（可选）
    remove_directories ".vscode" "VS Code 配置目录"
    remove_directories ".idea" "IntelliJ IDEA 配置目录"
    
    # 清理 node_modules（如果指定）
    clean_node_modules
    
    # 清理空目录
    clean_empty_directories
    
    # 显示结果
    echo ""
    if [ "$DRY_RUN" = true ]; then
        log_info "预览完成！使用不带 --dry-run 参数运行以实际清理文件"
    else
        log_success "项目清理完成！"
        show_disk_usage
        
        if [ "$CLEAN_ALL" = true ]; then
            echo ""
            log_warning "已清理 node_modules，请运行 'npm install' 重新安装依赖"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}${TRASH} 清理完成！项目现在更加整洁了。${NC}"
}

# 运行主函数
main "$@"
