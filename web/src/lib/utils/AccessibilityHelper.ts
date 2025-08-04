/**
 * 无障碍访问助手
 * 为Focus Mode、发音评估、Rescue Mode提供无障碍访问支持
 */

export interface AccessibilityConfig {
  announceChanges: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
}

export interface AriaLabels {
  focusMode: {
    activated: string;
    deactivated: string;
    correctOption: string;
    incorrectOption: string;
  };
  pronunciation: {
    recording: string;
    evaluating: string;
    completed: string;
    score: string;
  };
  rescueMode: {
    activated: string;
    videoPlaying: string;
    tipsShowing: string;
    ready: string;
  };
}

export class AccessibilityHelper {
  private static instance: AccessibilityHelper;
  private config: AccessibilityConfig;
  private announcer: HTMLElement | null = null;
  
  // ARIA标签
  public readonly ariaLabels: AriaLabels = {
    focusMode: {
      activated: '专注模式已激活，正确选项将被高亮显示',
      deactivated: '专注模式已退出，继续学习',
      correctOption: '这是正确选项，已被高亮显示',
      incorrectOption: '这不是正确选项'
    },
    pronunciation: {
      recording: '正在录音，请清晰朗读目标单词',
      evaluating: '正在评估您的发音，请稍候',
      completed: '发音评估完成',
      score: '您的发音得分是'
    },
    rescueMode: {
      activated: '救援模式已激活，将为您提供额外帮助',
      videoPlaying: '正在播放慢动作发音示范视频',
      tipsShowing: '正在显示发音技巧指导',
      ready: '准备继续发音练习，通过标准已降低'
    }
  };

  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializeAccessibility();
  }

  static getInstance(): AccessibilityHelper {
    if (!AccessibilityHelper.instance) {
      AccessibilityHelper.instance = new AccessibilityHelper();
    }
    return AccessibilityHelper.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): AccessibilityConfig {
    return {
      announceChanges: true,
      highContrast: this.prefersHighContrast(),
      reducedMotion: this.prefersReducedMotion(),
      keyboardNavigation: true,
      screenReaderSupport: true
    };
  }

  /**
   * 初始化无障碍功能
   */
  private initializeAccessibility(): void {
    if (typeof document === 'undefined') return;

    this.createAnnouncer();
    this.setupKeyboardNavigation();
    this.applyAccessibilityStyles();
    this.setupFocusManagement();
  }

  /**
   * 创建屏幕阅读器公告器
   */
  private createAnnouncer(): void {
    if (typeof document === 'undefined') return;

    if (!this.announcer) {
      this.announcer = document.createElement('div');
      this.announcer.setAttribute('aria-live', 'polite');
      this.announcer.setAttribute('aria-atomic', 'true');
      this.announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(this.announcer);
    }
  }

  /**
   * 公告消息给屏幕阅读器
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.config.announceChanges || !this.announcer) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // 清空消息，以便下次公告
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  /**
   * Focus Mode 无障碍支持
   */
  announceFocusModeActivation(): void {
    this.announce(this.ariaLabels.focusMode.activated, 'assertive');
  }

  announceFocusModeDeactivation(): void {
    this.announce(this.ariaLabels.focusMode.deactivated);
  }

  announceFocusModeHighlight(element: HTMLElement): void {
    element.setAttribute('aria-label', this.ariaLabels.focusMode.correctOption);
    element.setAttribute('aria-describedby', 'focus-mode-help');
    this.announce(this.ariaLabels.focusMode.correctOption);
  }

  /**
   * 发音评估无障碍支持
   */
  announcePronunciationRecording(): void {
    this.announce(this.ariaLabels.pronunciation.recording, 'assertive');
  }

  announcePronunciationEvaluating(): void {
    this.announce(this.ariaLabels.pronunciation.evaluating);
  }

  announcePronunciationCompleted(score: number): void {
    const message = `${this.ariaLabels.pronunciation.completed}。${this.ariaLabels.pronunciation.score} ${score} 分`;
    this.announce(message, 'assertive');
  }

  /**
   * Rescue Mode 无障碍支持
   */
  announceRescueModeActivation(): void {
    this.announce(this.ariaLabels.rescueMode.activated, 'assertive');
  }

  announceRescueModeVideo(): void {
    this.announce(this.ariaLabels.rescueMode.videoPlaying);
  }

  announceRescueModeTips(): void {
    this.announce(this.ariaLabels.rescueMode.tipsShowing);
  }

  announceRescueModeReady(): void {
    this.announce(this.ariaLabels.rescueMode.ready, 'assertive');
  }

  /**
   * 设置键盘导航
   */
  private setupKeyboardNavigation(): void {
    if (typeof document === 'undefined') return;
    if (!this.config.keyboardNavigation) return;

    document.addEventListener('keydown', (event) => {
      // ESC键退出模态框
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
      
      // Tab键焦点管理
      if (event.key === 'Tab') {
        this.handleTabNavigation(event);
      }
      
      // 空格键和回车键激活按钮
      if (event.key === ' ' || event.key === 'Enter') {
        this.handleActivationKeys(event);
      }
    });
  }

  /**
   * 处理ESC键
   */
  private handleEscapeKey(): void {
    if (typeof document === 'undefined') return;

    // 查找并关闭打开的模态框
    const modals = document.querySelectorAll('[role="dialog"], .modal, [data-modal]');
    modals.forEach(modal => {
      if (modal instanceof HTMLElement && this.isVisible(modal)) {
        const closeButton = modal.querySelector('[data-close], .close, [aria-label*="关闭"]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      }
    });
  }

  /**
   * 处理Tab导航
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    if (typeof document === 'undefined') return;

    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (event.shiftKey) {
      // Shift+Tab 向前导航
      const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
      focusableElements[prevIndex]?.focus();
    } else {
      // Tab 向后导航
      const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
      focusableElements[nextIndex]?.focus();
    }
  }

  /**
   * 处理激活键
   */
  private handleActivationKeys(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      event.preventDefault();
      target.click();
    }
  }

  /**
   * 获取可聚焦元素
   */
  private getFocusableElements(): HTMLElement[] {
    if (typeof document === 'undefined') return [];

    const selector = `
      button:not([disabled]),
      [href],
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [tabindex]:not([tabindex="-1"]),
      [role="button"]:not([disabled])
    `;

    return Array.from(document.querySelectorAll(selector))
      .filter(el => this.isVisible(el as HTMLElement)) as HTMLElement[];
  }

  /**
   * 检查元素是否可见
   */
  private isVisible(element: HTMLElement): boolean {
    if (typeof window === 'undefined') return true;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  /**
   * 应用无障碍样式
   */
  private applyAccessibilityStyles(): void {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.id = 'accessibility-styles';
    
    let css = `
      /* 焦点指示器 */
      *:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      /* 跳过链接 */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
      }
      
      .skip-link:focus {
        top: 6px;
      }
    `;

    // 高对比度模式
    if (this.config.highContrast) {
      css += `
        /* 高对比度样式 */
        .focus-mode-active {
          border: 3px solid #ffff00 !important;
          background-color: #000080 !important;
          color: #ffffff !important;
        }
        
        .rescue-mode-active {
          border: 3px solid #ff00ff !important;
          background-color: #800080 !important;
          color: #ffffff !important;
        }
        
        .pronunciation-recording {
          border: 3px solid #00ff00 !important;
          background-color: #008000 !important;
          color: #ffffff !important;
        }
      `;
    }

    // 减少动画
    if (this.config.reducedMotion) {
      css += `
        /* 减少动画 */
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
    }

    style.textContent = css;
    if (document.head) {
      document.head.appendChild(style);
    }
  }

  /**
   * 设置焦点管理
   */
  private setupFocusManagement(): void {
    // 创建焦点陷阱
    this.createFocusTrap();
    
    // 添加跳过链接
    this.addSkipLinks();
  }

  /**
   * 创建焦点陷阱
   */
  private createFocusTrap(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const modal = target.closest('[role="dialog"], .modal');
      
      if (modal) {
        const focusableElements = this.getFocusableElementsInContainer(modal as HTMLElement);
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          // 确保焦点在模态框内
          if (!modal.contains(target)) {
            firstElement.focus();
          }
        }
      }
    });
  }

  /**
   * 获取容器内的可聚焦元素
   */
  private getFocusableElementsInContainer(container: HTMLElement): HTMLElement[] {
    const selector = `
      button:not([disabled]),
      [href],
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [tabindex]:not([tabindex="-1"]),
      [role="button"]:not([disabled])
    `;
    
    return Array.from(container.querySelectorAll(selector))
      .filter(el => this.isVisible(el as HTMLElement)) as HTMLElement[];
  }

  /**
   * 添加跳过链接
   */
  private addSkipLinks(): void {
    if (typeof document === 'undefined') return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = '跳到主要内容';

    if (document.body) {
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }

  /**
   * 检查是否偏好高对比度
   */
  private prefersHighContrast(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  /**
   * 检查是否偏好减少动画
   */
  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * 设置元素的ARIA属性
   */
  setAriaAttributes(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  /**
   * 创建ARIA描述
   */
  createAriaDescription(id: string, text: string): HTMLElement {
    if (typeof document === 'undefined') {
      // 返回一个虚拟元素用于SSR
      return { textContent: text } as HTMLElement;
    }

    let description = document.getElementById(id);
    if (!description) {
      description = document.createElement('div');
      description.id = id;
      description.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      if (document.body) {
        document.body.appendChild(description);
      }
    }
    description.textContent = text;
    return description;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.applyAccessibilityStyles();
  }

  /**
   * 获取当前配置
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
    }

    if (typeof document !== 'undefined') {
      const accessibilityStyles = document.getElementById('accessibility-styles');
      if (accessibilityStyles) {
        accessibilityStyles.remove();
      }
    }
  }
}

// 创建全局实例
export const accessibilityHelper = AccessibilityHelper.getInstance();

// 在页面卸载时清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    accessibilityHelper.cleanup();
  });
}
