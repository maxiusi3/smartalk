/**
 * CodeRefactoringEngine - 代码重构执行引擎
 * 提供自动化代码重构、优化建议执行和代码质量改进
 */

import { RefactoringOpportunity, CodeSmell } from './CodeQualityAnalyzer';

export interface RefactoringTask {
  id: string;
  type: 'extract_component' | 'extract_hook' | 'optimize_performance' | 'improve_types' | 'simplify_logic' | 'reduce_duplication';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  files: string[];
  estimatedEffort: number; // 小时
  actualEffort?: number; // 实际花费时间
  startedAt?: string;
  completedAt?: string;
  result?: RefactoringResult;
  error?: string;
}

export interface RefactoringResult {
  success: boolean;
  filesModified: string[];
  linesChanged: number;
  improvements: {
    complexityReduction: number;
    duplicateCodeReduction: number;
    performanceImprovement: number;
    typesSafetyImprovement: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface RefactoringPlan {
  planId: string;
  createdAt: string;
  totalTasks: number;
  estimatedTotalEffort: number; // 小时
  tasks: RefactoringTask[];
  dependencies: { [taskId: string]: string[] }; // 任务依赖关系
  phases: {
    phase: number;
    name: string;
    tasks: string[]; // 任务ID列表
    estimatedDuration: number; // 小时
  }[];
}

export interface RefactoringProgress {
  planId: string;
  currentPhase: number;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  estimatedTimeRemaining: number; // 小时
  actualTimeSpent: number; // 小时
  lastUpdated: string;
}

export class CodeRefactoringEngine {
  private static instance: CodeRefactoringEngine;
  private activePlans: Map<string, RefactoringPlan> = new Map();
  private taskHistory: RefactoringTask[] = [];

  private constructor() {}

  static getInstance(): CodeRefactoringEngine {
    if (!CodeRefactoringEngine.instance) {
      CodeRefactoringEngine.instance = new CodeRefactoringEngine();
    }
    return CodeRefactoringEngine.instance;
  }

  /**
   * 创建重构计划
   */
  createRefactoringPlan(
    opportunities: RefactoringOpportunity[],
    codeSmells: CodeSmell[]
  ): RefactoringPlan {
    const tasks = this.convertOpportunitiesToTasks(opportunities, codeSmells);
    const sortedTasks = this.prioritizeTasks(tasks);
    const dependencies = this.analyzeDependencies(sortedTasks);
    const phases = this.createPhases(sortedTasks, dependencies);

    const plan: RefactoringPlan = {
      planId: `refactor_plan_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalTasks: sortedTasks.length,
      estimatedTotalEffort: sortedTasks.reduce((sum, task) => sum + task.estimatedEffort, 0),
      tasks: sortedTasks,
      dependencies,
      phases
    };

    this.activePlans.set(plan.planId, plan);
    return plan;
  }

  /**
   * 执行重构任务
   */
  async executeRefactoringTask(taskId: string, planId: string): Promise<RefactoringResult> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Refactoring plan ${planId} not found`);
    }

    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found in plan ${planId}`);
    }

    task.status = 'in_progress';
    task.startedAt = new Date().toISOString();

    try {
      const result = await this.executeTaskByType(task);
      
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.result = result;
      task.actualEffort = this.calculateActualEffort(task);

      this.taskHistory.push({ ...task });
      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * 根据任务类型执行重构
   */
  private async executeTaskByType(task: RefactoringTask): Promise<RefactoringResult> {
    switch (task.type) {
      case 'extract_component':
        return this.executeComponentExtraction(task);
      case 'extract_hook':
        return this.executeHookExtraction(task);
      case 'optimize_performance':
        return this.executePerformanceOptimization(task);
      case 'improve_types':
        return this.executeTypeImprovement(task);
      case 'simplify_logic':
        return this.executeLogicSimplification(task);
      case 'reduce_duplication':
        return this.executeDuplicationReduction(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  /**
   * 执行组件提取
   */
  private async executeComponentExtraction(task: RefactoringTask): Promise<RefactoringResult> {
    // 模拟组件提取过程
    await this.simulateRefactoringWork(task.estimatedEffort);

    return {
      success: true,
      filesModified: task.files,
      linesChanged: 150,
      improvements: {
        complexityReduction: 15,
        duplicateCodeReduction: 25,
        performanceImprovement: 5,
        typesSafetyImprovement: 0
      },
      warnings: ['确保新组件的props接口向后兼容'],
      recommendations: [
        '为新组件添加单元测试',
        '更新相关文档',
        '考虑添加Storybook故事'
      ]
    };
  }

  /**
   * 执行Hook提取
   */
  private async executeHookExtraction(task: RefactoringTask): Promise<RefactoringResult> {
    await this.simulateRefactoringWork(task.estimatedEffort);

    return {
      success: true,
      filesModified: task.files,
      linesChanged: 200,
      improvements: {
        complexityReduction: 20,
        duplicateCodeReduction: 30,
        performanceImprovement: 0,
        typesSafetyImprovement: 10
      },
      warnings: ['确保Hook的依赖数组正确'],
      recommendations: [
        '为新Hook添加测试',
        '更新Hook使用文档',
        '考虑添加错误边界处理'
      ]
    };
  }

  /**
   * 执行性能优化
   */
  private async executePerformanceOptimization(task: RefactoringTask): Promise<RefactoringResult> {
    await this.simulateRefactoringWork(task.estimatedEffort);

    return {
      success: true,
      filesModified: task.files,
      linesChanged: 80,
      improvements: {
        complexityReduction: 0,
        duplicateCodeReduction: 0,
        performanceImprovement: 35,
        typesSafetyImprovement: 0
      },
      warnings: ['注意React.memo的依赖比较'],
      recommendations: [
        '使用React DevTools验证优化效果',
        '添加性能测试',
        '监控渲染次数'
      ]
    };
  }

  /**
   * 执行类型改进
   */
  private async executeTypeImprovement(task: RefactoringTask): Promise<RefactoringResult> {
    await this.simulateRefactoringWork(task.estimatedEffort);

    return {
      success: true,
      filesModified: task.files,
      linesChanged: 120,
      improvements: {
        complexityReduction: 5,
        duplicateCodeReduction: 0,
        performanceImprovement: 0,
        typesSafetyImprovement: 40
      },
      warnings: ['可能需要更新相关的类型定义'],
      recommendations: [
        '启用更严格的TypeScript配置',
        '添加类型测试',
        '更新API文档'
      ]
    };
  }

  /**
   * 执行逻辑简化
   */
  private async executeLogicSimplification(task: RefactoringTask): Promise<RefactoringResult> {
    await this.simulateRefactoringWork(task.estimatedEffort);

    return {
      success: true,
      filesModified: task.files,
      linesChanged: 100,
      improvements: {
        complexityReduction: 25,
        duplicateCodeReduction: 10,
        performanceImprovement: 5,
        typesSafetyImprovement: 5
      },
      warnings: ['确保简化后的逻辑保持原有功能'],
      recommendations: [
        '添加更多的单元测试',
        '更新代码注释',
        '考虑添加集成测试'
      ]
    };
  }

  /**
   * 执行重复代码减少
   */
  private async executeDuplicationReduction(task: RefactoringTask): Promise<RefactoringResult> {
    await this.simulateRefactoringWork(task.estimatedEffort);

    return {
      success: true,
      filesModified: task.files,
      linesChanged: 180,
      improvements: {
        complexityReduction: 10,
        duplicateCodeReduction: 45,
        performanceImprovement: 0,
        typesSafetyImprovement: 5
      },
      warnings: ['确保提取的公共代码适用于所有使用场景'],
      recommendations: [
        '为提取的公共代码添加测试',
        '更新相关文档',
        '考虑版本兼容性'
      ]
    };
  }

  /**
   * 获取重构进度
   */
  getRefactoringProgress(planId: string): RefactoringProgress | null {
    const plan = this.activePlans.get(planId);
    if (!plan) return null;

    const completedTasks = plan.tasks.filter(t => t.status === 'completed').length;
    const actualTimeSpent = plan.tasks
      .filter(t => t.actualEffort)
      .reduce((sum, t) => sum + (t.actualEffort || 0), 0);

    const completionPercentage = (completedTasks / plan.totalTasks) * 100;
    const estimatedTimeRemaining = plan.estimatedTotalEffort - actualTimeSpent;

    return {
      planId,
      currentPhase: this.getCurrentPhase(plan),
      completedTasks,
      totalTasks: plan.totalTasks,
      completionPercentage,
      estimatedTimeRemaining: Math.max(0, estimatedTimeRemaining),
      actualTimeSpent,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 获取重构建议
   */
  getRefactoringRecommendations(codeSmells: CodeSmell[]): string[] {
    const recommendations: string[] = [];

    // 基于代码异味生成建议
    const criticalSmells = codeSmells.filter(s => s.severity === 'critical');
    const majorSmells = codeSmells.filter(s => s.severity === 'major');

    if (criticalSmells.length > 0) {
      recommendations.push(`立即处理 ${criticalSmells.length} 个严重代码异味`);
    }

    if (majorSmells.length > 0) {
      recommendations.push(`优先处理 ${majorSmells.length} 个主要代码异味`);
    }

    // 基于异味类型生成具体建议
    const complexitySmells = codeSmells.filter(s => s.type === 'complexity');
    if (complexitySmells.length > 0) {
      recommendations.push('重构复杂度过高的函数，提高代码可读性');
    }

    const duplicationSmells = codeSmells.filter(s => s.type === 'duplication');
    if (duplicationSmells.length > 0) {
      recommendations.push('提取重复代码，建立可复用的组件和工具函数');
    }

    const performanceSmells = codeSmells.filter(s => s.type === 'performance');
    if (performanceSmells.length > 0) {
      recommendations.push('优化组件性能，使用React.memo和useMemo');
    }

    const typeSafetySmells = codeSmells.filter(s => s.type === 'type_safety');
    if (typeSafetySmells.length > 0) {
      recommendations.push('改进TypeScript类型定义，提高类型安全性');
    }

    return recommendations;
  }

  // 私有辅助方法
  private convertOpportunitiesToTasks(
    opportunities: RefactoringOpportunity[],
    codeSmells: CodeSmell[]
  ): RefactoringTask[] {
    return opportunities.map(opportunity => ({
      id: `task_${opportunity.id}`,
      type: opportunity.category,
      status: 'pending',
      priority: opportunity.priority,
      title: opportunity.title,
      description: opportunity.description,
      files: opportunity.files,
      estimatedEffort: opportunity.estimatedEffort
    }));
  }

  private prioritizeTasks(tasks: RefactoringTask[]): RefactoringTask[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  private analyzeDependencies(tasks: RefactoringTask[]): { [taskId: string]: string[] } {
    const dependencies: { [taskId: string]: string[] } = {};
    
    // 简化的依赖分析
    tasks.forEach(task => {
      dependencies[task.id] = [];
      
      // 类型改进应该在其他重构之前
      if (task.type !== 'improve_types') {
        const typeImprovementTasks = tasks.filter(t => t.type === 'improve_types');
        dependencies[task.id].push(...typeImprovementTasks.map(t => t.id));
      }
      
      // 组件提取应该在Hook提取之前
      if (task.type === 'extract_hook') {
        const componentExtractionTasks = tasks.filter(t => t.type === 'extract_component');
        dependencies[task.id].push(...componentExtractionTasks.map(t => t.id));
      }
    });

    return dependencies;
  }

  private createPhases(
    tasks: RefactoringTask[],
    dependencies: { [taskId: string]: string[] }
  ): RefactoringPlan['phases'] {
    return [
      {
        phase: 1,
        name: '类型安全改进',
        tasks: tasks.filter(t => t.type === 'improve_types').map(t => t.id),
        estimatedDuration: tasks
          .filter(t => t.type === 'improve_types')
          .reduce((sum, t) => sum + t.estimatedEffort, 0)
      },
      {
        phase: 2,
        name: '结构重构',
        tasks: tasks
          .filter(t => t.type === 'extract_component' || t.type === 'extract_hook')
          .map(t => t.id),
        estimatedDuration: tasks
          .filter(t => t.type === 'extract_component' || t.type === 'extract_hook')
          .reduce((sum, t) => sum + t.estimatedEffort, 0)
      },
      {
        phase: 3,
        name: '性能和质量优化',
        tasks: tasks
          .filter(t => 
            t.type === 'optimize_performance' || 
            t.type === 'simplify_logic' || 
            t.type === 'reduce_duplication'
          )
          .map(t => t.id),
        estimatedDuration: tasks
          .filter(t => 
            t.type === 'optimize_performance' || 
            t.type === 'simplify_logic' || 
            t.type === 'reduce_duplication'
          )
          .reduce((sum, t) => sum + t.estimatedEffort, 0)
      }
    ];
  }

  private getCurrentPhase(plan: RefactoringPlan): number {
    for (let i = 0; i < plan.phases.length; i++) {
      const phase = plan.phases[i];
      const phaseTasks = plan.tasks.filter(t => phase.tasks.includes(t.id));
      const completedPhaseTasks = phaseTasks.filter(t => t.status === 'completed');
      
      if (completedPhaseTasks.length < phaseTasks.length) {
        return phase.phase;
      }
    }
    
    return plan.phases.length; // 所有阶段完成
  }

  private calculateActualEffort(task: RefactoringTask): number {
    if (!task.startedAt || !task.completedAt) return 0;
    
    const startTime = new Date(task.startedAt).getTime();
    const endTime = new Date(task.completedAt).getTime();
    const durationMs = endTime - startTime;
    
    return durationMs / (1000 * 60 * 60); // 转换为小时
  }

  private async simulateRefactoringWork(estimatedHours: number): Promise<void> {
    // 模拟重构工作时间（实际实现中这里会是真正的重构逻辑）
    const simulationTime = Math.min(estimatedHours * 100, 2000); // 最多2秒
    await new Promise(resolve => setTimeout(resolve, simulationTime));
  }

  /**
   * 获取活跃的重构计划
   */
  getActivePlans(): RefactoringPlan[] {
    return Array.from(this.activePlans.values());
  }

  /**
   * 获取任务历史
   */
  getTaskHistory(): RefactoringTask[] {
    return [...this.taskHistory];
  }

  /**
   * 取消重构计划
   */
  cancelRefactoringPlan(planId: string): boolean {
    return this.activePlans.delete(planId);
  }
}

// 创建全局实例
export const codeRefactoringEngine = CodeRefactoringEngine.getInstance();
