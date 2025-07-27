'use client'

import { useEffect, useState } from 'react';
import ProgressDashboard from '../components/ProgressDashboard';
import MobileNavigation from '../components/MobileNavigation';
import { userSession } from '../lib/userSession';
import { useMobile } from '../hooks/useMobile';

export default function Home() {
  const [showProgress, setShowProgress] = useState(false);
  const {
    isMobile,
    getResponsiveStyles,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getContainerMaxWidth,
    getSafeAreaStyles
  } = useMobile();

  // 导航项配置
  const navigationItems = [
    { id: 'home', label: '首页', icon: '🏠', href: '/', isActive: true },
    { id: 'learning', label: '学习', icon: '📚', href: '/learning' },
    { id: 'progress', label: '进度', icon: '📊', href: '/progress' },
    { id: 'profile', label: '我的', icon: '👤', href: '/profile' }
  ];

  useEffect(() => {
    // 初始化用户会话并检查是否有学习进度
    const initializeSession = async () => {
      try {
        // 确保在客户端环境中运行
        if (typeof window === 'undefined') return;

        const session = await userSession.initializeSession();
        const progress = await userSession.getProgress();

        // 如果用户有学习进度，显示进度仪表板
        if (progress.length > 0) {
          setShowProgress(true);
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initializeSession();
  }, []);
  return (
    <>
      {/* 移动端导航 */}
      <MobileNavigation
        items={navigationItems}
        currentPath="/"
        title="SmarTalk"
      />

      <div style={{
        ...getResponsiveStyles({
          default: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
            color: 'white',
            padding: '2rem'
          },
          mobile: {
            padding: getResponsiveSpacing(32),
            paddingTop: getResponsiveSpacing(80), // 为移动端导航留空间
            paddingBottom: getResponsiveSpacing(80)
          }
        }),
        ...getSafeAreaStyles()
      }}>
      {/* 主标题区域 */}
      <div style={{
        textAlign: 'center',
        marginBottom: getResponsiveSpacing(48),
        maxWidth: getContainerMaxWidth(),
        width: '100%'
      }}>
        <h1 style={{
          fontSize: getResponsiveFontSize(56),
          fontWeight: 'bold',
          marginBottom: getResponsiveSpacing(16),
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          lineHeight: 1.2
        }}>
          SmarTalk - 开芯说
        </h1>
        <p style={{
          fontSize: getResponsiveFontSize(24),
          opacity: 0.9,
          marginBottom: getResponsiveSpacing(32),
          lineHeight: 1.4,
          padding: isMobile ? '0 1rem' : '0'
        }}>
          神经沉浸法英语学习平台
        </p>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.8,
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          通过故事线索收集和音画匹配训练，体验无字幕理解的魔法时刻
        </p>
      </div>

      {/* 进度仪表板 */}
      {showProgress && (
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          marginBottom: '3rem'
        }}>
          <ProgressDashboard compact={true} showExportButton={false} />
        </div>
      )}

      {/* 功能卡片区域 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {/* 学习中心卡片 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>学习中心</h3>
          <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
            开始你的英语学习之旅，选择感兴趣的主题
          </p>
          <a
            href="/learning"
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            开始学习
          </a>
        </div>

        {/* 入门指导卡片 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>新手指导</h3>
          <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
            了解神经沉浸法学习原理和使用方法
          </p>
          <a
            href="/onboarding"
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            查看指导
          </a>
        </div>

        {/* 系统状态卡片 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>系统状态</h3>
          <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
            检查系统健康状态和数据库连接
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <a
              href="/api/health"
              target="_blank"
              style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              健康检查
            </a>
            <a
              href="/api/db-test"
              target="_blank"
              style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              数据库测试
            </a>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div style={{
        marginTop: '3rem',
        textAlign: 'center',
        opacity: 0.7
      }}>
        <p>🎉 部署成功！系统正在运行中</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          版本 1.0.0 | 基于 Next.js 14 + Supabase
        </p>
      </div>
    </div>
    </>
  );
}
