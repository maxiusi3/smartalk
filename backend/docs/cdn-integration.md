# CDN Integration and Content Delivery Strategy

## 概述

SmarTalk MVP的内容交付网络(CDN)集成方案，支持视频、音频、图片等多媒体内容的高效分发。

## 文件组织结构

```
/content/
├── videos/                    # 主要视频内容
│   ├── travel/               # 旅行主题
│   │   ├── coffee-shop-encounter.mp4          # 完整剧集（带字幕）
│   │   ├── coffee-shop-encounter-no-subs.mp4  # 无字幕版本
│   │   └── coffee-shop-encounter.srt          # 字幕文件
│   ├── movies/               # 电影主题
│   │   ├── cinema-experience.mp4
│   │   ├── cinema-experience-no-subs.mp4
│   │   └── cinema-experience.srt
│   └── workplace/            # 职场主题
│       ├── office-meeting.mp4
│       ├── office-meeting-no-subs.mp4
│       └── office-meeting.srt
├── audio/                    # 词汇发音音频
│   ├── travel/               # 旅行词汇音频
│   │   ├── excuse.mp3
│   │   ├── table.mp3
│   │   ├── coffee.mp3
│   │   └── ... (15个音频文件)
│   ├── movies/               # 电影词汇音频
│   │   ├── movie.mp3
│   │   ├── ticket.mp3
│   │   └── ... (15个音频文件)
│   └── workplace/            # 职场词汇音频
│       ├── meeting.mp3
│       ├── presentation.mp3
│       └── ... (15个音频文件)
├── clips/                    # vTPR视频片段
│   ├── travel/               # 旅行主题片段
│   │   ├── excuse_correct.mp4     # 正确选项
│   │   ├── excuse_wrong1.mp4      # 干扰选项1
│   │   ├── excuse_wrong2.mp4      # 干扰选项2
│   │   ├── excuse_wrong3.mp4      # 干扰选项3
│   │   ├── coffee_correct.mp4
│   │   └── ... (60个片段文件)
│   ├── movies/               # 电影主题片段
│   │   └── ... (60个片段文件)
│   └── workplace/            # 职场主题片段
│       └── ... (60个片段文件)
├── images/                   # 图片资源
│   ├── interests/            # 兴趣主题图标
│   │   ├── travel.png
│   │   ├── movies.png
│   │   └── workplace.png
│   ├── dramas/               # 剧集缩略图
│   │   ├── coffee-shop-thumb.jpg
│   │   ├── cinema-experience-thumb.jpg
│   │   └── office-meeting-thumb.jpg
│   └── ui/                   # UI图标和装饰
│       ├── play-button.svg
│       ├── pause-button.svg
│       └── progress-bar.png
└── subtitles/                # 字幕文件
    ├── travel/
    ├── movies/
    └── workplace/
```

## CDN部署策略

### 开发环境
- **本地静态文件服务**
- 使用Express.js静态文件中间件
- 基础URL: `http://localhost:3001/content/`

### 测试环境
- **AWS S3 + CloudFront**
- S3存储桶: `smartalk-content-staging`
- CloudFront分发: `https://staging-cdn.smartalk.app/`
- 支持HTTPS和HTTP/2

### 生产环境
- **专业CDN服务** (推荐AWS CloudFront或阿里云CDN)
- 全球节点分发
- 智能缓存策略
- 基础URL: `https://cdn.smartalk.app/`

## 内容规格要求

### 视频文件
- **格式**: MP4 (H.264编码)
- **分辨率**: 1280x720 (720p)
- **帧率**: 30fps
- **码率**: 2-4 Mbps
- **时长**: 
  - 主剧集: 60秒
  - vTPR片段: 2-4秒

### 音频文件
- **格式**: MP3
- **采样率**: 44.1kHz
- **码率**: 128kbps
- **声道**: 单声道
- **时长**: 1-3秒

### 图片文件
- **格式**: PNG (图标), JPEG (照片)
- **尺寸**: 
  - 兴趣图标: 128x128px
  - 剧集缩略图: 320x180px
  - UI图标: 24x24px, 48x48px

### 字幕文件
- **格式**: SRT
- **编码**: UTF-8
- **时间精度**: 毫秒级

## 缓存策略

### 静态资源缓存
```
Cache-Control: public, max-age=31536000  # 1年
```
- 视频文件
- 音频文件
- 图片文件

### 动态内容缓存
```
Cache-Control: public, max-age=3600     # 1小时
```
- 字幕文件
- API响应

### 无缓存内容
```
Cache-Control: no-cache
```
- 用户进度数据
- 实时分析数据

## 内容安全

### 访问控制
- 公开内容: 兴趣图标、UI图标
- 受限内容: 视频、音频文件（需要用户认证）
- 私有内容: 用户数据、分析报告

### 防盗链保护
- Referer检查
- 时间戳签名
- IP白名单（开发环境）

## 性能优化

### 预加载策略
- 首页加载: 兴趣图标
- 选择兴趣后: 对应主题的缩略图
- 开始学习前: 第一个视频的前10秒

### 渐进式加载
- 视频: 分段加载，支持断点续传
- 音频: 按需加载
- 图片: 懒加载

### 压缩优化
- Gzip压缩: 文本文件、字幕
- 图片压缩: WebP格式支持
- 视频压缩: 自适应码率

## 监控和分析

### 关键指标
- CDN命中率
- 平均响应时间
- 带宽使用量
- 错误率

### 监控工具
- CloudWatch (AWS)
- 自定义分析脚本
- 用户体验监控

## 成本优化

### 存储成本
- 冷存储: 历史版本内容
- 热存储: 当前活跃内容
- 智能分层存储

### 传输成本
- 区域优化: 就近访问
- 压缩传输: 减少带宽
- 缓存优化: 减少回源

## 实施计划

### Phase 1: 本地开发 (当前)
- [x] 文件结构设计
- [x] 本地静态服务配置
- [ ] 内容上传工具

### Phase 2: 云端部署 (下周)
- [ ] S3存储桶配置
- [ ] CloudFront分发设置
- [ ] 域名和SSL证书

### Phase 3: 生产优化 (后续)
- [ ] 全球CDN部署
- [ ] 性能监控系统
- [ ] 自动化运维工具

## 开发工具

### 内容管理脚本
```bash
# 上传内容到CDN
npm run upload-content

# 验证内容完整性
npm run verify-content

# 生成内容清单
npm run generate-manifest
```

### 本地开发服务
```bash
# 启动本地CDN服务
npm run serve-content

# 监听文件变化
npm run watch-content
```
