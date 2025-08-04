/**
 * AIAssistantIndicator - AI学习助手状态指示器
 * 在学习界面显示AI助手状态和快速建议入口
 */

'use client'

import React, { useState } from 'react';
import { useLearningPathOptimizer } from '../../hooks/useLearningPathOptimizer';

export default function AIAssistantIndicator() {
  const { 
    recommendations, 
    insights, 
    profileStats, 
    optimizedPath,
    isProfileLoading,
    isPathLoading 
  } = useLearningPathOptimizer();
  
  const [isExpanded, setIsExpanded] = useState(false);

  // 如果正在加载或没有数据，不显示指示器
  if (isProfileLoading || isPathLoading || !profileStats) {
    return null;
  }

  // 获取高优先级推荐
  const highPriorityRecommendations = recommendations.filter(rec => rec.priority === 'high');
  const hasUrgentRecommendations = highPriorityRecommendations.length > 0;

  // 获取状态颜色
  const getStatusColor = () => {
    if (hasUrgentRecommendations) {
      return {
        bg: 'bg-red-500',
        text: 'text-red-100',
        border: 'border-red-400',
        icon: '🚨'
      };
    } else if (recommendations.length > 0) {
      return {
        bg: 'bg-blue-500',
        text: 'text-blue-100',
        border: 'border-blue-400',
        icon: '💡'
      };
    } else {
      return {
        bg: 'bg-green-500',
        text: 'text-green-100',
        border: 'border-green-400',
        icon: '✅'
      };
    }
  };

  const status = getStatusColor();

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* 主指示器 */}
      <div
        className={`${status.bg} ${status.text} rounded-lg shadow-lg border ${status.border} transition-all duration-300 cursor-pointer ${
          isExpanded ? 'rounded-b-none' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="px-4 py-3 flex items-center space-x-3">
          <span className="text-xl">{status.icon}</span>
          <div>
            <div className="font-semibold text-sm">AI 助手</div>
            <div className="text-xs opacity-90">
              {hasUrgentRecommendations 
                ? `${highPriorityRecommendations.length} 条紧急建议`
                : recommendations.length > 0
                ? `${recommendations.length} 条建议`
                : '学习状态良好'
              }
            </div>
          </div>
          <div className="text-lg">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* 展开的详细信息 */}
      {isExpanded && (
        <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 border-t-0 min-w-80">
          <div className="p-4">
            {/* 学习状态概览 */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">📊 学习状态</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{profileStats.overallScore}</div>
                  <div className="text-xs text-blue-700">综合评分</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-sm font-bold text-purple-600">
                    {optimizedPath?.currentPhase === 'foundation' && '基础'}
                    {optimizedPath?.currentPhase === 'development' && '发展'}
                    {optimizedPath?.currentPhase === 'mastery' && '精通'}
                    {optimizedPath?.currentPhase === 'maintenance' && '维持'}
                  </div>
                  <div className="text-xs text-purple-700">学习阶段</div>
                </div>
              </div>
            </div>

            {/* 优势和改进领域 */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-xs text-green-700 mb-1">优势领域</div>
                  <div className="text-sm font-medium text-green-800">
                    {profileStats.strongestArea}
                  </div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <div className="text-xs text-orange-700 mb-1">改进领域</div>
                  <div className="text-sm font-medium text-orange-800">
                    {profileStats.weakestArea}
                  </div>
                </div>
              </div>
            </div>

            {/* 高优先级推荐 */}
            {highPriorityRecommendations.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">🔥 紧急建议</h4>
                <div className="space-y-2">
                  {highPriorityRecommendations.slice(0, 2).map((rec) => (
                    <div key={rec.id} className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <div className="text-sm font-medium text-red-900">{rec.title}</div>
                      <div className="text-xs text-red-700">{rec.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 一般推荐 */}
            {recommendations.length > highPriorityRecommendations.length && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">💡 学习建议</h4>
                <div className="space-y-2">
                  {recommendations
                    .filter(rec => rec.priority !== 'high')
                    .slice(0, 2)
                    .map((rec) => (
                      <div key={rec.id} className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="text-sm font-medium text-blue-900">{rec.title}</div>
                        <div className="text-xs text-blue-700">{rec.description}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* 学习洞察 */}
            {insights.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">🔍 学习洞察</h4>
                <div className="space-y-2">
                  {insights.slice(0, 1).map((insight, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <div className="text-sm text-gray-800">{insight.insight}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        置信度: {insight.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 快速操作按钮 */}
            <div className="space-y-2">
              <a
                href="/ai-learning-assistant"
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center block font-medium"
              >
                🤖 打开AI助手
              </a>
              
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/ai-learning-assistant?view=recommendations"
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                >
                  💡 查看建议
                </a>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  ✕ 关闭
                </button>
              </div>
            </div>

            {/* AI助手提示 */}
            {recommendations.length === 0 && insights.length === 0 && (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">🎉</div>
                <div className="text-sm text-gray-600">
                  您的学习表现很棒！<br />
                  AI助手会持续分析您的学习数据
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 简化版本的AI助手指示器，用于其他页面
export function AIMiniIndicator() {
  const { recommendations, profileStats } = useLearningPathOptimizer();

  if (!profileStats || recommendations.length === 0) {
    return null;
  }

  const hasHighPriority = recommendations.some(rec => rec.priority === 'high');

  return (
    <a
      href="/ai-learning-assistant"
      className={`fixed bottom-20 right-4 z-50 ${
        hasHighPriority ? 'bg-red-600' : 'bg-purple-600'
      } text-white rounded-full p-3 shadow-lg hover:bg-opacity-80 transition-colors`}
      title={`AI助手: ${recommendations.length} 条建议`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-xl">🤖</span>
        <span className={`${hasHighPriority ? 'bg-red-700' : 'bg-purple-700'} text-white text-xs rounded-full px-2 py-1 min-w-6 text-center`}>
          {recommendations.length}
        </span>
      </div>
    </a>
  );
}
