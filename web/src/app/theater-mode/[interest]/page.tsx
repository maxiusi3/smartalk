'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import EnhancedVideoPlayer from '../../../components/EnhancedVideoPlayer';
import { VideoKeyword } from '../../../lib/videoManager';
import { userSession } from '../../../lib/userSession';

export default function TheaterModePage() {
  const params = useParams();
  const interest = params?.interest as string;
  const [watchTime, setWatchTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMagicMoment, setShowMagicMoment] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<VideoKeyword[]>([]);

  // 获取视频ID
  const videoId = `${interest}_story`;

  useEffect(() => {
    // 记录剧场模式访问
    const trackVisit = async () => {
      await userSession.trackEvent('theater_mode_visit', {
        interest,
        videoId,
        timestamp: new Date().toISOString()
      });
    };

    if (interest) {
      trackVisit();
    }
  }, [interest, videoId]);

  // 检查是否达到魔法时刻
  useEffect(() => {
    if (watchTime >= 30 && !showMagicMoment) {
      setShowMagicMoment(true);
    }
  }, [watchTime, showMagicMoment]);

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

  // 处理视频进度更新
  const handleProgress = (currentTime: number, videoDuration: number) => {
    setWatchTime(Math.floor(currentTime));
    setDuration(Math.floor(videoDuration));
  };

  // 处理关键词点击
  const handleKeywordClick = async (keyword: VideoKeyword) => {
    setSelectedKeywords(prev => [...prev, keyword]);

    // 记录关键词点击事件
    await userSession.trackEvent('keyword_clicked_in_theater', {
      keyword: keyword.word,
      translation: keyword.translation,
      timestamp: keyword.startTime,
      interest,
      videoId
    });
  };

  // 处理完成观看
  const handleComplete = async () => {
    // 记录完成事件
    await userSession.trackEvent('theater_mode_completed', {
      interest,
      videoId,
      watchTime,
      duration,
      completionRate: duration > 0 ? (watchTime / duration) * 100 : 0,
      keywordsClicked: selectedKeywords.length
    });

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
        fontFamily: 'system-ui, sans-serif',
        color: 'white'
      }}
    >
      {/* 增强视频播放器 */}
      <EnhancedVideoPlayer
        videoId={videoId}
        showSubtitles={false} // 剧场模式不显示字幕
        showKeywordHighlight={true}
        autoPlay={false}
        onKeywordClick={handleKeywordClick}
        onProgress={handleProgress}
        style={{
          width: '100%',
          height: '100vh'
        }}
      />

      {/* 观看时间指示器 */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '0.75rem 1.5rem',
        borderRadius: '1rem',
        fontSize: '1rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span>{themeInfo.icon}</span>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {themeInfo.name}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              观看时间: {formatTime(watchTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>

      {/* 已点击关键词显示 */}
      {selectedKeywords.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '1rem',
          borderRadius: '0.5rem',
          maxWidth: '300px',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: themeInfo.color
          }}>
            已学习关键词 ({selectedKeywords.length})
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.25rem'
          }}>
            {selectedKeywords.slice(-5).map((keyword, index) => (
              <span
                key={`${keyword.id}-${index}`}
                style={{
                  background: `${themeInfo.color}30`,
                  color: themeInfo.color,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: '500'
                }}
              >
                {keyword.word}
              </span>
            ))}
            {selectedKeywords.length > 5 && (
              <span style={{
                color: '#9ca3af',
                fontSize: '0.7rem',
                padding: '0.25rem'
              }}>
                +{selectedKeywords.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

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
      {showMagicMoment && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(34, 197, 94, 0.95)',
          color: 'white',
          padding: '2.5rem',
          borderRadius: '1rem',
          textAlign: 'center',
          maxWidth: '450px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            animation: 'bounce 2s infinite'
          }}>✨</div>

          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            🎉 魔法时刻到了！
          </h3>

          <p style={{
            marginBottom: '1rem',
            lineHeight: '1.6',
            fontSize: '1.1rem'
          }}>
            你已经观看了 {formatTime(watchTime)} 的内容，体验了无字幕理解的神奇感觉！
          </p>

          {selectedKeywords.length > 0 && (
            <p style={{
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              opacity: 0.9
            }}>
              并且学习了 {selectedKeywords.length} 个关键词 🎯
            </p>
          )}

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleComplete}
              style={{
                background: 'white',
                color: '#22c55e',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              🏆 查看成就
            </button>

            <button
              onClick={() => setShowMagicMoment(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              继续观看
            </button>
          </div>
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
