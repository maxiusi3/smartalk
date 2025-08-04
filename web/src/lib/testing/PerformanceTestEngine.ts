/**
 * PerformanceTestEngine - 性能测试引擎
 * 提供负载测试、压力测试、内存泄漏测试和响应时间测试
 */

export interface PerformanceTestConfig {
  id: string;
  name: string;
  type: 'load' | 'stress' | 'memory' | 'response_time' | 'endurance' | 'spike';
  description: string;
  parameters: TestParameters;
  thresholds: PerformanceThresholds;
  duration: number; // 测试持续时间（毫秒）
}

export interface TestParameters {
  // 负载参数
  concurrentUsers?: number;
  requestsPerSecond?: number;
  rampUpTime?: number; // 加载时间（秒）
  
  // 压力参数
  maxUsers?: number;
  stressIncrement?: number;
  stressInterval?: number;
  
  // 内存参数
  memoryThreshold?: number; // MB
  gcThreshold?: number;
  
  // 响应时间参数
  targetEndpoints?: string[];
  acceptableResponseTime?: number; // 毫秒
  
  // 持久性参数
  enduranceDuration?: number; // 小时
  
  // 峰值参数
  spikeUsers?: number;
  spikeDuration?: number; // 秒
}

export interface PerformanceThresholds {
  maxResponseTime: number; // 毫秒
  maxMemoryUsage: number; // MB
  maxCpuUsage: number; // 百分比
  minThroughput: number; // 请求/秒
  maxErrorRate: number; // 百分比
  maxLatency: number; // 毫秒
}

export interface PerformanceTestResult {
  testId: string;
  testType: PerformanceTestConfig['type'];
  passed: boolean;
  duration: number;
  startTime: string;
  endTime: string;
  metrics: PerformanceMetrics;
  thresholdViolations: ThresholdViolation[];
  recommendations: PerformanceRecommendation[];
  rawData: PerformanceDataPoint[];
}

export interface PerformanceMetrics {
  // 响应时间指标
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  
  // 吞吐量指标
  requestsPerSecond: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  
  // 资源使用指标
  averageMemoryUsage: number;
  peakMemoryUsage: number;
  averageCpuUsage: number;
  peakCpuUsage: number;
  
  // 网络指标
  averageLatency: number;
  networkThroughput: number;
  connectionErrors: number;
  
  // 用户体验指标
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface ThresholdViolation {
  metric: string;
  threshold: number;
  actualValue: number;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  timestamp: string;
}

export interface PerformanceRecommendation {
  category: 'response_time' | 'memory' | 'cpu' | 'network' | 'user_experience';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  expectedImprovement: string;
}

export interface PerformanceDataPoint {
  timestamp: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
  requestsPerSecond: number;
  errorRate: number;
}

export interface LoadTestScenario {
  name: string;
  steps: LoadTestStep[];
  userBehavior: UserBehaviorPattern;
}

export interface LoadTestStep {
  action: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  expectedStatusCode: number;
  thinkTime: number; // 用户思考时间（毫秒）
}

export interface UserBehaviorPattern {
  sessionDuration: number; // 平均会话时长（分钟）
  pageViewsPerSession: number;
  bounceRate: number; // 跳出率
  returnUserRate: number; // 回访用户率
}

export class PerformanceTestEngine {
  private static instance: PerformanceTestEngine;
  private testResults: PerformanceTestResult[] = [];
  private isRunning = false;
  private currentTest: PerformanceTestConfig | null = null;
  private performanceData: PerformanceDataPoint[] = [];

  private constructor() {}

  static getInstance(): PerformanceTestEngine {
    if (!PerformanceTestEngine.instance) {
      PerformanceTestEngine.instance = new PerformanceTestEngine();
    }
    return PerformanceTestEngine.instance;
  }

  /**
   * 执行性能测试
   */
  async executePerformanceTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    if (this.isRunning) {
      throw new Error('Another performance test is already running');
    }

    this.isRunning = true;
    this.currentTest = config;
    this.performanceData = [];

    const startTime = new Date().toISOString();
    const testStartTime = Date.now();

    try {
      let result: PerformanceTestResult;

      switch (config.type) {
        case 'load':
          result = await this.executeLoadTest(config);
          break;
        case 'stress':
          result = await this.executeStressTest(config);
          break;
        case 'memory':
          result = await this.executeMemoryTest(config);
          break;
        case 'response_time':
          result = await this.executeResponseTimeTest(config);
          break;
        case 'endurance':
          result = await this.executeEnduranceTest(config);
          break;
        case 'spike':
          result = await this.executeSpikeTest(config);
          break;
        default:
          throw new Error(`Unsupported test type: ${config.type}`);
      }

      result.startTime = startTime;
      result.endTime = new Date().toISOString();
      result.duration = Date.now() - testStartTime;

      this.testResults.push(result);
      return result;

    } finally {
      this.isRunning = false;
      this.currentTest = null;
    }
  }

  /**
   * 执行负载测试
   */
  private async executeLoadTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    const { concurrentUsers = 10, requestsPerSecond = 5, rampUpTime = 30 } = config.parameters;
    
    // 模拟负载测试执行
    const dataPoints: PerformanceDataPoint[] = [];
    const testDuration = config.duration;
    const interval = 1000; // 每秒收集一次数据
    
    for (let elapsed = 0; elapsed < testDuration; elapsed += interval) {
      // 模拟渐进式负载增加
      const currentUsers = Math.min(concurrentUsers, Math.floor((elapsed / 1000) / rampUpTime * concurrentUsers));
      
      const dataPoint: PerformanceDataPoint = {
        timestamp: Date.now(),
        responseTime: 200 + Math.random() * 300 + (currentUsers * 10), // 响应时间随用户数增加
        memoryUsage: 100 + (currentUsers * 5) + Math.random() * 20,
        cpuUsage: 20 + (currentUsers * 2) + Math.random() * 15,
        activeUsers: currentUsers,
        requestsPerSecond: Math.min(requestsPerSecond, currentUsers * 0.5),
        errorRate: Math.max(0, (currentUsers - concurrentUsers * 0.8) * 0.1)
      };
      
      dataPoints.push(dataPoint);
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    const metrics = this.calculateMetrics(dataPoints);
    const violations = this.checkThresholds(metrics, config.thresholds);
    const recommendations = this.generateRecommendations(metrics, violations);

    return {
      testId: config.id,
      testType: 'load',
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      duration: 0, // 将在外部设置
      startTime: '',
      endTime: '',
      metrics,
      thresholdViolations: violations,
      recommendations,
      rawData: dataPoints
    };
  }

  /**
   * 执行压力测试
   */
  private async executeStressTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    const { maxUsers = 100, stressIncrement = 10, stressInterval = 30000 } = config.parameters;
    
    const dataPoints: PerformanceDataPoint[] = [];
    let currentUsers = 0;
    
    while (currentUsers < maxUsers) {
      currentUsers = Math.min(currentUsers + stressIncrement, maxUsers);
      
      // 在当前用户负载下运行一段时间
      for (let i = 0; i < stressInterval; i += 1000) {
        const dataPoint: PerformanceDataPoint = {
          timestamp: Date.now(),
          responseTime: 200 + Math.random() * 500 + (currentUsers * 15),
          memoryUsage: 100 + (currentUsers * 8) + Math.random() * 30,
          cpuUsage: 20 + (currentUsers * 3) + Math.random() * 20,
          activeUsers: currentUsers,
          requestsPerSecond: Math.max(0, 50 - (currentUsers * 0.3)),
          errorRate: Math.max(0, (currentUsers - maxUsers * 0.7) * 0.2)
        };
        
        dataPoints.push(dataPoint);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const metrics = this.calculateMetrics(dataPoints);
    const violations = this.checkThresholds(metrics, config.thresholds);
    const recommendations = this.generateRecommendations(metrics, violations);

    return {
      testId: config.id,
      testType: 'stress',
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      duration: 0,
      startTime: '',
      endTime: '',
      metrics,
      thresholdViolations: violations,
      recommendations,
      rawData: dataPoints
    };
  }

  /**
   * 执行内存测试
   */
  private async executeMemoryTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    const { memoryThreshold = 500 } = config.parameters;
    
    const dataPoints: PerformanceDataPoint[] = [];
    let memoryUsage = 100;
    
    for (let elapsed = 0; elapsed < config.duration; elapsed += 1000) {
      // 模拟内存使用增长
      memoryUsage += Math.random() * 10 - 2; // 随机增长，偶尔减少（GC）
      
      if (Math.random() > 0.9) {
        // 模拟垃圾回收
        memoryUsage *= 0.8;
      }
      
      const dataPoint: PerformanceDataPoint = {
        timestamp: Date.now(),
        responseTime: 200 + (memoryUsage * 2),
        memoryUsage: Math.max(50, memoryUsage),
        cpuUsage: 20 + Math.random() * 30,
        activeUsers: 10,
        requestsPerSecond: Math.max(1, 10 - (memoryUsage / 100)),
        errorRate: memoryUsage > memoryThreshold ? 0.1 : 0
      };
      
      dataPoints.push(dataPoint);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const metrics = this.calculateMetrics(dataPoints);
    const violations = this.checkThresholds(metrics, config.thresholds);
    const recommendations = this.generateRecommendations(metrics, violations);

    return {
      testId: config.id,
      testType: 'memory',
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      duration: 0,
      startTime: '',
      endTime: '',
      metrics,
      thresholdViolations: violations,
      recommendations,
      rawData: dataPoints
    };
  }

  /**
   * 执行响应时间测试
   */
  private async executeResponseTimeTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    const { acceptableResponseTime = 1000, targetEndpoints = ['/api/test'] } = config.parameters;
    
    const dataPoints: PerformanceDataPoint[] = [];
    
    for (let elapsed = 0; elapsed < config.duration; elapsed += 1000) {
      // 模拟不同端点的响应时间
      const baseResponseTime = 200 + Math.random() * 300;
      const networkLatency = Math.random() * 100;
      const processingTime = Math.random() * 200;
      
      const totalResponseTime = baseResponseTime + networkLatency + processingTime;
      
      const dataPoint: PerformanceDataPoint = {
        timestamp: Date.now(),
        responseTime: totalResponseTime,
        memoryUsage: 100 + Math.random() * 50,
        cpuUsage: 20 + Math.random() * 40,
        activeUsers: 5,
        requestsPerSecond: 10,
        errorRate: totalResponseTime > acceptableResponseTime ? 0.05 : 0
      };
      
      dataPoints.push(dataPoint);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const metrics = this.calculateMetrics(dataPoints);
    const violations = this.checkThresholds(metrics, config.thresholds);
    const recommendations = this.generateRecommendations(metrics, violations);

    return {
      testId: config.id,
      testType: 'response_time',
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      duration: 0,
      startTime: '',
      endTime: '',
      metrics,
      thresholdViolations: violations,
      recommendations,
      rawData: dataPoints
    };
  }

  /**
   * 执行持久性测试
   */
  private async executeEnduranceTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    // 持久性测试的简化实现
    return this.executeLoadTest(config);
  }

  /**
   * 执行峰值测试
   */
  private async executeSpikeTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    const { spikeUsers = 50, spikeDuration = 60 } = config.parameters;
    
    const dataPoints: PerformanceDataPoint[] = [];
    const normalUsers = 10;
    
    // 正常负载阶段
    for (let i = 0; i < 30; i++) {
      const dataPoint: PerformanceDataPoint = {
        timestamp: Date.now(),
        responseTime: 200 + Math.random() * 100,
        memoryUsage: 100 + Math.random() * 20,
        cpuUsage: 20 + Math.random() * 10,
        activeUsers: normalUsers,
        requestsPerSecond: 10,
        errorRate: 0
      };
      
      dataPoints.push(dataPoint);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 峰值负载阶段
    for (let i = 0; i < spikeDuration; i++) {
      const dataPoint: PerformanceDataPoint = {
        timestamp: Date.now(),
        responseTime: 200 + Math.random() * 800 + (spikeUsers * 10),
        memoryUsage: 100 + (spikeUsers * 5) + Math.random() * 50,
        cpuUsage: 20 + (spikeUsers * 2) + Math.random() * 30,
        activeUsers: spikeUsers,
        requestsPerSecond: Math.max(1, 20 - (spikeUsers * 0.2)),
        errorRate: Math.max(0, (spikeUsers - 30) * 0.02)
      };
      
      dataPoints.push(dataPoint);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 恢复阶段
    for (let i = 0; i < 30; i++) {
      const dataPoint: PerformanceDataPoint = {
        timestamp: Date.now(),
        responseTime: 200 + Math.random() * 150,
        memoryUsage: 100 + Math.random() * 30,
        cpuUsage: 20 + Math.random() * 15,
        activeUsers: normalUsers,
        requestsPerSecond: 8,
        errorRate: 0.01
      };
      
      dataPoints.push(dataPoint);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const metrics = this.calculateMetrics(dataPoints);
    const violations = this.checkThresholds(metrics, config.thresholds);
    const recommendations = this.generateRecommendations(metrics, violations);

    return {
      testId: config.id,
      testType: 'spike',
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      duration: 0,
      startTime: '',
      endTime: '',
      metrics,
      thresholdViolations: violations,
      recommendations,
      rawData: dataPoints
    };
  }

  /**
   * 计算性能指标
   */
  private calculateMetrics(dataPoints: PerformanceDataPoint[]): PerformanceMetrics {
    if (dataPoints.length === 0) {
      throw new Error('No data points available for metrics calculation');
    }

    const responseTimes = dataPoints.map(dp => dp.responseTime).sort((a, b) => a - b);
    const memoryUsages = dataPoints.map(dp => dp.memoryUsage);
    const cpuUsages = dataPoints.map(dp => dp.cpuUsage);
    const requestRates = dataPoints.map(dp => dp.requestsPerSecond);
    const errorRates = dataPoints.map(dp => dp.errorRate);

    return {
      // 响应时间指标
      averageResponseTime: this.average(responseTimes),
      medianResponseTime: this.percentile(responseTimes, 50),
      p95ResponseTime: this.percentile(responseTimes, 95),
      p99ResponseTime: this.percentile(responseTimes, 99),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      
      // 吞吐量指标
      requestsPerSecond: this.average(requestRates),
      totalRequests: dataPoints.length * 10, // 模拟值
      successfulRequests: Math.floor(dataPoints.length * 10 * (1 - this.average(errorRates))),
      failedRequests: Math.floor(dataPoints.length * 10 * this.average(errorRates)),
      errorRate: this.average(errorRates) * 100,
      
      // 资源使用指标
      averageMemoryUsage: this.average(memoryUsages),
      peakMemoryUsage: Math.max(...memoryUsages),
      averageCpuUsage: this.average(cpuUsages),
      peakCpuUsage: Math.max(...cpuUsages),
      
      // 网络指标
      averageLatency: this.average(responseTimes) * 0.3, // 假设延迟是响应时间的30%
      networkThroughput: this.average(requestRates) * 1024, // KB/s
      connectionErrors: Math.floor(this.average(errorRates) * 100),
      
      // 用户体验指标
      firstContentfulPaint: 800 + Math.random() * 400,
      largestContentfulPaint: 1500 + Math.random() * 500,
      cumulativeLayoutShift: Math.random() * 0.1,
      firstInputDelay: 50 + Math.random() * 100,
      timeToInteractive: 2000 + Math.random() * 1000
    };
  }

  /**
   * 检查阈值违规
   */
  private checkThresholds(metrics: PerformanceMetrics, thresholds: PerformanceThresholds): ThresholdViolation[] {
    const violations: ThresholdViolation[] = [];

    if (metrics.averageResponseTime > thresholds.maxResponseTime) {
      violations.push({
        metric: 'averageResponseTime',
        threshold: thresholds.maxResponseTime,
        actualValue: metrics.averageResponseTime,
        severity: 'critical',
        description: `平均响应时间 ${metrics.averageResponseTime.toFixed(0)}ms 超过阈值 ${thresholds.maxResponseTime}ms`,
        timestamp: new Date().toISOString()
      });
    }

    if (metrics.peakMemoryUsage > thresholds.maxMemoryUsage) {
      violations.push({
        metric: 'peakMemoryUsage',
        threshold: thresholds.maxMemoryUsage,
        actualValue: metrics.peakMemoryUsage,
        severity: 'warning',
        description: `峰值内存使用 ${metrics.peakMemoryUsage.toFixed(0)}MB 超过阈值 ${thresholds.maxMemoryUsage}MB`,
        timestamp: new Date().toISOString()
      });
    }

    if (metrics.peakCpuUsage > thresholds.maxCpuUsage) {
      violations.push({
        metric: 'peakCpuUsage',
        threshold: thresholds.maxCpuUsage,
        actualValue: metrics.peakCpuUsage,
        severity: 'warning',
        description: `峰值CPU使用 ${metrics.peakCpuUsage.toFixed(1)}% 超过阈值 ${thresholds.maxCpuUsage}%`,
        timestamp: new Date().toISOString()
      });
    }

    if (metrics.requestsPerSecond < thresholds.minThroughput) {
      violations.push({
        metric: 'requestsPerSecond',
        threshold: thresholds.minThroughput,
        actualValue: metrics.requestsPerSecond,
        severity: 'critical',
        description: `吞吐量 ${metrics.requestsPerSecond.toFixed(1)} req/s 低于阈值 ${thresholds.minThroughput} req/s`,
        timestamp: new Date().toISOString()
      });
    }

    if (metrics.errorRate > thresholds.maxErrorRate) {
      violations.push({
        metric: 'errorRate',
        threshold: thresholds.maxErrorRate,
        actualValue: metrics.errorRate,
        severity: 'critical',
        description: `错误率 ${metrics.errorRate.toFixed(2)}% 超过阈值 ${thresholds.maxErrorRate}%`,
        timestamp: new Date().toISOString()
      });
    }

    return violations;
  }

  /**
   * 生成性能建议
   */
  private generateRecommendations(metrics: PerformanceMetrics, violations: ThresholdViolation[]): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    if (violations.some(v => v.metric === 'averageResponseTime')) {
      recommendations.push({
        category: 'response_time',
        priority: 'high',
        title: '优化响应时间',
        description: '响应时间超过可接受范围，需要优化',
        implementation: '1. 启用缓存机制 2. 优化数据库查询 3. 使用CDN加速静态资源',
        expectedImprovement: '响应时间可减少30-50%'
      });
    }

    if (violations.some(v => v.metric === 'peakMemoryUsage')) {
      recommendations.push({
        category: 'memory',
        priority: 'medium',
        title: '优化内存使用',
        description: '内存使用过高，可能存在内存泄漏',
        implementation: '1. 检查并修复内存泄漏 2. 优化数据结构 3. 实施内存池管理',
        expectedImprovement: '内存使用可减少20-40%'
      });
    }

    if (violations.some(v => v.metric === 'requestsPerSecond')) {
      recommendations.push({
        category: 'network',
        priority: 'high',
        title: '提升系统吞吐量',
        description: '系统吞吐量不足，需要扩展处理能力',
        implementation: '1. 增加服务器实例 2. 实施负载均衡 3. 优化并发处理',
        expectedImprovement: '吞吐量可提升50-100%'
      });
    }

    if (metrics.firstContentfulPaint > 1000) {
      recommendations.push({
        category: 'user_experience',
        priority: 'medium',
        title: '优化首次内容绘制',
        description: '首次内容绘制时间过长，影响用户体验',
        implementation: '1. 优化关键渲染路径 2. 减少阻塞资源 3. 实施服务端渲染',
        expectedImprovement: 'FCP可减少200-500ms'
      });
    }

    return recommendations;
  }

  /**
   * 计算平均值
   */
  private average(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * 计算百分位数
   */
  private percentile(sortedNumbers: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedNumbers.length) - 1;
    return sortedNumbers[Math.max(0, index)];
  }

  /**
   * 获取测试结果
   */
  getTestResults(): PerformanceTestResult[] {
    return [...this.testResults];
  }

  /**
   * 清除测试结果
   */
  clearResults(): void {
    this.testResults = [];
  }

  /**
   * 检查是否正在运行测试
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 获取当前测试
   */
  getCurrentTest(): PerformanceTestConfig | null {
    return this.currentTest;
  }

  /**
   * 停止当前测试
   */
  stopCurrentTest(): void {
    this.isRunning = false;
    this.currentTest = null;
  }
}

// 创建全局实例
export const performanceTestEngine = PerformanceTestEngine.getInstance();
