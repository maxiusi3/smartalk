'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TheaterModePage() {
  const params = useParams();
  const interest = params.interest as string;
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [watchTime, setWatchTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setWatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    // 自动隐藏控制栏
    let hideTimer: NodeJS.Timeout;
    if (showControls && isPlaying) {
      hideTimer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(hideTimer);
  }, [showControls, isPlaying]);

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

  const themeInfo = getThemeInfo(interest);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const handleComplete = () => {
    // 导航到成就页面
    window.location.href = `/achievement/${interest}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: '#000',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        overflow: 'hidden'
      }}
      onClick={() => setShowControls(!showControls)}
    >
      {/* 视频播放区域 */}
      <div style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(45deg, #1f2937, #374151)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* 模拟视频内容 */}
        <div style={{
          textAlign: 'center',
          opacity: isPlaying ? 0.3 : 1,
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>
            {themeInfo.icon}
          </div>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: themeInfo.color
          }}>
            {themeInfo.name}
          </h2>
          <p style={{
            fontSize: '1.5rem',
            color: '#d1d5db',
            marginBottom: '2rem'
          }}>
            无字幕沉浸式体验
          </p>
          {!isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              style={{
                background: themeInfo.color,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                fontSize: '2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              ▶️
            </button>
          )}
        </div>

        {/* 播放进度指示器 */}
        {isPlaying && (
          <div style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '1rem',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}>
            {formatTime(watchTime)} / 3:00
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
        padding: '2rem',
        transform: showControls ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* 播放控制 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <div style={{
              color: '#d1d5db',
              fontSize: '0.9rem'
            }}>
              {formatTime(watchTime)} / 3:00
            </div>
          </div>

          {/* 进度条 */}
          <div style={{
            flex: 1,
            margin: '0 2rem',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(watchTime / 180) * 100}%`,
              height: '100%',
              background: themeInfo.color,
              transition: 'width 0.3s ease'
            }}></div>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {watchTime >= 30 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete();
                }}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                🎉 体验魔法时刻
              </button>
            )}
            
            <a
              href={`/story-clues/${interest}`}
              style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              返回线索收集
            </a>
          </div>
        </div>
      </div>

      {/* 魔法时刻提示 */}
      {watchTime >= 30 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(34, 197, 94, 0.9)',
          color: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            魔法时刻到了！
          </h3>
          <p style={{
            marginBottom: '1.5rem',
            lineHeight: '1.5'
          }}>
            你已经观看了足够的内容，现在可以体验无字幕理解的成就感了！
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            style={{
              background: 'white',
              color: '#22c55e',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            🎯 确认理解并继续
          </button>
        </div>
      )}

      {/* 学习提示 */}
      {!isPlaying && (
        <div style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '1rem',
          borderRadius: '0.5rem',
          maxWidth: '300px'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: themeInfo.color
          }}>
            🎭 剧场模式
          </h4>
          <p style={{
            fontSize: '0.8rem',
            color: '#d1d5db',
            lineHeight: '1.4'
          }}>
            专注观看，不要依赖字幕。通过之前收集的线索，你已经能够理解故事内容了！
          </p>
        </div>
      )}
    </div>
  );
}
