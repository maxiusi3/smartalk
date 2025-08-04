/**
 * Rescue Mode 测试页面
 * 用于测试和验证Rescue Mode功能的完整性
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useRescueMode } from '../../hooks/useRescueMode';
import { rescueModeService } from '../../lib/services/RescueModeService';
import RescueModeModal from '../../components/learning/RescueModeModal';
import { RescueModeIndicator } from '../../components/learning/RescueModeModal';
import SlowMotionVideoPlayer from '../../components/learning/SlowMotionVideoPlayer';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

export default function TestRescueModePage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTestWord, setSelectedTestWord] = useState('hello');
  const [showModal, setShowModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const {
    isActive,
    state,
    supportiveMessage,
    phoneticTips,
    rescueVideoUrl,
    currentPassThreshold,
    shouldUseLoweredThreshold,
    recordFailure,
    recordImprovement,
    calculateRescueScore,
    exitRescueMode,
    stats
  } = useRescueMode();

  // 测试单词列表
  const testWords = [
    'hello', 'world', 'pronunciation', 'rescue', 'practice',
    'difficult', 'challenge', 'improvement', 'success', 'training'
  ];

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

  // 运行基础功能测试
  const runBasicTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      // 测试1: 服务初始化
      const service = rescueModeService;
      addTestResult(
        'Rescue Mode服务初始化',
        service !== null,
        `服务实例: ${service ? '创建成功' : '创建失败'}`
      );

      // 测试2: 配置获取
      const config = rescueModeService.getConfig();
      addTestResult(
        '配置获取测试',
        config && config.triggerThreshold === 3,
        `触发阈值: ${config.triggerThreshold}, 启用阶段: ${config.enabledPhases.join(', ')}`
      );

      // 测试3: 统计数据获取
      const statistics = rescueModeService.getRescueModeStatistics();
      addTestResult(
        '统计数据获取',
        statistics && typeof statistics.totalTriggers === 'number',
        `总触发次数: ${statistics.totalTriggers}, 成功率: ${statistics.successRate.toFixed(1)}%`
      );

      // 测试4: 阈值检查
      const normalThreshold = rescueModeService.getCurrentPassThreshold('test_user');
      addTestResult(
        '通过阈值检查',
        normalThreshold === 70,
        `正常阈值: ${normalThreshold}分`
      );

    } catch (error) {
      addTestResult(
        '基础测试执行错误',
        false,
        `错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // 运行触发机制测试
  const runTriggerTests = async () => {
    setIsRunningTests(true);

    try {
      const testUserId = 'test_user_trigger';
      const testSessionId = 'test_session_trigger';

      // 重置用户状态
      rescueModeService.resetUserState(testUserId);

      // 测试单次失败不触发
      const firstFailure = await rescueModeService.recordPronunciationFailure(
        testUserId, selectedTestWord, testSessionId, 50
      );
      addTestResult(
        '单次失败不触发测试',
        !firstFailure,
        `第1次失败触发结果: ${firstFailure}`
      );

      // 测试第二次失败不触发
      const secondFailure = await rescueModeService.recordPronunciationFailure(
        testUserId, selectedTestWord, testSessionId, 45
      );
      addTestResult(
        '两次失败不触发测试',
        !secondFailure,
        `第2次失败触发结果: ${secondFailure}`
      );

      // 测试第三次失败触发
      const thirdFailure = await rescueModeService.recordPronunciationFailure(
        testUserId, selectedTestWord, testSessionId, 40
      );
      addTestResult(
        '三次失败触发测试',
        thirdFailure,
        `第3次失败触发结果: ${thirdFailure}`
      );

      // 验证救援模式状态
      const rescueState = rescueModeService.getRescueModeState(testUserId);
      addTestResult(
        '救援模式状态验证',
        rescueState?.isActive === true,
        `救援模式激活: ${rescueState?.isActive}, 连续失败: ${rescueState?.consecutivePronunciationFailures}`
      );

      // 测试降低阈值
      const loweredThreshold = rescueModeService.getCurrentPassThreshold(testUserId);
      addTestResult(
        '降低阈值测试',
        loweredThreshold === 60,
        `救援模式阈值: ${loweredThreshold}分 (应为60分)`
      );

      // 测试救援评分
      const originalScore = 55;
      const rescueScore = rescueModeService.calculateRescueScore(testUserId, originalScore);
      addTestResult(
        '救援评分测试',
        rescueScore > originalScore,
        `原始分数: ${originalScore}, 救援分数: ${rescueScore}, 加分: ${rescueScore - originalScore}`
      );

      // 测试成功改善
      await rescueModeService.recordPronunciationImprovement(testUserId, rescueScore, true);
      const finalState = rescueModeService.getRescueModeState(testUserId);
      addTestResult(
        '成功改善测试',
        finalState?.isActive === false,
        `改善后状态: 激活=${finalState?.isActive}, 连续失败=${finalState?.consecutivePronunciationFailures}`
      );

    } catch (error) {
      addTestResult(
        '触发机制测试错误',
        false,
        `错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // 模拟发音失败
  const simulateFailure = async () => {
    const sessionId = `test_${Date.now()}`;
    const score = Math.floor(Math.random() * 50) + 20; // 20-70分的失败分数
    
    const triggered = await recordFailure(selectedTestWord, sessionId, score);
    
    if (triggered) {
      addTestResult(
        '模拟失败触发',
        true,
        `模拟失败触发了Rescue Mode，分数: ${score}`
      );
    } else {
      addTestResult(
        '模拟失败记录',
        true,
        `记录失败，分数: ${score}，连续失败: ${state?.consecutivePronunciationFailures || 0}`
      );
    }
  };

  // 模拟发音改善
  const simulateImprovement = async () => {
    const score = Math.floor(Math.random() * 30) + 60; // 60-90分的改善分数
    const rescueScore = calculateRescueScore(score);
    const passed = rescueScore >= currentPassThreshold;
    
    await recordImprovement(rescueScore, passed);
    
    addTestResult(
      '模拟改善',
      passed,
      `改善分数: ${score} → ${rescueScore}，通过: ${passed} (阈值: ${currentPassThreshold})`
    );
  };

  // 计算测试通过率
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
      {/* Rescue Mode 组件 */}
      <RescueModeIndicator />

      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🆘 Rescue Mode 功能测试
          </h1>
          <p className="text-gray-300 text-lg">
            全面测试救援模式的触发机制和用户体验
          </p>
        </div>

        {/* 当前状态显示 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">当前状态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isActive ? 'bg-purple-900/20 border border-purple-400' : 'bg-gray-900/20 border border-gray-400'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{isActive ? '🆘' : '⭕'}</div>
                <div className="font-semibold text-white">Rescue Mode</div>
                <div className="text-sm text-gray-300">
                  {isActive ? '激活' : '未激活'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-400">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-white">通过阈值</div>
                <div className="text-sm text-gray-300">
                  {currentPassThreshold}分
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-900/20 border border-red-400">
              <div className="text-center">
                <div className="text-2xl mb-2">❌</div>
                <div className="font-semibold text-white">连续失败</div>
                <div className="text-sm text-gray-300">
                  {state?.consecutivePronunciationFailures || 0}次
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-900/20 border border-green-400">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-white">成功率</div>
                <div className="text-sm text-gray-300">
                  {stats?.successRate.toFixed(1) || '0'}%
                </div>
              </div>
            </div>
          </div>

          {/* 支持消息 */}
          {supportiveMessage && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-purple-800 font-semibold mb-2">支持消息</h4>
              <p className="text-purple-700">{supportiveMessage}</p>
            </div>
          )}
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runBasicTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '基础功能测试'}
            </button>
            
            <button
              onClick={runTriggerTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              触发机制测试
            </button>
            
            <button
              onClick={simulateFailure}
              disabled={isRunningTests}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              模拟发音失败
            </button>
            
            <button
              onClick={simulateImprovement}
              disabled={isRunningTests || !isActive}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              模拟发音改善
            </button>
            
            <button
              onClick={() => setShowModal(true)}
              disabled={!isActive}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              显示救援界面
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              清除结果
            </button>
          </div>

          {/* 测试单词选择 */}
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">选择测试单词：</label>
            <select
              value={selectedTestWord}
              onChange={(e) => setSelectedTestWord(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              {testWords.map(word => (
                <option key={word} value={word}>{word}</option>
              ))}
            </select>
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

        {/* 返回链接 */}
        <div className="text-center">
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            返回 vTPR 训练
          </a>
          <a
            href="/test-pronunciation"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            发音评估测试
          </a>
        </div>
      </div>

      {/* Rescue Mode Modal */}
      <RescueModeModal
        isVisible={showModal}
        targetText={selectedTestWord}
        onClose={() => setShowModal(false)}
        onContinuePractice={() => {
          setShowModal(false);
          addTestResult('救援界面测试', true, '用户选择继续练习');
        }}
      />

      {/* 慢动作视频播放器测试 */}
      {showVideoPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SlowMotionVideoPlayer
              videoUrl={`/videos/rescue/${selectedTestWord}_slow_motion.mp4`}
              phoneticTips={phoneticTips}
              targetText={selectedTestWord}
              onVideoComplete={() => {
                setShowVideoPlayer(false);
                addTestResult('慢动作视频测试', true, '视频播放完成');
              }}
            />
            <div className="p-4 text-center">
              <button
                onClick={() => setShowVideoPlayer(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                关闭视频
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
