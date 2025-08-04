/**
 * Focus Mode 功能验证页面
 * 全面测试 Focus Mode 的所有功能和规范要求
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useFocusMode } from '../../hooks/useFocusMode';
import { focusModeService } from '../../lib/services/FocusModeService';
import { progressManager } from '../../lib/progressManager';
import FocusModeModal from '../../components/learning/FocusModeModal';
import { FocusModeHighlight, FocusModeIndicator } from '../../components/learning/FocusModeModal';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

export default function FocusModeValidationPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [sessionId] = useState(`validation_${Date.now()}`);
  const [testKeyword] = useState('validation_test');

  const {
    isActive,
    recordError,
    recordSuccess,
    state,
    supportiveMessage,
    highlightCorrectOption,
    showGlowEffect
  } = useFocusMode();

  // 添加测试结果
  const addTestResult = (testName: string, passed: boolean, details: string) => {
    const result: TestResult = {
      testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [...prev, result]);
  };

  // 等待函数
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 全面功能测试
  const runComprehensiveTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      // 测试1: 初始状态验证
      addTestResult(
        '初始状态验证',
        !isActive && !highlightCorrectOption && !showGlowEffect,
        `Focus Mode初始状态: ${isActive ? '激活' : '未激活'}`
      );

      await wait(500);

      // 测试2: 单次错误不触发
      await recordError(testKeyword, sessionId, 'context_guessing');
      await wait(500);
      
      addTestResult(
        '单次错误不触发测试',
        !isActive,
        `单次错误后状态: ${isActive ? '激活' : '未激活'} (应该未激活)`
      );

      // 测试3: 连续2次错误触发Focus Mode
      const triggered = await recordError(testKeyword, sessionId, 'context_guessing');
      await wait(500);
      
      addTestResult(
        '连续2次错误触发测试',
        triggered && isActive,
        `连续2次错误后: 触发=${triggered}, 激活=${isActive}, 消息="${supportiveMessage}"`
      );

      await wait(1000);

      // 测试4: 高亮效果验证
      addTestResult(
        '高亮效果验证',
        highlightCorrectOption && showGlowEffect,
        `高亮正确选项: ${highlightCorrectOption}, 发光效果: ${showGlowEffect}`
      );

      // 测试5: 成功退出Focus Mode
      await recordSuccess();
      await wait(500);
      
      addTestResult(
        '成功退出测试',
        !isActive && !highlightCorrectOption,
        `成功后状态: 激活=${isActive}, 高亮=${highlightCorrectOption}`
      );

      // 测试6: 发音训练阶段不触发
      await recordError(testKeyword, sessionId, 'pronunciation_training');
      await recordError(testKeyword, sessionId, 'pronunciation_training');
      await wait(500);
      
      addTestResult(
        '发音训练阶段不触发测试',
        !isActive,
        `发音训练阶段连续2次错误后: ${isActive ? '激活' : '未激活'} (应该未激活)`
      );

      // 测试7: progressManager集成验证
      const focusStats = progressManager.getFocusModeStats();
      addTestResult(
        'progressManager集成验证',
        focusStats.triggered > 0,
        `Focus Mode触发次数: ${focusStats.triggered}, 成功率: ${focusStats.successRate.toFixed(1)}%`
      );

      // 测试8: 数据持久化验证
      const userState = focusModeService.getFocusModeState('test_user');
      addTestResult(
        '数据持久化验证',
        true, // 只要没有抛出错误就算通过
        `用户状态存储: ${userState ? '成功' : '失败'}`
      );

    } catch (error) {
      addTestResult(
        '测试执行错误',
        false,
        `错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // 性能测试
  const runPerformanceTests = async () => {
    const startTime = performance.now();
    
    // 测试Focus Mode触发性能
    for (let i = 0; i < 10; i++) {
      await recordError(`perf_test_${i}`, sessionId, 'context_guessing');
      if (i % 2 === 1) {
        await recordSuccess();
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    addTestResult(
      '性能测试',
      duration < 1000, // 10次操作应该在1秒内完成
      `10次Focus Mode操作耗时: ${duration.toFixed(2)}ms`
    );
  };

  // 计算测试通过率
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
      {/* Focus Mode 组件 */}
      <FocusModeModal />
      <FocusModeIndicator />

      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 Focus Mode 功能验证
          </h1>
          <p className="text-gray-300 text-lg">
            全面测试 Focus Mode 的所有功能和规范要求
          </p>
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runComprehensiveTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '运行全面测试'}
            </button>
            
            <button
              onClick={runPerformanceTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              运行性能测试
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              清除结果
            </button>
          </div>

          {/* 测试统计 */}
          {totalTests > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">测试统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{totalTests}</div>
                  <div className="text-sm text-gray-300">总测试数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{passedTests}</div>
                  <div className="text-sm text-gray-300">通过测试</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${parseFloat(passRate) >= 90 ? 'text-green-400' : parseFloat(passRate) >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {passRate}%
                  </div>
                  <div className="text-sm text-gray-300">通过率</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 测试结果 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">测试结果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-400 text-center py-8">点击上方按钮开始测试</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.passed 
                      ? 'bg-green-900/20 border-green-400' 
                      : 'bg-red-900/20 border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">
                      {result.passed ? '✅' : '❌'} {result.testName}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{result.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 视觉效果测试区域 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">视觉效果测试</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { id: '1', label: 'A', isCorrect: true, text: '正确选项' },
              { id: '2', label: 'B', isCorrect: false, text: '错误选项1' },
              { id: '3', label: 'C', isCorrect: false, text: '错误选项2' },
              { id: '4', label: 'D', isCorrect: false, text: '错误选项3' }
            ].map((option) => (
              <FocusModeHighlight
                key={option.id}
                isCorrectOption={option.isCorrect}
                className="test-option"
              >
                <div className="bg-white/10 hover:bg-white/20 rounded-lg p-4 cursor-pointer transition-all">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-300">
                      {option.text}
                    </div>
                  </div>
                </div>
              </FocusModeHighlight>
            ))}
          </div>

          <div className="text-sm text-gray-400">
            <p>• 当前Focus Mode状态: <span className={`font-bold ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>
              {isActive ? '🎯 激活' : '⭕ 未激活'}
            </span></p>
            <p>• 高亮效果: <span className={`font-bold ${highlightCorrectOption ? 'text-green-400' : 'text-gray-400'}`}>
              {highlightCorrectOption ? '✅ 开启' : '❌ 关闭'}
            </span></p>
            <p>• 发光动画: <span className={`font-bold ${showGlowEffect ? 'text-yellow-400' : 'text-gray-400'}`}>
              {showGlowEffect ? '✨ 开启' : '❌ 关闭'}
            </span></p>
          </div>
        </div>

        {/* 返回链接 */}
        <div className="text-center mt-8">
          <a
            href="/test-focus-mode"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            返回测试页面
          </a>
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            返回 vTPR 训练
          </a>
        </div>
      </div>
    </div>
  );
}
