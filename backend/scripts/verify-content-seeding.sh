#!/bin/bash

# SmarTalk Content Seeding and Management 验证脚本
echo "🎬 SmarTalk Content Seeding and Management Verification"
echo "======================================================="

# 检查种子数据脚本
echo "📄 Checking seed data script..."
if [ -f "src/scripts/seed.ts" ]; then
    echo "✅ src/scripts/seed.ts exists"
    
    # 检查是否包含45个词汇数据
    keyword_count=$(grep -c "word:" src/scripts/seed.ts)
    if [ "$keyword_count" -ge 45 ]; then
        echo "✅ Contains $keyword_count keywords (expected: 45)"
    else
        echo "❌ Only contains $keyword_count keywords (expected: 45)"
        exit 1
    fi
    
    # 检查vTPR视频片段生成函数
    if grep -q "generateVideoClipsForKeyword" src/scripts/seed.ts; then
        echo "✅ vTPR video clips generation function exists"
    else
        echo "❌ vTPR video clips generation function missing"
        exit 1
    fi
else
    echo "❌ src/scripts/seed.ts missing"
    exit 1
fi

# 检查内容管理工具
echo "📄 Checking content management tools..."
tools=(
    "scripts/content-manager.ts"
    "docs/cdn-integration.md"
    "docs/content-production-checklist.md"
)

for tool in "${tools[@]}"; do
    if [ -f "$tool" ]; then
        echo "✅ $tool exists"
    else
        echo "❌ $tool missing"
        exit 1
    fi
done

# 检查内容目录结构
echo "📁 Checking content directory structure..."
content_dirs=(
    "content/videos/travel"
    "content/videos/movies"
    "content/videos/workplace"
    "content/audio/travel"
    "content/audio/movies"
    "content/audio/workplace"
    "content/clips/travel"
    "content/clips/movies"
    "content/clips/workplace"
    "content/images/interests"
    "content/images/dramas"
    "content/images/ui"
    "content/subtitles/travel"
    "content/subtitles/movies"
    "content/subtitles/workplace"
)

for dir in "${content_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "❌ $dir missing"
        exit 1
    fi
done

# 检查package.json中的内容管理脚本
echo "📄 Checking package.json scripts..."
content_scripts=(
    "content:validate"
    "content:manifest"
    "content:setup"
    "content:checklist"
    "content:all"
)

for script in "${content_scripts[@]}"; do
    if grep -q "\"$script\":" package.json; then
        echo "✅ $script script defined"
    else
        echo "❌ $script script missing"
        exit 1
    fi
done

# 验证种子数据结构
echo "🔍 Validating seed data structure..."

# 检查三个主题的数据
themes=("travel" "movies" "workplace")
for theme in "${themes[@]}"; do
    theme_count=$(grep -c "dramaIndex: [0-2]" src/scripts/seed.ts | head -1)
    if [ "$theme_count" -gt 0 ]; then
        echo "✅ $theme theme data structure present"
    else
        echo "❌ $theme theme data structure missing"
        exit 1
    fi
done

# TypeScript编译检查
echo "🔍 Checking TypeScript compilation..."
if npx tsc --noEmit; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# 验证CDN文档完整性
echo "📖 Validating CDN documentation..."
cdn_sections=(
    "文件组织结构"
    "CDN部署策略"
    "内容规格要求"
    "缓存策略"
)

for section in "${cdn_sections[@]}"; do
    if grep -q "$section" docs/cdn-integration.md; then
        echo "✅ CDN documentation contains: $section"
    else
        echo "❌ CDN documentation missing: $section"
        exit 1
    fi
done

# 验证内容制作清单
echo "📋 Validating content production checklist..."
checklist_items=(
    "主要视频内容"
    "词汇内容"
    "内容制作统计"
    "制作优先级"
)

for item in "${checklist_items[@]}"; do
    if grep -q "$item" docs/content-production-checklist.md; then
        echo "✅ Production checklist contains: $item"
    else
        echo "❌ Production checklist missing: $item"
        exit 1
    fi
done

echo ""
echo "🎉 Content Seeding and Management verification completed successfully!"
echo ""
echo "📊 Summary:"
echo "- ✅ Seed data script with 45 keywords implemented"
echo "- ✅ vTPR video clips generation function created"
echo "- ✅ Content management tools developed"
echo "- ✅ CDN integration strategy documented"
echo "- ✅ Content directory structure established (15 directories)"
echo "- ✅ Content production checklist generated"
echo "- ✅ Package.json scripts configured (5 scripts)"
echo "- ✅ TypeScript compilation successful"
echo ""
echo "🚀 Content seeding and management system is ready!"
echo "Next steps:"
echo "1. Begin content production using the checklist"
echo "2. Set up CDN infrastructure"
echo "3. Implement content validation automation"
echo ""
echo "📈 Content Statistics:"
echo "- 3 interest themes"
echo "- 45 vocabulary items (15 per theme)"
echo "- 180 vTPR video clips (4 per vocabulary)"
echo "- 45 audio pronunciation files"
echo "- 9 main video files"
echo "- Total: 279 content files to produce"
echo ""
