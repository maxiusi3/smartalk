/**
 * SRS主页面
 * 整合复习界面、进度仪表板、提醒系统的完整SRS体验
 */

'use client'

import React, { useState } from 'react';
import SRSReviewInterface from '../../components/srs/SRSReviewInterface';
import SRSProgressDashboard from '../../components/srs/SRSProgressDashboard';
import SRSReminderSystem from '../../components/srs/SRSReminderSystem';
import { useSRS } from '../../hooks/useSRS';

type SRSView = 'dashboard' | 'review' | 'progress' | 'settings';

export default function SRSPage() {
  const [currentView, setCurrentView] = useState<SRSView>('dashboard');
  const { statistics, dueCards, newCards, isLoading } = useSRS();

  // 处理复习完成
  const handleReviewComplete = (session: any) => {
    console.log('Review session completed:', session);
    setCurrentView('dashboard');
  };

  // 开始复习
  const handleStartReview = () => {
    setCurrentView('review');
  };

  // 导航菜单项
  const navigationItems = [
    {
      id: 'dashboard' as SRSView,
      label: '仪表板',
      icon: '📊',
      description: '学习概览和提醒'
    },
    {
      id: 'review' as SRSView,
      label: '开始复习',
      icon: '🧠',
      description: '进行卡片复习'
    },
    {
      id: 'progress' as SRSView,
      label: '学习进度',
      icon: '📈',
      description: '详细统计和分析'
    },
    {
      id: 'settings' as SRSView,
      label: '设置',
      icon: '⚙️',
      description: '复习设置和偏好'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">正在加载SRS系统...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700">
      {/* 顶部导航栏 */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🧠</span>
                <h1 className="text-xl font-bold text-white">SRS 间隔重复系统</h1>
              </div>
              
              {/* 快速统计 */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <span>📚</span>
                  <span>{statistics?.totalCards || 0} 张卡片</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🎯</span>
                  <span>{statistics?.overallAccuracy || 0}% 准确率</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>{(dueCards?.length || 0) + (newCards?.length || 0)} 待复习</span>
                </div>
              </div>
            </div>

            {/* 快速操作按钮 */}
            <div className="flex items-center space-x-3">
              {(dueCards?.length || 0) + (newCards?.length || 0) > 0 && (
                <button
                  onClick={handleStartReview}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  🚀 开始复习
                </button>
              )}
              
              <a
                href="/learning/vtpr?interest=travel&keyword=hello"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📖 继续学习
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 复习模式 - 全屏显示 */}
        {currentView === 'review' && (
          <div className="max-w-4xl mx-auto">
            <SRSReviewInterface
              onComplete={handleReviewComplete}
              onClose={() => setCurrentView('dashboard')}
              className="w-full"
            />
          </div>
        )}

        {/* 其他视图 - 带侧边栏布局 */}
        {currentView !== 'review' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 侧边栏导航 */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-white mb-4">导航</h2>
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs opacity-75">{item.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>

                {/* 快速统计卡片 */}
                <div className="mt-6 space-y-3">
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-red-200 text-sm">过期卡片</span>
                      <span className="text-red-100 font-bold">{dueCards?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">新卡片</span>
                      <span className="text-blue-100 font-bold">{newCards?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-200 text-sm">今日复习</span>
                      <span className="text-green-100 font-bold">{statistics?.todayReviews || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 主要内容区域 */}
            <div className="lg:col-span-3">
              {/* 仪表板视图 */}
              {currentView === 'dashboard' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      欢迎回到 SRS 学习系统
                    </h2>
                    <p className="text-white/70 text-lg">
                      基于科学的间隔重复算法，帮助你高效记忆单词
                    </p>
                  </div>

                  {/* 提醒系统 */}
                  <SRSReminderSystem
                    onStartReview={handleStartReview}
                    className="w-full"
                  />

                  {/* 快速统计概览 */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">📊 学习概览</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-400 mb-1">
                            {statistics?.totalCards || 0}
                          </div>
                          <div className="text-white/70 text-sm">总卡片数</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-400 mb-1">
                            {statistics?.overallAccuracy || 0}%
                          </div>
                          <div className="text-white/70 text-sm">整体准确率</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-400 mb-1">
                            {statistics?.currentStreak || 0}
                          </div>
                          <div className="text-white/70 text-sm">连续学习天数</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 进度视图 */}
              {currentView === 'progress' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      📈 学习进度分析
                    </h2>
                    <p className="text-white/70 text-lg">
                      详细的学习统计和进度可视化
                    </p>
                  </div>
                  
                  <SRSProgressDashboard className="w-full" />
                </div>
              )}

              {/* 设置视图 */}
              {currentView === 'settings' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      ⚙️ 系统设置
                    </h2>
                    <p className="text-white/70 text-lg">
                      个性化你的学习体验
                    </p>
                  </div>
                  
                  <SRSReminderSystem
                    onStartReview={handleStartReview}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部链接 */}
      <footer className="bg-white/5 backdrop-blur-lg border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-white/60 text-sm">
              SmarTalk SRS - 基于SuperMemo 2算法的智能复习系统
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/learning/vtpr?interest=travel&keyword=hello"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                返回学习
              </a>
              <a
                href="/integration-test"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                集成测试
              </a>
              <a
                href="/test-srs"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                SRS测试
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
