'use client'

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { contentManager, StoryContent } from '../../../lib/contentManager';

export default function StoryPreviewPage() {
  const params = useParams();
  const interest = params?.interest as string;
  const [isMobile, setIsMobile] = useState(false);
  const [storyContent, setStoryContent] = useState<StoryContent | null>(null);
  const [loading, setLoading] = useState(true);

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

  // 加载故事内容
  useEffect(() => {
    const loadStoryContent = async () => {
      if (!interest) return;

      try {
        const story = contentManager.getStory(interest);
        setStoryContent(story);

        // 预加载内容以优化用户体验
        if (story) {
          await contentManager.preloadContent(interest);
        }
      } catch (error) {
        console.error('Failed to load story content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoryContent();
  }, [interest]);

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

  // 加载状态
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${themeInfo.color}20 0%, ${themeInfo.color}10 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            animation: 'spin 1s linear infinite'
          }}>
            🔄
          </div>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280'
          }}>
            正在加载故事内容...
          </p>
        </div>
      </div>
    );
  }

  // 内容未找到
  if (!storyContent) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${themeInfo.color}20 0%, ${themeInfo.color}10 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#374151' }}>
            故事内容未找到
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            请返回学习中心选择其他主题
          </p>
          <a
            href="/learning"
            style={{
              display: 'inline-block',
              background: themeInfo.color,
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            返回学习中心
          </a>
        </div>
      </div>
    );
  }

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
                {storyContent.title}
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
              {storyContent.setting}
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
              {storyContent.characters.map((character, index) => (
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
              {storyContent.preview}
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
                {storyContent.duration}
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
                {storyContent.difficulty === 'beginner' ? '初级' :
                 storyContent.difficulty === 'intermediate' ? '中级' : '高级'}
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
                {storyContent.keywordCount}
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
