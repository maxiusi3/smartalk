/**
 * Launch Metrics Tracker
 * 专门用于跟踪SmarTalk MVP启动关键指标的服务
 */

import { AnalyticsService } from '../mobile/src/services/AnalyticsService';

export interface LaunchMetrics {
  northStarMetric: {
    activationRate: number;
    totalUsers: number;
    activatedUsers: number;
  };
  retentionMetrics: {
    d1Retention: number;
    d7Retention: number;
  };
  conversionFunnel: {
    [stageName: string]: {
      users: number;
      conversionRate: number;
    };
  };
  qualityMetrics: {
    userSatisfaction: {
      totalResponses: number;
      positiveRate: number;
      feedbackDistribution: { [option: string]: number };
    };
    learningEffectiveness: {
      avgAttemptsPerClue: number;
      avgCompletionTime: number;
    };
  };
}

export class LaunchMetricsTracker {
  private static instance: LaunchMetricsTracker;
  private metricsData: LaunchMetrics;
  private startTime: number;

  private constructor() {
    this.metricsData = this.initializeMetrics();
    this.startTime = Date.now();
  }

  public static getInstance(): LaunchMetricsTracker {
    if (!LaunchMetricsTracker.instance) {
      LaunchMetricsTracker.instance = new LaunchMetricsTracker();
    }
    return LaunchMetricsTracker.instance;
  }

  private initializeMetrics(): LaunchMetrics {
    return {
      northStarMetric: {
        activationRate: 0,
        totalUsers: 0,
        activatedUsers: 0,
      },
      retentionMetrics: {
        d1Retention: 0,
        d7Retention: 0,
      },
      conversionFunnel: {
        'App Launch': { users: 0, conversionRate: 100 },
        'Onboarding Started': { users: 0, conversionRate: 0 },
        'Interest Selected': { users: 0, conversionRate: 0 },
        'Preview Watched': { users: 0, conversionRate: 0 },
        'Learning Started': { users: 0, conversionRate: 0 },
        'First Clue Completed': { users: 0, conversionRate: 0 },
        'All Clues Completed': { users: 0, conversionRate: 0 },
        'Magic Moment (Activation)': { users: 0, conversionRate: 0 },
      },
      qualityMetrics: {
        userSatisfaction: {
          totalResponses: 0,
          positiveRate: 0,
          feedbackDistribution: {},
        },
        learningEffectiveness: {
          avgAttemptsPerClue: 0,
          avgCompletionTime: 0,
        },
      },
    };
  }

  /**
   * 跟踪用户激活事件（北极星指标）
   */
  public trackActivation(userId: string): void {
    this.metricsData.northStarMetric.activatedUsers++;
    this.updateActivationRate();
    
    // 发送到分析服务
    AnalyticsService.trackEvent('user_activated', {
      userId,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
    });

    console.log(`🎯 用户激活: ${userId}`);
    console.log(`📊 当前激活率: ${this.metricsData.northStarMetric.activationRate.toFixed(1)}%`);
  }

  /**
   * 跟踪新用户
   */
  public trackNewUser(userId: string): void {
    this.metricsData.northStarMetric.totalUsers++;
    this.updateActivationRate();
    this.updateFunnelStage('App Launch', 1);

    AnalyticsService.trackEvent('new_user_started', {
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * 跟踪转化漏斗事件
   */
  public trackFunnelEvent(eventName: string, userId: string): void {
    const stageMap: { [key: string]: string } = {
      'onboarding_started': 'Onboarding Started',
      'interest_selected': 'Interest Selected',
      'preview_video_completed': 'Preview Watched',
      'vtpr_learning_started': 'Learning Started',
      'first_clue_completed': 'First Clue Completed',
      'all_clues_completed': 'All Clues Completed',
      'magic_moment_completed': 'Magic Moment (Activation)',
    };

    const stageName = stageMap[eventName];
    if (stageName) {
      this.updateFunnelStage(stageName, 1);
    }

    AnalyticsService.trackEvent(eventName, {
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * 跟踪用户反馈
   */
  public trackUserFeedback(userId: string, feedback: string): void {
    this.metricsData.qualityMetrics.userSatisfaction.totalResponses++;
    
    if (!this.metricsData.qualityMetrics.userSatisfaction.feedbackDistribution[feedback]) {
      this.metricsData.qualityMetrics.userSatisfaction.feedbackDistribution[feedback] = 0;
    }
    this.metricsData.qualityMetrics.userSatisfaction.feedbackDistribution[feedback]++;

    // 计算积极反馈率
    const positiveOptions = ['😍 完全听懂了！', '🤩 比想象的容易！', '😊 抓住了主线！', '🔥 想学更多！'];
    const totalPositive = positiveOptions.reduce((sum, option) => {
      return sum + (this.metricsData.qualityMetrics.userSatisfaction.feedbackDistribution[option] || 0);
    }, 0);
    
    this.metricsData.qualityMetrics.userSatisfaction.positiveRate = 
      (totalPositive / this.metricsData.qualityMetrics.userSatisfaction.totalResponses) * 100;

    AnalyticsService.trackEvent('user_feedback_submitted', {
      userId,
      feedback,
      timestamp: Date.now(),
    });
  }

  /**
   * 跟踪学习效果
   */
  public trackLearningAttempt(userId: string, clueId: string, attempts: number, success: boolean): void {
    if (success) {
      // 更新平均尝试次数
      const currentAvg = this.metricsData.qualityMetrics.learningEffectiveness.avgAttemptsPerClue;
      const totalClues = this.metricsData.conversionFunnel['All Clues Completed'].users * 15; // 假设每个用户15个线索
      const newAvg = ((currentAvg * totalClues) + attempts) / (totalClues + 1);
      this.metricsData.qualityMetrics.learningEffectiveness.avgAttemptsPerClue = newAvg;
    }

    AnalyticsService.trackEvent('learning_attempt', {
      userId,
      clueId,
      attempts,
      success,
      timestamp: Date.now(),
    });
  }

  /**
   * 获取当前指标报告
   */
  public getMetricsReport(): LaunchMetrics {
    return { ...this.metricsData };
  }

  /**
   * 检查是否达到启动目标
   */
  public checkLaunchTargets(): {
    northStarMet: boolean;
    d1RetentionMet: boolean;
    d7RetentionMet: boolean;
    overallReadiness: boolean;
  } {
    const northStarMet = this.metricsData.northStarMetric.activationRate >= 40;
    const d1RetentionMet = this.metricsData.retentionMetrics.d1Retention >= 50;
    const d7RetentionMet = this.metricsData.retentionMetrics.d7Retention >= 30;

    return {
      northStarMet,
      d1RetentionMet,
      d7RetentionMet,
      overallReadiness: northStarMet && d1RetentionMet && d7RetentionMet,
    };
  }

  /**
   * 生成启动准备报告
   */
  public generateLaunchReport(): string {
    const metrics = this.getMetricsReport();
    const targets = this.checkLaunchTargets();

    return `
# SmarTalk MVP 启动准备报告

## 🎯 北极星指标
- **用户激活率**: ${metrics.northStarMetric.activationRate.toFixed(1)}% (目标: 40%)
- **状态**: ${targets.northStarMet ? '✅ 达标' : '❌ 未达标'}
- **总用户数**: ${metrics.northStarMetric.totalUsers}
- **激活用户数**: ${metrics.northStarMetric.activatedUsers}

## 📈 留存指标
- **D1留存率**: ${metrics.retentionMetrics.d1Retention.toFixed(1)}% (目标: 50%)
- **D7留存率**: ${metrics.retentionMetrics.d7Retention.toFixed(1)}% (目标: 30%)

## 🔄 转化漏斗
${Object.entries(metrics.conversionFunnel).map(([stage, data]) => 
  `- **${stage}**: ${data.users} 用户 (${data.conversionRate.toFixed(1)}%)`
).join('\n')}

## 😊 用户满意度
- **反馈总数**: ${metrics.qualityMetrics.userSatisfaction.totalResponses}
- **积极反馈率**: ${metrics.qualityMetrics.userSatisfaction.positiveRate.toFixed(1)}%

## 📚 学习效果
- **平均尝试次数**: ${metrics.qualityMetrics.learningEffectiveness.avgAttemptsPerClue.toFixed(1)}
- **平均完成时间**: ${(metrics.qualityMetrics.learningEffectiveness.avgCompletionTime / 60).toFixed(1)} 分钟

## 🚀 启动准备状态
- **整体准备度**: ${targets.overallReadiness ? '✅ 准备就绪' : '⚠️ 需要改进'}

---
报告生成时间: ${new Date().toLocaleString()}
    `;
  }

  private updateActivationRate(): void {
    if (this.metricsData.northStarMetric.totalUsers > 0) {
      this.metricsData.northStarMetric.activationRate = 
        (this.metricsData.northStarMetric.activatedUsers / this.metricsData.northStarMetric.totalUsers) * 100;
    }
  }

  private updateFunnelStage(stageName: string, increment: number): void {
    if (this.metricsData.conversionFunnel[stageName]) {
      this.metricsData.conversionFunnel[stageName].users += increment;
      
      // 更新转化率
      const totalUsers = this.metricsData.northStarMetric.totalUsers;
      if (totalUsers > 0) {
        this.metricsData.conversionFunnel[stageName].conversionRate = 
          (this.metricsData.conversionFunnel[stageName].users / totalUsers) * 100;
      }
    }
  }
}