/**
 * FocusModeModal - 专注模式模态框组件
 * 显示专注模式的支持消息和视觉提示
 */

'use client'

import React, { useEffect, useState } from 'react';
import { useFocusMode } from '../../hooks/useFocusMode';

interface FocusModeModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number; // 毫秒
}

export default function FocusModeModal({
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000
}: FocusModeModalProps) {
  const { isActive, supportiveMessage, showGlowEffect } = useFocusMode();
  const [showModal, setShowModal] = useState(false);

  // 控制模态框显示
  useEffect(() => {
    if (isVisible !== undefined) {
      setShowModal(isVisible);
    } else {
      setShowModal(isActive);
    }
  }, [isVisible, isActive]);

  // 自动关闭
  useEffect(() => {
    if (showModal && autoClose) {
      const timer = setTimeout(() => {
        setShowModal(false);
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [showModal, autoClose, autoCloseDelay, onClose]);

  // 手动关闭
  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  if (!showModal) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* 模态框内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`
            bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6
            transform transition-all duration-300 ease-out
            ${showGlowEffect ? 'animate-pulse' : ''}
          `}
          style={{
            boxShadow: showGlowEffect 
              ? '0 0 30px 10px rgba(251, 191, 36, 0.3), 0 20px 40px rgba(0, 0, 0, 0.1)' 
              : '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="关闭专注模式提示"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 图标和标题 */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              专注模式
            </h3>
          </div>

          {/* 支持消息 */}
          <div className="text-center mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              {supportiveMessage || '🎯 专注模式已启动，正确答案会有提示哦！'}
            </p>
          </div>

          {/* 提示信息 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-xl">💡</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>提示：</strong>正确的选项会有金色发光效果，帮助你找到答案！
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center">
            <button
              onClick={handleClose}
              className="
                px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors duration-200
              "
            >
              我知道了
            </button>
          </div>
        </div>
      </div>

      {/* CSS动画样式 - 转换为内联样式 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          .animate-pulse {
            animation: pulse 2s ease-in-out infinite;
          }
        `
      }} />
    </>
  );
}

// 专注模式高亮组件 - 用于高亮正确选项
interface FocusModeHighlightProps {
  isCorrectOption: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FocusModeHighlight({
  isCorrectOption,
  children,
  className = ''
}: FocusModeHighlightProps) {
  const { highlightCorrectOption, showGlowEffect } = useFocusMode();

  const shouldHighlight = highlightCorrectOption && isCorrectOption;

  return (
    <div
      className={`
        ${className}
        ${shouldHighlight ? 'focus-mode-highlight' : ''}
        transition-all duration-300 ease-in-out
        relative
      `}
      style={{
        // 基础样式由CSS类控制，这里只添加条件样式
        position: 'relative',
        zIndex: shouldHighlight ? 10 : 1
      }}
    >
      {children}

      {/* 额外的视觉提示 */}
      {shouldHighlight && (
        <div
          className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce"
          style={{ zIndex: 20 }}
        >
          正确答案
        </div>
      )}
      
      {/* 优化的发光动画样式 - 转换为内联样式 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .focus-mode-highlight {
            position: relative;
            animation: focusGlow 1s ease-in-out infinite;
            border: 2px solid #fbbf24 !important;
            border-radius: 8px !important;
            transition: all 0.3s ease-in-out;
          }
          .focus-mode-highlight::before {
            content: '';
            position: absolute;
            top: -4px; left: -4px; right: -4px; bottom: -4px;
            background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
            border-radius: 12px;
            z-index: -1;
            animation: focusRotate 2s linear infinite;
            opacity: 0.7;
          }
          @keyframes focusGlow {
            0%, 100% {
              box-shadow: 0 0 20px 5px rgba(251, 191, 36, 0.8), 0 0 40px 10px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(251, 191, 36, 0.1);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 30px 8px rgba(251, 191, 36, 1), 0 0 60px 15px rgba(251, 191, 36, 0.6), inset 0 0 30px rgba(251, 191, 36, 0.2);
              transform: scale(1.02);
            }
          }
          @keyframes focusRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .focus-mode-highlight::after {
            content: '✨';
            position: absolute;
            top: -10px; right: -10px;
            font-size: 20px;
            animation: focusPulse 1s ease-in-out infinite;
            z-index: 10;
          }
          @keyframes focusPulse {
            0%, 100% { opacity: 0.6; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `
      }} />
    </div>
  );
}

// 专注模式状态指示器
export function FocusModeIndicator() {
  const { isActive, supportiveMessage } = useFocusMode();

  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 z-30">
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
        <span className="text-sm">🎯</span>
        <span className="text-sm font-medium">专注模式</span>
      </div>
      
      {supportiveMessage && (
        <div className="mt-2 bg-white border border-yellow-300 rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm text-gray-700">{supportiveMessage}</p>
        </div>
      )}
    </div>
  );
}
