'use client'

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AchievementPage() {
  const params = useParams();
  const interest = params?.interest as string;
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动设备
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const getThemeInfo = (theme: string) => {
    switch (theme) {
      case 'travel':
        return { name: '旅行英语', icon: '✈️', color: '#3b82f6' };
      case 'movie':
        return { name: '电影对话', icon: '🎬', color: '#8b5cf6' };
      case 'workplace':
        return { name: '职场沟通', icon: '💼', color: '#10b981' };
      default:
        return { name: '学习', icon: '📚', color: '#6b7280' };
    }
  };

  const themeInfo = getThemeInfo(interest || 'travel');

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${themeInfo.color}20 0%, ${themeInfo.color}10 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '2rem 1rem' : '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* 成就庆祝区域 */}
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '1rem',
        padding: isMobile ? '2rem 1.5rem' : '3rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* 庆祝图标 */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          animation: 'bounce 2s infinite'
        }}>
          🎉
        </div>

        {/* 主标题 */}
        <h1 style={{
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem',
          lineHeight: 1.2
        }}>
          恭喜完成学习！
        </h1>

        {/* 副标题 */}
        <p style={{
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: 1.5
        }}>
          你已经成功完成了 <span style={{ color: themeInfo.color, fontWeight: 'bold' }}>
            {themeInfo.icon} {themeInfo.name}
          </span> 的学习体验
        </p>

        {/* 成就统计 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div style={{
            background: `${themeInfo.color}10`,
            borderRadius: '0.5rem',
            padding: '1.5rem',
            border: `1px solid ${themeInfo.color}20`
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: themeInfo.color,
              marginBottom: '0.5rem'
            }}>
              15
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280'
            }}>
              关键词掌握
            </div>
          </div>

          <div style={{
            background: `${themeInfo.color}10`,
            borderRadius: '0.5rem',
            padding: '1.5rem',
            border: `1px solid ${themeInfo.color}20`
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: themeInfo.color,
              marginBottom: '0.5rem'
            }}>
              100%
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280'
            }}>
              完成度
            </div>
          </div>

          <div style={{
            background: `${themeInfo.color}10`,
            borderRadius: '0.5rem',
            padding: '1.5rem',
            border: `1px solid ${themeInfo.color}20`
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: themeInfo.color,
              marginBottom: '0.5rem'
            }}>
              ⭐
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280'
            }}>
              学习成就
            </div>
          </div>
        </div>

        {/* 鼓励文字 */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '1rem',
            color: '#374151',
            lineHeight: 1.6,
            margin: 0
          }}>
            🌟 你已经体验了神经沉浸法的魔力！通过无字幕理解视频内容，
            你的英语理解能力得到了真正的提升。继续保持这种学习方式，
            你会发现英语交流变得越来越自然。
          </p>
        </div>

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => window.location.href = '/learning'}
            style={{
              background: themeInfo.color,
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🚀 继续学习
          </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'rgba(107, 114, 128, 0.1)',
              color: '#374151',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              borderRadius: '0.5rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
            }}
          >
            🏠 返回首页
          </button>
        </div>
      </div>

      {/* CSS 动画通过内联样式实现 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `
      }} />
    </div>
  );
}
