/**
 * 移动端适配工具
 * 提供设备检测、响应式布局和移动端优化功能
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  devicePixelRatio: number;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

class MobileUtils {
  private static instance: MobileUtils;
  private deviceInfo: DeviceInfo | null = null;
  private breakpoints: ResponsiveBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
    largeDesktop: 1920
  };

  private constructor() {}

  static getInstance(): MobileUtils {
    if (!MobileUtils.instance) {
      MobileUtils.instance = new MobileUtils();
    }
    return MobileUtils.instance;
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      // 服务器端默认值
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1280,
        screenHeight: 720,
        orientation: 'landscape',
        touchSupported: false,
        devicePixelRatio: 1
      };
    }

    if (!this.deviceInfo) {
      this.deviceInfo = this.detectDevice();
    }

    return this.deviceInfo;
  }

  /**
   * 检测设备类型
   */
  private detectDevice(): DeviceInfo {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // 检测移动设备
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTabletDevice = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    
    // 基于屏幕尺寸的检测
    const isMobileScreen = screenWidth < this.breakpoints.mobile;
    const isTabletScreen = screenWidth >= this.breakpoints.mobile && screenWidth < this.breakpoints.desktop;
    
    const isMobile = isMobileDevice || isMobileScreen;
    const isTablet = (isTabletDevice || isTabletScreen) && !isMobile;
    const isDesktop = !isMobile && !isTablet;

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait',
      touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  /**
   * 刷新设备信息
   */
  refreshDeviceInfo(): DeviceInfo {
    this.deviceInfo = null;
    return this.getDeviceInfo();
  }

  /**
   * 获取响应式样式
   */
  getResponsiveStyles(styles: {
    mobile?: React.CSSProperties;
    tablet?: React.CSSProperties;
    desktop?: React.CSSProperties;
    default?: React.CSSProperties;
  }): React.CSSProperties {
    const device = this.getDeviceInfo();
    
    if (device.isMobile && styles.mobile) {
      return { ...styles.default, ...styles.mobile };
    }
    
    if (device.isTablet && styles.tablet) {
      return { ...styles.default, ...styles.tablet };
    }
    
    if (device.isDesktop && styles.desktop) {
      return { ...styles.default, ...styles.desktop };
    }
    
    return styles.default || {};
  }

  /**
   * 获取响应式网格列数
   */
  getGridColumns(options: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    default?: number;
  }): number {
    const device = this.getDeviceInfo();
    
    if (device.isMobile && options.mobile !== undefined) {
      return options.mobile;
    }
    
    if (device.isTablet && options.tablet !== undefined) {
      return options.tablet;
    }
    
    if (device.isDesktop && options.desktop !== undefined) {
      return options.desktop;
    }
    
    return options.default || 1;
  }

  /**
   * 获取响应式字体大小
   */
  getResponsiveFontSize(baseFontSize: number): number {
    const device = this.getDeviceInfo();
    
    if (device.isMobile) {
      return baseFontSize * 0.9; // 移动端字体稍小
    }
    
    if (device.isTablet) {
      return baseFontSize * 0.95; // 平板字体略小
    }
    
    return baseFontSize; // 桌面端保持原始大小
  }

  /**
   * 获取响应式间距
   */
  getResponsiveSpacing(baseSpacing: number): number {
    const device = this.getDeviceInfo();
    
    if (device.isMobile) {
      return baseSpacing * 0.75; // 移动端间距更紧凑
    }
    
    if (device.isTablet) {
      return baseSpacing * 0.85; // 平板间距略小
    }
    
    return baseSpacing; // 桌面端保持原始间距
  }

  /**
   * 检查是否为触摸设备
   */
  isTouchDevice(): boolean {
    return this.getDeviceInfo().touchSupported;
  }

  /**
   * 获取安全区域样式（适配刘海屏等）
   */
  getSafeAreaStyles(): React.CSSProperties {
    if (typeof window === 'undefined') return {};

    return {
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)'
    };
  }

  /**
   * 获取视口高度（考虑移动端地址栏）
   */
  getViewportHeight(): string {
    const device = this.getDeviceInfo();
    
    if (device.isMobile) {
      // 移动端使用 dvh（动态视口高度）或回退到 vh
      return 'min(100vh, 100dvh)';
    }
    
    return '100vh';
  }

  /**
   * 优化移动端触摸体验
   */
  getTouchOptimizedStyles(): React.CSSProperties {
    const device = this.getDeviceInfo();
    
    if (!device.touchSupported) return {};

    return {
      WebkitTapHighlightColor: 'transparent', // 移除点击高亮
      WebkitTouchCallout: 'none', // 禁用长按菜单
      WebkitUserSelect: 'none', // 禁用文本选择
      userSelect: 'none',
      touchAction: 'manipulation' // 优化触摸响应
    };
  }

  /**
   * 获取移动端优化的按钮样式
   */
  getMobileButtonStyles(baseStyles: React.CSSProperties = {}): React.CSSProperties {
    const device = this.getDeviceInfo();
    
    if (!device.isMobile) return baseStyles;

    return {
      ...baseStyles,
      minHeight: '44px', // iOS 推荐的最小触摸目标
      minWidth: '44px',
      padding: '12px 16px',
      fontSize: '16px', // 防止 iOS 缩放
      ...this.getTouchOptimizedStyles()
    };
  }

  /**
   * 获取移动端优化的输入框样式
   */
  getMobileInputStyles(baseStyles: React.CSSProperties = {}): React.CSSProperties {
    const device = this.getDeviceInfo();
    
    if (!device.isMobile) return baseStyles;

    return {
      ...baseStyles,
      fontSize: '16px', // 防止 iOS 缩放
      padding: '12px',
      borderRadius: '8px',
      ...this.getTouchOptimizedStyles()
    };
  }

  /**
   * 检查是否需要显示移动端导航
   */
  shouldShowMobileNavigation(): boolean {
    const device = this.getDeviceInfo();
    return device.isMobile || device.isTablet;
  }

  /**
   * 获取响应式容器最大宽度
   */
  getContainerMaxWidth(): string {
    const device = this.getDeviceInfo();
    
    if (device.isMobile) {
      return '100%';
    }
    
    if (device.isTablet) {
      return '768px';
    }
    
    return '1200px';
  }

  /**
   * 设置自定义断点
   */
  setBreakpoints(breakpoints: Partial<ResponsiveBreakpoints>): void {
    this.breakpoints = { ...this.breakpoints, ...breakpoints };
    this.deviceInfo = null; // 重置设备信息以使用新断点
  }

  /**
   * 监听屏幕尺寸变化
   */
  onResize(callback: (deviceInfo: DeviceInfo) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {}; // 服务器端返回空函数
    }

    const handleResize = () => {
      const newDeviceInfo = this.refreshDeviceInfo();
      callback(newDeviceInfo);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 返回清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }
}

// 导出单例实例
export const mobileUtils = MobileUtils.getInstance();
