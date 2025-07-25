/**
 * Launch Feedback Collector
 * 专门用于启动期间收集和分析用户反馈的增强系统
 */

export interface UserFeedback {
  userId: string;
  sessionId: string;
  timestamp: number;
  feedbackType: 'magic_moment' | 'overall_experience' | 'bug_report' | 'feature_request';
  rating?: number; // 1-5 星评分
  emotionalResponse?: string; // 情感反馈选项
  textFeedback?: string; // 自由文本反馈
  context: {
    currentScreen: string;
    completedSteps: string[];
    sessionDuration: number;
    errorEncountered?: boolean;
  };
}

export interface FeedbackAnalysis {
  totalFeedbacks: number;
  averageRating: number;
  emotionalDistribution: { [emotion: string]: number };
  sentimentScore: number; // -1 to 1
  commonIssues: string[];
  improvementSuggestions: string[];
  urgentIssues: UserFeedback[];
}

export class LaunchFeedbackCollector {
  private static instance: LaunchFeedbackCollector;
  private feedbacks: UserFeedback[] = [];
  private analysisCache: FeedbackAnalysis | null = null;
  private lastAnalysisTime: number = 0;

  private constructor() {}

  public static getInstance(): LaunchFeedbackCollector {
    if (!LaunchFeedbackCollector.instance) {
      LaunchFeedbackCollector.instance = new LaunchFeedbackCollector();
    }
    return LaunchFeedbackCollector.instance;
  }

  /**
   * 收集Magic Moment反馈
   */
  public collectMagicMomentFeedback(
    userId: string,
    sessionId: string,
    emotionalResponse: string,
    context: any
  ): void {
    const feedback: UserFeedback = {
      userId,
      sessionId,
      timestamp: Date.now(),
      feedbackType: 'magic_moment',
      emotionalResponse,
      context: {
        currentScreen: 'achievement',
        completedSteps: context.completedSteps || [],
        sessionDuration: context.sessionDuration || 0,
      },
    };

    this.feedbacks.push(feedback);
    this.invalidateAnalysisCache();

    // 实时分析关键反馈
    this.analyzeRealTimeFeedback(feedback);
  }

  /**
   * 收集整体体验反馈
   */
  public collectOverallFeedback(
    userId: string,
    sessionId: string,
    rating: number,
    textFeedback?: string
  ): void {
    const feedback: UserFeedback = {
      userId,
      sessionId,
      timestamp: Date.now(),
      feedbackType: 'overall_experience',
      rating,
      textFeedback,
      context: {
        currentScreen: 'feedback',
        completedSteps: [],
        sessionDuration: 0,
      },
    };

    this.feedbacks.push(feedback);
    this.invalidateAnalysisCache();
  }

  /**
   * 收集错误报告
   */
  public collectBugReport(
    userId: string,
    sessionId: string,
    errorDescription: string,
    context: any
  ): void {
    const feedback: UserFeedback = {
      userId,
      sessionId,
      timestamp: Date.now(),
      feedbackType: 'bug_report',
      textFeedback: errorDescription,
      context: {
        ...context,
        errorEncountered: true,
      },
    };

    this.feedbacks.push(feedback);
    this.invalidateAnalysisCache();

    // 紧急问题立即处理
    if (this.isUrgentIssue(feedback)) {
      this.handleUrgentIssue(feedback);
    }
  }

  /**
   * 分析所有反馈数据
   */
  public analyzeFeedback(): FeedbackAnalysis {
    // 如果缓存有效且最近分析过，返回缓存结果
    if (this.analysisCache && Date.now() - this.lastAnalysisTime < 300000) { // 5分钟缓存
      return this.analysisCache;
    }

    const analysis: FeedbackAnalysis = {
      totalFeedbacks: this.feedbacks.length,
      averageRating: this.calculateAverageRating(),
      emotionalDistribution: this.analyzeEmotionalDistribution(),
      sentimentScore: this.calculateSentimentScore(),
      commonIssues: this.identifyCommonIssues(),
      improvementSuggestions: this.generateImprovementSuggestions(),
      urgentIssues: this.identifyUrgentIssues(),
    };

    this.analysisCache = analysis;
    this.lastAnalysisTime = Date.now();

    return analysis;
  }

  /**
   * 生成反馈报告
   */
  public generateFeedbackReport(): string {
    const analysis = this.analyzeFeedback();
    const magicMomentFeedbacks = this.feedbacks.filter(f => f.feedbackType === 'magic_moment');

    return `
# 用户反馈分析报告

## 📊 总体统计
- **反馈总数**: ${analysis.totalFeedbacks}
- **平均评分**: ${analysis.averageRating.toFixed(1)}/5.0
- **情感得分**: ${analysis.sentimentScore.toFixed(2)} (-1到1，越高越积极)

## 😊 Magic Moment 反馈分析
- **Magic Moment反馈数**: ${magicMomentFeedbacks.length}
- **情感分布**:
${Object.entries(analysis.emotionalDistribution).map(([emotion, count]) => 
  `  - ${emotion}: ${count} (${((count / magicMomentFeedbacks.length) * 100).toFixed(1)}%)`
).join('\n')}

## 🔍 用户洞察

### 积极反馈亮点
${this.getPositiveFeedbackHighlights().map(highlight => `- ${highlight}`).join('\n')}

### 需要改进的问题
${analysis.commonIssues.map(issue => `- ${issue}`).join('\n')}

### 改进建议
${analysis.improvementSuggestions.map(suggestion => `- ${suggestion}`).join('\n')}

## 🚨 紧急问题
${analysis.urgentIssues.length > 0 ? 
  analysis.urgentIssues.map(issue => 
    `- **用户 ${issue.userId}**: ${issue.textFeedback} (${new Date(issue.timestamp).toLocaleString()})`
  ).join('\n') : 
  '暂无紧急问题'
}

## 📈 启动成功指标
- **用户满意度**: ${analysis.averageRating >= 4 ? '✅ 优秀' : analysis.averageRating >= 3 ? '⚠️ 良好' : '❌ 需改进'}
- **情感反应**: ${analysis.sentimentScore >= 0.5 ? '✅ 非常积极' : analysis.sentimentScore >= 0 ? '⚠️ 中性偏积极' : '❌ 需要关注'}
- **Magic Moment效果**: ${this.evaluateMagicMomentEffectiveness()}

---
报告生成时间: ${new Date().toLocaleString()}
数据覆盖期间: ${this.feedbacks.length > 0 ? 
  `${new Date(Math.min(...this.feedbacks.map(f => f.timestamp))).toLocaleString()} - ${new Date(Math.max(...this.feedbacks.map(f => f.timestamp))).toLocaleString()}` : 
  '暂无数据'
}
    `;
  }

  /**
   * 获取实时反馈摘要（用于监控仪表板）
   */
  public getRealTimeSummary(): {
    recentFeedbacks: number;
    averageRating: number;
    urgentIssuesCount: number;
    topEmotion: string;
  } {
    const recentFeedbacks = this.feedbacks.filter(
      f => Date.now() - f.timestamp < 3600000 // 最近1小时
    );

    const analysis = this.analyzeFeedback();
    const topEmotion = Object.entries(analysis.emotionalDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '无数据';

    return {
      recentFeedbacks: recentFeedbacks.length,
      averageRating: analysis.averageRating,
      urgentIssuesCount: analysis.urgentIssues.length,
      topEmotion,
    };
  }

  private calculateAverageRating(): number {
    const ratedFeedbacks = this.feedbacks.filter(f => f.rating !== undefined);
    if (ratedFeedbacks.length === 0) return 0;
    
    const sum = ratedFeedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    return sum / ratedFeedbacks.length;
  }

  private analyzeEmotionalDistribution(): { [emotion: string]: number } {
    const distribution: { [emotion: string]: number } = {};
    
    this.feedbacks.forEach(feedback => {
      if (feedback.emotionalResponse) {
        distribution[feedback.emotionalResponse] = (distribution[feedback.emotionalResponse] || 0) + 1;
      }
    });

    return distribution;
  }

  private calculateSentimentScore(): number {
    // 简化的情感分析，基于预定义的情感权重
    const emotionWeights: { [emotion: string]: number } = {
      '😍 完全听懂了！': 1.0,
      '🤩 比想象的容易！': 0.8,
      '😊 抓住了主线！': 0.6,
      '🔥 想学更多！': 0.9,
      '😕 有点困难': -0.3,
      '😞 没听懂': -0.8,
      '😤 太难了': -1.0,
    };

    let totalWeight = 0;
    let totalCount = 0;

    this.feedbacks.forEach(feedback => {
      if (feedback.emotionalResponse && emotionWeights[feedback.emotionalResponse] !== undefined) {
        totalWeight += emotionWeights[feedback.emotionalResponse];
        totalCount++;
      }
    });

    return totalCount > 0 ? totalWeight / totalCount : 0;
  }

  private identifyCommonIssues(): string[] {
    const issues: string[] = [];
    const bugReports = this.feedbacks.filter(f => f.feedbackType === 'bug_report');
    
    // 分析常见问题模式
    const issuePatterns = [
      { pattern: /视频.*卡顿|播放.*问题/, issue: '视频播放性能问题' },
      { pattern: /加载.*慢|等待.*久/, issue: '加载速度问题' },
      { pattern: /听不清|音频.*问题/, issue: '音频质量问题' },
      { pattern: /点击.*无反应|按钮.*不工作/, issue: '交互响应问题' },
      { pattern: /字幕.*不准|同步.*问题/, issue: '字幕同步问题' },
    ];

    issuePatterns.forEach(({ pattern, issue }) => {
      const matchingReports = bugReports.filter(report => 
        pattern.test(report.textFeedback || '')
      );
      if (matchingReports.length >= 2) { // 至少2个用户报告同样问题
        issues.push(`${issue} (${matchingReports.length}个用户反馈)`);
      }
    });

    return issues;
  }

  private generateImprovementSuggestions(): string[] {
    const suggestions: string[] = [];
    const analysis = this.analyzeFeedback();

    // 基于数据生成建议
    if (analysis.averageRating < 4) {
      suggestions.push('整体用户满意度需要提升，重点关注用户体验优化');
    }

    if (analysis.sentimentScore < 0.5) {
      suggestions.push('用户情感反应偏中性，需要增强Magic Moment的冲击力');
    }

    const negativeEmotions = Object.entries(analysis.emotionalDistribution)
      .filter(([emotion]) => emotion.includes('😕') || emotion.includes('😞') || emotion.includes('😤'));
    
    if (negativeEmotions.length > 0) {
      suggestions.push('部分用户反馈学习难度过高，考虑优化vTPR练习的难度曲线');
    }

    return suggestions;
  }

  private identifyUrgentIssues(): UserFeedback[] {
    return this.feedbacks.filter(feedback => this.isUrgentIssue(feedback));
  }

  private isUrgentIssue(feedback: UserFeedback): boolean {
    // 定义紧急问题的条件
    if (feedback.feedbackType === 'bug_report') {
      const urgentKeywords = ['崩溃', '无法使用', '严重错误', '数据丢失'];
      return urgentKeywords.some(keyword => 
        feedback.textFeedback?.includes(keyword)
      );
    }

    if (feedback.rating && feedback.rating <= 2) {
      return true; // 低评分视为紧急问题
    }

    return false;
  }

  private handleUrgentIssue(feedback: UserFeedback): void {
    console.error('🚨 紧急用户问题:', {
      userId: feedback.userId,
      issue: feedback.textFeedback,
      timestamp: new Date(feedback.timestamp).toLocaleString(),
    });

    // 这里可以集成告警系统，如发送邮件、Slack通知等
    // 例如: AlertService.sendUrgentAlert(feedback);
  }

  private analyzeRealTimeFeedback(feedback: UserFeedback): void {
    // 实时分析新反馈，用于即时响应
    if (feedback.feedbackType === 'magic_moment') {
      console.log(`✨ Magic Moment反馈: ${feedback.emotionalResponse} (用户: ${feedback.userId})`);
    }
  }

  private getPositiveFeedbackHighlights(): string[] {
    const positiveEmotions = ['😍 完全听懂了！', '🤩 比想象的容易！', '🔥 想学更多！'];
    const highlights: string[] = [];

    positiveEmotions.forEach(emotion => {
      const count = this.feedbacks.filter(f => f.emotionalResponse === emotion).length;
      if (count > 0) {
        highlights.push(`${emotion} - ${count}位用户有此反馈`);
      }
    });

    return highlights;
  }

  private evaluateMagicMomentEffectiveness(): string {
    const magicMomentFeedbacks = this.feedbacks.filter(f => f.feedbackType === 'magic_moment');
    if (magicMomentFeedbacks.length === 0) return '暂无数据';

    const positiveCount = magicMomentFeedbacks.filter(f => 
      f.emotionalResponse?.includes('😍') || 
      f.emotionalResponse?.includes('🤩') || 
      f.emotionalResponse?.includes('🔥')
    ).length;

    const positiveRate = (positiveCount / magicMomentFeedbacks.length) * 100;

    if (positiveRate >= 80) return '✅ 非常成功';
    if (positiveRate >= 60) return '⚠️ 良好，有改进空间';
    return '❌ 需要重点优化';
  }

  private invalidateAnalysisCache(): void {
    this.analysisCache = null;
  }
}