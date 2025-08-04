/**
 * Focus Mode 测试页面
 * 用于验证Focus Mode功能是否正常工作
 */

'use client'

import React, { useState } from 'react';
import { useFocusMode } from '../../hooks/useFocusMode';
import FocusModeModal from '../../components/learning/FocusModeModal';
import { FocusModeHighlight, FocusModeIndicator } from '../../components/learning/FocusModeModal';

export default function TestFocusModePage() {
  const [sessionId] = useState(`test_${Date.now()}`);
  const [testKeyword] = useState('hello');
  const [errorCount, setErrorCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  const {
    isActive,
    recordError,
    recordSuccess,
    supportiveMessage,
    highlightCorrectOption,
    showGlowEffect,
    state
  } = useFocusMode();

  const handleRecordError = async () => {
    const triggered = await recordError(testKeyword, sessionId, 'context_guessing');
    setErrorCount(prev => prev + 1);
    
    if (triggered) {
      console.log('Focus Mode triggered!');
    }
  };

  const handleRecordSuccess = async () => {
    await recordSuccess();
    setSuccessCount(prev => prev + 1);
  };

  const resetTest = () => {
    setErrorCount(0);
    setSuccessCount(0);
    // 注意：这里不能直接重置Focus Mode状态，需要通过正常流程
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
      {/* Focus Mode 组件 */}
      <FocusModeModal />
      <FocusModeIndicator />

      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 Focus Mode 测试页面
          </h1>
          <p className="text-gray-300 text-lg">
            测试专注模式的触发和视觉效果
          </p>
        </div>

        {/* 状态显示 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">当前状态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Focus Mode</h3>
              <p className="text-gray-300">
                状态: <span className={`font-bold ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {isActive ? '🎯 激活' : '⭕ 未激活'}
                </span>
              </p>
              <p className="text-gray-300">
                高亮正确选项: <span className={`font-bold ${highlightCorrectOption ? 'text-green-400' : 'text-gray-400'}`}>
                  {highlightCorrectOption ? '✅ 是' : '❌ 否'}
                </span>
              </p>
              <p className="text-gray-300">
                发光效果: <span className={`font-bold ${showGlowEffect ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {showGlowEffect ? '✨ 是' : '❌ 否'}
                </span>
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">测试计数</h3>
              <p className="text-gray-300">错误次数: <span className="font-bold text-red-400">{errorCount}</span></p>
              <p className="text-gray-300">成功次数: <span className="font-bold text-green-400">{successCount}</span></p>
              <p className="text-gray-300">连续错误: <span className="font-bold text-orange-400">{state?.consecutiveErrors || 0}</span></p>
            </div>
          </div>

          {/* 支持消息 */}
          {supportiveMessage && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <h4 className="text-yellow-400 font-semibold mb-2">支持消息</h4>
              <p className="text-yellow-300">{supportiveMessage}</p>
            </div>
          )}
        </div>

        {/* 测试按钮 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">测试操作</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={handleRecordError}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              记录错误 (连续2次触发Focus Mode)
            </button>
            
            <button
              onClick={handleRecordSuccess}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              disabled={!isActive}
            >
              记录成功 (退出Focus Mode)
            </button>
            
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              重置测试
            </button>
          </div>

          <div className="text-sm text-gray-400">
            <p>• 连续点击"记录错误"2次应该触发Focus Mode</p>
            <p>• Focus Mode激活后，"记录成功"按钮会变为可用</p>
            <p>• 点击"记录成功"会退出Focus Mode</p>
          </div>
        </div>

        {/* 模拟选项测试 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">视觉效果测试</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    {option.isCorrect && (
                      <div className="text-xs text-green-400 mt-2">
                        (Focus Mode会高亮此选项)
                      </div>
                    )}
                  </div>
                </div>
              </FocusModeHighlight>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>• 当Focus Mode激活时，正确选项(A)会显示金色发光效果</p>
            <p>• 发光效果包括边框高亮和脉冲动画</p>
          </div>
        </div>

        {/* 返回链接 */}
        <div className="text-center mt-8">
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            返回 vTPR 训练页面
          </a>
        </div>
      </div>
    </div>
  );
}
