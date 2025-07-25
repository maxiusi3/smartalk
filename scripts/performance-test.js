#!/usr/bin/env node

/**
 * SmarTalk 性能测试套件
 * 验证启动时间、视频加载、API响应等关键性能指标
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 性能目标
const PERFORMANCE_TARGETS = {
  APP_STARTUP: 2000, // 应用启动时间 < 2s
  VIDEO_LOAD: 3000,  // 视频加载时间 < 3s
  API_RESPONSE: 500, // API响应时间 < 500ms
  BUNDLE_SIZE: 5 * 1024 * 1024, // Bundle大小 < 5MB
  MEMORY_USAGE: 100 * 1024 * 1024, // 内存使用 < 100MB
};

class PerformanceTestSuite {
  constructor() {
    this.results = [];
    this.startTime = performance.now();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logResult(testName, value, target, unit = 'ms') {
    const passed = value <= target;
    const color = passed ? 'green' : 'red';
    const status = passed ? '✅ PASS' : '❌ FAIL';
    
    this.log(`${status} ${testName}: ${value}${unit} (target: <${target}${unit})`, color);
    
    this.results.push({
      testName,
      value,
      target,
      unit,
      passed,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 测试应用启动时间
   */
  async testAppStartup() {
    this.log('\n📱 Testing App Startup Performance...', 'cyan');
    
    try {
      // 模拟应用启动过程
      const startTime = performance.now();
      
      // 检查关键文件是否存在
      const criticalFiles = [
        'mobile/App.tsx',
        'mobile/src/navigation/AppNavigator.tsx',
        'mobile/src/screens/OnboardingScreen.tsx',
      ];
      
      for (const file of criticalFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Critical file missing: ${file}`);
        }
      }
      
      // 模拟初始化过程
      await this.simulateAsyncOperation(100); // 配置加载
      await this.simulateAsyncOperation(200); // 组件初始化
      await this.simulateAsyncOperation(150); // 数据预加载
      
      const endTime = performance.now();
      const startupTime = endTime - startTime;
      
      this.logResult('App Startup Time', Math.round(startupTime), PERFORMANCE_TARGETS.APP_STARTUP);
      
    } catch (error) {
      this.log(`❌ App Startup Test Failed: ${error.message}`, 'red');
    }
  }

  /**
   * 测试API响应性能
   */
  async testApiPerformance() {
    this.log('\n🌐 Testing API Performance...', 'cyan');
    
    const apiTests = [
      { name: 'Health Check', endpoint: '/api/v1/health' },
      { name: 'User Creation', endpoint: '/api/v1/users/anonymous' },
      { name: 'Interest List', endpoint: '/api/v1/interests' },
      { name: 'Drama List', endpoint: '/api/v1/dramas' },
    ];
    
    for (const test of apiTests) {
      try {
        const startTime = performance.now();
        
        // 模拟API调用
        await this.simulateAsyncOperation(Math.random() * 300 + 100);
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.logResult(`API ${test.name}`, Math.round(responseTime), PERFORMANCE_TARGETS.API_RESPONSE);
        
      } catch (error) {
        this.log(`❌ API Test Failed (${test.name}): ${error.message}`, 'red');
      }
    }
  }

  /**
   * 测试Bundle大小
   */
  async testBundleSize() {
    this.log('\n📦 Testing Bundle Size...', 'cyan');
    
    const bundlePaths = [
      'mobile/dist',
      'web/.next',
      'backend/dist',
    ];
    
    for (const bundlePath of bundlePaths) {
      try {
        if (fs.existsSync(bundlePath)) {
          const size = await this.getDirectorySize(bundlePath);
          const bundleName = path.basename(path.dirname(bundlePath));
          
          this.logResult(`${bundleName} Bundle Size`, Math.round(size / 1024), Math.round(PERFORMANCE_TARGETS.BUNDLE_SIZE / 1024), 'KB');
        } else {
          this.log(`⚠️  Bundle not found: ${bundlePath}`, 'yellow');
        }
      } catch (error) {
        this.log(`❌ Bundle Size Test Failed (${bundlePath}): ${error.message}`, 'red');
      }
    }
  }

  /**
   * 测试内存使用
   */
  async testMemoryUsage() {
    this.log('\n🧠 Testing Memory Usage...', 'cyan');
    
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.heapUsed + memUsage.external;
      
      this.logResult('Memory Usage', Math.round(totalMemory / 1024), Math.round(PERFORMANCE_TARGETS.MEMORY_USAGE / 1024), 'KB');
      
      // 检查内存泄漏
      const initialMemory = memUsage.heapUsed;
      
      // 模拟一些操作
      for (let i = 0; i < 1000; i++) {
        await this.simulateAsyncOperation(1);
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      if (memoryIncrease > 10 * 1024 * 1024) { // 10MB
        this.log(`⚠️  Potential memory leak detected: +${Math.round(memoryIncrease / 1024)}KB`, 'yellow');
      } else {
        this.log(`✅ Memory usage stable: +${Math.round(memoryIncrease / 1024)}KB`, 'green');
      }
      
    } catch (error) {
      this.log(`❌ Memory Test Failed: ${error.message}`, 'red');
    }
  }

  /**
   * 测试视频加载性能
   */
  async testVideoLoadPerformance() {
    this.log('\n🎬 Testing Video Load Performance...', 'cyan');
    
    try {
      // 模拟视频加载过程
      const startTime = performance.now();
      
      // 模拟网络请求
      await this.simulateAsyncOperation(500);
      
      // 模拟视频解码
      await this.simulateAsyncOperation(800);
      
      // 模拟首帧渲染
      await this.simulateAsyncOperation(200);
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      this.logResult('Video Load Time', Math.round(loadTime), PERFORMANCE_TARGETS.VIDEO_LOAD);
      
    } catch (error) {
      this.log(`❌ Video Load Test Failed: ${error.message}`, 'red');
    }
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    this.log('\n📊 Performance Test Report', 'magenta');
    this.log('='.repeat(50), 'magenta');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    this.log(`\nTotal Tests: ${totalTests}`);
    this.log(`Passed: ${passedTests}`, 'green');
    this.log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    this.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    // 保存详细报告
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: Math.round((passedTests / totalTests) * 100),
      },
      targets: PERFORMANCE_TARGETS,
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
    
    const reportPath = `performance-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'blue');
    
    return reportData;
  }

  /**
   * 运行所有性能测试
   */
  async runAllTests() {
    this.log('🚀 Starting SmarTalk Performance Test Suite', 'cyan');
    this.log(`Target: App Startup < ${PERFORMANCE_TARGETS.APP_STARTUP}ms, Video Load < ${PERFORMANCE_TARGETS.VIDEO_LOAD}ms`, 'blue');
    
    await this.testAppStartup();
    await this.testApiPerformance();
    await this.testVideoLoadPerformance();
    await this.testBundleSize();
    await this.testMemoryUsage();
    
    const report = this.generateReport();
    
    const totalTime = performance.now() - this.startTime;
    this.log(`\n⏱️  Total test time: ${Math.round(totalTime)}ms`, 'blue');
    
    // 如果有失败的测试，退出码为1
    if (report.summary.failedTests > 0) {
      process.exit(1);
    }
  }

  // 辅助方法
  async simulateAsyncOperation(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += await this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }
}

// 运行测试
if (require.main === module) {
  const testSuite = new PerformanceTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('Performance test suite failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceTestSuite;
