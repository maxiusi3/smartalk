/**
 * SRSProgressDashboard - SRS进度可视化仪表板
 * 显示学习统计、进度图表、复习日历等
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useSRSStatistics } from '../../hooks/useSRS';
import { srsService } from '../../lib/services/SRSService';

interface SRSProgressDashboardProps {
  className?: string;
}

type TimeRange = 'day' | 'week' | 'month';

export default function SRSProgressDashboard({ className = '' }: SRSProgressDashboardProps) {
  const { statistics, isLoading, error } = useSRSStatistics();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  // 加载会话历史
  useEffect(() => {
    const history = srsService.getSessionHistory(30);
    setSessionHistory(history);
  }, []);

  // 生成复习日历数据
  const generateCalendarData = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 查找该日期的复习记录
      const daySession = sessionHistory.find(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date: date.toISOString().split('T')[0],
        reviews: daySession?.cardsReviewed || 0,
        accuracy: daySession?.accuracyRate || 0,
        intensity: daySession ? Math.min(daySession.cardsReviewed / 20, 1) : 0
      });
    }
    
    return days;
  };

  // 生成趋势数据
  const generateTrendData = () => {
    const days = timeRange === 'day' ? 7 : timeRange === 'week' ? 4 : 12;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      if (timeRange === 'day') {
        date.setDate(date.getDate() - i);
      } else if (timeRange === 'week') {
        date.setDate(date.getDate() - i * 7);
      } else {
        date.setMonth(date.getMonth() - i);
      }
      
      // 模拟数据（实际应用中应从真实数据计算）
      const reviews = Math.floor(Math.random() * 30) + 10;
      const accuracy = Math.floor(Math.random() * 20) + 75;
      
      data.push({
        period: timeRange === 'day' 
          ? date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
          : timeRange === 'week'
          ? `第${Math.ceil((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000))}周`
          : date.toLocaleDateString('zh-CN', { month: 'short' }),
        reviews,
        accuracy
      });
    }
    
    return data;
  };

  const calendarData = generateCalendarData();
  const trendData = generateTrendData();

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载统计数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总卡片数</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.totalCards || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">↗️ +{statistics?.newCards || 0}</span>
              <span className="text-gray-500 ml-1">新增</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">准确率</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.overallAccuracy || 0}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${statistics?.overallAccuracy || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">今日复习</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.todayReviews || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-blue-600">📊 明日: {statistics?.upcomingReviews?.tomorrow || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">连续天数</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.currentStreak || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-purple-600">🏆 最长: {statistics?.longestStreak || 0}天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 卡片状态分布 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 卡片状态分布</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">{statistics?.newCards || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">新卡片</p>
            <p className="text-xs text-gray-500">New</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-yellow-600">{statistics?.learningCards || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">学习中</p>
            <p className="text-xs text-gray-500">Learning</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-orange-600">{statistics?.reviewCards || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">复习中</p>
            <p className="text-xs text-gray-500">Review</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">{statistics?.graduatedCards || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">已掌握</p>
            <p className="text-xs text-gray-500">Graduated</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-gray-600">{statistics?.suspendedCards || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">已暂停</p>
            <p className="text-xs text-gray-500">Suspended</p>
          </div>
        </div>
      </div>

      {/* 复习趋势图表 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📈 复习趋势</h3>
          <div className="flex space-x-2">
            {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'day' ? '日' : range === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {trendData.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-600">{item.period}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-700">复习数量</span>
                  <span className="text-sm font-medium text-blue-600">{item.reviews}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.reviews / 50) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-700">准确率</span>
                  <span className="text-sm font-medium text-green-600">{item.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 复习日历热力图 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🗓️ 复习活动日历</h3>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded text-xs flex items-center justify-center cursor-pointer transition-colors ${
                day.intensity === 0
                  ? 'bg-gray-100 text-gray-400'
                  : day.intensity < 0.3
                  ? 'bg-green-100 text-green-700'
                  : day.intensity < 0.6
                  ? 'bg-green-300 text-green-800'
                  : day.intensity < 0.9
                  ? 'bg-green-500 text-white'
                  : 'bg-green-700 text-white'
              }`}
              title={`${day.date}: ${day.reviews}次复习, ${day.accuracy.toFixed(1)}%准确率`}
            >
              {day.reviews > 0 ? day.reviews : ''}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>过去30天</span>
          <div className="flex items-center space-x-1">
            <span>少</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <div className="w-3 h-3 bg-green-700 rounded"></div>
            </div>
            <span>多</span>
          </div>
        </div>
      </div>

      {/* 即将到期的复习 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ 即将到期的复习</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{statistics?.upcomingReviews?.today || 0}</div>
            <div className="text-sm text-red-700">今天</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{statistics?.upcomingReviews?.tomorrow || 0}</div>
            <div className="text-sm text-orange-700">明天</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{statistics?.upcomingReviews?.thisWeek || 0}</div>
            <div className="text-sm text-yellow-700">本周</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{statistics?.upcomingReviews?.nextWeek || 0}</div>
            <div className="text-sm text-blue-700">下周</div>
          </div>
        </div>
      </div>

      {/* 学习成就 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 学习成就</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg text-white">
            <div className="text-2xl mb-2">🥇</div>
            <div className="text-sm font-medium">学习新手</div>
            <div className="text-xs opacity-90">完成首次复习</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg text-white">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-medium">知识收集者</div>
            <div className="text-xs opacity-90">收集100张卡片</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg text-white">
            <div className="text-2xl mb-2">🔥</div>
            <div className="text-sm font-medium">坚持不懈</div>
            <div className="text-xs opacity-90">连续学习7天</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg text-white">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium">精准射手</div>
            <div className="text-xs opacity-90">准确率达到90%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
