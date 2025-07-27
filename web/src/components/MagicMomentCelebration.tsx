'use client'

import { useState, useEffect } from 'react';
import { MagicMoment } from '../lib/magicMomentDetector';

interface MagicMomentCelebrationProps {
  magicMoment: MagicMoment | null;
  onClose: () => void;
  onShare?: (content: any) => void;
}

export default function MagicMomentCelebration({ 
  magicMoment, 
  onClose, 
  onShare 
}: MagicMomentCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entrance' | 'celebration' | 'content' | 'exit'>('entrance');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (magicMoment) {
      setIsVisible(true);
      setAnimationPhase('entrance');
      
      // 动画序列
      const sequence = [
        { phase: 'celebration', delay: 500 },
        { phase: 'content', delay: 2000 }
      ];

      sequence.forEach(({ phase, delay }) => {
        setTimeout(() => {
          setAnimationPhase(phase as any);
        }, delay);
      });
    }
  }, [magicMoment]);

  const handleClose = () => {
    setAnimationPhase('exit');
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 500);
  };

  const handleShare = () => {
    if (magicMoment && onShare) {
      onShare(magicMoment.shareableContent);
    }
  };

  if (!magicMoment || !isVisible) return null;

  const getCelebrationIntensity = () => {
    switch (magicMoment.celebrationLevel) {
      case 'spectacular': return 'spectacular';
      case 'moderate': return 'moderate';
      default: return 'subtle';
    }
  };

  const getRarityColor = () => {
    switch (magicMoment.rarity) {
      case 'legendary': return '#ffd700';
      case 'epic': return '#9d4edd';
      case 'rare': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const intensity = getCelebrationIntensity();
  const rarityColor = getRarityColor();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: animationPhase === 'entrance' 
        ? 'transparent' 
        : `radial-gradient(circle, ${rarityColor}20 0%, rgba(0,0,0,0.9) 70%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '1rem' : '2rem',
      transition: 'all 0.5s ease',
      opacity: animationPhase === 'exit' ? 0 : 1
    }}>
      {/* 背景粒子效果 */}
      {intensity === 'spectacular' && animationPhase !== 'entrance' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                background: rarityColor,
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `sparkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
                animationDelay: Math.random() * 2 + 's'
              }}
            />
          ))}
        </div>
      )}

      {/* 主要庆祝内容 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '2rem',
        padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
        maxWidth: isMobile ? '90vw' : '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 3px ${rarityColor}40`,
        transform: animationPhase === 'entrance' 
          ? 'scale(0.3) rotate(180deg)' 
          : animationPhase === 'exit'
          ? 'scale(0.8) translateY(50px)'
          : 'scale(1) rotate(0deg)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 顶部装饰 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${rarityColor}, ${rarityColor}80, ${rarityColor})`,
          animation: intensity === 'spectacular' ? 'shimmer 2s infinite' : 'none'
        }} />

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
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
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>

        {/* 图标和标题 */}
        <div style={{
          marginBottom: '2rem',
          transform: animationPhase === 'celebration' ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{
            fontSize: isMobile ? '4rem' : '5rem',
            marginBottom: '1rem',
            animation: intensity === 'spectacular' 
              ? 'bounce 1s infinite alternate' 
              : intensity === 'moderate'
              ? 'pulse 2s infinite'
              : 'none'
          }}>
            {magicMoment.icon}
          </div>
          
          <h1 style={{
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem',
            background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}80)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {magicMoment.title}
          </h1>

          <p style={{
            fontSize: isMobile ? '1rem' : '1.2rem',
            color: '#4b5563',
            fontWeight: '500'
          }}>
            {magicMoment.description}
          </p>
        </div>

        {/* 个性化消息 */}
        {animationPhase === 'content' && (
          <div style={{
            background: `${rarityColor}10`,
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: `2px solid ${rarityColor}30`,
            animation: 'fadeInUp 0.5s ease'
          }}>
            <p style={{
              fontSize: isMobile ? '0.9rem' : '1rem',
              color: '#374151',
              lineHeight: 1.6,
              margin: 0
            }}>
              {magicMoment.personalizedMessage}
            </p>
          </div>
        )}

        {/* 统计信息 */}
        {animationPhase === 'content' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.5s ease 0.2s both'
          }}>
            {magicMoment.shareableContent.stats.map((stat, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  marginBottom: '0.25rem'
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: isMobile ? '1.2rem' : '1.4rem',
                  fontWeight: 'bold',
                  color: rarityColor,
                  marginBottom: '0.25rem'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6b7280'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 行动按钮 */}
        {animationPhase === 'content' && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.5s ease 0.4s both'
          }}>
            <button
              onClick={handleShare}
              style={{
                background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}dd)`,
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: `0 8px 25px ${rarityColor}40`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 12px 35px ${rarityColor}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${rarityColor}40`;
              }}
            >
              🎉 分享成就
            </button>

            <button
              onClick={handleClose}
              style={{
                background: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = rarityColor;
                e.currentTarget.style.color = rarityColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#374151';
              }}
            >
              继续学习
            </button>
          </div>
        )}

        {/* 经验值奖励 */}
        {animationPhase === 'content' && magicMoment.experienceReward > 0 && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}dd)`,
            color: 'white',
            borderRadius: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            animation: 'slideInLeft 0.5s ease 0.6s both'
          }}>
            +{magicMoment.experienceReward} EXP
          </div>
        )}
      </div>

      {/* CSS 动画 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-10px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `
      }} />
    </div>
  );
}
