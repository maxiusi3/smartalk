'use client'

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function StoryPreviewPage() {
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
        return {
          name: '旅行英语',
          icon: '✈️',
          color: '#3b82f6',
          story: {
            title: '巴黎咖啡馆初遇',
            setting: '在巴黎的一个温馨咖啡馆里',
            characters: ['Alex - 中国游客', 'Emma - 法国咖啡师'],
            preview: '一个关于文化交流和温暖人情的美好故事。Alex 第一次来到巴黎，在当地咖啡馆遇到了友善的咖啡师 Emma。通过简单的对话，他们建立了跨越语言和文化的友谊...',
            duration: '60秒',
            difficulty: '初级',
            keywords: 15
          }
        };
      case 'movie':
        return {
          name: '电影对话',
          icon: '🎬',
          color: '#8b5cf6',
          story: {
            title: '制片厂的一天',
            setting: '在好莱坞的电影制片厂',
            characters: ['Sarah - 制片人', 'Mike - 导演'],
            preview: '深入电影制作的幕后世界。Sarah 和 Mike 正在为新项目进行紧张的筹备工作，他们需要在有限的时间内做出重要决定，体验真实的好莱坞工作节奏...',
            duration: '75秒',
            difficulty: '中级',
            keywords: 18
          }
        };
      case 'workplace':
        return {
          name: '职场沟通',
          icon: '💼',
          color: '#10b981',
          story: {
            title: '项目启动会议',
            setting: '在现代化的办公室会议室',
            characters: ['Lisa - 项目经理', 'David - 团队成员'],
            preview: '一个关于团队协作和职场沟通的故事。Lisa 正在主持新项目的启动会议，需要与团队成员协调各项工作安排，展现专业的职场英语交流技巧...',
            duration: '90秒',
            difficulty: '高级',
            keywords: 20
          }
        };
      default:
        return {
          name: '学习',
          icon: '📚',
          color: '#6b7280',
          story: {
            title: '学习之旅',
            setting: '在学习的世界里',
            characters: ['学习者'],
            preview: '开始你的学习之旅...',
            duration: '60秒',
            difficulty: '初级',
            keywords: 15
          }
        };
    }
  };

  const themeInfo = getThemeInfo(interest || 'travel');

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${themeInfo.color}20 0%, ${themeInfo.color}10 100%)`,
      fontFamily: 'system-ui, sans-serif',
      padding: isMobile ? '2rem 1rem' : '3rem 2rem'
    }}>
      {/* 返回导航 */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <a
          href="/learning"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            textDecoration: 'none',
            fontSize: '0.9rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = themeInfo.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          ← 返回学习中心
        </a>
      </div>

      {/* 主要内容 */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* 左侧：故事信息 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1rem',
          padding: isMobile ? '2rem 1.5rem' : '3rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* 主题标识 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              fontSize: '3rem',
              background: `${themeInfo.color}20`,
              borderRadius: '1rem',
              padding: '1rem',
              border: `2px solid ${themeInfo.color}30`
            }}>
              {themeInfo.icon}
            </div>
            <div>
              <h1 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                {themeInfo.story.title}
              </h1>
              <p style={{
                color: themeInfo.color,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                {themeInfo.name}
              </p>
            </div>
          </div>

          {/* 故事详情 */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '1rem'
            }}>
              📍 故事背景
            </h3>
            <p style={{
              color: '#6b7280',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              {themeInfo.story.setting}
            </p>

            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '1rem'
            }}>
              👥 主要角色
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              marginBottom: '1.5rem'
            }}>
              {themeInfo.story.characters.map((character, index) => (
                <li key={index} style={{
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  paddingLeft: '1.5rem',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: themeInfo.color
                  }}>•</span>
                  {character}
                </li>
              ))}
            </ul>

            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '1rem'
            }}>
              📖 故事简介
            </h3>
            <p style={{
              color: '#6b7280',
              lineHeight: 1.6
            }}>
              {themeInfo.story.preview}
            </p>
          </div>

          {/* 学习信息 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: `${themeInfo.color}10`,
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center',
              border: `1px solid ${themeInfo.color}20`
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: themeInfo.color,
                marginBottom: '0.25rem'
              }}>
                {themeInfo.story.duration}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#6b7280'
              }}>
                视频时长
              </div>
            </div>

            <div style={{
              background: `${themeInfo.color}10`,
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center',
              border: `1px solid ${themeInfo.color}20`
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: themeInfo.color,
                marginBottom: '0.25rem'
              }}>
                {themeInfo.story.difficulty}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#6b7280'
              }}>
                难度等级
              </div>
            </div>

            <div style={{
              background: `${themeInfo.color}10`,
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center',
              border: `1px solid ${themeInfo.color}20`,
              gridColumn: isMobile ? 'span 2' : 'auto'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: themeInfo.color,
                marginBottom: '0.25rem'
              }}>
                {themeInfo.story.keywords}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#6b7280'
              }}>
                核心词汇
              </div>
            </div>
          </div>

          {/* 开始学习按钮 */}
          <button
            onClick={() => window.location.href = `/story-clues/${interest}`}
            style={{
              width: '100%',
              background: `linear-gradient(135deg, ${themeInfo.color}, ${themeInfo.color}dd)`,
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '1.25rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 10px 30px ${themeInfo.color}30`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 15px 40px ${themeInfo.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 10px 30px ${themeInfo.color}30`;
            }}
          >
            🚀 开始收集故事线索
          </button>
        </div>

        {/* 右侧：视频预览区域 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1rem',
          padding: isMobile ? '2rem 1.5rem' : '3rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '1.5rem'
          }}>
            🎬 故事预览
          </h3>

          {/* 视频预览占位符 */}
          <div style={{
            width: '100%',
            height: isMobile ? '200px' : '250px',
            background: `linear-gradient(135deg, ${themeInfo.color}20, ${themeInfo.color}10)`,
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            border: `2px solid ${themeInfo.color}30`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                opacity: 0.7
              }}>
                ▶️
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                点击开始预览故事
              </p>
            </div>
          </div>

          {/* 学习提示 */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            textAlign: 'left'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              💡 学习提示
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '0.9rem',
              color: '#6b7280',
              lineHeight: 1.5
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                • 先观看故事预览，了解背景和角色
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                • 收集关键词线索，建立理解基础
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                • 通过 vTPR 训练强化记忆
              </li>
              <li>
                • 最后观看无字幕视频，体验魔法时刻
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
