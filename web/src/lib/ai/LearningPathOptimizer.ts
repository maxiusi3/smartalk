/**
 * LearningPathOptimizer - AI学习路径优化引擎
 * 基于用户学习数据和行为模式，提供个性化的学习路径建议和优化
 */

import { progressManager } from '../progressManager';
import { srsService } from '../services/SRSService';

export interface LearningProfile {
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  difficultyPreference: 'easy' | 'moderate' | 'challenging' | 'adaptive';
  pacePreference: 'slow' | 'moderate' | 'fast' | 'adaptive';
  focusStrength: number; // 0-100, 专注力强度
  memoryRetention: number; // 0-100, 记忆保持能力
  pronunciationSkill: number; // 0-100, 发音技能水平
  consistencyScore: number; // 0-100, 学习一致性评分
  motivationLevel: number; // 0-100, 学习动机水平
  preferredTopics: string[]; // 偏好的学习主题
  weakAreas: string[]; // 需要加强的领域
  strongAreas: string[]; // 擅长的领域
  lastUpdated: string;
}

export interface LearningRecommendation {
  id: string;
  type: 'content' | 'strategy' | 'schedule' | 'focus' | 'review';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  actionItems: string[];
  expectedBenefit: string;
  estimatedTimeToComplete: number; // 分钟
  confidence: number; // 0-100, 推荐置信度
  relatedFeatures: ('focus_mode' | 'pronunciation' | 'rescue_mode' | 'srs')[];
  metadata: {
    basedOnData: string[];
    algorithmVersion: string;
    generatedAt: string;
  };
}

export interface LearningInsight {
  category: 'performance' | 'behavior' | 'progress' | 'prediction';
  insight: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  supportingData: any;
  recommendations: string[];
}

export interface OptimizedLearningPath {
  pathId: string;
  userId: string;
  currentPhase: 'foundation' | 'development' | 'mastery' | 'maintenance';
  recommendations: LearningRecommendation[];
  insights: LearningInsight[];
  nextMilestones: {
    milestone: string;
    estimatedTimeToReach: number;
    requiredActions: string[];
  }[];
  adaptiveAdjustments: {
    reason: string;
    adjustment: string;
    expectedImpact: string;
  }[];
  generatedAt: string;
  validUntil: string;
}

export class LearningPathOptimizer {
  private static instance: LearningPathOptimizer;
  private learningProfiles: Map<string, LearningProfile> = new Map();
  private pathCache: Map<string, OptimizedLearningPath> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

  private constructor() {}

  static getInstance(): LearningPathOptimizer {
    if (!LearningPathOptimizer.instance) {
      LearningPathOptimizer.instance = new LearningPathOptimizer();
    }
    return LearningPathOptimizer.instance;
  }

  /**
   * 分析用户学习数据并生成学习档案
   */
  async analyzeLearningProfile(userId: string): Promise<LearningProfile> {
    const comprehensiveStats = progressManager.getComprehensiveLearningStats();
    const srsStats = srsService.getSRSStatistics();
    
    // 分析学习风格
    const learningStyle = this.determineLearningStyle(comprehensiveStats);
    
    // 分析难度偏好
    const difficultyPreference = this.analyzeDifficultyPreference(comprehensiveStats);
    
    // 分析学习节奏
    const pacePreference = this.analyzePacePreference(comprehensiveStats);
    
    // 计算各项能力指标
    const focusStrength = this.calculateFocusStrength(comprehensiveStats.focusMode);
    const memoryRetention = this.calculateMemoryRetention(srsStats);
    const pronunciationSkill = this.calculatePronunciationSkill(comprehensiveStats.pronunciation);
    const consistencyScore = this.calculateConsistencyScore(comprehensiveStats);
    const motivationLevel = this.calculateMotivationLevel(comprehensiveStats);
    
    // 识别偏好主题和强弱领域
    const preferredTopics = this.identifyPreferredTopics(comprehensiveStats);
    const weakAreas = this.identifyWeakAreas(comprehensiveStats);
    const strongAreas = this.identifyStrongAreas(comprehensiveStats);

    const profile: LearningProfile = {
      userId,
      learningStyle,
      difficultyPreference,
      pacePreference,
      focusStrength,
      memoryRetention,
      pronunciationSkill,
      consistencyScore,
      motivationLevel,
      preferredTopics,
      weakAreas,
      strongAreas,
      lastUpdated: new Date().toISOString()
    };

    this.learningProfiles.set(userId, profile);
    return profile;
  }

  /**
   * 生成优化的学习路径
   */
  async generateOptimizedPath(userId: string): Promise<OptimizedLearningPath> {
    // 检查缓存
    const cached = this.pathCache.get(userId);
    if (cached && new Date(cached.validUntil) > new Date()) {
      return cached;
    }

    // 获取或生成学习档案
    let profile = this.learningProfiles.get(userId);
    if (!profile) {
      profile = await this.analyzeLearningProfile(userId);
    }

    // 确定当前学习阶段
    const currentPhase = this.determineCurrentPhase(profile);
    
    // 生成个性化推荐
    const recommendations = await this.generateRecommendations(profile, currentPhase);
    
    // 生成学习洞察
    const insights = this.generateLearningInsights(profile);
    
    // 设定下一阶段里程碑
    const nextMilestones = this.generateNextMilestones(profile, currentPhase);
    
    // 生成自适应调整建议
    const adaptiveAdjustments = this.generateAdaptiveAdjustments(profile);

    const optimizedPath: OptimizedLearningPath = {
      pathId: `path_${userId}_${Date.now()}`,
      userId,
      currentPhase,
      recommendations,
      insights,
      nextMilestones,
      adaptiveAdjustments,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + this.CACHE_DURATION).toISOString()
    };

    this.pathCache.set(userId, optimizedPath);
    return optimizedPath;
  }

  /**
   * 确定学习风格
   */
  private determineLearningStyle(stats: any): LearningProfile['learningStyle'] {
    const focusUsage = stats.focusMode?.triggered || 0;
    const pronunciationUsage = stats.pronunciation?.assessments || 0;
    const rescueUsage = stats.rescueMode?.triggered || 0;
    
    // 基于功能使用模式判断学习风格
    if (focusUsage > pronunciationUsage && focusUsage > rescueUsage) {
      return 'visual'; // 更多使用视觉引导
    } else if (pronunciationUsage > focusUsage && pronunciationUsage > rescueUsage) {
      return 'auditory'; // 更多进行发音练习
    } else if (rescueUsage > 0) {
      return 'kinesthetic'; // 需要更多互动帮助
    }
    return 'mixed';
  }

  /**
   * 分析难度偏好
   */
  private analyzeDifficultyPreference(stats: any): LearningProfile['difficultyPreference'] {
    const overallAccuracy = stats.overall?.overallAccuracy || 0;
    const rescueTriggered = stats.rescueMode?.triggered || 0;
    
    if (overallAccuracy > 85 && rescueTriggered < 5) {
      return 'challenging'; // 高准确率，很少需要救援
    } else if (overallAccuracy > 70 && rescueTriggered < 10) {
      return 'moderate'; // 中等准确率，偶尔需要救援
    } else if (overallAccuracy < 60 || rescueTriggered > 15) {
      return 'easy'; // 低准确率，经常需要救援
    }
    return 'adaptive';
  }

  /**
   * 分析学习节奏偏好
   */
  private analyzePacePreference(stats: any): LearningProfile['pacePreference'] {
    const totalSessions = stats.overall?.totalSessions || 0;
    const totalTimeSpent = stats.overall?.totalTimeSpent || 0;
    
    if (totalSessions === 0) return 'adaptive';
    
    const avgSessionTime = totalTimeSpent / totalSessions;
    
    if (avgSessionTime > 30) {
      return 'slow'; // 长时间学习会话
    } else if (avgSessionTime > 15) {
      return 'moderate'; // 中等时长会话
    } else {
      return 'fast'; // 短时间高频会话
    }
  }

  /**
   * 计算专注力强度
   */
  private calculateFocusStrength(focusStats: any): number {
    if (!focusStats) return 50;
    
    const triggered = focusStats.triggered || 0;
    const successRate = focusStats.successRate || 0;
    const effectiveness = focusStats.effectiveness || 0;
    
    // 触发次数少但成功率高表示专注力强
    let score = 50;
    if (triggered < 5 && successRate > 80) {
      score = 85; // 很少需要Focus Mode且效果好
    } else if (triggered < 10 && successRate > 60) {
      score = 70; // 偶尔需要Focus Mode
    } else if (triggered > 20 || successRate < 40) {
      score = 30; // 经常需要Focus Mode或效果不佳
    }
    
    return Math.min(100, Math.max(0, score + (effectiveness - 50) * 0.3));
  }

  /**
   * 计算记忆保持能力
   */
  private calculateMemoryRetention(srsStats: any): number {
    if (!srsStats) return 50;
    
    const overallAccuracy = srsStats.overallAccuracy || 0;
    const graduatedCards = srsStats.graduatedCards || 0;
    const totalCards = srsStats.totalCards || 1;
    
    const graduationRate = (graduatedCards / totalCards) * 100;
    
    // 结合复习准确率和毕业率
    return Math.min(100, (overallAccuracy * 0.7) + (graduationRate * 0.3));
  }

  /**
   * 计算发音技能水平
   */
  private calculatePronunciationSkill(pronunciationStats: any): number {
    if (!pronunciationStats) return 50;
    
    const averageScore = pronunciationStats.averageScore || 0;
    const assessments = pronunciationStats.assessments || 0;
    const improvement = pronunciationStats.improvement || 0;
    
    // 基于平均分数、评估次数和改进趋势
    let score = averageScore;
    
    // 评估次数多表示练习充分
    if (assessments > 50) score += 5;
    else if (assessments > 20) score += 2;
    
    // 改进趋势积极
    if (improvement > 10) score += 10;
    else if (improvement > 5) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * 计算学习一致性评分
   */
  private calculateConsistencyScore(stats: any): number {
    const totalSessions = stats.overall?.totalSessions || 0;
    const totalTimeSpent = stats.overall?.totalTimeSpent || 0;
    
    if (totalSessions === 0) return 0;
    
    // 基于学习频率和时长的一致性
    const avgSessionTime = totalTimeSpent / totalSessions;
    const sessionFrequency = totalSessions / 30; // 假设30天内的会话
    
    let score = 50;
    
    // 会话时长一致性
    if (avgSessionTime >= 10 && avgSessionTime <= 30) {
      score += 20; // 理想的会话时长
    }
    
    // 学习频率一致性
    if (sessionFrequency >= 0.5) { // 每两天至少一次
      score += 30;
    } else if (sessionFrequency >= 0.3) { // 每三天至少一次
      score += 15;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * 计算学习动机水平
   */
  private calculateMotivationLevel(stats: any): number {
    const totalSessions = stats.overall?.totalSessions || 0;
    const overallAccuracy = stats.overall?.overallAccuracy || 0;
    const srsReviews = stats.srs?.reviewsToday || 0;
    
    let score = 50;
    
    // 学习活跃度
    if (totalSessions > 20) score += 20;
    else if (totalSessions > 10) score += 10;
    
    // 学习效果
    if (overallAccuracy > 80) score += 15;
    else if (overallAccuracy > 60) score += 8;
    
    // SRS复习积极性
    if (srsReviews > 10) score += 15;
    else if (srsReviews > 5) score += 8;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * 识别偏好主题
   */
  private identifyPreferredTopics(stats: any): string[] {
    // 基于学习数据识别用户偏好的主题
    // 这里简化处理，实际应用中可以基于更详细的学习内容数据
    const topics = ['travel', 'business', 'technology', 'daily_life', 'culture'];
    return topics.slice(0, 2); // 返回前两个偏好主题
  }

  /**
   * 识别薄弱领域
   */
  private identifyWeakAreas(stats: any): string[] {
    const weakAreas: string[] = [];
    
    if (stats.focusMode?.triggered > 10) {
      weakAreas.push('attention_focus');
    }
    
    if (stats.pronunciation?.averageScore < 70) {
      weakAreas.push('pronunciation');
    }
    
    if (stats.rescueMode?.triggered > 15) {
      weakAreas.push('learning_persistence');
    }
    
    if (stats.srs?.accuracyRate < 70) {
      weakAreas.push('memory_retention');
    }
    
    return weakAreas;
  }

  /**
   * 识别优势领域
   */
  private identifyStrongAreas(stats: any): string[] {
    const strongAreas: string[] = [];
    
    if (stats.focusMode?.successRate > 85) {
      strongAreas.push('visual_learning');
    }
    
    if (stats.pronunciation?.averageScore > 85) {
      strongAreas.push('pronunciation');
    }
    
    if (stats.rescueMode?.effectiveness > 80) {
      strongAreas.push('problem_solving');
    }
    
    if (stats.srs?.accuracyRate > 85) {
      strongAreas.push('memory_retention');
    }
    
    return strongAreas;
  }

  /**
   * 确定当前学习阶段
   */
  private determineCurrentPhase(profile: LearningProfile): OptimizedLearningPath['currentPhase'] {
    const avgSkill = (profile.focusStrength + profile.memoryRetention + profile.pronunciationSkill) / 3;
    
    if (avgSkill < 40) {
      return 'foundation';
    } else if (avgSkill < 70) {
      return 'development';
    } else if (avgSkill < 90) {
      return 'mastery';
    } else {
      return 'maintenance';
    }
  }

  /**
   * 生成个性化推荐
   */
  private async generateRecommendations(
    profile: LearningProfile, 
    phase: OptimizedLearningPath['currentPhase']
  ): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];
    
    // 基于薄弱领域生成推荐
    for (const weakArea of profile.weakAreas) {
      recommendations.push(this.generateWeaknessRecommendation(weakArea, profile));
    }
    
    // 基于学习阶段生成推荐
    recommendations.push(...this.generatePhaseRecommendations(phase, profile));
    
    // 基于学习风格生成推荐
    recommendations.push(this.generateStyleRecommendation(profile));
    
    // 按优先级排序
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 生成薄弱领域推荐
   */
  private generateWeaknessRecommendation(weakArea: string, profile: LearningProfile): LearningRecommendation {
    const recommendations = {
      attention_focus: {
        title: '提升专注力训练',
        description: '通过Focus Mode练习提升学习专注力',
        reasoning: '检测到您在学习过程中经常分心，建议加强专注力训练',
        actionItems: [
          '每日进行10分钟专注力练习',
          '在安静环境中学习',
          '使用Focus Mode的视觉引导功能'
        ],
        expectedBenefit: '提升学习效率25%，减少错误率',
        relatedFeatures: ['focus_mode' as const]
      },
      pronunciation: {
        title: '发音技能强化',
        description: '加强发音练习，提升口语表达能力',
        reasoning: '您的发音评分较低，建议增加发音练习频率',
        actionItems: [
          '每日进行15分钟发音练习',
          '重点练习困难音素',
          '使用Rescue Mode获得发音指导'
        ],
        expectedBenefit: '发音准确率提升30%',
        relatedFeatures: ['pronunciation' as const, 'rescue_mode' as const]
      },
      learning_persistence: {
        title: '学习坚持性提升',
        description: '建立更好的学习习惯，提升学习坚持性',
        reasoning: '检测到您经常在困难时放弃，建议使用Rescue Mode获得帮助',
        actionItems: [
          '设定小目标，逐步完成',
          '遇到困难时主动使用Rescue Mode',
          '建立每日学习打卡习惯'
        ],
        expectedBenefit: '学习完成率提升40%',
        relatedFeatures: ['rescue_mode' as const]
      },
      memory_retention: {
        title: '记忆保持优化',
        description: '优化复习策略，提升长期记忆效果',
        reasoning: '您的SRS复习准确率较低，建议调整复习策略',
        actionItems: [
          '按时完成SRS复习任务',
          '增加困难卡片的复习频率',
          '使用多种记忆技巧'
        ],
        expectedBenefit: '记忆保持率提升35%',
        relatedFeatures: ['srs' as const]
      }
    };

    const rec = recommendations[weakArea as keyof typeof recommendations];
    
    return {
      id: `weakness_${weakArea}_${Date.now()}`,
      type: 'strategy',
      priority: 'high',
      title: rec.title,
      description: rec.description,
      reasoning: rec.reasoning,
      actionItems: rec.actionItems,
      expectedBenefit: rec.expectedBenefit,
      estimatedTimeToComplete: 30,
      confidence: 85,
      relatedFeatures: rec.relatedFeatures,
      metadata: {
        basedOnData: ['learning_profile', 'performance_stats'],
        algorithmVersion: '1.0.0',
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * 生成阶段性推荐
   */
  private generatePhaseRecommendations(
    phase: OptimizedLearningPath['currentPhase'], 
    profile: LearningProfile
  ): LearningRecommendation[] {
    const phaseRecommendations = {
      foundation: [
        {
          title: '建立学习基础',
          description: '专注于基础技能的建立和巩固',
          actionItems: ['每日学习20分钟', '重点练习基础词汇', '建立学习习惯'],
          relatedFeatures: ['focus_mode' as const, 'pronunciation' as const]
        }
      ],
      development: [
        {
          title: '技能发展提升',
          description: '在已有基础上进一步提升各项技能',
          actionItems: ['增加学习难度', '扩展词汇量', '提升发音准确性'],
          relatedFeatures: ['pronunciation' as const, 'srs' as const]
        }
      ],
      mastery: [
        {
          title: '技能精通训练',
          description: '追求更高水平的技能掌握',
          actionItems: ['挑战高难度内容', '保持高频复习', '追求完美发音'],
          relatedFeatures: ['srs' as const, 'rescue_mode' as const]
        }
      ],
      maintenance: [
        {
          title: '技能维持巩固',
          description: '保持已有技能水平，防止退化',
          actionItems: ['定期复习', '保持学习频率', '挑战新内容'],
          relatedFeatures: ['srs' as const]
        }
      ]
    };

    return phaseRecommendations[phase].map((rec, index) => ({
      id: `phase_${phase}_${index}_${Date.now()}`,
      type: 'strategy' as const,
      priority: 'medium' as const,
      title: rec.title,
      description: rec.description,
      reasoning: `基于您当前的${phase}学习阶段`,
      actionItems: rec.actionItems,
      expectedBenefit: '提升整体学习效果',
      estimatedTimeToComplete: 45,
      confidence: 80,
      relatedFeatures: rec.relatedFeatures,
      metadata: {
        basedOnData: ['learning_phase', 'skill_assessment'],
        algorithmVersion: '1.0.0',
        generatedAt: new Date().toISOString()
      }
    }));
  }

  /**
   * 生成学习风格推荐
   */
  private generateStyleRecommendation(profile: LearningProfile): LearningRecommendation {
    const styleRecommendations = {
      visual: {
        title: '视觉学习优化',
        description: '充分利用视觉学习优势',
        actionItems: ['使用Focus Mode视觉引导', '创建思维导图', '使用图像记忆法'],
        relatedFeatures: ['focus_mode' as const]
      },
      auditory: {
        title: '听觉学习强化',
        description: '发挥听觉学习的优势',
        actionItems: ['增加听力练习', '重复朗读', '使用音频材料'],
        relatedFeatures: ['pronunciation' as const]
      },
      kinesthetic: {
        title: '互动学习增强',
        description: '通过互动练习提升学习效果',
        actionItems: ['增加互动练习', '使用Rescue Mode获得帮助', '进行角色扮演'],
        relatedFeatures: ['rescue_mode' as const, 'pronunciation' as const]
      },
      mixed: {
        title: '多元学习策略',
        description: '结合多种学习方式',
        actionItems: ['轮换使用不同学习方法', '结合视听触觉', '保持学习多样性'],
        relatedFeatures: ['focus_mode' as const, 'pronunciation' as const, 'rescue_mode' as const, 'srs' as const]
      }
    };

    const rec = styleRecommendations[profile.learningStyle];
    
    return {
      id: `style_${profile.learningStyle}_${Date.now()}`,
      type: 'strategy',
      priority: 'medium',
      title: rec.title,
      description: rec.description,
      reasoning: `基于您的${profile.learningStyle}学习风格`,
      actionItems: rec.actionItems,
      expectedBenefit: '提升学习效率和满意度',
      estimatedTimeToComplete: 25,
      confidence: 75,
      relatedFeatures: rec.relatedFeatures,
      metadata: {
        basedOnData: ['learning_style_analysis'],
        algorithmVersion: '1.0.0',
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * 生成学习洞察
   */
  private generateLearningInsights(profile: LearningProfile): LearningInsight[] {
    const insights: LearningInsight[] = [];
    
    // 性能洞察
    if (profile.pronunciationSkill > 80) {
      insights.push({
        category: 'performance',
        insight: '您的发音技能表现优秀，建议挑战更高难度的内容',
        impact: 'positive',
        confidence: 90,
        supportingData: { pronunciationSkill: profile.pronunciationSkill },
        recommendations: ['尝试更复杂的发音练习', '挑战方言或口音变化']
      });
    }
    
    // 行为洞察
    if (profile.consistencyScore < 50) {
      insights.push({
        category: 'behavior',
        insight: '您的学习一致性有待提升，建议建立固定的学习时间',
        impact: 'negative',
        confidence: 85,
        supportingData: { consistencyScore: profile.consistencyScore },
        recommendations: ['设定每日固定学习时间', '使用提醒功能', '从短时间开始逐步增加']
      });
    }
    
    // 进度洞察
    if (profile.memoryRetention > 85 && profile.focusStrength > 80) {
      insights.push({
        category: 'progress',
        insight: '您的记忆力和专注力都很强，学习进度可以适当加快',
        impact: 'positive',
        confidence: 88,
        supportingData: { 
          memoryRetention: profile.memoryRetention,
          focusStrength: profile.focusStrength 
        },
        recommendations: ['增加学习内容量', '缩短复习间隔', '挑战更难的材料']
      });
    }
    
    return insights;
  }

  /**
   * 生成下一阶段里程碑
   */
  private generateNextMilestones(
    profile: LearningProfile, 
    phase: OptimizedLearningPath['currentPhase']
  ): OptimizedLearningPath['nextMilestones'] {
    const milestones = {
      foundation: [
        {
          milestone: '建立稳定的学习习惯',
          estimatedTimeToReach: 14, // 天
          requiredActions: ['连续7天完成学习任务', '建立固定学习时间', '完成基础词汇学习']
        },
        {
          milestone: '掌握基础发音技能',
          estimatedTimeToReach: 21,
          requiredActions: ['发音评分达到70分', '完成基础音素练习', '减少Rescue Mode使用']
        }
      ],
      development: [
        {
          milestone: '提升学习效率',
          estimatedTimeToReach: 30,
          requiredActions: ['Focus Mode使用减少50%', '学习准确率达到80%', '建立高效学习策略']
        },
        {
          milestone: '扩展词汇量',
          estimatedTimeToReach: 45,
          requiredActions: ['SRS卡片达到500张', '复习准确率保持85%', '掌握高频词汇']
        }
      ],
      mastery: [
        {
          milestone: '达到高级水平',
          estimatedTimeToReach: 60,
          requiredActions: ['发音评分达到90分', 'SRS准确率达到90%', '挑战高难度内容']
        }
      ],
      maintenance: [
        {
          milestone: '保持技能水平',
          estimatedTimeToReach: 30,
          requiredActions: ['定期复习', '保持学习频率', '探索新的学习内容']
        }
      ]
    };

    return milestones[phase] || [];
  }

  /**
   * 生成自适应调整建议
   */
  private generateAdaptiveAdjustments(profile: LearningProfile): OptimizedLearningPath['adaptiveAdjustments'] {
    const adjustments: OptimizedLearningPath['adaptiveAdjustments'] = [];
    
    // 基于动机水平调整
    if (profile.motivationLevel < 50) {
      adjustments.push({
        reason: '检测到学习动机较低',
        adjustment: '降低学习难度，增加成就感',
        expectedImpact: '提升学习动机和参与度'
      });
    }
    
    // 基于一致性调整
    if (profile.consistencyScore < 40) {
      adjustments.push({
        reason: '学习一致性不足',
        adjustment: '缩短单次学习时间，增加学习频率',
        expectedImpact: '建立稳定的学习习惯'
      });
    }
    
    // 基于技能水平调整
    if (profile.pronunciationSkill > 90 && profile.memoryRetention > 85) {
      adjustments.push({
        reason: '技能水平较高',
        adjustment: '增加学习难度和挑战性',
        expectedImpact: '保持学习兴趣和持续进步'
      });
    }
    
    return adjustments;
  }

  /**
   * 获取用户的学习档案
   */
  getLearningProfile(userId: string): LearningProfile | null {
    return this.learningProfiles.get(userId) || null;
  }

  /**
   * 获取缓存的学习路径
   */
  getCachedPath(userId: string): OptimizedLearningPath | null {
    const cached = this.pathCache.get(userId);
    if (cached && new Date(cached.validUntil) > new Date()) {
      return cached;
    }
    return null;
  }

  /**
   * 清除用户缓存
   */
  clearUserCache(userId: string): void {
    this.learningProfiles.delete(userId);
    this.pathCache.delete(userId);
  }
}

// 创建全局实例
export const learningPathOptimizer = LearningPathOptimizer.getInstance();
