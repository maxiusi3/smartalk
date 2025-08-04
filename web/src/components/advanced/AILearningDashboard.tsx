/**
 * AILearningDashboard - AI学习仪表板
 * 显示个性化学习建议、学习洞察和智能推荐
 */

'use client'

import React, { useState } from 'react';
import { useLearningPathOptimizer } from '../../hooks/useLearningPathOptimizer';
import { LearningRecommendation, LearningInsight } from '../../lib/ai/LearningPathOptimizer';

interface AILearningDashboardProps {
  className?: string;
}

export default function AILearningDashboard({ className = '' }: AILearningDashboardProps) {
  const {
    learningProfile,
    isProfileLoading,
    profileError,
    optimizedPath,
    isPathLoading,
    pathError,
    recommendations,
    insights,
    refreshProfile,
    refreshPath,
    markRecommendationAsRead,
    markRecommendationAsCompleted,
    dismissRecommendation,
    profileStats
  } = useLearningPathOptimizer();

  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'insights' | 'profile'>('overview');
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  // 加载状态
  if (isProfileLoading || isPathLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在分析您的学习数据...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (profileError || pathError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{profileError || pathError}</p>
          <button
            onClick={() => {
              refreshProfile();
              refreshPath();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 获取优先级颜色
  const getPriorityColor = (priority: LearningRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 获取洞察影响颜色
  const getImpactColor = (impact: LearningInsight['impact']) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🤖 AI 学习助手</h2>
            <p className="text-purple-100">基于您的学习数据提供个性化建议</p>
          </div>

          {profileStats && (
            <div className="text-right">
              <div className="text-3xl font-bold">{profileStats.overallScore}</div>
              <div className="text-sm text-purple-100">综合评分</div>
            </div>
          )}
        </div>
      </div>

      {/* 导航标签 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: '概览', icon: '📊' },
            { id: 'recommendations', label: '推荐', icon: '💡' },
            { id: 'insights', label: '洞察', icon: '🔍' },
            { id: 'profile', label: '档案', icon: '👤' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {/* 概览标签 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 学习阶段和统计 */}
            {optimizedPath && profileStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">当前阶段</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {optimizedPath.currentPhase === 'foundation' && '基础建立'}
                    {optimizedPath.currentPhase === 'development' && '技能发展'}
                    {optimizedPath.currentPhase === 'mastery' && '技能精通'}
                    {optimizedPath.currentPhase === 'maintenance' && '技能维持'}
                  </div>
                  <div className="text-sm text-blue-700">
                    综合评分: {profileStats.overallScore}/100
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">优势领域</h3>
                  <div className="text-lg font-bold text-green-600 mb-1">
                    {profileStats.strongestArea}
                  </div>
                  <div className="text-sm text-green-700">
                    继续发挥您的优势
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">改进领域</h3>
                  <div className="text-lg font-bold text-orange-600 mb-1">
                    {profileStats.weakestArea}
                  </div>
                  <div className="text-sm text-orange-700">
                    重点关注和提升
                  </div>
                </div>
              </div>
            )}

            {/* 快速推荐 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 今日推荐</h3>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority === 'high' && '高优先级'}
                            {rec.priority === 'medium' && '中优先级'}
                            {rec.priority === 'low' && '低优先级'}
                          </span>
                          <span className="text-sm text-gray-500">
                            预计 {rec.estimatedTimeToComplete} 分钟
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                      <button
                        onClick={() => markRecommendationAsRead(rec.id)}
                        className="ml-4 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 下一阶段里程碑 */}
            {optimizedPath?.nextMilestones && optimizedPath.nextMilestones.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 下一阶段目标</h3>
                <div className="space-y-3">
                  {optimizedPath.nextMilestones.slice(0, 2).map((milestone, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{milestone.milestone}</h4>
                        <span className="text-sm text-gray-500">
                          预计 {milestone.estimatedTimeToReach} 天
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium mb-1">需要完成的行动：</div>
                        <ul className="list-disc list-inside space-y-1">
                          {milestone.requiredActions.map((action, actionIndex) => (
                            <li key={actionIndex}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 推荐标签 */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                💡 个性化学习推荐 ({recommendations.length})
              </h3>
              <button
                onClick={refreshPath}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                🔄 刷新推荐
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-gray-600">暂无新的推荐，您的学习表现很棒！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority === 'high' && '🔥 高优先级'}
                          {rec.priority === 'medium' && '⚡ 中优先级'}
                          {rec.priority === 'low' && '💡 低优先级'}
                        </span>
                        <span className="text-sm text-gray-500">
                          置信度: {rec.confidence}%
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markRecommendationAsCompleted(rec.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✅ 完成
                        </button>
                        <button
                          onClick={() => dismissRecommendation(rec.id)}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          ✕ 忽略
                        </button>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                    <p className="text-gray-600 mb-3">{rec.description}</p>

                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="text-sm text-blue-800">
                        <strong>推荐理由：</strong> {rec.reasoning}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedRecommendation(
                        expandedRecommendation === rec.id ? null : rec.id
                      )}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      {expandedRecommendation === rec.id ? '收起详情 ▲' : '展开详情 ▼'}
                    </button>

                    {expandedRecommendation === rec.id && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">📋 行动清单：</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {rec.actionItems.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">🎯 预期收益：</h5>
                          <p className="text-sm text-gray-600">{rec.expectedBenefit}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">⏱️ 预计时间：</h5>
                          <p className="text-sm text-gray-600">{rec.estimatedTimeToComplete} 分钟</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">🔗 相关功能：</h5>
                          <div className="flex flex-wrap gap-2">
                            {rec.relatedFeatures.map((feature) => (
                              <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {feature === 'focus_mode' && 'Focus Mode'}
                                {feature === 'pronunciation' && '发音评估'}
                                {feature === 'rescue_mode' && 'Rescue Mode'}
                                {feature === 'srs' && 'SRS复习'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 洞察标签 */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🔍 学习洞察 ({insights.length})
            </h3>

            {insights.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-600">继续学习以获得更多洞察分析</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact === 'positive' && '✅ 积极'}
                          {insight.impact === 'negative' && '⚠️ 需关注'}
                          {insight.impact === 'neutral' && 'ℹ️ 中性'}
                        </span>
                        <span className="text-sm text-gray-500">
                          置信度: {insight.confidence}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {insight.category === 'performance' && '性能分析'}
                        {insight.category === 'behavior' && '行为分析'}
                        {insight.category === 'progress' && '进度分析'}
                        {insight.category === 'prediction' && '预测分析'}
                      </span>
                    </div>

                    <p className="text-gray-800 mb-3">{insight.insight}</p>

                    {insight.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">💡 建议：</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {insight.recommendations.map((rec, recIndex) => (
                            <li key={recIndex}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 档案标签 */}
        {activeTab === 'profile' && learningProfile && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">👤 学习档案</h3>
              <button
                onClick={refreshProfile}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                🔄 更新档案
              </button>
            </div>

            {/* 学习风格和偏好 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">学习特征</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">学习风格:</span>
                    <span className="font-medium">
                      {learningProfile.learningStyle === 'visual' && '视觉型'}
                      {learningProfile.learningStyle === 'auditory' && '听觉型'}
                      {learningProfile.learningStyle === 'kinesthetic' && '动觉型'}
                      {learningProfile.learningStyle === 'mixed' && '混合型'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">难度偏好:</span>
                    <span className="font-medium">
                      {learningProfile.difficultyPreference === 'easy' && '简单'}
                      {learningProfile.difficultyPreference === 'moderate' && '中等'}
                      {learningProfile.difficultyPreference === 'challenging' && '挑战'}
                      {learningProfile.difficultyPreference === 'adaptive' && '自适应'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">学习节奏:</span>
                    <span className="font-medium">
                      {learningProfile.pacePreference === 'slow' && '慢节奏'}
                      {learningProfile.pacePreference === 'moderate' && '中等节奏'}
                      {learningProfile.pacePreference === 'fast' && '快节奏'}
                      {learningProfile.pacePreference === 'adaptive' && '自适应'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">能力评估</h4>
                <div className="space-y-3">
                  {[
                    { label: '专注力', value: learningProfile.focusStrength },
                    { label: '记忆力', value: learningProfile.memoryRetention },
                    { label: '发音技能', value: learningProfile.pronunciationSkill },
                    { label: '学习一致性', value: learningProfile.consistencyScore },
                    { label: '学习动机', value: learningProfile.motivationLevel }
                  ].map((skill) => (
                    <div key={skill.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{skill.label}</span>
                        <span className="font-medium">{skill.value}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            skill.value >= 80 ? 'bg-green-600' :
                            skill.value >= 60 ? 'bg-yellow-600' :
                            skill.value >= 40 ? 'bg-orange-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${skill.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 优势和薄弱领域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">💪 优势领域</h4>
                {learningProfile.strongAreas.length > 0 ? (
                  <div className="space-y-2">
                    {learningProfile.strongAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-green-800">
                          {area === 'visual_learning' && '视觉学习'}
                          {area === 'pronunciation' && '发音技能'}
                          {area === 'problem_solving' && '问题解决'}
                          {area === 'memory_retention' && '记忆保持'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-700">继续学习以发现您的优势</p>
                )}
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-3">🎯 改进领域</h4>
                {learningProfile.weakAreas.length > 0 ? (
                  <div className="space-y-2">
                    {learningProfile.weakAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-orange-600">⚠</span>
                        <span className="text-sm text-orange-800">
                          {area === 'attention_focus' && '注意力集中'}
                          {area === 'pronunciation' && '发音技能'}
                          {area === 'learning_persistence' && '学习坚持性'}
                          {area === 'memory_retention' && '记忆保持'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-orange-700">表现均衡，无明显薄弱领域</p>
                )}
              </div>
            </div>

            {/* 档案更新时间 */}
            <div className="text-center text-sm text-gray-500">
              档案最后更新：{new Date(learningProfile.lastUpdated).toLocaleString('zh-CN')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

