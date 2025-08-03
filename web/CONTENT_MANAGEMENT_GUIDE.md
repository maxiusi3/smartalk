# SmarTalk Web 应用内容管理指南

## 📋 概述

SmarTalk Web 应用使用基于文件的内容管理系统，所有学习内容都通过 `contentManager.ts` 进行统一管理。本指南将详细说明如何添加、修改和管理学习内容。

## 🏗️ 内容架构

### 核心内容类型

1. **故事内容 (StoryContent)**
   - 主题故事的基本信息
   - 角色设定和背景描述
   - 关键词列表和学习目标

2. **关键词内容 (KeywordContent)**
   - 词汇定义和翻译
   - 发音指导和语境示例
   - 音频和图片资源链接

3. **vTPR练习 (VTPRExercise)**
   - 音画匹配练习题
   - 多选项图片选择
   - 正确答案标识

## 📁 文件结构

```
web/
├── src/lib/contentManager.ts          # 内容管理核心文件
├── public/
│   ├── videos/                        # 视频文件存储
│   │   ├── travel/
│   │   ├── movie/
│   │   └── workplace/
│   ├── audio/                         # 音频文件存储
│   │   ├── keywords/
│   │   └── pronunciation/
│   └── images/                        # 图片文件存储
│       ├── thumbnails/
│       ├── keywords/
│       └── vtpr-options/
└── CONTENT_MANAGEMENT_GUIDE.md        # 本指南文件
```

## 🎯 内容管理工作流程

### 1. 添加新主题故事

#### 步骤 1: 准备内容素材
- **视频文件**: MP4格式，建议1080p，时长15-30分钟
- **缩略图**: JPG/PNG格式，16:9比例，建议1280x720
- **关键词列表**: 每个主题5-15个核心词汇
- **音频文件**: MP3格式，清晰发音，每个关键词单独文件

#### 步骤 2: 上传媒体文件
```bash
# 视频文件
web/public/videos/[theme]/story.mp4

# 缩略图
web/public/images/thumbnails/[theme]_thumbnail.jpg

# 关键词音频
web/public/audio/keywords/[theme]_[keyword].mp3

# 关键词图片
web/public/images/keywords/[theme]_[keyword].jpg
```

#### 步骤 3: 更新 contentManager.ts
在 `initializeContent()` 方法中添加新故事：

```typescript
// 添加新主题故事
const newStory: StoryContent = {
  id: 'new_theme_story',
  theme: 'new_theme', // 新主题名称
  title: '故事标题',
  setting: '故事背景设定',
  characters: ['角色1', '角色2', '角色3'],
  preview: '故事预览描述...',
  duration: '25分钟',
  difficulty: 'intermediate',
  keywordCount: 8,
  videoUrl: '/videos/new_theme/story.mp4',
  thumbnailUrl: '/images/thumbnails/new_theme_thumbnail.jpg',
  keywords: [
    // 关键词列表...
  ]
};

this.stories.set(newStory.id, newStory);
```

### 2. 添加关键词内容

#### 关键词数据结构
```typescript
const keyword: KeywordContent = {
  id: 'theme_keyword_01',
  word: 'example',
  translation: '例子',
  pronunciation: '/ɪɡˈzæmpəl/',
  context: '在句子中的使用示例',
  imageUrl: '/images/keywords/theme_example.jpg',
  audioUrl: '/audio/keywords/theme_example.mp3',
  startTime: 120, // 在视频中出现的秒数
  endTime: 125
};
```

#### 批量添加关键词
```typescript
const keywords: KeywordContent[] = [
  {
    id: 'travel_coffee_01',
    word: 'coffee',
    translation: '咖啡',
    pronunciation: '/ˈkɔːfi/',
    context: 'I would like a cup of coffee, please.',
    imageUrl: '/images/keywords/travel_coffee.jpg',
    audioUrl: '/audio/keywords/travel_coffee.mp3',
    startTime: 45,
    endTime: 48
  },
  // 更多关键词...
];
```

### 3. 创建 vTPR 练习

#### vTPR 练习结构
```typescript
const vtprExercise: VTPRExercise = {
  id: 'vtpr_theme_keyword_01',
  storyId: 'theme_story',
  keyword: 'example',
  translation: '例子',
  audioUrl: '/audio/keywords/theme_example.mp3',
  options: [
    {
      id: 'option_1',
      imageUrl: '/images/vtpr-options/theme_example_correct.jpg',
      isCorrect: true
    },
    {
      id: 'option_2',
      imageUrl: '/images/vtpr-options/theme_example_wrong1.jpg',
      isCorrect: false
    },
    {
      id: 'option_3',
      imageUrl: '/images/vtpr-options/theme_example_wrong2.jpg',
      isCorrect: false
    }
  ]
};
```

## 🎨 媒体文件要求

### 视频文件规范
- **格式**: MP4 (H.264编码)
- **分辨率**: 1920x1080 (推荐) 或 1280x720 (最低)
- **帧率**: 24fps 或 30fps
- **音频**: AAC编码，44.1kHz，立体声
- **时长**: 15-30分钟
- **文件大小**: 建议小于500MB

### 音频文件规范
- **格式**: MP3
- **比特率**: 128kbps 或更高
- **采样率**: 44.1kHz
- **声道**: 单声道或立体声
- **时长**: 关键词发音1-3秒

### 图片文件规范
- **格式**: JPG (照片) 或 PNG (图标/透明背景)
- **缩略图**: 1280x720 (16:9比例)
- **关键词图片**: 400x300 (4:3比例)
- **vTPR选项图片**: 300x200 (3:2比例)
- **文件大小**: 单个图片小于500KB

## 🔧 内容更新流程

### 修改现有内容

1. **定位内容**: 在 `contentManager.ts` 中找到要修改的内容
2. **更新数据**: 修改相应的属性值
3. **更新媒体**: 如需要，替换 public 目录中的媒体文件
4. **测试验证**: 本地测试确保内容正确显示
5. **部署更新**: 提交代码并部署到生产环境

### 删除内容

1. **移除代码引用**: 从 `contentManager.ts` 中删除相关内容
2. **清理媒体文件**: 删除不再使用的媒体文件
3. **更新索引**: 确保所有引用都已移除
4. **测试验证**: 确保应用正常运行

## 📊 内容质量检查清单

### 故事内容检查
- [ ] 故事标题简洁明了
- [ ] 背景设定清晰有趣
- [ ] 角色设定符合主题
- [ ] 预览描述吸引人
- [ ] 难度等级准确
- [ ] 关键词数量合理 (5-15个)

### 关键词检查
- [ ] 词汇选择符合主题和难度
- [ ] 翻译准确无误
- [ ] 发音标注正确
- [ ] 语境示例自然
- [ ] 音频发音清晰
- [ ] 图片内容相关

### vTPR练习检查
- [ ] 音频质量清晰
- [ ] 图片选项相关性强
- [ ] 正确答案明确
- [ ] 干扰选项合理
- [ ] 难度适中

## 🚀 部署和发布

### 本地测试
```bash
# 启动开发服务器
npm run dev

# 访问测试页面
http://localhost:3000/story-preview/[theme]
http://localhost:3000/story-clues/[theme]
http://localhost:3000/learning/vtpr
```

### 生产部署
```bash
# 构建应用
npm run build

# 提交更改
git add .
git commit -m "content: add new theme content"
git push origin main

# Vercel 自动部署
# 访问 https://smartalk-web.vercel.app 验证更新
```

## 📞 技术支持

如果在内容管理过程中遇到问题，请检查：

1. **文件路径**: 确保所有媒体文件路径正确
2. **文件格式**: 验证媒体文件格式符合要求
3. **数据结构**: 检查 TypeScript 接口匹配
4. **构建错误**: 查看控制台错误信息
5. **浏览器兼容**: 测试不同浏览器和设备

---

**注意**: 所有内容更新都需要重新构建和部署应用。建议在本地充分测试后再部署到生产环境。
