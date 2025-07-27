/**
 * 增强视频播放器组件
 * 支持字幕同步、关键词高亮、质量选择等功能
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { videoManager, VideoContent, SubtitleCue, VideoKeyword } from '../lib/videoManager';

interface EnhancedVideoPlayerProps {
  videoId: string;
  showSubtitles?: boolean;
  showKeywordHighlight?: boolean;
  autoPlay?: boolean;
  onKeywordClick?: (keyword: VideoKeyword) => void;
  onProgress?: (currentTime: number, duration: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function EnhancedVideoPlayer({
  videoId,
  showSubtitles = true,
  showKeywordHighlight = true,
  autoPlay = false,
  onKeywordClick,
  onProgress,
  className,
  style
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoContent, setVideoContent] = useState<VideoContent | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleCue | null>(null);
  const [currentKeywords, setCurrentKeywords] = useState<VideoKeyword[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('720p');
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // 加载视频内容
  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      try {
        const content = await videoManager.getVideoContent(videoId);
        if (content) {
          setVideoContent(content);
          
          // 加载字幕
          if (content.subtitleUrl) {
            const subs = await videoManager.loadSubtitles(content.subtitleUrl);
            setSubtitles(subs);
          }
        }
      } catch (error) {
        console.error('Failed to load video:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [videoId]);

  // 时间更新处理
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !videoContent) return;

    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // 更新字幕
    if (showSubtitles && subtitles.length > 0) {
      const subtitle = videoManager.getCurrentSubtitle(subtitles, time);
      setCurrentSubtitle(subtitle);
    }

    // 更新关键词
    if (showKeywordHighlight && videoContent.keywords.length > 0) {
      const keywords = videoManager.getCurrentKeywords(videoContent.keywords, time);
      setCurrentKeywords(keywords);
    }

    // 通知父组件进度更新
    if (onProgress) {
      onProgress(time, duration);
    }
  }, [videoContent, subtitles, showSubtitles, showKeywordHighlight, duration, onProgress]);

  // 视频事件处理
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [handleTimeUpdate]);

  // 播放/暂停控制
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  // 跳转到指定时间
  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  };

  // 音量控制
  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  // 静音切换
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // 质量切换
  const changeQuality = (quality: string) => {
    if (!videoContent || !videoRef.current) return;

    const qualityOption = videoContent.quality.find(q => q.label === quality);
    if (!qualityOption) return;

    const currentTime = videoRef.current.currentTime;
    const wasPlaying = isPlaying;

    videoRef.current.src = qualityOption.url;
    videoRef.current.currentTime = currentTime;

    if (wasPlaying) {
      videoRef.current.play();
    }

    setSelectedQuality(quality);
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 关键词点击处理
  const handleKeywordClick = (keyword: VideoKeyword) => {
    if (onKeywordClick) {
      onKeywordClick(keyword);
    }
    // 跳转到关键词时间
    seekTo(keyword.startTime);
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.5rem',
        ...style
      }} className={className}>
        <div style={{
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>加载视频中...</p>
        </div>
      </div>
    );
  }

  if (!videoContent) {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.5rem',
        color: 'white',
        ...style
      }} className={className}>
        <p>视频加载失败</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        background: '#000',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        ...style
      }}
      className={className}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        src={videoContent.url}
        poster={videoContent.thumbnailUrl}
        autoPlay={autoPlay}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
        onClick={togglePlayPause}
      />

      {/* 字幕显示 */}
      {showSubtitles && currentSubtitle && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          fontSize: '1.1rem',
          textAlign: 'center',
          maxWidth: '80%',
          lineHeight: '1.4'
        }}>
          {currentSubtitle.text}
        </div>
      )}

      {/* 关键词高亮 */}
      {showKeywordHighlight && currentKeywords.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {currentKeywords.map((keyword) => (
            <button
              key={keyword.id}
              onClick={() => handleKeywordClick(keyword)}
              style={{
                background: 'rgba(59, 130, 246, 0.9)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.9)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{keyword.word}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{keyword.translation}</div>
            </button>
          ))}
        </div>
      )}

      {/* 播放控制栏 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
        padding: '1rem',
        transform: showControls ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease'
      }}>
        {/* 进度条 */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
          marginBottom: '1rem',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          seekTo(percent * duration);
        }}>
          <div style={{
            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            height: '100%',
            background: '#3b82f6',
            borderRadius: '2px',
            transition: 'width 0.1s ease'
          }}></div>
        </div>

        {/* 控制按钮 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* 播放/暂停按钮 */}
            <button
              onClick={togglePlayPause}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* 时间显示 */}
            <span style={{ fontSize: '0.9rem' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* 音量控制 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                style={{ width: '80px' }}
              />
            </div>

            {/* 质量选择 */}
            <select
              value={selectedQuality}
              onChange={(e) => changeQuality(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.8rem'
              }}
            >
              {videoContent.quality.map((q) => (
                <option key={q.label} value={q.label} style={{ color: 'black' }}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
