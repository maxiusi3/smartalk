/**
 * VTPR 视频选项组件
 * 显示视频预览和交互功能
 */

'use client'

import { useState, useRef, useEffect } from 'react';

interface VTPRVideoOptionProps {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description: string;
  isCorrect: boolean;
  isSelected: boolean;
  optionLabel: string;
  themeColor: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export default function VTPRVideoOption({
  id,
  videoUrl,
  thumbnailUrl,
  description,
  isCorrect,
  isSelected,
  optionLabel,
  themeColor,
  onSelect,
  disabled = false
}: VTPRVideoOptionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout>();

  // 预加载视频元数据
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setIsVideoLoaded(true);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  // 处理鼠标悬停预览
  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // 延迟显示预览，避免快速移动时频繁触发
    previewTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
      if (videoRef.current && isVideoLoaded) {
        videoRef.current.currentTime = 2; // 跳到2秒处显示预览
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPreview(false);
    
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // 处理预览播放
  const handlePreviewPlay = () => {
    if (videoRef.current && showPreview) {
      videoRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    if (showPreview) {
      handlePreviewPlay();
    }
  }, [showPreview]);

  const handleClick = () => {
    if (!disabled) {
      onSelect(id);
    }
  };

  return (
    <div
      style={{
        background: isSelected 
          ? `${themeColor}20` 
          : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        border: isSelected 
          ? `3px solid ${themeColor}` 
          : '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        opacity: disabled ? 0.6 : 1,
        transform: isHovered && !disabled ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered && !disabled 
          ? '0 15px 35px rgba(0, 0, 0, 0.3)' 
          : '0 5px 15px rgba(0, 0, 0, 0.1)'
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 选项标签 */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: themeColor,
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        zIndex: 10,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}>
        {optionLabel}
      </div>

      {/* 视频预览区域 */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(45deg, #374151, #4b5563)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 缩略图 */}
        {thumbnailUrl && !showPreview && (
          <img
            src={thumbnailUrl}
            alt={description}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        )}

        {/* 视频元素 */}
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          preload="metadata"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: showPreview ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* 播放图标覆盖层 */}
        {!showPreview && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            zIndex: 5
          }}>
            ▶️
          </div>
        )}

        {/* 加载指示器 */}
        {!isVideoLoaded && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '0.8rem'
          }}>
            加载中...
          </div>
        )}

        {/* 预览提示 */}
        {isHovered && !showPreview && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.7rem',
            zIndex: 10
          }}>
            悬停预览
          </div>
        )}

        {/* 选中指示器 */}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: themeColor,
            color: 'white',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            zIndex: 10
          }}>
            ✓
          </div>
        )}
      </div>

      {/* 描述区域 */}
      <div style={{
        padding: '1.5rem',
        background: isSelected 
          ? `${themeColor}10` 
          : 'rgba(255, 255, 255, 0.05)'
      }}>
        <p style={{
          color: '#e5e7eb',
          fontSize: '1rem',
          textAlign: 'center',
          lineHeight: '1.4',
          margin: 0
        }}>
          {description}
        </p>

        {/* 交互提示 */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          {isSelected ? (
            <span style={{
              color: themeColor,
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              ✓ 已选择
            </span>
          ) : (
            <span style={{
              color: '#9ca3af',
              fontSize: '0.8rem'
            }}>
              点击选择
            </span>
          )}
        </div>
      </div>

      {/* 悬停效果边框 */}
      {isHovered && !disabled && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: `2px solid ${themeColor}`,
          borderRadius: '1rem',
          pointerEvents: 'none',
          opacity: 0.6
        }} />
      )}
    </div>
  );
}
