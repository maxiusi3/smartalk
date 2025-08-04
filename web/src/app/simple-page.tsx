'use client'

import { useEffect, useState } from 'react';
import EnhancedProgressDashboard from '../components/EnhancedProgressDashboard';

export default function SimplePage() {
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

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: 'white',
    padding: isMobile ? '1rem' : '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const heroStyles: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '3rem',
    maxWidth: '1200px',
    width: '100%',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '2.5rem' : '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    lineHeight: 1.2,
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const cardStyles: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  };

  const buttonStyles: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={containerStyles}>
      {/* Hero Section */}
      <div style={heroStyles}>
        <h1 style={titleStyles}>
          SmarTalk - 开芯说
        </h1>
        <p style={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          opacity: 0.9,
          marginBottom: '2rem',
          lineHeight: 1.4,
        }}>
          神经沉浸法英语学习平台
        </p>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.8,
          maxWidth: '600px',
          lineHeight: '1.6',
          marginBottom: '3rem',
          margin: '0 auto 3rem auto',
        }}>
          告别哑巴英语，30分钟体验无字幕理解的魔法时刻
        </p>

        {/* 核心价值主张 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '1.5rem' : '2rem',
          maxWidth: '900px',
          margin: '0 auto 3rem auto',
        }}>
          <div style={cardStyles}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>😔</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              学了十几年还是不敢开口？
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.4 }}>
              看美剧听不懂，和外国人交流大脑空白
            </p>
          </div>

          <div style={cardStyles}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              神经沉浸法科学习得
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.4 }}>
              基于真实情境，可理解输入AI对话自然习得
            </p>
          </div>

          <div style={cardStyles}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              30分钟证奇迹
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.4 }}>
              互动电影式学习体验，突破听力魔法
            </p>
          </div>
        </div>
      </div>

      {/* 主要功能卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        width: '100%',
        marginBottom: '3rem',
      }}>
        {/* 学习中心卡片 */}
        <div style={cardStyles}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>学习中心</h3>
          <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
            开始你的英语学习之旅，选择感兴趣的主题
          </p>
          <button
            style={buttonStyles}
            onClick={() => window.location.href = '/learning'}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            开始学习
          </button>
        </div>

        {/* 系统状态卡片 */}
        <div style={cardStyles}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>系统状态</h3>
          <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
            检查系统健康状态和服务连接
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              style={{ ...buttonStyles, background: 'rgba(34, 197, 94, 0.8)' }}
              onClick={() => window.location.href = '/health-check'}
            >
              健康检查
            </button>
            <button
              style={{ ...buttonStyles, background: 'rgba(59, 130, 246, 0.8)' }}
              onClick={() => window.location.href = '/system-status'}
            >
              数据监控
            </button>
          </div>
        </div>
      </div>

      {/* 学习进度仪表板 */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        padding: '2rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '2rem',
      }}>
        <EnhancedProgressDashboard />
      </div>

      {/* 页脚信息 */}
      <div style={{
        textAlign: 'center',
        opacity: 0.7,
        fontSize: '0.9rem',
      }}>
        <p>🚀 部署成功！系统正在运行中</p>
        <p>版本 1.0.0 | 基于 Next.js 14 + Supabase</p>
      </div>
    </div>
  );
}
