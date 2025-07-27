'use client'

import { useState, useEffect } from 'react';
import { progressManager, UserProgress, LearningStats, Achievement } from '../lib/progressManager';

interface EnhancedProgressDashboardProps {
  className?: string;
  compact?: boolean;
}

export default function EnhancedProgressDashboard({ className = '', compact = false }: EnhancedProgressDashboardProps) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检测移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 加载用户进度
    const loadProgress = async () => {
      try {
        let progress = progressManager.getUserProgress();
        if (!progress) {
          // 初始化新用户
          const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          progress = await progressManager.initializeUser(deviceId);
        }
        setUserProgress(progress);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className={className} style={{
        padding: compact ? '1rem' : '2rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          animation: 'spin 1s linear infinite'
        }}>
          📊
        </div>
        <p>正在加载学习进度...</p>
      </div>
    );
  }

  if (!userProgress) {
    return (
      <div className={className} style={{
        padding: compact ? '1rem' : '2rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>😔</div>
        <p>无法加载学习进度</p>
      </div>
    );
  }

  const stats = userProgress.learningStats;
  const todayProgress = stats.weeklyProgress.find(p => p.date === new Date().toISOString().split('T')[0]);
  const dailyGoalProgress = todayProgress ? (todayProgress.timeSpent / userProgress.preferences.dailyGoal) * 100 : 0;

  if (compact) {
    // 紧凑版本 - 用于主页显示
    return (
      <div className={className} style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#374151',
            margin: 0
          }}>
            学习进度
          </h3>
          <div style={{
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            Lv.{userProgress.level} • {userProgress.streakDays}天连续
          </div>
        </div>

        {/* 今日进度条 */}
        <div style={{
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>
              今日目标
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              {todayProgress?.timeSpent || 0} / {userProgress.preferences.dailyGoal} 分钟
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(dailyGoalProgress, 100)}%`,
              height: '100%',
              background: dailyGoalProgress >= 100 
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* 快速统计 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          fontSize: '0.8rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>
              {stats.storiesCompleted}
            </div>
            <div style={{ color: '#6b7280' }}>故事完成</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#10b981' }}>
              {stats.keywordsMastered}
            </div>
            <div style={{ color: '#6b7280' }}>词汇掌握</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#8b5cf6' }}>
              {Math.round(stats.overallAccuracy)}%
            </div>
            <div style={{ color: '#6b7280' }}>准确率</div>
          </div>
        </div>
      </div>
    );
  }

  // 完整版本
  return (
    <div className={className} style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '1rem',
      padding: isMobile ? '1.5rem' : '2rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      {/* 头部统计 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* 等级 */}
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '0.75rem',
          color: 'white'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Lv.{userProgress.level}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            等级
          </div>
        </div>

        {/* 连续天数 */}
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '0.75rem',
          color: 'white'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {userProgress.streakDays}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            连续天数 🔥
          </div>
        </div>

        {/* 总学习时间 */}
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '0.75rem',
          color: 'white'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {Math.round(userProgress.totalStudyTime)}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            总时长(分钟)
          </div>
        </div>

        {/* 掌握词汇 */}
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          borderRadius: '0.75rem',
          color: 'white'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {stats.keywordsMastered}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            掌握词汇
          </div>
        </div>
      </div>

      {/* 今日目标进度 */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#f8fafc',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#374151',
            margin: 0
          }}>
            今日学习目标
          </h3>
          <span style={{
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            {todayProgress?.timeSpent || 0} / {userProgress.preferences.dailyGoal} 分钟
          </span>
        </div>

        {/* 进度条 */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(dailyGoalProgress, 100)}%`,
            height: '100%',
            background: dailyGoalProgress >= 100 
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {todayProgress?.goalAchieved && (
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            color: '#10b981',
            fontWeight: '500'
          }}>
            🎉 今日目标已完成！
          </div>
        )}
      </div>

      {/* 主题进度 */}
      <div style={{
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          主题学习进度
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '1rem'
        }}>
          {['travel', 'movie', 'workplace'].map((theme) => {
            const themeStats = progressManager.getThemeStats(theme);
            const themeInfo = {
              travel: { name: '旅行英语', icon: '✈️', color: '#3b82f6' },
              movie: { name: '电影对话', icon: '🎬', color: '#8b5cf6' },
              workplace: { name: '职场沟通', icon: '💼', color: '#10b981' }
            }[theme] || { name: '未知', icon: '📚', color: '#6b7280' };

            const completionRate = themeStats.total > 0 ? (themeStats.completed / themeStats.total) * 100 : 0;

            return (
              <div key={theme} style={{
                padding: '1rem',
                background: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                    {themeInfo.icon}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    {themeInfo.name}
                  </span>
                </div>

                <div style={{
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  完成度: {Math.round(completionRate)}%
                </div>

                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${completionRate}%`,
                    height: '100%',
                    background: themeInfo.color,
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <div style={{
                  fontSize: '0.7rem',
                  color: '#9ca3af',
                  marginTop: '0.25rem'
                }}>
                  准确率: {Math.round(themeStats.accuracy)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 最近成就 */}
      {userProgress.achievements.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            最近成就
          </h3>

          <div style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}>
            {userProgress.achievements.slice(-3).map((achievement) => (
              <div key={achievement.id} style={{
                minWidth: '200px',
                padding: '1rem',
                background: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {achievement.icon}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  {achievement.title}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6b7280'
                }}>
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 添加CSS动画 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}
