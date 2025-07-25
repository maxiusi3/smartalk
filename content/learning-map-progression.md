# SmarTalk 学习地图进度管理

## 🗺️ 学习路径设计

### 整体架构
每个兴趣主题包含2个章节，形成完整的学习进阶路径：
- **第1章**: 基础场景，建立信心
- **第2章**: 进阶场景，提升技能

### 解锁机制
- 用户选择兴趣后，第1章自动解锁
- 完成第1章的vTPR学习后，第2章解锁
- 每章包含15个核心词汇，60个vTPR练习视频

## 📚 各主题章节内容

### 🌍 旅行主题
**第1章: 巴黎咖啡馆初遇**
- 场景: 中国游客与法国咖啡师的温馨互动
- 难度: 初级 (Beginner)
- 词汇: Welcome, Recommend, Signature, Perfect, Window, Beautiful, Wonderful, Atmosphere, Magical, Hope, Smooth, Aromatic, Choice, View, Exactly
- 学习目标: 建立基础旅行交流信心

**第2章: 机场问路** 🔓
- 场景: 在国际机场寻求帮助和指路
- 难度: 初级 (Beginner)
- 词汇: Excuse me, Looking for, Lost, Terminal, Shuttle, Corridor, Journey, Run, Departure, Duty-free, Boards, Plenty, Reach, Saved, Safe travels
- 学习目标: 掌握复杂环境中的问题解决能力

### 🎬 电影主题
**第1章: 电影院偶遇**
- 场景: 电影爱好者在影院大厅的讨论
- 难度: 初级 (Beginner)
- 词汇: Incredible, Plot, Twist, Ending, Cinematography, Stunning, Soundtrack, Emotional, Performance, Outstanding, Transformation, Recommendation, Realistic, Captured, Impressive
- 学习目标: 学会基础的艺术讨论

**第2章: 网络影评讨论** 🔓
- 场景: 影评博主与电影学院学生的深度分析
- 难度: 中级 (Intermediate)
- 词汇: Published, Review, Brilliant, Approach, Mixed, Stand out, Narrative, Unconventional, Linear, Flashbacks, Complexity, Engaged, Expectations, Exceptional, Perspectives
- 学习目标: 提升专业影评分析能力

### 💼 职场主题
**第1章: 会议室讨论**
- 场景: 项目经理与团队成员的会议讨论
- 难度: 中级 (Intermediate)
- 词汇: Status, Contribute, Challenges, Deadline, Obstacles, Prioritize, Critical, Implement, Strategy, Iteration, Proposal, Teamwork, Eager, Overcome, Elaborate
- 学习目标: 掌握基础商务沟通

**第2章: 客户演示汇报** 🔓
- 场景: 项目负责人向重要客户的产品演示
- 难度: 高级 (Advanced)
- 词汇: Proposal, Requirements, Demonstrate, Dashboard, Real-time, Analytics, Operations, Interface, Integrate, Migration, Scalability, Infrastructure, Accommodate, Comprehensive, Implementation
- 学习目标: 培养高级商务演示技能

## 🔓 解锁逻辑实现

### 数据库设计
```sql
-- 用户进度表
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  drama_id VARCHAR(255) NOT NULL,
  completed_keywords INTEGER DEFAULT 0,
  total_keywords INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  magic_moment_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 剧集表增加顺序字段
ALTER TABLE dramas ADD COLUMN "order" INTEGER DEFAULT 1;
```

### 解锁条件检查
```typescript
// 检查章节解锁条件
async function checkChapterUnlock(userId: string, interestId: string): Promise<Drama[]> {
  const userProgress = await prisma.userProgress.findMany({
    where: { userId },
    include: { drama: true }
  });

  const allDramas = await prisma.drama.findMany({
    where: { interestId },
    orderBy: { order: 'asc' }
  });

  const unlockedDramas = [];
  
  for (const drama of allDramas) {
    if (drama.order === 1) {
      // 第一章总是解锁
      unlockedDramas.push({ ...drama, isUnlocked: true });
    } else {
      // 检查前一章是否完成
      const previousDrama = allDramas.find(d => d.order === drama.order - 1);
      const previousProgress = userProgress.find(p => p.dramaId === previousDrama?.id);
      
      const isUnlocked = previousProgress?.magicMomentCompleted || false;
      unlockedDramas.push({ ...drama, isUnlocked });
    }
  }
  
  return unlockedDramas;
}
```

## 🎯 学习地图UI设计

### 章节卡片状态
1. **已完成** ✅
   - 绿色边框和完成徽章
   - 显示"已完成 • X个故事线索"
   - 可重复学习

2. **进行中** 🔄
   - 蓝色边框和进度条
   - 显示"进行中 • X/15"
   - 继续学习按钮

3. **已解锁** 🔓
   - 正常边框，可点击
   - 显示章节信息和预估时间
   - 开始学习按钮

4. **锁定状态** 🔒
   - 灰色显示，不可点击
   - 显示"完成上一章节后解锁"
   - 锁定图标

### 进度可视化
```typescript
interface ChapterProgress {
  id: string;
  title: string;
  description: string;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number; // 0-100
  keywordCount: number;
  completedKeywords: number;
  estimatedTime: number; // 分钟
}
```

## 🚀 实现步骤

### 1. 后端API更新
```typescript
// GET /api/v1/learning-map/:userId/:interestId
export async function getLearningMap(req: Request, res: Response) {
  const { userId, interestId } = req.params;
  
  try {
    const chapters = await checkChapterUnlock(userId, interestId);
    const userStats = await getUserLearningStats(userId, interestId);
    
    res.json({
      chapters,
      stats: userStats,
      overallProgress: calculateOverallProgress(chapters)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load learning map' });
  }
}
```

### 2. 前端组件更新
```typescript
// LearningMapScreen.tsx
const LearningMapScreen = () => {
  const [chapters, setChapters] = useState<ChapterProgress[]>([]);
  
  useEffect(() => {
    loadLearningMap();
  }, []);
  
  const loadLearningMap = async () => {
    const response = await ApiService.getLearningMap(userId, interestId);
    setChapters(response.chapters);
  };
  
  const handleChapterPress = (chapter: ChapterProgress) => {
    if (!chapter.isUnlocked) {
      showUnlockMessage();
      return;
    }
    
    navigation.navigate('Learning', { 
      dramaId: chapter.id,
      isNewChapter: !chapter.isCompleted 
    });
  };
  
  // ... 渲染逻辑
};
```

### 3. 解锁动画效果
```typescript
// 章节解锁时的庆祝动画
const celebrateChapterUnlock = (chapterTitle: string) => {
  showNotification({
    title: '🎉 新章节解锁！',
    message: `恭喜解锁"${chapterTitle}"`,
    type: 'success',
    duration: 3000
  });
  
  // 播放解锁音效
  playUnlockSound();
  
  // 显示解锁动画
  triggerUnlockAnimation();
};
```

## 📊 学习数据分析

### 关键指标
- **章节完成率**: 各章节的完成百分比
- **解锁转化率**: 第1章完成后进入第2章的比例
- **词汇掌握度**: 每个词汇的正确率统计
- **学习时长**: 每章节的平均学习时间
- **重复学习率**: 用户重复学习章节的频率

### 数据收集
```typescript
// 章节完成事件
AnalyticsService.track('chapter_completed', {
  userId,
  chapterId: drama.id,
  interestId: drama.interestId,
  chapterOrder: drama.order,
  completionTime: Date.now() - startTime,
  keywordsLearned: completedKeywords.length,
  accuracy: calculateAccuracy(attempts)
});

// 章节解锁事件
AnalyticsService.track('chapter_unlocked', {
  userId,
  unlockedChapterId: nextChapter.id,
  previousChapterId: currentChapter.id,
  unlockTime: Date.now()
});
```

## 🎯 用户体验优化

### 激励机制
1. **解锁庆祝**: 新章节解锁时的特殊动画和音效
2. **进度可视化**: 清晰的进度条和完成状态
3. **成就系统**: 完成章节获得特殊徽章
4. **学习建议**: 基于进度的个性化学习建议

### 学习路径引导
1. **下一步提示**: 明确指示用户下一步应该做什么
2. **难度递进**: 从简单到复杂的自然过渡
3. **复习机制**: 鼓励用户复习已完成的章节
4. **跨主题推荐**: 完成一个主题后推荐其他主题

这个学习地图系统将为用户提供清晰的学习路径和持续的激励，确保他们能够循序渐进地提升英语能力！