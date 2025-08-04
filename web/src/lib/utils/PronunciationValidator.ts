/**
 * 发音评估功能验证器
 * 自动化验证发音评估功能是否符合规范要求
 */

import { basicPronunciationService } from '../services/BasicPronunciationService';
import { webAudioAdapter } from '../adapters/WebAudioAdapter';
import { progressManager } from '../progressManager';

export interface PronunciationValidationResult {
  testName: string;
  passed: boolean;
  details: string;
  performance?: {
    duration: number;
    score?: number;
  };
}

export class PronunciationValidator {
  private results: PronunciationValidationResult[] = [];

  /**
   * 运行所有验证测试
   */
  async runAllValidations(): Promise<PronunciationValidationResult[]> {
    this.results = [];

    try {
      // 1. 基础功能验证
      await this.validateBasicFunctionality();
      
      // 2. 录音功能验证
      await this.validateRecordingFunctionality();
      
      // 3. 评估服务验证
      await this.validateAssessmentService();
      
      // 4. 性能验证
      await this.validatePerformance();
      
      // 5. 集成验证
      await this.validateIntegrations();

    } catch (error) {
      this.addResult(
        '验证执行错误',
        false,
        `验证过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }

    return this.results;
  }

  /**
   * 验证基础功能
   */
  private async validateBasicFunctionality(): Promise<void> {
    try {
      // 测试浏览器支持
      const audioSupport = basicPronunciationService.checkAudioSupport();
      this.addResult(
        '浏览器音频支持验证',
        audioSupport.mediaRecorder && audioSupport.webAudio && audioSupport.getUserMedia,
        `MediaRecorder: ${audioSupport.mediaRecorder}, WebAudio: ${audioSupport.webAudio}, getUserMedia: ${audioSupport.getUserMedia}`
      );

      // 测试麦克风权限检查
      const hasPermission = await basicPronunciationService.checkMicrophonePermission();
      this.addResult(
        '麦克风权限检查',
        typeof hasPermission === 'boolean',
        `权限检查结果: ${hasPermission ? '已授权' : '未授权'}`
      );

      // 测试服务实例化
      const service = basicPronunciationService;
      this.addResult(
        '发音评估服务实例化',
        service !== null && service !== undefined,
        `服务实例: ${service ? '创建成功' : '创建失败'}`
      );

    } catch (error) {
      this.addResult(
        '基础功能验证',
        false,
        `基础功能测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 验证录音功能
   */
  private async validateRecordingFunctionality(): Promise<void> {
    try {
      // 测试录音状态获取
      const initialState = basicPronunciationService.getRecordingState();
      this.addResult(
        '录音状态获取',
        initialState && typeof initialState.isRecording === 'boolean',
        `初始录音状态: ${initialState.isRecording ? '录音中' : '未录音'}, 时长: ${initialState.duration}ms`
      );

      // 测试WebAudioAdapter支持检查
      const webAudioSupport = webAudioAdapter.constructor.checkAudioSupport();
      this.addResult(
        'WebAudioAdapter支持检查',
        webAudioSupport.mediaRecorder && webAudioSupport.webAudio,
        `支持的格式: ${webAudioSupport.supportedFormats.join(', ')}`
      );

    } catch (error) {
      this.addResult(
        '录音功能验证',
        false,
        `录音功能测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 验证评估服务
   */
  private async validateAssessmentService(): Promise<void> {
    try {
      // 测试用户统计获取
      const startTime = Date.now();
      const userStats = await basicPronunciationService.getUserPronunciationStats('test_user');
      const duration = Date.now() - startTime;

      this.addResult(
        '用户统计数据获取',
        userStats && typeof userStats.totalAssessments === 'number',
        `统计数据: 总评估${userStats.totalAssessments}次, 平均分${userStats.averageScore}, 改进${userStats.improvement}`,
        { duration }
      );

      // 测试评估服务响应时间
      this.addResult(
        '评估服务响应时间',
        duration < 100, // 统计查询应该很快
        `响应时间: ${duration}ms (目标 < 100ms)`
      );

    } catch (error) {
      this.addResult(
        '评估服务验证',
        false,
        `评估服务测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 验证性能
   */
  private async validatePerformance(): Promise<void> {
    try {
      // 性能测试：多次状态查询
      const iterations = 50;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        basicPronunciationService.getRecordingState();
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / iterations;

      this.addResult(
        '状态查询性能测试',
        avgTime < 2, // 平均每次查询应该小于2ms
        `${iterations}次查询总耗时: ${totalTime}ms, 平均: ${avgTime.toFixed(2)}ms`,
        { duration: totalTime }
      );

      // 内存使用检查
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;
        
        this.addResult(
          '内存使用检查',
          memoryUsageMB < 100, // 小于100MB
          `当前内存使用: ${memoryUsageMB.toFixed(2)}MB`
        );
      }

    } catch (error) {
      this.addResult(
        '性能验证',
        false,
        `性能测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 验证系统集成
   */
  private async validateIntegrations(): Promise<void> {
    try {
      // 验证progressManager集成
      const initialPronunciationStats = progressManager.getPronunciationStats();
      
      this.addResult(
        'progressManager发音统计集成',
        initialPronunciationStats && typeof initialPronunciationStats.assessments === 'number',
        `发音统计: 评估${initialPronunciationStats.assessments}次, 平均分${initialPronunciationStats.averageScore}, 最佳${initialPronunciationStats.bestScore}`
      );

      // 验证综合统计
      const comprehensiveStats = progressManager.getComprehensiveLearningStats();
      
      this.addResult(
        '综合学习统计集成',
        comprehensiveStats && comprehensiveStats.pronunciation && comprehensiveStats.focusMode,
        `综合统计包含: Focus Mode数据(${comprehensiveStats.focusMode.triggered}次触发), 发音数据(${comprehensiveStats.pronunciation.assessments}次评估)`
      );

    } catch (error) {
      this.addResult(
        '系统集成验证',
        false,
        `集成测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 添加测试结果
   */
  private addResult(
    testName: string, 
    passed: boolean, 
    details: string, 
    performance?: { duration: number; score?: number }
  ): void {
    this.results.push({
      testName,
      passed,
      details,
      performance
    });
  }

  /**
   * 生成验证报告
   */
  generateReport(): {
    summary: string;
    passRate: number;
    totalTests: number;
    passedTests: number;
    failedTests: PronunciationValidationResult[];
    performanceMetrics: {
      averageResponseTime: number;
      maxResponseTime: number;
      totalTests: number;
    };
  } {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed);
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    // 计算性能指标
    const performanceResults = this.results.filter(r => r.performance?.duration);
    const responseTimes = performanceResults.map(r => r.performance!.duration);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    const summary = `
发音评估功能验证完成
- 总测试数: ${totalTests}
- 通过测试: ${passedTests}
- 失败测试: ${failedTests.length}
- 通过率: ${passRate.toFixed(1)}%
- 平均响应时间: ${averageResponseTime.toFixed(2)}ms
- 最大响应时间: ${maxResponseTime}ms
    `.trim();

    return {
      summary,
      passRate,
      totalTests,
      passedTests,
      failedTests,
      performanceMetrics: {
        averageResponseTime,
        maxResponseTime,
        totalTests: performanceResults.length
      }
    };
  }
}

// 创建验证器实例
export const pronunciationValidator = new PronunciationValidator();
