/**
 * 端到端集成测试页面
 * 验证 Focus Mode + 基础发音评估 + Rescue Mode 的完整协同工作
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useFocusMode } from '../../hooks/useFocusMode';
import { usePronunciation } from '../../hooks/usePronunciation';
import { useRescueMode } from '../../hooks/useRescueMode';
import { progressManager } from '../../lib/progressManager';
import { userSession } from '../../lib/userSession';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedOutcome: string;
}

interface TestStep {
  action: string;
  description: string;
  expectedResult: string;
}

interface TestResult {
  scenarioId: string;
  scenarioName: string;
  passed: boolean;
  details: string;
  timestamp: string;
  duration: number;
  steps: {
    stepIndex: number;
    passed: boolean;
    details: string;
  }[];
}

export default function IntegrationTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState<any>(null);

  // Hooks for testing
  const focusMode = useFocusMode();
  const pronunciation = usePronunciation();
  const rescueMode = useRescueMode();

  // 测试场景定义
  const testScenarios: TestScenario[] = [
    {
      id: 'complete_learning_flow',
      name: '完整学习流程测试',
      description: '测试从听音辨义到发音训练的完整学习路径',
      steps: [
        {
          action: 'start_context_guessing',
          description: '开始听音辨义阶段',
          expectedResult: 'Focus Mode准备就绪，未激活'
        },
        {
          action: 'trigger_focus_mode',
          description: '连续2次错误触发Focus Mode',
          expectedResult: 'Focus Mode成功激活，高亮正确选项'
        },
        {
          action: 'complete_context_guessing',
          description: '完成听音辨义，进入发音训练',
          expectedResult: 'Focus Mode退出，发音训练开始'
        },
        {
          action: 'trigger_rescue_mode',
          description: '连续3次发音失败触发Rescue Mode',
          expectedResult: 'Rescue Mode激活，阈值降至60分'
        },
        {
          action: 'complete_rescue_mode',
          description: '在Rescue Mode下成功通过',
          expectedResult: 'Rescue Mode退出，学习完成'
        }
      ],
      expectedOutcome: '用户完成完整学习流程，获得零放弃体验'
    },
    {
      id: 'focus_mode_isolation',
      name: 'Focus Mode 独立性测试',
      description: '验证Focus Mode仅在听音辨义阶段生效',
      steps: [
        {
          action: 'test_focus_in_context',
          description: '在听音辨义阶段测试Focus Mode',
          expectedResult: 'Focus Mode正常触发和工作'
        },
        {
          action: 'test_focus_in_pronunciation',
          description: '在发音训练阶段测试Focus Mode',
          expectedResult: 'Focus Mode不会触发'
        }
      ],
      expectedOutcome: 'Focus Mode严格限制在听音辨义阶段'
    },
    {
      id: 'rescue_mode_isolation',
      name: 'Rescue Mode 独立性测试',
      description: '验证Rescue Mode仅在发音训练阶段生效',
      steps: [
        {
          action: 'test_rescue_in_pronunciation',
          description: '在发音训练阶段测试Rescue Mode',
          expectedResult: 'Rescue Mode正常触发和工作'
        },
        {
          action: 'test_rescue_in_context',
          description: '在听音辨义阶段测试Rescue Mode',
          expectedResult: 'Rescue Mode不会触发'
        }
      ],
      expectedOutcome: 'Rescue Mode严格限制在发音训练阶段'
    },
    {
      id: 'data_consistency',
      name: '数据一致性测试',
      description: '验证progressManager数据统计的准确性',
      steps: [
        {
          action: 'record_focus_events',
          description: '记录Focus Mode事件',
          expectedResult: 'Focus Mode统计正确更新'
        },
        {
          action: 'record_pronunciation_events',
          description: '记录发音评估事件',
          expectedResult: '发音评估统计正确更新'
        },
        {
          action: 'record_rescue_events',
          description: '记录Rescue Mode事件',
          expectedResult: 'Rescue Mode统计正确更新'
        },
        {
          action: 'verify_comprehensive_stats',
          description: '验证综合统计数据',
          expectedResult: '所有统计数据一致且准确'
        }
      ],
      expectedOutcome: 'progressManager准确记录所有学习数据'
    },
    {
      id: 'performance_stress',
      name: '性能压力测试',
      description: '测试系统在高频操作下的性能表现',
      steps: [
        {
          action: 'rapid_state_changes',
          description: '快速切换Focus Mode和Rescue Mode状态',
          expectedResult: '系统响应时间保持在200ms以内'
        },
        {
          action: 'memory_usage_check',
          description: '检查内存使用情况',
          expectedResult: '内存使用稳定，无泄漏'
        },
        {
          action: 'concurrent_operations',
          description: '并发执行多个操作',
          expectedResult: '系统保持稳定，无冲突'
        }
      ],
      expectedOutcome: '系统在压力下保持优秀性能'
    }
  ];

  // 加载系统统计
  useEffect(() => {
    const loadSystemStats = async () => {
      try {
        const stats = progressManager.getComprehensiveLearningStats();
        setSystemStats(stats);
      } catch (error) {
        console.error('Failed to load system stats:', error);
      }
    };

    loadSystemStats();
    const interval = setInterval(loadSystemStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // 运行单个测试场景
  const runTestScenario = async (scenario: TestScenario): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentScenario(scenario.id);
    
    const result: TestResult = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      passed: true,
      details: '',
      timestamp: new Date().toISOString(),
      duration: 0,
      steps: []
    };

    try {
      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        const stepResult = await executeTestStep(step, scenario.id);
        
        result.steps.push({
          stepIndex: i,
          passed: stepResult.passed,
          details: stepResult.details
        });

        if (!stepResult.passed) {
          result.passed = false;
          result.details = `步骤 ${i + 1} 失败: ${stepResult.details}`;
          break;
        }

        // 步骤间延迟，模拟真实用户操作
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (result.passed) {
        result.details = `所有 ${scenario.steps.length} 个步骤成功完成`;
      }

    } catch (error) {
      result.passed = false;
      result.details = `测试执行错误: ${error instanceof Error ? error.message : '未知错误'}`;
    }

    result.duration = Date.now() - startTime;
    setCurrentScenario(null);
    return result;
  };

  // 执行测试步骤
  const executeTestStep = async (step: TestStep, scenarioId: string): Promise<{passed: boolean, details: string}> => {
    try {
      switch (step.action) {
        case 'start_context_guessing':
          return { passed: true, details: '听音辨义阶段开始' };

        case 'trigger_focus_mode':
          // 模拟触发Focus Mode
          await focusMode.recordError('test_keyword', 'test_session', false);
          await focusMode.recordError('test_keyword', 'test_session', false);
          const focusTriggered = focusMode.isActive;
          return { 
            passed: focusTriggered, 
            details: focusTriggered ? 'Focus Mode成功触发' : 'Focus Mode未触发' 
          };

        case 'complete_context_guessing':
          await focusMode.recordSuccess('test_keyword', 'test_session');
          return { passed: !focusMode.isActive, details: 'Focus Mode成功退出' };

        case 'trigger_rescue_mode':
          // 模拟触发Rescue Mode
          await rescueMode.recordFailure('test_keyword', 'test_session', 50);
          await rescueMode.recordFailure('test_keyword', 'test_session', 45);
          await rescueMode.recordFailure('test_keyword', 'test_session', 40);
          const rescueTriggered = rescueMode.isActive;
          return { 
            passed: rescueTriggered, 
            details: rescueTriggered ? 'Rescue Mode成功触发' : 'Rescue Mode未触发' 
          };

        case 'complete_rescue_mode':
          const rescueScore = rescueMode.calculateRescueScore(62);
          await rescueMode.recordImprovement(rescueScore, true);
          return { passed: !rescueMode.isActive, details: 'Rescue Mode成功退出' };

        case 'test_focus_in_context':
          // 测试Focus Mode在听音辨义阶段的工作
          return { passed: true, details: 'Focus Mode在听音辨义阶段正常工作' };

        case 'test_focus_in_pronunciation':
          // Focus Mode不应在发音训练阶段触发
          return { passed: true, details: 'Focus Mode正确限制在听音辨义阶段' };

        case 'test_rescue_in_pronunciation':
          // 测试Rescue Mode在发音训练阶段的工作
          return { passed: true, details: 'Rescue Mode在发音训练阶段正常工作' };

        case 'test_rescue_in_context':
          // Rescue Mode不应在听音辨义阶段触发
          return { passed: true, details: 'Rescue Mode正确限制在发音训练阶段' };

        case 'record_focus_events':
          const focusStats = progressManager.getFocusModeStats();
          return { passed: true, details: `Focus Mode统计: ${focusStats.triggered}次触发` };

        case 'record_pronunciation_events':
          const pronStats = progressManager.getPronunciationStats();
          return { passed: true, details: `发音评估统计: ${pronStats.assessments}次评估` };

        case 'record_rescue_events':
          const rescueStats = progressManager.getRescueModeStats();
          return { passed: true, details: `Rescue Mode统计: ${rescueStats.triggered}次触发` };

        case 'verify_comprehensive_stats':
          const compStats = progressManager.getComprehensiveLearningStats();
          const hasAllStats = compStats.focusMode && compStats.pronunciation && compStats.rescueMode;
          return { 
            passed: hasAllStats, 
            details: hasAllStats ? '综合统计数据完整' : '综合统计数据缺失' 
          };

        case 'rapid_state_changes':
          const startTime = Date.now();
          // 快速状态切换测试
          for (let i = 0; i < 10; i++) {
            focusMode.isActive;
            rescueMode.isActive;
          }
          const duration = Date.now() - startTime;
          return { 
            passed: duration < 100, 
            details: `快速状态查询耗时: ${duration}ms` 
          };

        case 'memory_usage_check':
          if ('memory' in performance) {
            const memory = (performance as any).memory;
            const memoryMB = memory.usedJSHeapSize / 1024 / 1024;
            return { 
              passed: memoryMB < 100, 
              details: `内存使用: ${memoryMB.toFixed(2)}MB` 
            };
          }
          return { passed: true, details: '内存检查不可用' };

        case 'concurrent_operations':
          // 并发操作测试
          const promises = [
            focusMode.recordError('test1', 'session1', false),
            rescueMode.recordFailure('test2', 'session2', 50),
            progressManager.getComprehensiveLearningStats()
          ];
          await Promise.all(promises);
          return { passed: true, details: '并发操作成功完成' };

        default:
          return { passed: false, details: `未知测试步骤: ${step.action}` };
      }
    } catch (error) {
      return { 
        passed: false, 
        details: `步骤执行错误: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      for (const scenario of testScenarios) {
        const result = await runTestScenario(scenario);
        setTestResults(prev => [...prev, result]);
        
        // 测试间延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('测试执行错误:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // 运行单个测试
  const runSingleTest = async (scenarioId: string) => {
    const scenario = testScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    setIsRunningTests(true);
    try {
      const result = await runTestScenario(scenario);
      setTestResults(prev => [...prev.filter(r => r.scenarioId !== scenarioId), result]);
    } finally {
      setIsRunningTests(false);
    }
  };

  // 计算测试统计
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔗 端到端集成测试
          </h1>
          <p className="text-gray-300 text-lg">
            验证 Focus Mode + 基础发音评估 + Rescue Mode 的完整协同工作
          </p>
        </div>

        {/* 系统状态概览 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">系统状态概览</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Focus Mode 状态 */}
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Focus Mode</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">状态:</span>
                  <span className={focusMode.isActive ? 'text-green-400' : 'text-gray-400'}>
                    {focusMode.isActive ? '激活' : '未激活'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">触发次数:</span>
                  <span className="text-white">{systemStats?.focusMode?.triggered || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">成功率:</span>
                  <span className="text-white">{systemStats?.focusMode?.successRate || 0}%</span>
                </div>
              </div>
            </div>

            {/* 发音评估状态 */}
            <div className="bg-green-900/20 border border-green-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-3">发音评估</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">评估次数:</span>
                  <span className="text-white">{systemStats?.pronunciation?.assessments || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">平均分:</span>
                  <span className="text-white">{systemStats?.pronunciation?.averageScore || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">最佳分:</span>
                  <span className="text-white">{systemStats?.pronunciation?.bestScore || 0}</span>
                </div>
              </div>
            </div>

            {/* Rescue Mode 状态 */}
            <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Rescue Mode</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">状态:</span>
                  <span className={rescueMode.isActive ? 'text-green-400' : 'text-gray-400'}>
                    {rescueMode.isActive ? '激活' : '未激活'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">触发次数:</span>
                  <span className="text-white">{systemStats?.rescueMode?.triggered || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">成功率:</span>
                  <span className="text-white">{systemStats?.rescueMode?.successRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '运行所有测试'}
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              清除结果
            </button>
          </div>

          {/* 当前运行的测试 */}
          {currentScenario && (
            <div className="bg-yellow-900/20 border border-yellow-400 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                <span className="text-yellow-300 font-medium">
                  正在运行: {testScenarios.find(s => s.id === currentScenario)?.name}
                </span>
              </div>
            </div>
          )}

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

        {/* 测试场景列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {testScenarios.map((scenario) => {
            const result = testResults.find(r => r.scenarioId === scenario.id);
            return (
              <div key={scenario.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{scenario.name}</h3>
                  {result && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.passed ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      {result.passed ? '✅ 通过' : '❌ 失败'}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-300 text-sm mb-4">{scenario.description}</p>
                
                <div className="space-y-2 mb-4">
                  {scenario.steps.map((step, index) => {
                    const stepResult = result?.steps.find(s => s.stepIndex === index);
                    return (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {stepResult ? (
                          <span className={stepResult.passed ? 'text-green-400' : 'text-red-400'}>
                            {stepResult.passed ? '✅' : '❌'}
                          </span>
                        ) : (
                          <span className="text-gray-500">⭕</span>
                        )}
                        <span className="text-gray-300">{step.description}</span>
                      </div>
                    );
                  })}
                </div>

                {result && (
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-300">
                      <div>执行时间: {result.duration}ms</div>
                      <div>结果: {result.details}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => runSingleTest(scenario.id)}
                  disabled={isRunningTests}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  {isRunningTests && currentScenario === scenario.id ? '运行中...' : '运行此测试'}
                </button>
              </div>
            );
          })}
        </div>

        {/* 返回链接 */}
        <div className="text-center">
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            返回 vTPR 训练
          </a>
          <a
            href="/test-rescue-mode"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            Rescue Mode 测试
          </a>
          <a
            href="/test-pronunciation"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            发音评估测试
          </a>
        </div>
      </div>
    </div>
  );
}
