/**
 * 内容预加载指示器组件
 * 显示预加载进度和状态
 */

'use client'

import { useState, useEffect } from 'react';
import { contentPreloader } from '../lib/contentPreloader';

interface PreloadIndicatorProps {
  show: boolean;
  onComplete?: () => void;
  compact?: boolean;
}

export default function PreloadIndicator({ 
  show, 
  onComplete, 
  compact = false 
}: PreloadIndicatorProps) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    loading: 0,
    loaded: 0,
    error: 0,
    progress: 0
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!show) return;

    const updateStats = () => {
      const currentStats = contentPreloader.getStats();
      setStats(currentStats);

      // 检查是否完成
      if (currentStats.total > 0 && 
          currentStats.loaded + currentStats.error === currentStats.total) {
        if (!isComplete) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 1000); // 延迟1秒显示完成状态
        }
      }
    };

    // 立即更新一次
    updateStats();

    // 定期更新统计
    const interval = setInterval(updateStats, 500);

    return () => clearInterval(interval);
  }, [show, isComplete, onComplete]);

  if (!show) return null;

  if (compact) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* 进度环 */}
        <div style={{
          position: 'relative',
          width: '40px',
          height: '40px'
        }}>
          <svg
            width="40"
            height="40"
            style={{
              transform: 'rotate(-90deg)'
            }}
          >
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - stats.progress / 100)}`}
              style={{
                transition: 'stroke-dashoffset 0.5s ease'
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}>
            {stats.progress}%
          </div>
        </div>

        {/* 状态文本 */}
        <div>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginBottom: '0.25rem'
          }}>
            {isComplete ? '✅ 预加载完成' : '📥 预加载中...'}
          </div>
          <div style={{
            fontSize: '0.7rem',
            opacity: 0.8
          }}>
            {stats.loaded}/{stats.total} 项目
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* 主进度环 */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          margin: '0 auto 2rem'
        }}>
          <svg
            width="120"
            height="120"
            style={{
              transform: 'rotate(-90deg)'
            }}
          >
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - stats.progress / 100)}`}
              style={{
                transition: 'stroke-dashoffset 0.5s ease'
              }}
            />
          </svg>
          
          {/* 中心内容 */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white'
          }}>
            {isComplete ? (
              <div style={{
                fontSize: '2rem',
                animation: 'bounce 1s infinite'
              }}>
                ✅
              </div>
            ) : (
              <>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem'
                }}>
                  {stats.progress}%
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  opacity: 0.8
                }}>
                  {stats.loaded}/{stats.total}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 标题 */}
        <h3 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          {isComplete ? '🎉 预加载完成！' : '📥 正在预加载内容...'}
        </h3>

        {/* 描述 */}
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1rem',
          lineHeight: '1.5',
          marginBottom: '2rem'
        }}>
          {isComplete 
            ? '所有学习内容已准备就绪，即将为您提供流畅的学习体验！'
            : '我们正在为您准备最佳的学习体验，请稍候...'
          }
        </p>

        {/* 详细统计 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{
              color: '#3b82f6',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {stats.loaded}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem'
            }}>
              已完成
            </div>
          </div>

          <div style={{
            background: 'rgba(251, 191, 36, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            <div style={{
              color: '#fbbf24',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {stats.loading}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem'
            }}>
              加载中
            </div>
          </div>

          <div style={{
            background: 'rgba(107, 114, 128, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            border: '1px solid rgba(107, 114, 128, 0.3)'
          }}>
            <div style={{
              color: '#6b7280',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {stats.pending}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem'
            }}>
              等待中
            </div>
          </div>

          {stats.error > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{
                color: '#ef4444',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {stats.error}
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.7rem'
              }}>
                失败
              </div>
            </div>
          )}
        </div>

        {/* 加载动画 */}
        {!isComplete && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* CSS 动画通过内联样式实现 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `
      }} />
    </div>
  );
}
