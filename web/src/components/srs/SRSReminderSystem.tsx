/**
 * SRSReminderSystem - SRS复习提醒和通知系统
 * 智能提醒、学习目标设置、复习计划管理
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useSRS, useTodayReviews } from '../../hooks/useSRS';

interface SRSReminderSystemProps {
  onStartReview?: () => void;
  className?: string;
}

interface ReminderSettings {
  enabled: boolean;
  dailyGoal: number;
  reminderTimes: string[];
  weeklyGoal: number;
  notifications: {
    browser: boolean;
    sound: boolean;
    email: boolean;
  };
}

interface LearningGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  description: string;
  deadline?: string;
}

export default function SRSReminderSystem({
  onStartReview,
  className = ''
}: SRSReminderSystemProps) {
  const { statistics } = useSRS();
  const { dueCards, newCards, totalReviews } = useTodayReviews();
  
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    dailyGoal: 20,
    reminderTimes: ['09:00', '14:00', '20:00'],
    weeklyGoal: 140,
    notifications: {
      browser: true,
      sound: false,
      email: false
    }
  });

  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([
    {
      id: 'daily_reviews',
      type: 'daily',
      target: 20,
      current: statistics?.todayReviews || 0,
      description: '每日复习目标'
    },
    {
      id: 'weekly_reviews',
      type: 'weekly',
      target: 140,
      current: statistics?.weeklyReviews || 0,
      description: '每周复习目标'
    },
    {
      id: 'accuracy_goal',
      type: 'monthly',
      target: 85,
      current: statistics?.overallAccuracy || 0,
      description: '准确率目标'
    }
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  // 检查是否需要提醒
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5);
    
    if (reminderSettings.reminderTimes.includes(currentTimeStr)) {
      showReminder();
    }
  }, [currentTime, reminderSettings]);

  // 显示提醒
  const showReminder = () => {
    if (totalReviews === 0) return;

    // 浏览器通知
    if (reminderSettings.notifications.browser && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('SmarTalk 复习提醒', {
          body: `你有 ${totalReviews} 张卡片需要复习`,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showReminder();
          }
        });
      }
    }

    // 声音提醒
    if (reminderSettings.notifications.sound) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(console.error);
    }
  };

  // 更新学习目标
  const updateGoal = (goalId: string, newTarget: number) => {
    setLearningGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, target: newTarget } : goal
    ));
  };

  // 添加提醒时间
  const addReminderTime = (time: string) => {
    if (!reminderSettings.reminderTimes.includes(time)) {
      setReminderSettings(prev => ({
        ...prev,
        reminderTimes: [...prev.reminderTimes, time].sort()
      }));
    }
  };

  // 移除提醒时间
  const removeReminderTime = (time: string) => {
    setReminderSettings(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter(t => t !== time)
    }));
  };

  // 计算完成率
  const getCompletionRate = (goal: LearningGoal): number => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  // 获取目标状态
  const getGoalStatus = (goal: LearningGoal): 'completed' | 'on-track' | 'behind' | 'at-risk' => {
    const rate = getCompletionRate(goal);
    if (rate >= 100) return 'completed';
    if (rate >= 80) return 'on-track';
    if (rate >= 50) return 'behind';
    return 'at-risk';
  };

  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'on-track': return 'text-blue-600 bg-blue-100';
      case 'behind': return 'text-yellow-600 bg-yellow-100';
      case 'at-risk': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 获取优先级建议
  const getPriorityRecommendation = () => {
    if (dueCards.length > 0) {
      return {
        type: 'urgent',
        message: `你有 ${dueCards.length} 张过期卡片需要立即复习`,
        action: '立即复习',
        color: 'bg-red-500'
      };
    }
    
    if (newCards.length > 0) {
      return {
        type: 'new',
        message: `你有 ${newCards.length} 张新卡片等待学习`,
        action: '开始学习',
        color: 'bg-blue-500'
      };
    }
    
    return {
      type: 'completed',
      message: '今天的复习任务已完成！',
      action: '查看统计',
      color: 'bg-green-500'
    };
  };

  const recommendation = getPriorityRecommendation();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 今日复习状态 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📅 今日复习状态</h3>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* 优先级推荐 */}
        <div className={`${recommendation.color} text-white rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold mb-1">
                {recommendation.type === 'urgent' && '🚨 紧急'}
                {recommendation.type === 'new' && '📚 新内容'}
                {recommendation.type === 'completed' && '🎉 完成'}
              </div>
              <div className="text-sm opacity-90">{recommendation.message}</div>
            </div>
            <button
              onClick={onStartReview}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
            >
              {recommendation.action}
            </button>
          </div>
        </div>

        {/* 复习统计 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{dueCards.length}</div>
            <div className="text-sm text-red-700">过期卡片</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{newCards.length}</div>
            <div className="text-sm text-blue-700">新卡片</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{statistics?.todayReviews || 0}</div>
            <div className="text-sm text-green-700">已复习</div>
          </div>
        </div>
      </div>

      {/* 学习目标 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🎯 学习目标</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            设置
          </button>
        </div>

        <div className="space-y-4">
          {learningGoals.map((goal) => {
            const status = getGoalStatus(goal);
            const completionRate = getCompletionRate(goal);
            
            return (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{goal.description}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status === 'completed' && '已完成'}
                      {status === 'on-track' && '进展良好'}
                      {status === 'behind' && '稍微落后'}
                      {status === 'at-risk' && '需要努力'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {goal.current} / {goal.target}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      status === 'completed' ? 'bg-green-600' :
                      status === 'on-track' ? 'bg-blue-600' :
                      status === 'behind' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  完成率: {completionRate.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 提醒设置 */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ 提醒设置</h3>
          
          {/* 基本设置 */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">启用提醒</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.enabled}
                  onChange={(e) => setReminderSettings(prev => ({
                    ...prev,
                    enabled: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每日目标
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={reminderSettings.dailyGoal}
                onChange={(e) => setReminderSettings(prev => ({
                  ...prev,
                  dailyGoal: parseInt(e.target.value) || 20
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每周目标
              </label>
              <input
                type="number"
                min="1"
                max="700"
                value={reminderSettings.weeklyGoal}
                onChange={(e) => setReminderSettings(prev => ({
                  ...prev,
                  weeklyGoal: parseInt(e.target.value) || 140
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 提醒时间 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提醒时间
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {reminderSettings.reminderTimes.map((time) => (
                <div key={time} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>{time}</span>
                  <button
                    onClick={() => removeReminderTime(time)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="time"
                onChange={(e) => {
                  if (e.target.value) {
                    addReminderTime(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 通知方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通知方式
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reminderSettings.notifications.browser}
                  onChange={(e) => setReminderSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, browser: e.target.checked }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">浏览器通知</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reminderSettings.notifications.sound}
                  onChange={(e) => setReminderSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, sound: e.target.checked }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">声音提醒</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reminderSettings.notifications.email}
                  onChange={(e) => setReminderSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: e.target.checked }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">邮件提醒</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 学习建议 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 学习建议</h3>
        <div className="space-y-3">
          {dueCards.length > 10 && (
            <div className="flex items-start space-x-3">
              <span className="text-red-500">⚠️</span>
              <div>
                <div className="font-medium text-gray-900">过期卡片较多</div>
                <div className="text-sm text-gray-600">建议优先复习过期卡片，避免遗忘</div>
              </div>
            </div>
          )}
          
          {statistics && statistics.overallAccuracy < 70 && (
            <div className="flex items-start space-x-3">
              <span className="text-yellow-500">📈</span>
              <div>
                <div className="font-medium text-gray-900">准确率需要提升</div>
                <div className="text-sm text-gray-600">当前准确率 {statistics.overallAccuracy}%，建议放慢复习节奏</div>
              </div>
            </div>
          )}
          
          {newCards.length > 20 && (
            <div className="flex items-start space-x-3">
              <span className="text-blue-500">📚</span>
              <div>
                <div className="font-medium text-gray-900">新内容丰富</div>
                <div className="text-sm text-gray-600">有很多新内容等待学习，建议分批进行</div>
              </div>
            </div>
          )}
          
          {totalReviews === 0 && (
            <div className="flex items-start space-x-3">
              <span className="text-green-500">🎉</span>
              <div>
                <div className="font-medium text-gray-900">今日任务完成</div>
                <div className="text-sm text-gray-600">恭喜完成今日复习任务！明天继续加油</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
