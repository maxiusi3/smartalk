/**
 * Focus Mode 功能验证器
 * 自动化验证所有Focus Mode功能是否符合规范要求
 */

import { focusModeService } from '../services/FocusModeService';
import { progressManager } from '../progressManager';
import { performanceMonitor } from './PerformanceMonitor';

export interface ValidationResult {
  testName: string;
  passed: boolean;
  details: string;
  performance?: {
    duration: number;
    memoryUsage: number;
  };
}

export class FocusModeValidator {
  private results: ValidationResult[] = [];

  /**
   * 运行所有验证测试
   */
  async runAllValidations(): Promise<ValidationResult[]> {
    this.results = [];

    try {
      // 1. 基础功能验证
      await this.validateBasicFunctionality();
      
      // 2. 触发机制验证
      await this.validateTriggerMechanism();
      
      // 3. 学习阶段限制验证
      await this.validateLearningPhaseRestriction();
      
      // 4. 数据持久化验证
      await this.validateDataPersistence();
      
      // 5. 性能验证
      await this.validatePerformance();
      
      // 6. 集成验证
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
    const testUserId = 'test_user_basic';
    const testKeyword = 'test_keyword';
    const testSession = 'test_session_basic';

    try {
      // 测试初始状态
      const initialState = focusModeService.getFocusModeState(testUserId);
      this.addResult(
        '初始状态验证',
        initialState === null || !initialState.isActive,
        `初始状态: ${initialState ? '存在状态' : '无状态'}`
      );

      // 测试错误记录
      const triggered = await focusModeService.recordError(
        testUserId,
        testKeyword,
        testSession,
        'context_guessing'
      );

      this.addResult(
        '单次错误不触发验证',
        !triggered,
        `单次错误触发结果: ${triggered}`
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
   * 验证触发机制
   */
  private async validateTriggerMechanism(): Promise<void> {
    const testUserId = 'test_user_trigger';
    const testKeyword = 'test_keyword_trigger';
    const testSession = 'test_session_trigger';

    try {
      // 第一次错误
      await focusModeService.recordError(testUserId, testKeyword, testSession, 'context_guessing');
      
      // 第二次错误应该触发Focus Mode
      const triggered = await focusModeService.recordError(testUserId, testKeyword, testSession, 'context_guessing');
      
      const state = focusModeService.getFocusModeState(testUserId);
      
      this.addResult(
        '连续2次错误触发验证',
        triggered && state?.isActive === true,
        `触发结果: ${triggered}, 状态激活: ${state?.isActive}, 连续错误: ${state?.consecutiveErrors}`
      );

      // 验证高亮和发光效果
      this.addResult(
        '视觉效果激活验证',
        state?.highlightCorrectOption === true && state?.showGlowEffect === true,
        `高亮选项: ${state?.highlightCorrectOption}, 发光效果: ${state?.showGlowEffect}`
      );

      // 验证支持消息
      this.addResult(
        '支持消息验证',
        state?.supportiveMessage !== undefined && state.supportiveMessage.length > 0,
        `支持消息: "${state?.supportiveMessage}"`
      );

    } catch (error) {
      this.addResult(
        '触发机制验证',
        false,
        `触发机制测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 验证学习阶段限制
   */
  private async validateLearningPhaseRestriction(): Promise<void> {
    const testUserId = 'test_user_phase';
    const testKeyword = 'test_keyword_phase';
    const testSession = 'test_session_phase';

    try {
      // 在发音训练阶段连续错误不应该触发Focus Mode
      await focusModeService.recordError(testUserId, testKeyword, testSession, 'pronunciation_training');
      const triggered = await focusModeService.recordError(testUserId, testKeyword, testSession, 'pronunciation_training');
      
      const state = focusModeService.getFocusModeState(testUserId);
      
      this.addResult(
        '发音训练阶段不触发验证',
        !triggered && (!state || !state.isActive),
        `发音训练阶段触发结果: ${triggered}, 状态: ${state?.isActive ? '激活' : '未激活'}`
      );

    } catch (error) {
      this.addResult(
        '学习阶段限制验证',
        false,
        `学习阶段限制测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 验证数据持久化
   */
  private async validateDataPersistence(): Promise<void> {
    const testUserId = 'test_user_persistence';
    const testKeyword = 'test_keyword_persistence';
    const testSession = 'test_session_persistence';

    try {
      // 触发Focus Mode
      await focusModeService.recordError(testUserId, testKeyword, testSession, 'context_guessing');
      await focusModeService.recordError(testUserId, testKeyword, testSession, 'context_guessing');
      
      // 验证状态持久化
      const state = focusModeService.getFocusModeState(testUserId);
      
      this.addResult(
        '状态持久化验证',
        state !== null && state.isActive,
        `持久化状态: ${state ? '存在' : '不存在'}, 激活: ${state?.isActive}`
      );

      // 测试成功退出
      await focusModeService.recordSuccess(testUserId);
      const stateAfterSuccess = focusModeService.getFocusModeState(testUserId);
      
      this.addResult(
        '成功退出验证',
        stateAfterSuccess !== null && !stateAfterSuccess.isActive,
        `成功后状态: 激活=${stateAfterSuccess?.isActive}, 连续错误=${stateAfterSuccess?.consecutiveErrors}`
      );

    } catch (error) {
      this.addResult(
        '数据持久化验证',
        false,
        `数据持久化测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 验证性能
   */
  private async validatePerformance(): Promise<void> {
    const testUserId = 'test_user_performance';
    const testKeyword = 'test_keyword_performance';
    const testSession = 'test_session_performance';

    try {
      const startTime = performance.now();
      const startMemory = performanceMonitor.getMemoryUsage();

      // 执行多次Focus Mode操作
      for (let i = 0; i < 10; i++) {
        await focusModeService.recordError(testUserId + i, testKeyword, testSession, 'context_guessing');
        await focusModeService.recordError(testUserId + i, testKeyword, testSession, 'context_guessing');
        await focusModeService.recordSuccess(testUserId + i);
      }

      const endTime = performance.now();
      const endMemory = performanceMonitor.getMemoryUsage();
      
      const duration = endTime - startTime;
      const memoryIncrease = endMemory.used - startMemory.used;

      this.addResult(
        '性能验证',
        duration < 1000 && memoryIncrease < 5 * 1024 * 1024, // 1秒内完成，内存增长<5MB
        `10次操作耗时: ${duration.toFixed(2)}ms, 内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
        { duration, memoryUsage: memoryIncrease }
      );

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
      const initialStats = progressManager.getFocusModeStats();
      
      // 触发Focus Mode并记录成功
      const testUserId = 'test_user_integration';
      await focusModeService.recordError(testUserId, 'test', 'test', 'context_guessing');
      await focusModeService.recordError(testUserId, 'test', 'test', 'context_guessing');
      await focusModeService.recordSuccess(testUserId);
      
      const finalStats = progressManager.getFocusModeStats();
      
      this.addResult(
        'progressManager集成验证',
        finalStats.triggered > initialStats.triggered,
        `触发次数变化: ${initialStats.triggered} -> ${finalStats.triggered}`
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
  private addResult(testName: string, passed: boolean, details: string, performance?: { duration: number; memoryUsage: number }): void {
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
    failedTests: ValidationResult[];
  } {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed);
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const summary = `
Focus Mode 功能验证完成
- 总测试数: ${totalTests}
- 通过测试: ${passedTests}
- 失败测试: ${failedTests.length}
- 通过率: ${passRate.toFixed(1)}%
    `.trim();

    return {
      summary,
      passRate,
      totalTests,
      passedTests,
      failedTests
    };
  }
}

// 创建验证器实例
export const focusModeValidator = new FocusModeValidator();
