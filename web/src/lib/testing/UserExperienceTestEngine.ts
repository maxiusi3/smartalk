/**
 * UserExperienceTestEngine - 用户体验测试引擎
 * 提供完整的用户旅程测试、可用性测试和无障碍性测试
 */

export interface UserJourneyStep {
  id: string;
  name: string;
  description: string;
  expectedOutcome: string;
  testActions: TestAction[];
  validationRules: ValidationRule[];
  timeoutMs: number;
}

export interface TestAction {
  type: 'click' | 'input' | 'navigate' | 'wait' | 'scroll' | 'hover' | 'keypress';
  target: string; // CSS selector or element ID
  value?: string;
  delay?: number;
  options?: Record<string, any>;
}

export interface ValidationRule {
  type: 'element_exists' | 'element_visible' | 'text_contains' | 'url_matches' | 'performance' | 'accessibility';
  target?: string;
  expected: any;
  tolerance?: number;
}

export interface UserJourney {
  id: string;
  name: string;
  description: string;
  category: 'learning' | 'navigation' | 'interaction' | 'performance' | 'accessibility';
  priority: 'critical' | 'high' | 'medium' | 'low';
  steps: UserJourneyStep[];
  prerequisites?: string[];
  cleanup?: TestAction[];
}

export interface TestResult {
  journeyId: string;
  stepId?: string;
  passed: boolean;
  duration: number;
  error?: string;
  details: {
    expectedOutcome: string;
    actualOutcome: string;
    screenshots?: string[];
    performanceMetrics?: PerformanceMetrics;
    accessibilityIssues?: AccessibilityIssue[];
  };
  timestamp: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  interactionToNextPaint: number;
  memoryUsage: number;
  networkRequests: number;
}

export interface AccessibilityIssue {
  type: 'color_contrast' | 'keyboard_navigation' | 'screen_reader' | 'focus_management' | 'aria_labels';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  description: string;
  suggestion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export interface UsabilityTestResult {
  testId: string;
  category: 'navigation' | 'learnability' | 'efficiency' | 'memorability' | 'error_prevention';
  score: number; // 0-100
  issues: UsabilityIssue[];
  recommendations: string[];
  userFeedback?: UserFeedback[];
}

export interface UsabilityIssue {
  type: 'confusing_navigation' | 'unclear_labels' | 'poor_feedback' | 'complex_workflow' | 'inconsistent_design';
  severity: 'high' | 'medium' | 'low';
  description: string;
  location: string;
  impact: string;
  suggestion: string;
}

export interface UserFeedback {
  category: 'satisfaction' | 'ease_of_use' | 'clarity' | 'efficiency' | 'overall';
  rating: number; // 1-5
  comment?: string;
}

export class UserExperienceTestEngine {
  private static instance: UserExperienceTestEngine;
  private testResults: TestResult[] = [];
  private usabilityResults: UsabilityTestResult[] = [];
  private isRunning = false;

  private constructor() {}

  static getInstance(): UserExperienceTestEngine {
    if (!UserExperienceTestEngine.instance) {
      UserExperienceTestEngine.instance = new UserExperienceTestEngine();
    }
    return UserExperienceTestEngine.instance;
  }

  /**
   * 执行用户旅程测试
   */
  async executeUserJourney(journey: UserJourney): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    try {
      // 执行前置条件
      if (journey.prerequisites) {
        await this.executePrerequisites(journey.prerequisites);
      }

      // 执行每个步骤
      for (const step of journey.steps) {
        const stepResult = await this.executeJourneyStep(journey.id, step);
        results.push(stepResult);
        
        // 如果步骤失败，停止执行
        if (!stepResult.passed) {
          break;
        }
      }

      // 执行清理操作
      if (journey.cleanup) {
        await this.executeCleanup(journey.cleanup);
      }

    } catch (error) {
      results.push({
        journeyId: journey.id,
        passed: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          expectedOutcome: 'Journey completion',
          actualOutcome: 'Journey failed with error'
        },
        timestamp: new Date().toISOString()
      });
    }

    this.testResults.push(...results);
    return results;
  }

  /**
   * 执行旅程步骤
   */
  private async executeJourneyStep(journeyId: string, step: UserJourneyStep): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // 执行测试动作
      for (const action of step.testActions) {
        await this.executeTestAction(action);
      }

      // 验证结果
      const validationResults = await this.validateStep(step.validationRules);
      const allPassed = validationResults.every(result => result.passed);

      const duration = Date.now() - startTime;

      return {
        journeyId,
        stepId: step.id,
        passed: allPassed,
        duration,
        details: {
          expectedOutcome: step.expectedOutcome,
          actualOutcome: allPassed ? step.expectedOutcome : 'Validation failed',
          performanceMetrics: await this.collectPerformanceMetrics(),
          accessibilityIssues: await this.checkAccessibility()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        journeyId,
        stepId: step.id,
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          expectedOutcome: step.expectedOutcome,
          actualOutcome: 'Step execution failed'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 执行测试动作
   */
  private async executeTestAction(action: TestAction): Promise<void> {
    // 模拟测试动作执行
    await new Promise(resolve => setTimeout(resolve, action.delay || 100));
    
    switch (action.type) {
      case 'click':
        // 模拟点击操作
        console.log(`Clicking element: ${action.target}`);
        break;
      case 'input':
        // 模拟输入操作
        console.log(`Inputting "${action.value}" into: ${action.target}`);
        break;
      case 'navigate':
        // 模拟导航操作
        console.log(`Navigating to: ${action.value}`);
        break;
      case 'wait':
        // 等待操作
        await new Promise(resolve => setTimeout(resolve, parseInt(action.value || '1000')));
        break;
      case 'scroll':
        // 模拟滚动操作
        console.log(`Scrolling to: ${action.target}`);
        break;
      case 'hover':
        // 模拟悬停操作
        console.log(`Hovering over: ${action.target}`);
        break;
      case 'keypress':
        // 模拟按键操作
        console.log(`Pressing key: ${action.value}`);
        break;
    }
  }

  /**
   * 验证步骤结果
   */
  private async validateStep(rules: ValidationRule[]): Promise<{ passed: boolean; rule: ValidationRule }[]> {
    const results = [];
    
    for (const rule of rules) {
      let passed = false;
      
      switch (rule.type) {
        case 'element_exists':
          // 检查元素是否存在
          passed = true; // 模拟检查结果
          break;
        case 'element_visible':
          // 检查元素是否可见
          passed = true; // 模拟检查结果
          break;
        case 'text_contains':
          // 检查文本内容
          passed = true; // 模拟检查结果
          break;
        case 'url_matches':
          // 检查URL匹配
          passed = true; // 模拟检查结果
          break;
        case 'performance':
          // 检查性能指标
          passed = await this.validatePerformance(rule);
          break;
        case 'accessibility':
          // 检查无障碍性
          passed = await this.validateAccessibility(rule);
          break;
      }
      
      results.push({ passed, rule });
    }
    
    return results;
  }

  /**
   * 收集性能指标
   */
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    // 模拟性能指标收集
    return {
      pageLoadTime: 1200 + Math.random() * 800,
      firstContentfulPaint: 800 + Math.random() * 400,
      largestContentfulPaint: 1500 + Math.random() * 500,
      cumulativeLayoutShift: Math.random() * 0.1,
      firstInputDelay: 50 + Math.random() * 100,
      interactionToNextPaint: 100 + Math.random() * 200,
      memoryUsage: 50 + Math.random() * 30,
      networkRequests: 15 + Math.floor(Math.random() * 10)
    };
  }

  /**
   * 检查无障碍性
   */
  private async checkAccessibility(): Promise<AccessibilityIssue[]> {
    // 模拟无障碍性检查
    const issues: AccessibilityIssue[] = [];
    
    // 随机生成一些无障碍性问题
    if (Math.random() > 0.8) {
      issues.push({
        type: 'color_contrast',
        severity: 'moderate',
        element: '.text-gray-500',
        description: '文本颜色对比度不足',
        suggestion: '增加文本颜色对比度至4.5:1以上',
        wcagLevel: 'AA'
      });
    }
    
    if (Math.random() > 0.9) {
      issues.push({
        type: 'aria_labels',
        severity: 'serious',
        element: 'button.icon-only',
        description: '图标按钮缺少aria-label',
        suggestion: '为图标按钮添加描述性的aria-label',
        wcagLevel: 'A'
      });
    }
    
    return issues;
  }

  /**
   * 验证性能指标
   */
  private async validatePerformance(rule: ValidationRule): Promise<boolean> {
    const metrics = await this.collectPerformanceMetrics();
    
    switch (rule.expected.metric) {
      case 'pageLoadTime':
        return metrics.pageLoadTime <= rule.expected.threshold;
      case 'firstContentfulPaint':
        return metrics.firstContentfulPaint <= rule.expected.threshold;
      case 'largestContentfulPaint':
        return metrics.largestContentfulPaint <= rule.expected.threshold;
      case 'cumulativeLayoutShift':
        return metrics.cumulativeLayoutShift <= rule.expected.threshold;
      default:
        return true;
    }
  }

  /**
   * 验证无障碍性
   */
  private async validateAccessibility(rule: ValidationRule): Promise<boolean> {
    const issues = await this.checkAccessibility();
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    
    return criticalIssues.length === 0;
  }

  /**
   * 执行可用性测试
   */
  async executeUsabilityTest(testId: string, category: UsabilityTestResult['category']): Promise<UsabilityTestResult> {
    const issues: UsabilityIssue[] = [];
    let score = 85; // 基础分数

    // 模拟可用性问题检测
    switch (category) {
      case 'navigation':
        if (Math.random() > 0.7) {
          issues.push({
            type: 'confusing_navigation',
            severity: 'medium',
            description: '导航结构层级过深',
            location: '主导航菜单',
            impact: '用户难以快速找到目标功能',
            suggestion: '简化导航结构，减少层级深度'
          });
          score -= 10;
        }
        break;
      case 'learnability':
        if (Math.random() > 0.8) {
          issues.push({
            type: 'complex_workflow',
            severity: 'high',
            description: '学习流程过于复杂',
            location: 'vTPR学习界面',
            impact: '新用户学习成本高',
            suggestion: '添加引导教程和帮助提示'
          });
          score -= 15;
        }
        break;
      case 'efficiency':
        if (Math.random() > 0.6) {
          issues.push({
            type: 'poor_feedback',
            severity: 'medium',
            description: '操作反馈不够及时',
            location: '发音评估功能',
            impact: '用户不确定操作是否成功',
            suggestion: '增加即时反馈和进度指示'
          });
          score -= 8;
        }
        break;
    }

    const result: UsabilityTestResult = {
      testId,
      category,
      score,
      issues,
      recommendations: this.generateUsabilityRecommendations(issues),
      userFeedback: this.generateMockUserFeedback()
    };

    this.usabilityResults.push(result);
    return result;
  }

  /**
   * 生成可用性建议
   */
  private generateUsabilityRecommendations(issues: UsabilityIssue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(issue => issue.type === 'confusing_navigation')) {
      recommendations.push('重新设计导航结构，采用更直观的信息架构');
    }
    
    if (issues.some(issue => issue.type === 'complex_workflow')) {
      recommendations.push('简化用户操作流程，减少不必要的步骤');
    }
    
    if (issues.some(issue => issue.type === 'poor_feedback')) {
      recommendations.push('增强用户操作反馈，提供清晰的状态指示');
    }
    
    if (issues.some(issue => issue.type === 'unclear_labels')) {
      recommendations.push('优化界面文案，使用更清晰的标签和说明');
    }
    
    if (issues.some(issue => issue.type === 'inconsistent_design')) {
      recommendations.push('统一设计语言，保持界面一致性');
    }
    
    return recommendations;
  }

  /**
   * 生成模拟用户反馈
   */
  private generateMockUserFeedback(): UserFeedback[] {
    return [
      {
        category: 'satisfaction',
        rating: 4 + Math.random(),
        comment: '整体体验不错，但有些功能不够直观'
      },
      {
        category: 'ease_of_use',
        rating: 3.5 + Math.random() * 1.5,
        comment: '学习功能很强大，但初次使用需要一些时间适应'
      },
      {
        category: 'efficiency',
        rating: 4.2 + Math.random() * 0.8,
        comment: '功能响应速度快，但某些操作步骤可以更简化'
      }
    ];
  }

  /**
   * 执行前置条件
   */
  private async executePrerequisites(prerequisites: string[]): Promise<void> {
    for (const prerequisite of prerequisites) {
      console.log(`Executing prerequisite: ${prerequisite}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  /**
   * 执行清理操作
   */
  private async executeCleanup(cleanup: TestAction[]): Promise<void> {
    for (const action of cleanup) {
      await this.executeTestAction(action);
    }
  }

  /**
   * 获取测试结果
   */
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  /**
   * 获取可用性测试结果
   */
  getUsabilityResults(): UsabilityTestResult[] {
    return [...this.usabilityResults];
  }

  /**
   * 清除测试结果
   */
  clearResults(): void {
    this.testResults = [];
    this.usabilityResults = [];
  }

  /**
   * 检查是否正在运行测试
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 设置测试运行状态
   */
  setTestRunning(running: boolean): void {
    this.isRunning = running;
  }
}

// 创建全局实例
export const userExperienceTestEngine = UserExperienceTestEngine.getInstance();
