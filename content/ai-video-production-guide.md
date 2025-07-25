# SmarTalk AI视频内容生产指南

## 🎯 内容概览

### 三大学习主题
1. **旅行主题** - "巴黎咖啡馆初遇" (60秒 + 60个vTPR视频)
2. **电影主题** - "电影院偶遇" (60秒 + 60个vTPR视频)  
3. **职场主题** - "会议室讨论" (60秒 + 60个vTPR视频)

### 视频需求统计
- **主视频**: 3个 × 60秒 = 3分钟
- **vTPR练习视频**: 45个词汇 × 4个选项 = 180个短视频
- **总计**: 183个视频文件

## 🤖 推荐AI视频生成工具

### 1. Runway ML (推荐)
**优势**: 高质量、支持中文提示、商业友好
**价格**: $12/月起
**适用**: 主视频和高质量vTPR视频

**使用步骤**:
```bash
1. 访问 runwayml.com
2. 选择 "Gen-2" 视频生成
3. 输入详细的英文提示词
4. 设置视频长度 (4-16秒)
5. 生成并下载高质量视频
```

### 2. Pika Labs
**优势**: 免费使用、Discord集成、快速生成
**价格**: 免费 (有限制)
**适用**: vTPR练习视频批量生成

**使用步骤**:
```bash
1. 加入 Pika Discord 服务器
2. 使用 /create 命令
3. 输入提示词生成视频
4. 下载生成的视频文件
```

### 3. Stable Video Diffusion
**优势**: 开源免费、可本地部署
**价格**: 免费
**适用**: 大批量vTPR视频生成

## 📝 视频生成提示词模板

### 主视频提示词结构
```
[场景描述] + [人物设定] + [动作描述] + [环境细节] + [风格要求]

示例:
"Create a cinematic 60-second video in a cozy Parisian café. 
Young Asian tourist enters, friendly barista greets warmly. 
Warm afternoon lighting, wooden furniture, authentic atmosphere. 
Natural conversations, 4K quality, smooth camera movements."
```

### vTPR视频提示词结构
```
[核心概念] + [视觉表现] + [情感表达] + [技术要求]

示例:
"Close-up of person showing 'welcome' gesture, 
warm smile, open arms, inviting expression, 
professional lighting, 3-second duration."
```

## 🎬 具体生产计划

### 第一阶段：主视频制作 (3天)

#### 旅行主题 - "巴黎咖啡馆初遇"
**Runway ML提示词**:
```
Create a cinematic 60-second video sequence:

Scene 1 (0-15s): Young Asian man (Alex) enters charming Parisian café in Montmartre. Warm afternoon sunlight through large windows. Friendly female barista (Emma) behind counter with genuine welcoming smile. Cozy wooden furniture, vintage French décor.

Scene 2 (15-30s): Emma enthusiastically explains coffee options, pointing to menu board with animated gestures. Alex listens attentively, slightly nervous but interested. Show coffee beans, espresso machine, aromatic steam rising.

Scene 3 (30-45s): Alex gains confidence making his choice. Emma skillfully prepares signature coffee blend. Show coffee-making process: grinding beans, steaming milk, creating latte art.

Scene 4 (45-60s): Emma serves coffee at window table overlooking Parisian street. Both share warm moment of cultural connection. Alex looks content, Emma smiles warmly. End with cozy café atmosphere.

Style: Cinematic quality, warm golden lighting, authentic French café atmosphere, natural interactions, 4K resolution, smooth camera transitions.
```

#### 电影主题 - "电影院偶遇"
**Runway ML提示词**:
```
Create a 60-second modern movie theater lobby scene:

Scene 1 (0-15s): Contemporary cinema lobby after evening screening. Sarah (enthusiastic movie fan) and Mike (fellow moviegoer) exit theater into stylish lobby with movie posters, ambient lighting. Other patrons in background.

Scene 2 (15-30s): Animated discussion about film they just watched. Close-up of excited facial expressions, hand gestures, genuine enthusiasm. Brief flashes of sci-fi movie scenes they're discussing.

Scene 3 (30-45s): Deep conversation about cinematography and acting. Show appreciation gestures, engaged body language, professional film discussion. Montage of impressive movie visuals.

Scene 4 (45-60s): Sarah recommends another film to Mike. He shows interest and gratitude. End with both smiling, connected through shared movie passion. Warm theater lobby lighting.

Style: Modern cinematic, contemporary theater atmosphere, natural film enthusiast conversations, 4K quality, smooth lighting transitions.
```

#### 职场主题 - "会议室讨论"
**Runway ML提示词**:
```
Create a 60-second professional office meeting:

Scene 1 (0-15s): Modern conference room with glass walls, large display screen. Lisa (professional project manager) presents to David (engaged team member). Corporate environment with laptops, documents, charts.

Scene 2 (15-30s): Lisa points to project timeline showing tight deadlines. David leans forward showing concern and engagement. Screen displays project status with deadline warnings.

Scene 3 (30-45s): David stands confidently proposing solution with professional gestures. Lisa listens intently, showing growing interest. Collaborative problem-solving atmosphere.

Scene 4 (45-60s): Successful agreement with handshake. Both look satisfied reviewing project plan together. Professional teamwork and solution achievement.

Style: Corporate professional, bright office lighting, modern business environment, natural workplace interactions, 4K quality, clean aesthetic.
```

### 第二阶段：vTPR视频制作 (7天)

#### 批量生成策略
**每日目标**: 25-30个vTPR视频
**工具组合**: Pika Labs (快速生成) + Runway ML (精品制作)

#### 示例：旅行主题词汇视频

**"Welcome" 词汇 (4个选项)**:

选项A (正确):
```
Pika提示词: "Café barista opening door with welcoming gesture, warm smile, inviting hand motion, cozy coffee shop entrance, 3 seconds"
```

选项B:
```
Pika提示词: "Airport gate with passengers walking, flight attendant in background, busy travel atmosphere, 3 seconds"
```

选项C:
```
Pika提示词: "Hotel reception with concierge checking in guests, marble lobby, professional service, 3 seconds"
```

选项D:
```
Pika提示词: "Retail store with sales associate arranging products, commercial environment, 3 seconds"
```

### 第三阶段：后期制作 (2天)

#### 视频规格标准化
- **分辨率**: 1920×1080 (Full HD)
- **帧率**: 30fps
- **格式**: MP4 (H.264编码)
- **音频**: AAC, 48kHz
- **文件大小**: 主视频<50MB, vTPR视频<10MB

#### 后期制作清单
- [ ] 视频剪辑和时长调整
- [ ] 音频同步和音量平衡
- [ ] 字幕添加和时间轴对齐
- [ ] 关键词高亮效果
- [ ] 视频压缩和格式转换
- [ ] 质量检查和测试播放

## 🎵 音频内容制作

### 语音合成工具推荐
1. **ElevenLabs** - 最自然的AI语音
2. **Azure Speech Services** - 企业级稳定性
3. **Google Text-to-Speech** - 多语言支持

### 音频制作规格
- **格式**: MP3, 320kbps
- **采样率**: 48kHz
- **声道**: 立体声
- **时长**: 2-5秒 (单词发音)

### 语音提示词示例
```
"Generate natural, clear pronunciation of the English word 'Welcome' 
with American accent, friendly tone, moderate speaking speed, 
suitable for language learning."
```

## 📊 内容质量控制

### 视频质量检查标准
- [ ] 画面清晰，无模糊或失真
- [ ] 人物表情和动作自然
- [ ] 场景符合词汇语境
- [ ] 时长符合规格要求
- [ ] 文件格式和大小合规

### 教育效果验证
- [ ] 词汇与视觉内容高度匹配
- [ ] 干扰选项设计合理
- [ ] 难度梯度适中
- [ ] 文化背景准确
- [ ] 学习目标明确

## 💰 预算估算

### AI工具成本
- **Runway ML**: $50/月 × 2个月 = $100
- **ElevenLabs**: $22/月 × 1个月 = $22
- **后期制作软件**: $30/月 × 1个月 = $30
- **总计**: ~$152

### 时间投入
- **内容策划**: 2天
- **视频生成**: 10天
- **后期制作**: 3天
- **质量检查**: 2天
- **总计**: 17个工作日

## 🚀 实施时间表

### Week 1: 准备和主视频
- Day 1-2: 完善剧本和提示词
- Day 3-5: 生成3个主视频
- Day 6-7: 主视频后期制作

### Week 2: vTPR视频制作
- Day 8-12: 批量生成vTPR视频 (180个)
- Day 13-14: vTPR视频后期处理

### Week 3: 完善和测试
- Day 15-16: 音频制作和同步
- Day 17: 最终质量检查和测试

## ✅ 交付清单

### 视频文件
- [ ] 3个主视频 (60秒每个)
- [ ] 180个vTPR练习视频 (3-5秒每个)
- [ ] 45个词汇发音音频文件

### 技术文档
- [ ] 视频文件命名规范
- [ ] CDN上传和配置指南
- [ ] 移动端播放优化设置
- [ ] 内容更新和维护流程

这个生产指南将确保SmarTalk获得高质量、教育效果显著的视频内容，为用户提供真正的"魔法时刻"学习体验！