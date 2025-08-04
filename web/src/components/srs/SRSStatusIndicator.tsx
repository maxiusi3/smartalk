/**
 * SRSStatusIndicator - SRS状态指示器
 * 在学习界面显示SRS复习状态和快速入口
 */

'use client'

import React, { useState } from 'react';
import { useSRS, useTodayReviews } from '../../hooks/useSRS';

export default function SRSStatusIndicator() {
  const { statistics } = useSRS();
  const { dueCards, newCards, totalReviews } = useTodayReviews();
  const [isExpanded, setIsExpanded] = useState(false);

  // 如果没有待复习的内容，不显示指示器
  if (totalReviews === 0) {
    return null;
  }

  // 获取优先级状态
  const getPriorityStatus = () => {
    if (dueCards.length > 0) {
      return {
        type: 'urgent',
        color: 'bg-red-500',
        textColor: 'text-red-100',
        borderColor: 'border-red-400',
        message: `${dueCards.length} 张过期`,
        icon: '🚨'
      };
    }
    
    if (newCards.length > 0) {
      return {
        type: 'new',
        color: 'bg-blue-500',
        textColor: 'text-blue-100',
        borderColor: 'border-blue-400',
        message: `${newCards.length} 张新卡片`,
        icon: '📚'
      };
    }
    
    return {
      type: 'normal',
      color: 'bg-green-500',
      textColor: 'text-green-100',
      borderColor: 'border-green-400',
      message: '复习完成',
      icon: '✅'
    };
  };

  const status = getPriorityStatus();

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* 主指示器 */}
      <div
        className={`${status.color} ${status.textColor} rounded-lg shadow-lg border ${status.borderColor} transition-all duration-300 cursor-pointer ${
          isExpanded ? 'rounded-b-none' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="px-4 py-3 flex items-center space-x-3">
          <span className="text-xl">{status.icon}</span>
          <div>
            <div className="font-semibold text-sm">SRS 复习</div>
            <div className="text-xs opacity-90">{status.message}</div>
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
            {/* 复习统计 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{dueCards.length}</div>
                <div className="text-xs text-red-700">过期</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{newCards.length}</div>
                <div className="text-xs text-blue-700">新卡片</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{statistics?.todayReviews || 0}</div>
                <div className="text-xs text-green-700">已复习</div>
              </div>
            </div>

            {/* 学习进度 */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>今日进度</span>
                <span>{statistics?.todayReviews || 0} / {(statistics?.todayReviews || 0) + totalReviews}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${totalReviews > 0 ? ((statistics?.todayReviews || 0) / ((statistics?.todayReviews || 0) + totalReviews)) * 100 : 100}%` 
                  }}
                />
              </div>
            </div>

            {/* 快速操作按钮 */}
            <div className="space-y-2">
              <a
                href="/srs"
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center block font-medium"
              >
                🧠 开始复习
              </a>
              
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/srs?view=progress"
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                >
                  📊 查看进度
                </a>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  ✕ 关闭
                </button>
              </div>
            </div>

            {/* 学习建议 */}
            {dueCards.length > 5 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-600 text-sm">⚠️</span>
                  <div className="text-xs text-yellow-800">
                    过期卡片较多，建议优先复习以避免遗忘
                  </div>
                </div>
              </div>
            )}

            {statistics && statistics.overallAccuracy < 70 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 text-sm">💡</span>
                  <div className="text-xs text-blue-800">
                    当前准确率 {statistics.overallAccuracy}%，建议放慢复习节奏
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 简化版本的SRS状态指示器，用于其他页面
export function SRSMiniIndicator() {
  const { totalReviews } = useTodayReviews();

  if (totalReviews === 0) {
    return null;
  }

  return (
    <a
      href="/srs"
      className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white rounded-full p-3 shadow-lg hover:bg-purple-700 transition-colors"
      title={`${totalReviews} 张卡片待复习`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-xl">🧠</span>
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center">
          {totalReviews}
        </span>
      </div>
    </a>
  );
}
