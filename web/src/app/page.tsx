'use client'

import { useEffect, useState } from 'react';
import EnhancedProgressDashboard from '../components/EnhancedProgressDashboard';
import { ModernCard, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/ModernCard';
import Button from '../components/ui/button';
import { colors, spacing, borderRadius, shadows, typography, animations } from '../styles/design-system';

export default function ModernHome() {
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
    background: colors.gradients.primary,
    fontFamily: typography.fontFamily.sans.join(', '),
    color: colors.white,
    padding: isMobile ? spacing[4] : spacing[8],
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const heroSectionStyles: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: spacing[16],
    maxWidth: '1200px',
    width: '100%',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? typography.fontSize['4xl'] : typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[6],
    textShadow: shadows.md,
    lineHeight: typography.lineHeight.tight,
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: isMobile ? typography.fontSize.xl : typography.fontSize['2xl'],
    opacity: 0.9,
    marginBottom: spacing[8],
    lineHeight: typography.lineHeight.relaxed,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: isMobile ? typography.fontSize.base : typography.fontSize.lg,
    opacity: 0.8,
    marginBottom: spacing[12],
    lineHeight: typography.lineHeight.relaxed,
    maxWidth: '600px',
    margin: `0 auto ${spacing[12]} auto`,
  };

  const featuresGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: spacing[6],
    maxWidth: '900px',
    width: '100%',
    marginBottom: spacing[16],
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: spacing[8],
    maxWidth: '1200px',
    width: '100%',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }

          .hero-animation {
            animation: fadeInUp 0.8s ease-out;
          }

          .feature-card {
            animation: fadeInUp 0.8s ease-out;
            animation-delay: 0.2s;
            animation-fill-mode: both;
          }

          .main-card {
            animation: fadeInUp 0.8s ease-out;
            animation-delay: 0.4s;
            animation-fill-mode: both;
          }

          .cta-button {
            animation: pulse 2s infinite;
          }
        `
      }} />
      
      <div style={containerStyles}>
        {/* Hero Section */}
        <div style={heroSectionStyles} className="hero-animation">
          <h1 style={titleStyles}>
            SmarTalk - 开芯说
          </h1>
          <p style={subtitleStyles}>
            神经沉浸法英语学习平台
          </p>
          <p style={descriptionStyles}>
            告别哑巴英语，30分钟体验无字幕理解的魔法时刻
          </p>

          {/* 核心价值主张 */}
          <div style={featuresGridStyles}>
            <ModernCard variant="glass" hover className="feature-card">
              <CardContent>
                <div style={{ fontSize: '2.5rem', marginBottom: spacing[4] }}>😔</div>
                <CardTitle as="h3" style={{ fontSize: typography.fontSize.lg, color: colors.white, marginBottom: spacing[2] }}>
                  学了十几年还是不敢开口？
                </CardTitle>
                <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  看美剧听不懂，和外国人交流大脑空白
                </CardDescription>
              </CardContent>
            </ModernCard>

            <ModernCard variant="glass" hover className="feature-card">
              <CardContent>
                <div style={{ fontSize: '2.5rem', marginBottom: spacing[4] }}>🧠</div>
                <CardTitle as="h3" style={{ fontSize: typography.fontSize.lg, color: colors.white, marginBottom: spacing[2] }}>
                  神经沉浸法科学习得
                </CardTitle>
                <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  基于真实情境，可理解输入AI对话自然习得
                </CardDescription>
              </CardContent>
            </ModernCard>

            <ModernCard variant="glass" hover className="feature-card">
              <CardContent>
                <div style={{ fontSize: '2.5rem', marginBottom: spacing[4] }}>✨</div>
                <CardTitle as="h3" style={{ fontSize: typography.fontSize.lg, color: colors.white, marginBottom: spacing[2] }}>
                  30分钟证奇迹
                </CardTitle>
                <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  互动电影式学习体验，突破听力魔法
                </CardDescription>
              </CardContent>
            </ModernCard>
          </div>
        </div>

        {/* 主要功能卡片 */}
        <div style={mainContentStyles}>
          {/* 学习中心卡片 */}
          <ModernCard variant="glass" hover padding="lg" className="main-card">
            <CardHeader>
              <div style={{ fontSize: '3rem', marginBottom: spacing[4] }}>🎯</div>
              <CardTitle style={{ color: colors.white }}>学习中心</CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                开始你的英语学习之旅，选择感兴趣的主题
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="cta-button"
                onClick={() => window.location.href = '/learning'}
              >
                开始学习
              </Button>
            </CardContent>
          </ModernCard>

          {/* 系统状态卡片 */}
          <ModernCard variant="glass" hover padding="lg" className="main-card">
            <CardHeader>
              <div style={{ fontSize: '3rem', marginBottom: spacing[4] }}>⚡</div>
              <CardTitle style={{ color: colors.white }}>系统状态</CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                检查系统健康状态和服务连接
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', gap: spacing[3] }}>
                <Button
                  variant="success"
                  size="md"
                  onClick={() => window.location.href = '/health-check'}
                >
                  健康检查
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => window.location.href = '/system-status'}
                >
                  数据监控
                </Button>
              </div>
            </CardContent>
          </ModernCard>
        </div>

        {/* 学习进度仪表板 */}
        <div style={{ 
          maxWidth: '1200px', 
          width: '100%', 
          marginTop: spacing[16],
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: borderRadius['2xl'],
          padding: spacing[6],
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(255, 255, 255, 0.2)`,
        }} className="main-card">
          <EnhancedProgressDashboard />
        </div>

        {/* 页脚信息 */}
        <div style={{
          marginTop: spacing[16],
          textAlign: 'center',
          opacity: 0.7,
          fontSize: typography.fontSize.sm,
        }}>
          <p>🚀 部署成功！系统正在运行中</p>
          <p>版本 1.0.0 | 基于 Next.js 14 + Supabase</p>
        </div>
      </div>
    </>
  );
}
