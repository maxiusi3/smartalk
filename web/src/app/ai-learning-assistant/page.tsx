/**
 * AI学习助手主页面
 * 整合AI学习路径优化、个性化推荐、学习洞察的完整AI体验
 */

'use client'

import React, { useState } from 'react';
import AILearningDashboard from '../../components/advanced/AILearningDashboard';
import { useLearningPathOptimizer } from '../../hooks/useLearningPathOptimizer';

type AIView = 'dashboard' | 'recommendations' | 'insights' | 'settings';

export default function AILearningAssistantPage() {
  const [currentView, setCurrentView] = useState<AIView>('dashboard');
  const { learningProfile, optimizedPath, recommendations, insights, profileStats } = useLearningPathOptimizer();

  // 导航菜单项
  const navigationItems = [
    {
      id: 'dashboard' as AIView,
      label: 'AI仪表板',
      icon: '🤖',
      description: '个性化学习建议和洞察'
    },
    {
      id: 'recommendations' as AIView,
      label: '智能推荐',
      icon: '💡',
      description: '基于AI的学习建议'
    },
    {
      id: 'insights' as AIView,
      label: '学习洞察',
      icon: '🔍',
      description: '深度学习行为分析'
    },
    {
      id: 'settings' as AIView,
      label: 'AI设置',
      icon: '⚙️',
      description: 'AI助手个性化设置'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 顶部导航栏 */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <h1 className="text-xl font-bold text-white">AI 学习助手</h1>
              </div>
              
              {/* 快速统计 */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-white/80">
                {profileStats && (
                  <>
                    <div className="flex items-center space-x-1">
                      <span>📊</span>
                      <span>综合评分: {profileStats.overallScore}/100</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>💡</span>
                      <span>{recommendations.length} 条推荐</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>🔍</span>
                      <span>{insights.length} 项洞察</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 快速操作按钮 */}
            <div className="flex items-center space-x-3">
              <a
                href="/srs"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🧠 SRS复习
              </a>
              
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
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-4">AI功能导航</h2>
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

              {/* AI助手状态卡片 */}
              <div className="mt-6 space-y-3">
                {learningProfile && (
                  <>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200 text-sm">学习阶段</span>
                        <span className="text-blue-100 font-bold">
                          {optimizedPath?.currentPhase === 'foundation' && '基础'}
                          {optimizedPath?.currentPhase === 'development' && '发展'}
                          {optimizedPath?.currentPhase === 'mastery' && '精通'}
                          {optimizedPath?.currentPhase === 'maintenance' && '维持'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-200 text-sm">优势领域</span>
                        <span className="text-green-100 font-bold text-xs">
                          {profileStats?.strongestArea}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-200 text-sm">改进领域</span>
                        <span className="text-orange-100 font-bold text-xs">
                          {profileStats?.weakestArea}
                        </span>
                      </div>
                    </div>
                  </>
                )}
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
                    🤖 AI 学习助手
                  </h2>
                  <p className="text-white/70 text-lg">
                    基于您的学习数据提供个性化的智能建议和洞察
                  </p>
                </div>

                {/* AI学习仪表板 */}
                <AILearningDashboard className="w-full" />

                {/* AI功能介绍 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🚀 AI功能特色</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🎯</span>
                        <h4 className="font-semibold text-white">个性化学习路径</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        基于您的学习风格、能力水平和进度，AI为您量身定制最适合的学习路径和策略。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🔮</span>
                        <h4 className="font-semibold text-white">预测性学习干预</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        AI能够预测您可能遇到的学习困难，并提前提供针对性的帮助和建议。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">📊</span>
                        <h4 className="font-semibold text-white">深度学习分析</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        全面分析您的学习行为模式，提供深度洞察和改进建议。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🤝</span>
                        <h4 className="font-semibold text-white">智能功能协同</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        AI与Focus Mode、发音评估、Rescue Mode、SRS系统完美协同工作。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 智能推荐视图 */}
            {currentView === 'recommendations' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    💡 智能学习推荐
                  </h2>
                  <p className="text-white/70 text-lg">
                    基于AI分析的个性化学习建议
                  </p>
                </div>
                
                <AILearningDashboard className="w-full" />
              </div>
            )}

            {/* 学习洞察视图 */}
            {currentView === 'insights' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    🔍 学习洞察分析
                  </h2>
                  <p className="text-white/70 text-lg">
                    深度的学习行为分析和预测
                  </p>
                </div>
                
                <AILearningDashboard className="w-full" />
              </div>
            )}

            {/* AI设置视图 */}
            {currentView === 'settings' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    ⚙️ AI助手设置
                  </h2>
                  <p className="text-white/70 text-lg">
                    个性化您的AI学习助手
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI偏好设置</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        推荐频率
                      </label>
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option value="high">高频率 - 每日更新</option>
                        <option value="medium">中频率 - 每周更新</option>
                        <option value="low">低频率 - 按需更新</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        推荐类型偏好
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'content', label: '内容推荐', description: '推荐学习内容和材料' },
                          { id: 'strategy', label: '策略建议', description: '学习方法和策略优化' },
                          { id: 'schedule', label: '时间安排', description: '学习时间和节奏建议' },
                          { id: 'focus', label: '专注提升', description: 'Focus Mode相关建议' },
                          { id: 'review', label: '复习优化', description: 'SRS复习策略建议' }
                        ].map((type) => (
                          <label key={type.id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <div className="text-white font-medium">{type.label}</div>
                              <div className="text-white/60 text-sm">{type.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        洞察分析深度
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'basic', label: '基础分析', description: '基本的学习统计和趋势' },
                          { id: 'advanced', label: '高级分析', description: '深度行为模式分析' },
                          { id: 'predictive', label: '预测分析', description: '学习效果预测和建议' }
                        ].map((level) => (
                          <label key={level.id} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="analysis_depth"
                              value={level.id}
                              defaultChecked={level.id === 'advanced'}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <div className="text-white font-medium">{level.label}</div>
                              <div className="text-white/60 text-sm">{level.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        保存设置
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部链接 */}
      <footer className="bg-white/5 backdrop-blur-lg border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-white/60 text-sm">
              SmarTalk AI学习助手 - 基于机器学习的个性化学习优化系统
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/learning/vtpr?interest=travel&keyword=hello"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                返回学习
              </a>
              <a
                href="/srs"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                SRS复习
              </a>
              <a
                href="/four-way-integration-test"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                功能测试
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
