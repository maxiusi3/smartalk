/**
 * SRSPerformanceOptimizer - SRS系统性能优化工具
 * 专门针对SRS算法和界面的性能监控、优化和稳定性测试
 */

import { srsService, SRSCard } from '../services/SRSService';
import { performanceOptimizer } from './PerformanceOptimizer';

export interface SRSPerformanceMetrics {
  algorithmPerformance: {
    sm2CalculationTime: number; // SuperMemo 2算法计算时间
    cardSortingTime: number; // 卡片排序时间
    priorityCalculationTime: number; // 优先级计算时间
    sessionManagementTime: number; // 会话管理时间
  };
  memoryUsage: {
    cardsInMemory: number; // 内存中的卡片数量
    sessionsInMemory: number; // 内存中的会话数量
    totalMemoryFootprint: number; // 总内存占用
    memoryLeakDetected: boolean; // 是否检测到内存泄漏
  };
  databasePerformance: {
    saveOperationTime: number; // 保存操作时间
    loadOperationTime: number; // 加载操作时间
    syncOperationTime: number; // 同步操作时间
    indexingTime: number; // 索引时间
  };
  uiPerformance: {
    reviewInterfaceRenderTime: number; // 复习界面渲染时间
    progressDashboardRenderTime: number; // 进度仪表板渲染时间
    animationFrameRate: number; // 动画帧率
    userInteractionResponseTime: number; // 用户交互响应时间
  };
  scalabilityMetrics: {
    maxCardsHandled: number; // 最大处理卡片数
    concurrentSessionsSupported: number; // 支持的并发会话数
    performanceDegradationThreshold: number; // 性能下降阈值
    systemStabilityScore: number; // 系统稳定性评分
  };
}

export interface SRSStressTestResult {
  testName: string;
  cardCount: number;
  sessionCount: number;
  duration: number;
  success: boolean;
  performanceMetrics: SRSPerformanceMetrics;
  errors: string[];
  recommendations: string[];
}

export class SRSPerformanceOptimizer {
  private static instance: SRSPerformanceOptimizer;
  private performanceHistory: SRSPerformanceMetrics[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SRSPerformanceOptimizer {
    if (!SRSPerformanceOptimizer.instance) {
      SRSPerformanceOptimizer.instance = new SRSPerformanceOptimizer();
    }
    return SRSPerformanceOptimizer.instance;
  }

  /**
   * 开始性能监控
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      const metrics = await this.getCurrentSRSMetrics();
      this.performanceHistory.push(metrics);
      
      // 保持历史记录在合理范围内
      if (this.performanceHistory.length > 100) {
        this.performanceHistory = this.performanceHistory.slice(-100);
      }
    }, intervalMs);
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * 获取当前SRS性能指标
   */
  async getCurrentSRSMetrics(): Promise<SRSPerformanceMetrics> {
    const startTime = performance.now();

    // 算法性能测试
    const algorithmStartTime = performance.now();
    const testCard: SRSCard = {
      id: 'perf_test',
      keywordId: 'test',
      word: 'test',
      translation: '测试',
      audioUrl: '/audio/test.mp3',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      status: 'new',
      createdAt: new Date().toISOString(),
      totalReviews: 0,
      correctReviews: 0,
      averageResponseTime: 0,
      learningContext: { difficulty: 3, priority: 5 },
      userFeedback: {}
    };

    // 测试SuperMemo 2算法计算时间
    const sm2StartTime = performance.now();
    // 模拟算法计算（实际应用中会调用真实的算法）
    const mockCalculation = Math.pow(testCard.easeFactor, testCard.repetitions);
    const sm2CalculationTime = performance.now() - sm2StartTime;

    // 测试卡片排序时间
    const sortStartTime = performance.now();
    const allCards = srsService.getAllCards();
    const dueCards = srsService.getDueCards(50);
    const cardSortingTime = performance.now() - sortStartTime;

    // 测试优先级计算时间
    const priorityStartTime = performance.now();
    // 模拟优先级计算
    const mockPriorityCalculation = allCards.slice(0, 10).map(card => ({
      cardId: card.id,
      priority: Math.random() * 100
    }));
    const priorityCalculationTime = performance.now() - priorityStartTime;

    const algorithmPerformanceTime = performance.now() - algorithmStartTime;

    // 内存使用分析
    const memoryStartTime = performance.now();
    const cardsInMemory = allCards.length;
    const sessionsInMemory = srsService.getSessionHistory(10).length;
    
    // 估算内存占用（简化计算）
    const avgCardSize = 1024; // 假设每张卡片1KB
    const avgSessionSize = 2048; // 假设每个会话2KB
    const totalMemoryFootprint = (cardsInMemory * avgCardSize) + (sessionsInMemory * avgSessionSize);
    
    // 简单的内存泄漏检测
    const memoryLeakDetected = this.detectMemoryLeak();

    // 数据库性能测试
    const dbStartTime = performance.now();
    
    // 测试保存操作
    const saveStartTime = performance.now();
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1));
    } catch (error) {
      console.warn('Save operation test failed:', error);
    }
    const saveOperationTime = performance.now() - saveStartTime;

    // 测试加载操作
    const loadStartTime = performance.now();
    try {
      const statistics = srsService.getSRSStatistics();
    } catch (error) {
      console.warn('Load operation test failed:', error);
    }
    const loadOperationTime = performance.now() - loadStartTime;

    const databasePerformanceTime = performance.now() - dbStartTime;

    // UI性能测试
    const uiStartTime = performance.now();
    
    // 测试渲染时间（模拟）
    const reviewInterfaceRenderTime = this.measureRenderTime('srs-review-interface');
    const progressDashboardRenderTime = this.measureRenderTime('srs-progress-dashboard');
    
    // 获取动画帧率
    const animationFrameRate = this.getAnimationFrameRate();
    
    // 测试用户交互响应时间
    const interactionStartTime = performance.now();
    // 模拟用户交互
    const mockInteraction = document.createElement('div');
    mockInteraction.click();
    const userInteractionResponseTime = performance.now() - interactionStartTime;

    // 可扩展性指标
    const maxCardsHandled = this.estimateMaxCardsCapacity();
    const concurrentSessionsSupported = this.estimateConcurrentSessionCapacity();
    const performanceDegradationThreshold = this.calculatePerformanceDegradationThreshold();
    const systemStabilityScore = this.calculateSystemStabilityScore();

    return {
      algorithmPerformance: {
        sm2CalculationTime,
        cardSortingTime,
        priorityCalculationTime,
        sessionManagementTime: algorithmPerformanceTime
      },
      memoryUsage: {
        cardsInMemory,
        sessionsInMemory,
        totalMemoryFootprint,
        memoryLeakDetected
      },
      databasePerformance: {
        saveOperationTime,
        loadOperationTime,
        syncOperationTime: databasePerformanceTime,
        indexingTime: loadOperationTime * 0.3 // 估算
      },
      uiPerformance: {
        reviewInterfaceRenderTime,
        progressDashboardRenderTime,
        animationFrameRate,
        userInteractionResponseTime
      },
      scalabilityMetrics: {
        maxCardsHandled,
        concurrentSessionsSupported,
        performanceDegradationThreshold,
        systemStabilityScore
      }
    };
  }

  /**
   * 运行SRS压力测试
   */
  async runStressTest(cardCount: number, sessionCount: number, durationMs: number): Promise<SRSStressTestResult> {
    const testStartTime = performance.now();
    const errors: string[] = [];
    const recommendations: string[] = [];

    try {
      // 创建测试卡片
      const testCards: string[] = [];
      for (let i = 0; i < cardCount; i++) {
        try {
          const card = await srsService.addCard(
            `stress_test_${i}_${Date.now()}`,
            `word_${i}`,
            `单词_${i}`,
            `/audio/word_${i}.mp3`,
            { difficulty: Math.floor(Math.random() * 5) + 1 }
          );
          testCards.push(card.id);
        } catch (error) {
          errors.push(`Failed to create card ${i}: ${error}`);
        }
      }

      // 创建并发会话
      const sessions: string[] = [];
      for (let i = 0; i < sessionCount; i++) {
        try {
          const sessionId = await srsService.startSession('practice', {
            targetCards: Math.min(10, cardCount),
            maxDuration: Math.floor(durationMs / 1000 / 60)
          });
          sessions.push(sessionId);
        } catch (error) {
          errors.push(`Failed to create session ${i}: ${error}`);
        }
      }

      // 运行压力测试
      const testEndTime = testStartTime + durationMs;
      let operationCount = 0;

      while (performance.now() < testEndTime && testCards.length > 0) {
        try {
          // 随机选择操作
          const operation = Math.random();
          
          if (operation < 0.4) {
            // 40% 概率进行复习操作
            const randomCard = testCards[Math.floor(Math.random() * testCards.length)];
            const assessments = ['forgot', 'hard', 'good', 'easy', 'perfect'];
            const randomAssessment = assessments[Math.floor(Math.random() * assessments.length)];
            
            await srsService.reviewCard(
              randomCard,
              randomAssessment as any,
              Math.random() * 3000 + 1000
            );
          } else if (operation < 0.7) {
            // 30% 概率获取统计数据
            srsService.getSRSStatistics();
          } else if (operation < 0.9) {
            // 20% 概率获取到期卡片
            srsService.getDueCards(20);
          } else {
            // 10% 概率获取新卡片
            srsService.getNewCards(10);
          }
          
          operationCount++;
          
          // 每100次操作检查一次性能
          if (operationCount % 100 === 0) {
            const currentMetrics = await this.getCurrentSRSMetrics();
            if (currentMetrics.memoryUsage.memoryLeakDetected) {
              errors.push(`Memory leak detected after ${operationCount} operations`);
            }
          }
          
        } catch (error) {
          errors.push(`Operation failed after ${operationCount} operations: ${error}`);
        }
      }

      // 清理测试会话
      for (const sessionId of sessions) {
        try {
          await srsService.endSession();
        } catch (error) {
          errors.push(`Failed to end session ${sessionId}: ${error}`);
        }
      }

      // 获取最终性能指标
      const finalMetrics = await this.getCurrentSRSMetrics();

      // 生成建议
      if (finalMetrics.algorithmPerformance.sm2CalculationTime > 10) {
        recommendations.push('SuperMemo 2算法计算时间较长，建议优化算法实现');
      }
      
      if (finalMetrics.memoryUsage.totalMemoryFootprint > 50 * 1024 * 1024) {
        recommendations.push('内存使用量较高，建议实现卡片懒加载');
      }
      
      if (finalMetrics.uiPerformance.animationFrameRate < 30) {
        recommendations.push('动画帧率较低，建议优化UI渲染性能');
      }
      
      if (errors.length > operationCount * 0.01) {
        recommendations.push('错误率较高，建议加强错误处理和系统稳定性');
      }

      return {
        testName: `SRS压力测试 - ${cardCount}卡片 ${sessionCount}会话`,
        cardCount,
        sessionCount,
        duration: performance.now() - testStartTime,
        success: errors.length < operationCount * 0.05, // 错误率低于5%视为成功
        performanceMetrics: finalMetrics,
        errors,
        recommendations
      };

    } catch (error) {
      return {
        testName: `SRS压力测试 - ${cardCount}卡片 ${sessionCount}会话`,
        cardCount,
        sessionCount,
        duration: performance.now() - testStartTime,
        success: false,
        performanceMetrics: await this.getCurrentSRSMetrics(),
        errors: [...errors, `Test execution failed: ${error}`],
        recommendations: ['测试执行失败，建议检查系统基础功能']
      };
    }
  }

  /**
   * 检测内存泄漏
   */
  private detectMemoryLeak(): boolean {
    if (this.performanceHistory.length < 5) return false;
    
    const recent = this.performanceHistory.slice(-5);
    const memoryTrend = recent.map(m => m.memoryUsage.totalMemoryFootprint);
    
    // 简单的内存泄漏检测：连续增长且增长幅度超过阈值
    let consecutiveIncreases = 0;
    for (let i = 1; i < memoryTrend.length; i++) {
      if (memoryTrend[i] > memoryTrend[i - 1] * 1.1) { // 增长超过10%
        consecutiveIncreases++;
      } else {
        consecutiveIncreases = 0;
      }
    }
    
    return consecutiveIncreases >= 3;
  }

  /**
   * 测量渲染时间
   */
  private measureRenderTime(elementSelector: string): number {
    const startTime = performance.now();
    
    // 模拟渲染时间测量
    const element = document.querySelector(`[data-testid="${elementSelector}"]`);
    if (element) {
      // 触发重绘
      element.getBoundingClientRect();
    }
    
    return performance.now() - startTime;
  }

  /**
   * 获取动画帧率
   */
  private getAnimationFrameRate(): number {
    // 简化的帧率检测
    return 60; // 假设60fps，实际应用中需要真实测量
  }

  /**
   * 估算最大卡片处理能力
   */
  private estimateMaxCardsCapacity(): number {
    const currentCards = srsService.getAllCards().length;
    const currentPerformance = this.performanceHistory.length > 0 
      ? this.performanceHistory[this.performanceHistory.length - 1]
      : null;
    
    if (!currentPerformance) return 10000; // 默认估算
    
    // 基于当前性能估算最大容量
    const baseCapacity = 10000;
    const performanceFactor = Math.max(0.1, 1 - (currentPerformance.algorithmPerformance.sm2CalculationTime / 100));
    
    return Math.floor(baseCapacity * performanceFactor);
  }

  /**
   * 估算并发会话支持能力
   */
  private estimateConcurrentSessionCapacity(): number {
    // 基于内存使用和性能估算
    return 10; // 简化估算
  }

  /**
   * 计算性能下降阈值
   */
  private calculatePerformanceDegradationThreshold(): number {
    if (this.performanceHistory.length < 2) return 100;
    
    const recent = this.performanceHistory.slice(-10);
    const avgResponseTime = recent.reduce((sum, m) => 
      sum + m.algorithmPerformance.sm2CalculationTime, 0) / recent.length;
    
    return avgResponseTime * 2; // 响应时间翻倍作为阈值
  }

  /**
   * 计算系统稳定性评分
   */
  private calculateSystemStabilityScore(): number {
    if (this.performanceHistory.length < 5) return 85; // 默认评分
    
    const recent = this.performanceHistory.slice(-10);
    let stabilityScore = 100;
    
    // 检查内存泄漏
    if (recent.some(m => m.memoryUsage.memoryLeakDetected)) {
      stabilityScore -= 20;
    }
    
    // 检查性能波动
    const responseTimes = recent.map(m => m.algorithmPerformance.sm2CalculationTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length;
    
    if (variance > avgResponseTime * 0.5) {
      stabilityScore -= 15; // 性能波动较大
    }
    
    return Math.max(0, stabilityScore);
  }

  /**
   * 获取性能历史
   */
  getPerformanceHistory(): SRSPerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): {
    summary: string;
    metrics: SRSPerformanceMetrics;
    trends: string[];
    recommendations: string[];
  } {
    const currentMetrics = this.performanceHistory.length > 0 
      ? this.performanceHistory[this.performanceHistory.length - 1]
      : null;
    
    if (!currentMetrics) {
      return {
        summary: '暂无性能数据',
        metrics: {} as SRSPerformanceMetrics,
        trends: [],
        recommendations: ['开始性能监控以获取数据']
      };
    }

    const trends: string[] = [];
    const recommendations: string[] = [];

    // 分析趋势
    if (this.performanceHistory.length >= 5) {
      const recent = this.performanceHistory.slice(-5);
      const memoryTrend = recent.map(m => m.memoryUsage.totalMemoryFootprint);
      const isMemoryIncreasing = memoryTrend[memoryTrend.length - 1] > memoryTrend[0] * 1.2;
      
      if (isMemoryIncreasing) {
        trends.push('内存使用呈上升趋势');
        recommendations.push('建议检查内存泄漏并优化内存管理');
      }
    }

    // 性能建议
    if (currentMetrics.algorithmPerformance.sm2CalculationTime > 20) {
      recommendations.push('SuperMemo 2算法计算时间较长，建议优化');
    }
    
    if (currentMetrics.scalabilityMetrics.systemStabilityScore < 80) {
      recommendations.push('系统稳定性评分较低，建议进行稳定性优化');
    }

    return {
      summary: `SRS系统性能良好，稳定性评分 ${currentMetrics.scalabilityMetrics.systemStabilityScore}/100`,
      metrics: currentMetrics,
      trends,
      recommendations
    };
  }
}

// 创建全局实例
export const srsPerformanceOptimizer = SRSPerformanceOptimizer.getInstance();
