/**
 * 发音评估测试页面
 * 用于测试和验证发音评估功能的完整性
 */

'use client'

import React, { useState, useEffect } from 'react';
import { usePronunciation, usePronunciationSupport } from '../../hooks/usePronunciation';
import PronunciationTrainer from '../../components/learning/PronunciationTrainer';
import { basicPronunciationService } from '../../lib/services/BasicPronunciationService';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
  performance?: {
    duration: number;
    score?: number;
  };
}

export default function TestPronunciationPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTestWord, setSelectedTestWord] = useState('hello');
  const [showTrainer, setShowTrainer] = useState(false);

  const { stats, isLoading: statsLoading } = usePronunciation();
  const { isSupported, hasPermission, supportDetails } = usePronunciationSupport();

  // 测试单词列表
  const testWords = [
    'hello', 'world', 'pronunciation', 'assessment', 'microphone',
    'recording', 'evaluation', 'accuracy', 'fluency', 'practice'
  ];

  // 添加测试结果
  const addTestResult = (testName: string, passed: boolean, details: string, performance?: { duration: number; score?: number }) => {
    const result: TestResult = {
      testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
      performance
    };
    setTestResults(prev => [...prev, result]);
  };

  // 运行基础功能测试
  const runBasicTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      // 测试1: 浏览器支持检查
      const audioSupport = basicPronunciationService.checkAudioSupport();
      addTestResult(
        '浏览器音频支持检查',
        audioSupport.mediaRecorder && audioSupport.webAudio && audioSupport.getUserMedia,
        `MediaRecorder: ${audioSupport.mediaRecorder}, WebAudio: ${audioSupport.webAudio}, getUserMedia: ${audioSupport.getUserMedia}, 支持格式: ${audioSupport.supportedFormats.join(', ')}`
      );

      // 测试2: 麦克风权限检查
      const permission = await basicPronunciationService.checkMicrophonePermission();
      addTestResult(
        '麦克风权限检查',
        permission,
        `权限状态: ${permission ? '已授权' : '未授权或被拒绝'}`
      );

      // 测试3: 服务初始化
      const service = basicPronunciationService;
      addTestResult(
        '发音评估服务初始化',
        service !== null,
        `服务实例: ${service ? '成功创建' : '创建失败'}`
      );

      // 测试4: 用户统计数据获取
      try {
        const userStats = await basicPronunciationService.getUserPronunciationStats('test_user');
        addTestResult(
          '用户统计数据获取',
          true,
          `总评估次数: ${userStats.totalAssessments}, 平均分: ${userStats.averageScore}, 改进: ${userStats.improvement}`
        );
      } catch (error) {
        addTestResult(
          '用户统计数据获取',
          false,
          `获取失败: ${error instanceof Error ? error.message : '未知错误'}`
        );
      }

      // 测试5: 模拟录音测试（不实际录音）
      try {
        const startTime = Date.now();
        // 这里我们测试录音状态获取
        const recordingState = basicPronunciationService.getRecordingState();
        const duration = Date.now() - startTime;
        
        addTestResult(
          '录音状态获取测试',
          true,
          `录音状态: ${recordingState.isRecording ? '录音中' : '未录音'}, 响应时间: ${duration}ms`,
          { duration }
        );
      } catch (error) {
        addTestResult(
          '录音状态获取测试',
          false,
          `测试失败: ${error instanceof Error ? error.message : '未知错误'}`
        );
      }

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

  // 运行性能测试
  const runPerformanceTests = async () => {
    setIsRunningTests(true);

    try {
      // 性能测试：多次状态查询
      const iterations = 100;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        basicPronunciationService.getRecordingState();
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / iterations;

      addTestResult(
        '状态查询性能测试',
        avgTime < 1, // 平均每次查询应该小于1ms
        `${iterations}次查询总耗时: ${totalTime}ms, 平均: ${avgTime.toFixed(2)}ms`,
        { duration: totalTime }
      );

      // 内存使用测试
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        addTestResult(
          '内存使用检查',
          memory.usedJSHeapSize < 50 * 1024 * 1024, // 小于50MB
          `已使用内存: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB, 总内存: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`
        );
      }

    } catch (error) {
      addTestResult(
        '性能测试执行错误',
        false,
        `错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // 处理发音训练完成
  const handlePronunciationComplete = (assessment: any) => {
    addTestResult(
      '实际发音评估测试',
      assessment.overallScore > 0,
      `评估完成 - 总分: ${assessment.overallScore}, 准确度: ${assessment.accuracy}, 流利度: ${assessment.fluency}, 评估时间: ${assessment.assessmentTime}ms`,
      { duration: assessment.assessmentTime, score: assessment.overallScore }
    );
    
    setShowTrainer(false);
  };

  // 计算测试通过率
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎤 发音评估功能测试
          </h1>
          <p className="text-gray-300 text-lg">
            全面测试基础发音评估功能的完整性和性能
          </p>
        </div>

        {/* 系统支持状态 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">系统支持状态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isSupported ? 'bg-green-900/20 border border-green-400' : 'bg-red-900/20 border border-red-400'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{isSupported ? '✅' : '❌'}</div>
                <div className="font-semibold text-white">浏览器支持</div>
                <div className="text-sm text-gray-300">
                  {isSupported ? '完全支持' : '不支持'}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${hasPermission ? 'bg-green-900/20 border border-green-400' : 'bg-red-900/20 border border-red-400'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{hasPermission ? '🎤' : '🚫'}</div>
                <div className="font-semibold text-white">麦克风权限</div>
                <div className="text-sm text-gray-300">
                  {hasPermission ? '已授权' : '未授权'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-400">
              <div className="text-center">
                <div className="text-2xl mb-2">🎵</div>
                <div className="font-semibold text-white">支持格式</div>
                <div className="text-sm text-gray-300">
                  {supportDetails.supportedFormats.length} 种
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-400">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-white">用户统计</div>
                <div className="text-sm text-gray-300">
                  {statsLoading ? '加载中...' : `${stats?.totalAssessments || 0} 次评估`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runBasicTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '运行基础测试'}
            </button>
            
            <button
              onClick={runPerformanceTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              运行性能测试
            </button>
            
            <button
              onClick={() => setShowTrainer(true)}
              disabled={!isSupported || !hasPermission}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              实际录音测试
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
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
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
                    <div className="text-right">
                      <span className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                      {result.performance && (
                        <div className="text-xs text-gray-400">
                          {result.performance.duration}ms
                          {result.performance.score && ` | ${result.performance.score}分`}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{result.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 发音训练器模态框 */}
        {showTrainer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <PronunciationTrainer
                keywordId={`test_${selectedTestWord}`}
                targetText={selectedTestWord}
                onAssessmentComplete={handlePronunciationComplete}
                onCancel={() => setShowTrainer(false)}
              />
            </div>
          </div>
        )}

        {/* 返回链接 */}
        <div className="text-center">
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            返回 vTPR 训练
          </a>
          <a
            href="/focus-mode-validation"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Focus Mode 测试
          </a>
        </div>
      </div>
    </div>
  );
}
