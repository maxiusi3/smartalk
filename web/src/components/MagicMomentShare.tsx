'use client'

import { useState, useEffect } from 'react';
import { ShareableContent } from '../lib/magicMomentDetector';

interface MagicMomentShareProps {
  content: ShareableContent;
  isVisible: boolean;
  onClose: () => void;
}

export default function MagicMomentShare({ content, isVisible, onClose }: MagicMomentShareProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isVisible) return null;

  const shareText = `${content.title}\n\n${content.description}\n\n${content.hashtags.join(' ')}\n\n🔗 体验SmarTalk: https://smartalk-web.vercel.app`;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleShareToWeChat = () => {
    // 微信分享逻辑（需要微信SDK）
    if (typeof window !== 'undefined' && (window as any).wx) {
      (window as any).wx.ready(() => {
        (window as any).wx.updateAppMessageShareData({
          title: content.title,
          desc: content.description,
          link: 'https://smartalk-web.vercel.app',
          imgUrl: content.imageUrl || 'https://smartalk-web.vercel.app/images/share-default.jpg'
        });
      });
    } else {
      // 降级到复制链接
      handleCopyToClipboard();
    }
  };

  const handleShareToWeibo = () => {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent('https://smartalk-web.vercel.app')}&title=${encodeURIComponent(shareText)}`;
    window.open(weiboUrl, '_blank', 'width=600,height=400');
  };

  const handleShareToQQ = () => {
    const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent('https://smartalk-web.vercel.app')}&title=${encodeURIComponent(content.title)}&summary=${encodeURIComponent(content.description)}`;
    window.open(qqUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.description,
          url: 'https://smartalk-web.vercel.app'
        });
      } catch (error) {
        console.error('Native share failed:', error);
        handleCopyToClipboard();
      }
    } else {
      handleCopyToClipboard();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '1rem' : '2rem',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: isMobile ? '2rem 1.5rem' : '2.5rem',
        maxWidth: isMobile ? '90vw' : '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
        animation: 'slideUp 0.3s ease'
      }}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#6b7280',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          }}
        >
          ×
        </button>

        {/* 标题 */}
        <h2 style={{
          fontSize: isMobile ? '1.5rem' : '1.8rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          🎉 分享你的成就
        </h2>

        {/* 预览卡片 */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #e0e7ff'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            {content.title}
          </h3>
          
          <p style={{
            fontSize: '0.9rem',
            color: '#4b5563',
            marginBottom: '1rem',
            lineHeight: 1.5
          }}>
            {content.description}
          </p>

          {/* 统计信息 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(content.stats.length, 3)}, 1fr)`,
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            {content.stats.map((stat, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  marginBottom: '0.25rem'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#6b7280'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* 标签 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {content.hashtags.map((tag, index) => (
              <span key={index} style={{
                background: '#3b82f6',
                color: 'white',
                fontSize: '0.8rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontWeight: '500'
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 分享选项 */}
        <div style={{
          marginBottom: '1.5rem'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            选择分享方式
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '0.75rem'
          }}>
            {/* 微信分享 */}
            <button
              onClick={handleShareToWeChat}
              style={{
                background: '#07c160',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '1rem 0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(7, 193, 96, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>💬</span>
              微信
            </button>

            {/* 微博分享 */}
            <button
              onClick={handleShareToWeibo}
              style={{
                background: '#ff8200',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '1rem 0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 130, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🐦</span>
              微博
            </button>

            {/* QQ分享 */}
            <button
              onClick={handleShareToQQ}
              style={{
                background: '#12b7f5',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '1rem 0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(18, 183, 245, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🐧</span>
              QQ
            </button>

            {/* 更多分享 */}
            <button
              onClick={handleNativeShare}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '1rem 0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📤</span>
              更多
            </button>
          </div>
        </div>

        {/* 复制链接 */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '0.75rem',
          padding: '1rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <input
              type="text"
              value={shareText}
              readOnly
              style={{
                flex: 1,
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.9rem',
                color: '#374151'
              }}
            />
            <button
              onClick={handleCopyToClipboard}
              style={{
                background: copySuccess ? '#10b981' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '80px'
              }}
            >
              {copySuccess ? '✓ 已复制' : '复制'}
            </button>
          </div>
        </div>
      </div>

      {/* CSS 动画 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `
      }} />
    </div>
  );
}
