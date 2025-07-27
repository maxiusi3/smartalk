'use client'

import { useState, useEffect } from 'react';

interface Interest {
  id: string;
  name: string;
  theme: string;
  description: string;
}

export default function LearningPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [showPreloader, setShowPreloader] = useState(false);
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

  useEffect(() => {
    fetchInterests();
  }, []);

  // 处理兴趣选择
  const handleInterestSelect = async (interestId: string) => {
    try {
      setSelectedInterest(interestId);
      setShowPreloader(true);

      // 模拟加载过程
      setTimeout(() => {
        // 导航到故事线索页面
        window.location.href = `/story-clues/${interestId}`;
      }, 1500);
    } catch (error) {
      console.error('Failed to handle interest selection:', error);
      setShowPreloader(false);
    }
  };



  const fetchInterests = async () => {
    try {
      // 使用静态数据避免数据库查询失败
      const staticInterests: Interest[] = [
        {
          id: 'travel',
          name: '旅行英语',
          theme: 'travel',
          description: '学习旅行中的实用英语对话'
        },
        {
          id: 'movie',
          name: '电影对话',
          theme: 'movie',
          description: '通过经典电影片段学习地道英语'
        },
        {
          id: 'workplace',
          name: '职场沟通',
          theme: 'workplace',
          description: '掌握职场英语沟通技巧'
        }
      ];

      setInterests(staticInterests);
    } catch (err) {
      setError('加载失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'travel': return '✈️';
      case 'movie': return '🎬';
      case 'workplace': return '💼';
      default: return '📚';
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'travel': return '#3b82f6';
      case 'movie': return '#8b5cf6';
      case 'workplace': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>加载学习内容中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      fontFamily: 'system-ui, sans-serif',
      padding: isMobile ? '1rem' : '2rem'
    }}>
      {/* 头部导航 */}
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        marginBottom: '3rem',
        maxWidth: '1200px',
        margin: '0 auto 3rem',
        gap: isMobile ? '1rem' : 0
      }}>
        <div style={{ width: '100%' }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>学习中心</h1>
          <p style={{
            color: '#6b7280',
            fontSize: isMobile ? '1rem' : '1.1rem',
            textAlign: isMobile ? 'center' : 'left',
            lineHeight: 1.5
          }}>选择你感兴趣的主题，开始神经沉浸法学习之旅</p>
        </div>
        <a
          href="/"
          style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#374151',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          ← 返回首页
        </a>
      </div>

      {/* 主要内容区域 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {error ? (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>加载失败</h3>
            <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>{error}</p>
            <button
              onClick={fetchInterests}
              style={{
                background: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              重试
            </button>
          </div>
        ) : (
          <>
            {/* 兴趣主题卡片 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {interests.map((interest) => (
                <div
                  key={interest.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                  }}
                  onClick={() => handleInterestSelect(interest.theme)}
                >
                  {/* 主题图标和标题 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      fontSize: '3rem',
                      marginRight: '1rem'
                    }}>
                      {getThemeIcon(interest.theme)}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '0.25rem'
                      }}>
                        {interest.name}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        background: getThemeColor(interest.theme),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {interest.theme}
                      </div>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p style={{
                    color: '#6b7280',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    {interest.description}
                  </p>

                  {/* 开始学习按钮 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      color: getThemeColor(interest.theme),
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      点击开始学习 →
                    </span>
                    <div style={{
                      background: `${getThemeColor(interest.theme)}20`,
                      color: getThemeColor(interest.theme),
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '1.2rem'
                    }}>
                      🎯
                    </div>
                  </div>

                  {/* 装饰性背景 */}
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '100px',
                    height: '100px',
                    background: `${getThemeColor(interest.theme)}10`,
                    borderRadius: '50%',
                    zIndex: -1
                  }}></div>
                </div>
              ))}
            </div>

            {/* 学习指导 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                🧠 神经沉浸法学习流程
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                  <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>收集线索</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>通过音画匹配解锁15个关键词</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎭</div>
                  <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>剧场模式</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>无字幕观看完整故事</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                  <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>魔法时刻</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>体验无字幕理解的成就感</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 简化的加载指示器 */}
      {showPreloader && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '300px'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              animation: 'spin 1s linear infinite'
            }}>
              🔄
            </div>
            <p style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              正在准备学习内容...
            </p>
          </div>
        </div>
      )}

      {/* CSS 动画通过内联样式实现 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}
