// 魔法时刻检测系统 - 识别用户理解突破的关键时刻
import { progressManager, UserProgress, StoryProgress, KeywordProgress } from './progressManager';

export interface MagicMoment {
  id: string;
  type: 'first_comprehension' | 'streak_breakthrough' | 'accuracy_milestone' | 'speed_improvement' | 'theme_mastery' | 'overall_breakthrough';
  title: string;
  description: string;
  personalizedMessage: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  experienceReward: number;
  triggeredAt: string;
  context: MagicMomentContext;
  celebrationLevel: 'subtle' | 'moderate' | 'spectacular';
  shareableContent: ShareableContent;
}

export interface MagicMomentContext {
  theme: string;
  sessionDuration: number; // 分钟
  keywordsLearned: number;
  accuracyAchieved: number;
  streakDays: number;
  totalStudyTime: number;
  previousBestAccuracy: number;
  improvementPercentage: number;
  milestone: string;
}

export interface ShareableContent {
  title: string;
  description: string;
  imageUrl?: string;
  hashtags: string[];
  stats: {
    label: string;
    value: string;
    icon: string;
  }[];
}

export interface MagicMomentTrigger {
  condition: (progress: UserProgress, context: any) => boolean;
  priority: number; // 1-10, 10 being highest priority
  cooldown: number; // 小时，防止频繁触发
  createMoment: (progress: UserProgress, context: any) => MagicMoment;
}

class MagicMomentDetector {
  private triggers: Map<string, MagicMomentTrigger> = new Map();
  private recentMoments: MagicMoment[] = [];
  private lastTriggerTimes: Map<string, number> = new Map();

  constructor() {
    this.initializeTriggers();
  }

  private initializeTriggers() {
    // 1. 首次理解突破 - 最重要的魔法时刻
    this.triggers.set('first_comprehension', {
      condition: (progress: UserProgress, context: any) => {
        // 检查是否首次在30分钟内完成一个完整的学习流程
        const sessionTime = context.sessionDuration || 0;
        const accuracy = context.accuracy || 0;
        const keywordsLearned = context.keywordsLearned || 0;
        
        return sessionTime <= 30 && 
               sessionTime >= 15 && 
               accuracy >= 70 && 
               keywordsLearned >= 3 &&
               !this.hasTriggeredBefore('first_comprehension');
      },
      priority: 10,
      cooldown: 24, // 24小时冷却
      createMoment: (progress: UserProgress, context: any) => ({
        id: `magic_${Date.now()}_first_comprehension`,
        type: 'first_comprehension',
        title: '🎉 魔法时刻来了！',
        description: '恭喜！你刚刚体验了无字幕理解英语的神奇感觉！',
        personalizedMessage: `在短短${context.sessionDuration}分钟内，你成功掌握了${context.keywordsLearned}个关键词，准确率达到${Math.round(context.accuracy)}%。这就是神经沉浸法的魔力！`,
        icon: '✨',
        rarity: 'legendary',
        experienceReward: 500,
        triggeredAt: new Date().toISOString(),
        context: {
          theme: context.theme || 'unknown',
          sessionDuration: context.sessionDuration,
          keywordsLearned: context.keywordsLearned,
          accuracyAchieved: context.accuracy,
          streakDays: progress.streakDays,
          totalStudyTime: progress.totalStudyTime,
          previousBestAccuracy: 0,
          improvementPercentage: context.accuracy,
          milestone: '首次魔法时刻'
        },
        celebrationLevel: 'spectacular',
        shareableContent: {
          title: '我在SmarTalk体验了英语学习的魔法时刻！',
          description: `仅用${context.sessionDuration}分钟就实现了无字幕理解，准确率${Math.round(context.accuracy)}%！`,
          hashtags: ['#SmarTalk', '#英语学习', '#魔法时刻', '#神经沉浸法'],
          stats: [
            { label: '学习时长', value: `${context.sessionDuration}分钟`, icon: '⏱️' },
            { label: '掌握词汇', value: `${context.keywordsLearned}个`, icon: '📚' },
            { label: '理解准确率', value: `${Math.round(context.accuracy)}%`, icon: '🎯' }
          ]
        }
      })
    });

    // 2. 连续学习突破
    this.triggers.set('streak_breakthrough', {
      condition: (progress: UserProgress, context: any) => {
        return progress.streakDays >= 7 && 
               progress.streakDays % 7 === 0 && 
               !this.hasTriggeredRecently('streak_breakthrough', 6); // 6小时内不重复
      },
      priority: 8,
      cooldown: 6,
      createMoment: (progress: UserProgress, context: any) => ({
        id: `magic_${Date.now()}_streak_breakthrough`,
        type: 'streak_breakthrough',
        title: '🔥 坚持的力量！',
        description: '连续学习的习惯正在改变你的大脑！',
        personalizedMessage: `连续${progress.streakDays}天的坚持学习，你已经掌握了${progress.learningStats.keywordsMastered}个词汇，总学习时长达到${Math.round(progress.totalStudyTime)}分钟。持续的努力正在创造奇迹！`,
        icon: '🔥',
        rarity: progress.streakDays >= 30 ? 'legendary' : progress.streakDays >= 14 ? 'epic' : 'rare',
        experienceReward: progress.streakDays * 10,
        triggeredAt: new Date().toISOString(),
        context: {
          theme: context.theme || 'streak',
          sessionDuration: context.sessionDuration || 0,
          keywordsLearned: progress.learningStats.keywordsMastered,
          accuracyAchieved: progress.learningStats.overallAccuracy,
          streakDays: progress.streakDays,
          totalStudyTime: progress.totalStudyTime,
          previousBestAccuracy: 0,
          improvementPercentage: 0,
          milestone: `${progress.streakDays}天连续学习`
        },
        celebrationLevel: progress.streakDays >= 30 ? 'spectacular' : 'moderate',
        shareableContent: {
          title: `坚持${progress.streakDays}天英语学习的成果！`,
          description: `通过SmarTalk的神经沉浸法，我已经连续学习${progress.streakDays}天，掌握了${progress.learningStats.keywordsMastered}个词汇！`,
          hashtags: ['#SmarTalk', '#坚持学习', '#英语进步', '#学习习惯'],
          stats: [
            { label: '连续天数', value: `${progress.streakDays}天`, icon: '🔥' },
            { label: '掌握词汇', value: `${progress.learningStats.keywordsMastered}个`, icon: '📚' },
            { label: '总学习时长', value: `${Math.round(progress.totalStudyTime)}分钟`, icon: '⏱️' }
          ]
        }
      })
    });

    // 3. 准确率里程碑
    this.triggers.set('accuracy_milestone', {
      condition: (progress: UserProgress, context: any) => {
        const currentAccuracy = context.accuracy || progress.learningStats.overallAccuracy;
        const milestones = [80, 85, 90, 95];
        
        return milestones.some(milestone => 
          currentAccuracy >= milestone && 
          !this.hasAchievedAccuracyMilestone(milestone)
        );
      },
      priority: 7,
      cooldown: 2,
      createMoment: (progress: UserProgress, context: any) => {
        const currentAccuracy = Math.round(context.accuracy || progress.learningStats.overallAccuracy);
        const milestone = currentAccuracy >= 95 ? 95 : 
                         currentAccuracy >= 90 ? 90 : 
                         currentAccuracy >= 85 ? 85 : 80;
        
        return {
          id: `magic_${Date.now()}_accuracy_${milestone}`,
          type: 'accuracy_milestone',
          title: '🎯 精准理解！',
          description: '你的理解准确率达到了新高度！',
          personalizedMessage: `太棒了！你的理解准确率已经达到${currentAccuracy}%，这表明你的英语理解能力正在快速提升。继续保持这个势头！`,
          icon: '🎯',
          rarity: milestone >= 95 ? 'legendary' : milestone >= 90 ? 'epic' : 'rare',
          experienceReward: milestone * 5,
          triggeredAt: new Date().toISOString(),
          context: {
            theme: context.theme || 'accuracy',
            sessionDuration: context.sessionDuration || 0,
            keywordsLearned: context.keywordsLearned || 0,
            accuracyAchieved: currentAccuracy,
            streakDays: progress.streakDays,
            totalStudyTime: progress.totalStudyTime,
            previousBestAccuracy: progress.learningStats.overallAccuracy,
            improvementPercentage: currentAccuracy - progress.learningStats.overallAccuracy,
            milestone: `${currentAccuracy}%准确率`
          },
          celebrationLevel: milestone >= 90 ? 'spectacular' : 'moderate',
          shareableContent: {
            title: `英语理解准确率突破${currentAccuracy}%！`,
            description: `通过SmarTalk的科学学习方法，我的英语理解能力达到了新的高度！`,
            hashtags: ['#SmarTalk', '#英语进步', '#理解突破', '#学习成果'],
            stats: [
              { label: '理解准确率', value: `${currentAccuracy}%`, icon: '🎯' },
              { label: '学习天数', value: `${progress.streakDays}天`, icon: '📅' },
              { label: '掌握词汇', value: `${progress.learningStats.keywordsMastered}个`, icon: '📚' }
            ]
          }
        };
      }
    });

    // 4. 主题掌握
    this.triggers.set('theme_mastery', {
      condition: (progress: UserProgress, context: any) => {
        if (!context.theme) return false;
        
        const themeStats = progressManager.getThemeStats(context.theme);
        const completionRate = themeStats.total > 0 ? (themeStats.completed / themeStats.total) * 100 : 0;
        
        return completionRate >= 80 && 
               themeStats.accuracy >= 85 &&
               !this.hasTriggeredThemeMastery(context.theme);
      },
      priority: 6,
      cooldown: 1,
      createMoment: (progress: UserProgress, context: any) => {
        const themeMap = {
          travel: { name: '旅行英语', icon: '✈️', description: '旅行场景的英语交流' },
          movie: { name: '电影对话', icon: '🎬', description: '影视作品的英语理解' },
          workplace: { name: '职场沟通', icon: '💼', description: '职场环境的英语应用' }
        };
        const themeInfo = themeMap[context.theme as keyof typeof themeMap] || { name: '英语学习', icon: '📚', description: '英语技能' };

        const themeStats = progressManager.getThemeStats(context.theme);
        
        return {
          id: `magic_${Date.now()}_theme_${context.theme}`,
          type: 'theme_mastery',
          title: `${themeInfo.icon} 主题精通！`,
          description: `你已经掌握了${themeInfo.name}的核心技能！`,
          personalizedMessage: `恭喜！你在${themeInfo.name}方面的表现非常出色，完成度达到${Math.round((themeStats.completed / themeStats.total) * 100)}%，准确率${Math.round(themeStats.accuracy)}%。你已经可以自信地在${themeInfo.description}中使用英语了！`,
          icon: themeInfo.icon,
          rarity: 'epic',
          experienceReward: 300,
          triggeredAt: new Date().toISOString(),
          context: {
            theme: context.theme,
            sessionDuration: context.sessionDuration || 0,
            keywordsLearned: themeStats.completed,
            accuracyAchieved: themeStats.accuracy,
            streakDays: progress.streakDays,
            totalStudyTime: progress.totalStudyTime,
            previousBestAccuracy: 0,
            improvementPercentage: 0,
            milestone: `${themeInfo.name}精通`
          },
          celebrationLevel: 'spectacular',
          shareableContent: {
            title: `我精通了${themeInfo.name}！`,
            description: `通过SmarTalk的学习，我在${themeInfo.description}方面达到了精通水平！`,
            hashtags: ['#SmarTalk', '#英语精通', `#${themeInfo.name}`, '#学习成就'],
            stats: [
              { label: '完成度', value: `${Math.round((themeStats.completed / themeStats.total) * 100)}%`, icon: '📊' },
              { label: '准确率', value: `${Math.round(themeStats.accuracy)}%`, icon: '🎯' },
              { label: '主题', value: themeInfo.name, icon: themeInfo.icon }
            ]
          }
        };
      }
    });
  }

  // 检测魔法时刻
  async detectMagicMoment(context: any): Promise<MagicMoment | null> {
    const userProgress = progressManager.getUserProgress();
    if (!userProgress) return null;

    // 按优先级排序触发器
    const sortedTriggers = Array.from(this.triggers.entries())
      .sort(([, a], [, b]) => b.priority - a.priority);

    for (const [triggerId, trigger] of sortedTriggers) {
      // 检查冷却时间
      if (this.isInCooldown(triggerId, trigger.cooldown)) {
        continue;
      }

      // 检查触发条件
      if (trigger.condition(userProgress, context)) {
        const magicMoment = trigger.createMoment(userProgress, context);
        
        // 记录触发时间
        this.lastTriggerTimes.set(triggerId, Date.now());
        
        // 添加到最近时刻列表
        this.recentMoments.unshift(magicMoment);
        if (this.recentMoments.length > 10) {
          this.recentMoments.pop();
        }

        // 更新用户进度中的成就
        await this.recordMagicMoment(magicMoment);

        return magicMoment;
      }
    }

    return null;
  }

  // 记录魔法时刻到用户进度
  private async recordMagicMoment(moment: MagicMoment): Promise<void> {
    const userProgress = progressManager.getUserProgress();
    if (!userProgress) return;

    // 添加成就
    const achievement = {
      id: moment.id,
      type: 'exploration' as const,
      title: moment.title,
      description: moment.description,
      icon: moment.icon,
      rarity: moment.rarity,
      experienceReward: moment.experienceReward,
      unlockedAt: moment.triggeredAt
    };

    userProgress.achievements.push(achievement);
    userProgress.experience += moment.experienceReward;

    // 检查升级
    const experienceForNextLevel = userProgress.level * 100;
    if (userProgress.experience >= experienceForNextLevel) {
      userProgress.level += 1;
    }

    // 标记魔法时刻已达成
    if (moment.context.theme) {
      const storyProgress = userProgress.storyProgress.get(`${moment.context.theme}_story`);
      if (storyProgress) {
        storyProgress.magicMomentAchieved = true;
      }
    }

    // 保存进度
    await progressManager.getUserProgress(); // 触发保存
  }

  // 辅助方法
  private hasTriggeredBefore(triggerId: string): boolean {
    return this.recentMoments.some(moment => moment.id.includes(triggerId));
  }

  private hasTriggeredRecently(triggerId: string, hours: number): boolean {
    const lastTrigger = this.lastTriggerTimes.get(triggerId);
    if (!lastTrigger) return false;
    
    const hoursAgo = Date.now() - (hours * 60 * 60 * 1000);
    return lastTrigger > hoursAgo;
  }

  private isInCooldown(triggerId: string, cooldownHours: number): boolean {
    return this.hasTriggeredRecently(triggerId, cooldownHours);
  }

  private hasAchievedAccuracyMilestone(milestone: number): boolean {
    return this.recentMoments.some(moment => 
      moment.type === 'accuracy_milestone' && 
      moment.context.accuracyAchieved >= milestone
    );
  }

  private hasTriggeredThemeMastery(theme: string): boolean {
    return this.recentMoments.some(moment => 
      moment.type === 'theme_mastery' && 
      moment.context.theme === theme
    );
  }

  // 获取最近的魔法时刻
  getRecentMagicMoments(): MagicMoment[] {
    return [...this.recentMoments];
  }

  // 清除历史记录（用于测试）
  clearHistory(): void {
    this.recentMoments = [];
    this.lastTriggerTimes.clear();
  }
}

// 导出单例实例
export const magicMomentDetector = new MagicMomentDetector();
