/**
 * 学习进度仪表板组件 - 使用新的进度管理系统
 * 显示用户的学习统计和进度可视化
 */

'use client'

import { useState, useEffect } from 'react';
import { progressManager, UserProgress, LearningStats } from '../lib/progressManager';

interface ProgressDashboardProps {
  compact?: boolean;
  showExportButton?: boolean;
  className?: string;
}

export default function ProgressDashboard({
  compact = false,
  showExportButton = false,
  className = ''
}: ProgressDashboardProps) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // 计算完成率
  const completionRate = stats.totalKeywords > 0 
    ? Math.round((stats.unlockedKeywords / stats.totalKeywords) * 100) 
    : 0;

  // 获取等级信息
  const getLevelInfo = (unlockedKeywords: number) => {
    if (unlockedKeywords >= 100) return { level: 'Master', icon: '🏆', color: '#f59e0b' };
    if (unlockedKeywords >= 50) return { level: 'Expert', icon: '🎯', color: '#8b5cf6' };
    if (unlockedKeywords >= 20) return { level: 'Advanced', icon: '🚀', color: '#10b981' };
    if (unlockedKeywords >= 10) return { level: 'Intermediate', icon: '📚', color: '#3b82f6' };
    return { level: 'Beginner', icon: '🌱', color: '#6b7280' };
  };

  const levelInfo = getLevelInfo(stats.unlockedKeywords);

  if (isLoading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: compact ? '0.5rem' : '1rem',
        padding: compact ? '1rem' : '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ color: '#6b7280' }}>加载进度数据中...</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '0.5rem',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        {/* 等级图标 */}
        <div style={{
          fontSize: '2rem',
          background: `${levelInfo.color}20`,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {levelInfo.icon}
        </div>

        {/* 进度信息 */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontWeight: 'bold',
              color: levelInfo.color
            }}>
              {levelInfo.level}
            </span>
            <span style={{
              fontSize: '0.9rem',
              color: '#6b7280'
            }}>
              {stats.unlockedKeywords}/{stats.totalKeywords}
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
              width: `${completionRate}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}dd)`,
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>

        {/* 完成率 */}
        <div style={{
          textAlign: 'center',
          minWidth: '60px'
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: levelInfo.color
          }}>
            {completionRate}%
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: '#9ca3af'
          }}>
            完成率
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0
        }}>
          📊 学习进度
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}
          >
            {showDetails ? '隐藏详情' : '显示详情'}
          </button>
          
          {showExportButton && (
            <button
              onClick={exportLearningData}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}
            >
              📥 导出数据
            </button>
          )}
          
          <button
            onClick={refreshProgress}
            style={{
              background: 'rgba(107, 114, 128, 0.1)',
              color: '#6b7280',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}
          >
            🔄 刷新
          </button>
        </div>
      </div>

      {/* 主要统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* 等级卡片 */}
        <div style={{
          background: `${levelInfo.color}10`,
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          border: `2px solid ${levelInfo.color}20`
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {levelInfo.icon}
          </div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: levelInfo.color,
            marginBottom: '0.25rem'
          }}>
            {levelInfo.level}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            当前等级
          </div>
        </div>

        {/* 解锁词汇 */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          border: '2px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔓</div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: '0.25rem'
          }}>
            {stats.unlockedKeywords}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            已解锁词汇
          </div>
        </div>

        {/* 完成率 */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          border: '2px solid rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📈</div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '0.25rem'
          }}>
            {completionRate}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            完成率
          </div>
        </div>

        {/* 准确率 */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          border: '2px solid rgba(139, 92, 246, 0.2)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#8b5cf6',
            marginBottom: '0.25rem'
          }}>
            {stats.accuracy}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            答题准确率
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      {showDetails && (
        <div style={{
          background: 'rgba(243, 244, 246, 0.5)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginTop: '1rem'
        }}>
          <h4 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            详细统计
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.completedStories}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>完成故事</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.totalAttempts}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>总尝试次数</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.currentStreak}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>当前连击</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.bestStreak}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>最佳连击</div>
            </div>
          </div>
        </div>
      )}

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
