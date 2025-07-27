/**
 * 移动端导航组件
 * 提供移动端优化的导航体验
 */

'use client'

import { useState, useEffect } from 'react';
import { useMobile } from '../hooks/useMobile';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isActive?: boolean;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  currentPath?: string;
  onNavigate?: (href: string) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
}

export default function MobileNavigation({
  items,
  currentPath,
  onNavigate,
  showBackButton = false,
  onBack,
  title
}: MobileNavigationProps) {
  const {
    isMobile,
    isTablet,
    getSafeAreaStyles,
    getMobileButtonStyles,
    getTouchOptimizedStyles
  } = useMobile();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 如果不是移动设备，不显示移动导航
  if (!isMobile && !isTablet) {
    return null;
  }

  const handleNavigate = (href: string) => {
    setIsMenuOpen(false);
    if (onNavigate) {
      onNavigate(href);
    } else {
      window.location.href = href;
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <>
      {/* 顶部导航栏 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 1000,
        ...getSafeAreaStyles()
      }}>
        {/* 左侧：返回按钮或菜单按钮 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {showBackButton ? (
            <button
              onClick={handleBack}
              style={{
                ...getMobileButtonStyles({
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#374151',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                })
              }}
            >
              ←
            </button>
          ) : (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                ...getMobileButtonStyles({
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  color: '#374151',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px'
                })
              }}
            >
              <div style={{
                width: '20px',
                height: '2px',
                background: '#374151',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none'
              }}></div>
              <div style={{
                width: '20px',
                height: '2px',
                background: '#374151',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                opacity: isMenuOpen ? 0 : 1
              }}></div>
              <div style={{
                width: '20px',
                height: '2px',
                background: '#374151',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none'
              }}></div>
            </button>
          )}
        </div>

        {/* 中间：标题 */}
        {title && (
          <h1 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0,
            textAlign: 'center',
            flex: 1
          }}>
            {title}
          </h1>
        )}

        {/* 右侧：占位或其他操作 */}
        <div style={{ width: '44px' }}></div>
      </div>

      {/* 菜单覆盖层 */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1500,
            ...getTouchOptimizedStyles()
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          {/* 侧边菜单 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '280px',
              height: '100%',
              background: 'white',
              boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease',
              ...getSafeAreaStyles()
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 菜单头部 */}
            <div style={{
              padding: '2rem 1.5rem 1rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                SmarTalk
              </h2>
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: 0
              }}>
                智能英语学习平台
              </p>
            </div>

            {/* 菜单项 */}
            <div style={{ padding: '1rem 0' }}>
              {items.map((item) => {
                const isActive = currentPath === item.href || item.isActive;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.href)}
                    style={{
                      ...getMobileButtonStyles({
                        width: '100%',
                        background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        border: 'none',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        textAlign: 'left',
                        color: isActive ? '#3b82f6' : '#374151',
                        borderRadius: 0,
                        borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent'
                      })
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: isActive ? 'bold' : 'normal'
                    }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 底部导航栏（仅移动端） */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0.5rem',
          zIndex: 1000,
          ...getSafeAreaStyles()
        }}>
          {items.slice(0, 4).map((item) => {
            const isActive = currentPath === item.href || item.isActive;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.href)}
                style={{
                  ...getMobileButtonStyles({
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: isActive ? '#3b82f6' : '#6b7280',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    minWidth: '60px'
                  })
                }}
              >
                <span style={{
                  fontSize: '1.2rem',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 页面内容间距补偿 */}
      <style jsx global>{`
        body {
          padding-top: 60px;
          padding-bottom: ${isMobile ? '70px' : '0'};
        }
      `}</style>
    </>
  );
}
