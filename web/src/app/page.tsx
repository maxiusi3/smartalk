'use client'

import { useEffect, useState } from 'react';
import { ModernCard, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/ModernCard';
import Button from '../components/ui/button';
import { colors, spacing, borderRadius, shadows, typography, animations } from '../styles/design-system';

// 专业级现代化主页面
export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);

  // 检测移动设备和初始化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      // 页面加载动画
      setTimeout(() => setIsLoaded(true), 100);
      
      // 实时时间更新
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      
      return () => {
        window.removeEventListener('resize', checkMobile);
        clearInterval(timer);
      };
    }
  }, []);

  // 获取问候语
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  // 学习数据（模拟真实数据）
  const learningStats = {
    todayMinutes: 45,
    weekStreak: 7,
    totalWords: 1247,
    completedLessons: 23,
  };

  // 推荐内容
  const recommendations = [
    {
      id: 1,
      title: '商务英语对话',
      subtitle: '职场沟通必备',
      progress: 65,
      icon: '💼',
      color: colors.primary[500],
      lessons: 12,
      duration: '25分钟',
    },
    {
      id: 2,
      title: '旅行英语实用',
      subtitle: '出国旅行无忧',
      progress: 30,
      icon: '✈️',
      color: colors.success[500],
      lessons: 8,
      duration: '18分钟',
    },
    {
      id: 3,
      title: '电影对话精选',
      subtitle: '影视英语提升',
      progress: 80,
      icon: '🎬',
      color: colors.secondary[500],
      lessons: 15,
      duration: '32分钟',
    },
  ];

  // 快速操作
  const quickActions = [
    { icon: '🎯', title: 'Focus Mode', subtitle: '专注学习模式', color: colors.warning[500] },
    { icon: '🆘', title: 'Rescue Mode', subtitle: '学习救援模式', color: colors.error[500] },
    { icon: '🧠', title: 'SRS复习', subtitle: '间隔重复系统', color: colors.primary[500] },
    { icon: '📊', title: '学习分析', subtitle: '进度数据分析', color: colors.secondary[500] },
  ];

  // 渲染学习统计卡片
  const renderStatsCard = (title: string, value: string | number, subtitle: string, icon: string, color: string) => (
    <ModernCard variant="glass" hover padding="lg" style={{ 
      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
      border: `1px solid ${color}30`,
    }}>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] }}>
          <div style={{ fontSize: '2rem' }}>{icon}</div>
          <div style={{ 
            fontSize: typography.fontSize['2xl'], 
            fontWeight: typography.fontWeight.bold,
            color: colors.white,
          }}>
            {value}
          </div>
        </div>
        <div style={{ 
          fontSize: typography.fontSize.sm,
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: typography.fontWeight.medium,
          marginBottom: spacing[1],
        }}>
          {title}
        </div>
        <div style={{ 
          fontSize: typography.fontSize.xs,
          color: 'rgba(255, 255, 255, 0.7)',
        }}>
          {subtitle}
        </div>
      </CardContent>
    </ModernCard>
  );

  // 渲染推荐课程卡片
  const renderRecommendationCard = (item: typeof recommendations[0]) => (
    <ModernCard 
      key={item.id} 
      variant="glass" 
      hover 
      padding="lg"
      style={{ 
        background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}05 100%)`,
        border: `1px solid ${item.color}25`,
        cursor: 'pointer',
      }}
    >
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
          <div style={{ 
            background: `${item.color}20`,
            color: colors.white,
            padding: `${spacing[1]} ${spacing[3]}`,
            borderRadius: borderRadius.full,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
          }}>
            {item.progress}% 完成
          </div>
        </div>
        <CardTitle style={{ color: colors.white, fontSize: typography.fontSize.lg }}>
          {item.title}
        </CardTitle>
        <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {item.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: spacing[4] }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: spacing[2],
            fontSize: typography.fontSize.xs,
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            <span>{item.lessons} 课程</span>
            <span>{item.duration}</span>
          </div>
          <div style={{ 
            width: '100%',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: borderRadius.full,
            overflow: 'hidden',
          }}>
            <div style={{ 
              width: `${item.progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() => window.location.href = '/learning'}
        >
          继续学习
        </Button>
      </CardContent>
    </ModernCard>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          .page-container {
            opacity: ${isLoaded ? 1 : 0};
            transform: ${isLoaded ? 'translateY(0)' : 'translateY(20px)'};
            transition: all 0.8s ease-out;
          }
          
          .hero-section { animation: fadeInUp 0.8s ease-out; }
          .stats-grid { animation: slideInLeft 0.8s ease-out 0.2s both; }
          .recommendations-section { animation: slideInRight 0.8s ease-out 0.4s both; }
          .floating-element { animation: float 3s ease-in-out infinite; }
          .quick-actions { animation: fadeInUp 0.6s ease-out 0.6s both; }
        `
      }} />
      
      <div className="page-container" style={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${colors.primary[600]}40 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${colors.secondary[600]}40 0%, transparent 50%),
          linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[900]} 100%)
        `,
        fontFamily: typography.fontFamily.sans.join(', '),
        color: colors.white,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* 背景装饰元素 */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${colors.secondary[500]}20 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)',
        }} className="floating-element" />
        
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${colors.primary[400]}30 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(30px)',
        }} className="floating-element" />

        {/* 主要内容容器 */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? spacing[4] : spacing[8],
          position: 'relative',
          zIndex: 1,
        }}>
          {/* 顶部导航栏 */}
          <div className="hero-section" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing[12],
            padding: spacing[6],
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: borderRadius['2xl'],
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div>
              <h1 style={{
                fontSize: isMobile ? typography.fontSize['2xl'] : typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                margin: 0,
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                SmarTalk - 开芯说
              </h1>
              <p style={{
                fontSize: typography.fontSize.sm,
                opacity: 0.8,
                margin: 0,
                marginTop: spacing[1],
              }}>
                {getGreeting()}，欢迎回来！神经沉浸法英语学习平台
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[4],
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                opacity: 0.9,
                textAlign: 'right',
              }}>
                <div>{currentTime.toLocaleDateString('zh-CN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
                <div style={{ fontSize: typography.fontSize.xs, opacity: 0.7 }}>
                  {currentTime.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 学习统计网格 */}
          <div className="stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: spacing[4],
            marginBottom: spacing[12],
          }}>
            {renderStatsCard('今日学习', `${learningStats.todayMinutes}分钟`, '继续保持', '⏰', colors.success[500])}
            {renderStatsCard('连续天数', `${learningStats.weekStreak}天`, '学习连击', '🔥', colors.warning[500])}
            {renderStatsCard('掌握词汇', `${learningStats.totalWords}个`, '词汇积累', '📚', colors.primary[500])}
            {renderStatsCard('完成课程', `${learningStats.completedLessons}节`, '学习进度', '🎯', colors.secondary[500])}
          </div>

          {/* 快速操作区域 */}
          <div className="quick-actions" style={{
            marginBottom: spacing[12],
          }}>
            <h2 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing[6],
              textAlign: 'center',
            }}>
              快速开始
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: spacing[4],
            }}>
              {quickActions.map((action, index) => (
                <ModernCard
                  key={index}
                  variant="glass"
                  hover
                  padding="lg"
                  style={{
                    background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}05 100%)`,
                    border: `1px solid ${action.color}25`,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  onClick={() => {
                    if (action.title === 'Focus Mode') window.location.href = '/focus-mode-validation';
                    else if (action.title === 'SRS复习') window.location.href = '/srs-dashboard';
                    else if (action.title === '学习分析') window.location.href = '/four-way-integration-test';
                    else console.log(`启动: ${action.title}`);
                  }}
                >
                  <CardContent>
                    <div style={{ fontSize: '2.5rem', marginBottom: spacing[3] }}>{action.icon}</div>
                    <div style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.white,
                      marginBottom: spacing[1],
                    }}>
                      {action.title}
                    </div>
                    <div style={{
                      fontSize: typography.fontSize.xs,
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}>
                      {action.subtitle}
                    </div>
                  </CardContent>
                </ModernCard>
              ))}
            </div>
          </div>

          {/* 推荐学习内容 */}
          <div className="recommendations-section">
            <h2 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing[6],
              textAlign: 'center',
            }}>
              为你推荐
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: spacing[6],
              marginBottom: spacing[12],
            }}>
              {recommendations.map(renderRecommendationCard)}
            </div>
          </div>

          {/* 底部操作区域 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: spacing[4],
            marginBottom: spacing[8],
          }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/learning'}
            >
              🚀 开始学习之旅
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/health-check'}
            >
              📊 系统状态
            </Button>
          </div>

          {/* 页脚信息 */}
          <div style={{
            textAlign: 'center',
            opacity: 0.6,
            fontSize: typography.fontSize.xs,
            padding: spacing[4],
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: borderRadius.lg,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <p style={{ margin: 0, marginBottom: spacing[1] }}>
              🎉 现代化UI重构完成！专业级用户界面体验
            </p>
            <p style={{ margin: 0 }}>
              版本 2.0.0 | 基于 Next.js 14 + 现代化设计系统 | 与移动端设计保持一致
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
