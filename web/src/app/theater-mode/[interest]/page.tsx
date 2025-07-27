'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TheaterModePage() {
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

  // 获取主题信息
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
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1f2937, #374151)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        position: 'relative'
      }}
    >
      {/* 简化的视频播放区域 */}
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        width: '90%'
      }}>
        <div style={{
          fontSize: isMobile ? '4rem' : '6rem',
          marginBottom: '2rem'
        }}>
          {themeInfo.icon}
        </div>

        <h1 style={{
          fontSize: isMobile ? '2rem' : '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: themeInfo.color
        }}>
          {themeInfo.name}
        </h1>

        <p style={{
          fontSize: isMobile ? '1.1rem' : '1.5rem',
          color: '#d1d5db',
          marginBottom: '2rem',
          lineHeight: 1.5
        }}>
          沉浸式英语学习体验
        </p>

        {/* 模拟视频播放器 */}
        <div style={{
          width: '100%',
          height: isMobile ? '200px' : '300px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          border: '2px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}>
              ▶️
            </div>
            <p style={{
              fontSize: '1rem',
              opacity: 0.8
            }}>
              点击开始观看
            </p>
          </div>
        </div>

        <button
          onClick={() => window.location.href = `/achievement/${interest}`}
          style={{
            background: themeInfo.color,
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          🎯 完成学习
        </button>
      </div>

      {/* 返回按钮 */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem'
      }}>
        <a
          href={`/story-clues/${interest}`}
          style={{
            display: 'inline-block',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            backdropFilter: 'blur(10px)'
          }}
        >
          ← 返回线索收集
        </a>
      </div>




    </div>
  );
}
