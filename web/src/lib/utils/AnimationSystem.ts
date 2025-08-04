/**
 * 统一动画系统
 * 为Focus Mode、发音评估、Rescue Mode提供一致的动画效果
 */

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface AnimationPresets {
  fadeIn: AnimationConfig;
  fadeOut: AnimationConfig;
  slideIn: AnimationConfig;
  slideOut: AnimationConfig;
  scaleIn: AnimationConfig;
  scaleOut: AnimationConfig;
  bounce: AnimationConfig;
  pulse: AnimationConfig;
  shake: AnimationConfig;
  glow: AnimationConfig;
}

export class AnimationSystem {
  private static instance: AnimationSystem;
  
  // 动画预设
  public readonly presets: AnimationPresets = {
    fadeIn: { duration: 300, easing: 'ease-out' },
    fadeOut: { duration: 200, easing: 'ease-in' },
    slideIn: { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    slideOut: { duration: 300, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)' },
    scaleIn: { duration: 250, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    scaleOut: { duration: 200, easing: 'ease-in' },
    bounce: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    pulse: { duration: 1000, easing: 'ease-in-out' },
    shake: { duration: 500, easing: 'ease-in-out' },
    glow: { duration: 800, easing: 'ease-in-out' }
  };

  // 主题色彩
  public readonly colors = {
    focusMode: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#60a5fa',
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)'
    },
    pronunciation: {
      primary: '#10b981',
      secondary: '#047857',
      accent: '#34d399',
      background: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    rescueMode: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.3)'
    },
    success: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#4ade80',
      background: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)'
    },
    error: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f87171',
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    warning: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24',
      background: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)'
    }
  };

  private constructor() {}

  static getInstance(): AnimationSystem {
    if (!AnimationSystem.instance) {
      AnimationSystem.instance = new AnimationSystem();
    }
    return AnimationSystem.instance;
  }

  /**
   * 创建CSS动画样式
   */
  createAnimationStyle(config: AnimationConfig): string {
    return `
      transition: all ${config.duration}ms ${config.easing};
      ${config.delay ? `transition-delay: ${config.delay}ms;` : ''}
    `;
  }

  /**
   * Focus Mode 激活动画
   */
  animateFocusModeActivation(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      element.style.cssText += `
        ${this.createAnimationStyle(this.presets.scaleIn)}
        transform: scale(1.05);
        box-shadow: 0 0 20px ${this.colors.focusMode.accent};
        border-color: ${this.colors.focusMode.primary};
        background-color: ${this.colors.focusMode.background};
      `;

      setTimeout(() => {
        element.style.transform = 'scale(1)';
        resolve();
      }, this.presets.scaleIn.duration);
    });
  }

  /**
   * Focus Mode 高亮正确选项动画
   */
  animateFocusModeHighlight(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      let pulseCount = 0;
      const maxPulses = 3;

      const pulse = () => {
        element.style.cssText += `
          ${this.createAnimationStyle(this.presets.pulse)}
          box-shadow: 0 0 30px ${this.colors.focusMode.accent};
          transform: scale(1.02);
        `;

        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.style.boxShadow = `0 0 15px ${this.colors.focusMode.accent}`;
          
          pulseCount++;
          if (pulseCount < maxPulses) {
            setTimeout(pulse, 200);
          } else {
            resolve();
          }
        }, this.presets.pulse.duration / 2);
      };

      pulse();
    });
  }

  /**
   * Rescue Mode 触发动画
   */
  animateRescueModeActivation(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      // 先震动效果
      element.style.cssText += `
        ${this.createAnimationStyle(this.presets.shake)}
        animation: shake 0.5s ease-in-out;
      `;

      // 添加震动关键帧
      if (!document.getElementById('shake-keyframes')) {
        const style = document.createElement('style');
        style.id = 'shake-keyframes';
        style.textContent = `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `;
        document.head.appendChild(style);
      }

      setTimeout(() => {
        // 然后应用救援模式样式
        element.style.cssText += `
          ${this.createAnimationStyle(this.presets.fadeIn)}
          background-color: ${this.colors.rescueMode.background};
          border-color: ${this.colors.rescueMode.primary};
          box-shadow: 0 0 25px ${this.colors.rescueMode.accent};
        `;
        resolve();
      }, this.presets.shake.duration);
    });
  }

  /**
   * 发音评估成功动画
   */
  animatePronunciationSuccess(element: HTMLElement, score: number): Promise<void> {
    return new Promise((resolve) => {
      const isExcellent = score >= 90;
      const isGood = score >= 80;
      
      element.style.cssText += `
        ${this.createAnimationStyle(this.presets.bounce)}
        background-color: ${this.colors.success.background};
        border-color: ${this.colors.success.primary};
        transform: scale(1.1);
      `;

      if (isExcellent) {
        // 优秀分数的特殊效果
        this.createConfettiEffect(element);
      }

      setTimeout(() => {
        element.style.transform = 'scale(1)';
        if (isGood) {
          element.style.boxShadow = `0 0 20px ${this.colors.success.accent}`;
        }
        resolve();
      }, this.presets.bounce.duration);
    });
  }

  /**
   * 发音评估失败动画
   */
  animatePronunciationFailure(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      element.style.cssText += `
        ${this.createAnimationStyle(this.presets.shake)}
        background-color: ${this.colors.error.background};
        border-color: ${this.colors.error.primary};
        animation: shake 0.5s ease-in-out;
      `;

      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, this.presets.shake.duration);
    });
  }

  /**
   * 学习完成庆祝动画
   */
  animateLearningCompletion(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      // 创建庆祝效果
      this.createCelebrationEffect(element);
      
      element.style.cssText += `
        ${this.createAnimationStyle(this.presets.bounce)}
        background: linear-gradient(135deg, ${this.colors.success.primary}, ${this.colors.success.accent});
        transform: scale(1.05);
        box-shadow: 0 0 30px ${this.colors.success.accent};
      `;

      setTimeout(() => {
        element.style.transform = 'scale(1)';
        resolve();
      }, this.presets.bounce.duration);
    });
  }

  /**
   * 创建五彩纸屑效果
   */
  private createConfettiEffect(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: confetti-fall 2s ease-out forwards;
      `;

      // 添加五彩纸屑动画
      if (!document.getElementById('confetti-keyframes')) {
        const style = document.createElement('style');
        style.id = 'confetti-keyframes';
        style.textContent = `
          @keyframes confetti-fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(200px) rotate(360deg);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(confetti);
      
      // 清理
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 2000);
    }
  }

  /**
   * 创建庆祝效果
   */
  private createCelebrationEffect(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    
    // 创建光环效果
    const halo = document.createElement('div');
    halo.style.cssText = `
      position: fixed;
      width: ${rect.width + 40}px;
      height: ${rect.height + 40}px;
      left: ${rect.left - 20}px;
      top: ${rect.top - 20}px;
      border: 3px solid ${this.colors.success.accent};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      animation: halo-expand 1s ease-out forwards;
    `;

    // 添加光环动画
    if (!document.getElementById('halo-keyframes')) {
      const style = document.createElement('style');
      style.id = 'halo-keyframes';
      style.textContent = `
        @keyframes halo-expand {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(halo);
    
    // 清理
    setTimeout(() => {
      if (halo.parentNode) {
        halo.parentNode.removeChild(halo);
      }
    }, 1000);

    // 添加五彩纸屑
    this.createConfettiEffect(element);
  }

  /**
   * 平滑滚动到元素
   */
  smoothScrollToElement(element: HTMLElement, offset: number = 0): Promise<void> {
    return new Promise((resolve) => {
      const targetPosition = element.offsetTop - offset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 800;
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animation);
    });
  }

  /**
   * 缓动函数
   */
  private easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  /**
   * 获取主题颜色
   */
  getThemeColors(theme: 'focusMode' | 'pronunciation' | 'rescueMode' | 'success' | 'error' | 'warning') {
    return this.colors[theme];
  }

  /**
   * 应用主题样式到元素
   */
  applyThemeStyle(element: HTMLElement, theme: keyof typeof this.colors): void {
    const colors = this.colors[theme];
    element.style.cssText += `
      background-color: ${colors.background};
      border-color: ${colors.primary};
      color: ${colors.primary};
    `;
  }

  /**
   * 清理所有动画效果
   */
  cleanup(): void {
    // 移除动态添加的样式
    const dynamicStyles = document.querySelectorAll('#shake-keyframes, #confetti-keyframes, #halo-keyframes');
    dynamicStyles.forEach(style => style.remove());
    
    // 清理五彩纸屑和光环
    const effects = document.querySelectorAll('[style*="confetti-fall"], [style*="halo-expand"]');
    effects.forEach(effect => effect.remove());
  }
}

// 创建全局实例
export const animationSystem = AnimationSystem.getInstance();

// 在页面卸载时清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    animationSystem.cleanup();
  });
}
