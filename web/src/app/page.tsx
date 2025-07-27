'use client'

import { useEffect, useState } from 'react';

export default function Home() {
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
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: 'white',
      padding: isMobile ? '1rem' : '2rem'
    }}>
      {/* 主标题区域 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        maxWidth: '1200px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: isMobile ? '2.5rem' : '3.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          lineHeight: 1.2
        }}>
          SmarTalk - 开芯说
        </h1>
        <p style={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          opacity: 0.9,
          marginBottom: '2rem',
          lineHeight: 1.4,
          padding: isMobile ? '0 1rem' : '0'
        }}>
          神经沉浸法英语学习平台
        </p>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.8,
          maxWidth: '600px',
          lineHeight: '1.6',
          marginBottom: '3rem'
        }}>
          告别哑巴英语，30分钟体验无字幕理解的魔法时刻
        </p>

        {/* 核心价值主张 - 3个关键点 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '1.5rem' : '2rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* 问题识别 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>😔</div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              学了十几年还是不敢开口？
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.4
            }}>
              看美剧听不懂，和外国人交流大脑空白
            </p>
          </div>

          {/* 解决方案 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              神经沉浸法科学习得
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.4
            }}>
              基于克拉申理论，可理解输入(i+1)自然习得
            </p>
          </div>

          {/* 魔法时刻 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            transform: isMobile ? 'none' : 'scale(1.02)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              30分钟见证奇迹
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.4
            }}>
              互动剧情+无字幕理解，体验语言习得魔法
            </p>
          </div>
        </div>
      </div>

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
  );
}
