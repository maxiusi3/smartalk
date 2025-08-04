/**
 * BasicPronunciationService - 基础发音评估服务 (Web版本)
 * 移植自 mobile/src/services/PronunciationAssessmentService.ts
 * 提供Web环境下的发音评估功能，目标响应时间 < 2秒
 */

import { webAudioAdapter, RecordingResult } from '../adapters/WebAudioAdapter';
import { webStorageAdapter } from '../adapters/WebStorageAdapter';
import { webAnalyticsAdapter } from '../adapters/WebAnalyticsAdapter';
import { progressManager } from '../progressManager';
import { performanceMonitor } from '../utils/PerformanceMonitor';

// 发音评估结果
export interface PronunciationAssessment {
  id: string;
  keywordId: string;
  userId: string;
  audioUrl: string;
  targetText: string;
  
  // 总体评分
  overallScore: number; // 0-100
  accuracy: number; // 准确度 0-100
  fluency: number; // 流利度 0-100
  completeness: number; // 完整度 0-100
  prosody: number; // 韵律 0-100
  
  // 简化的分析数据
  feedback: PronunciationFeedback;
  recommendations: string[];
  
  // 元数据
  duration: number; // 录音时长（毫秒）
  recordingQuality: 'excellent' | 'good' | 'fair' | 'poor';
  assessmentTime: number; // 评估耗时（毫秒）
  createdAt: string;
  
  // 比较数据
  previousScore?: number;
  improvement?: number;
}

// 发音反馈
export interface PronunciationFeedback {
  overallMessage: string;
  strengths: string[];
  weaknesses: string[];
  specificTips: string[];
  encouragement: string;
}

// 讯飞API配置
export interface IFlytekConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  timeout: number;
}

// API响应
interface ProviderResponse {
  provider: 'iflytek' | 'mock';
  success: boolean;
  responseTime: number;
  overallScore: number;
  accuracyScore?: number;
  fluencyScore?: number;
  completenessScore?: number;
  error?: string;
  rawResponse?: any;
}

export class BasicPronunciationService {
  private static instance: BasicPronunciationService;
  private responseTimeThreshold = 2000; // 2秒响应时间目标
  
  // 讯飞API配置
  private iflytekConfig: IFlytekConfig = {
    appId: process.env.NEXT_PUBLIC_IFLYTEK_APP_ID || '',
    apiKey: process.env.NEXT_PUBLIC_IFLYTEK_API_KEY || '',
    apiSecret: process.env.NEXT_PUBLIC_IFLYTEK_API_SECRET || '',
    baseUrl: 'https://api.xfyun.cn/v1/service/v1/ise',
    timeout: 2000
  };

  // 存储键
  private readonly STORAGE_KEY_ASSESSMENTS = 'pronunciation_assessments';
  private readonly STORAGE_KEY_STATS = 'pronunciation_stats';

  static getInstance(): BasicPronunciationService {
    if (!BasicPronunciationService.instance) {
      BasicPronunciationService.instance = new BasicPronunciationService();
    }
    return BasicPronunciationService.instance;
  }

  /**
   * 开始录音
   */
  async startRecording(keywordId: string, targetText: string): Promise<void> {
    try {
      // 检查麦克风权限
      const hasPermission = await webAudioAdapter.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('需要麦克风权限才能进行发音评估');
      }

      // 开始录音
      await webAudioAdapter.startRecording({
        maxDuration: 10000, // 10秒最大录音时长
        autoStop: true,
        silenceThreshold: 0.1
      });

      // 记录分析事件
      await webAnalyticsAdapter.trackEvent({
        eventName: 'pronunciation_recording_started',
        parameters: {
          keyword_id: keywordId,
          target_text: targetText,
          timestamp: Date.now()
        }
      });

    } catch (error) {
      console.error('录音启动失败:', error);
      throw error;
    }
  }

  /**
   * 停止录音并进行评估
   */
  async stopRecordingAndAssess(
    keywordId: string,
    targetText: string,
    userId: string
  ): Promise<PronunciationAssessment> {
    try {
      // 开始性能监控
      const startTime = Date.now();
      performanceMonitor.startFocusModeActivation(); // 复用性能监控

      // 停止录音
      const recordingResult = await webAudioAdapter.stopRecording();
      
      // 检查录音质量
      if (recordingResult.analysis.quality === 'poor') {
        throw new Error('录音质量较差，请在安静环境中重新录音');
      }

      // 进行发音评估
      const assessment = await this.assessPronunciation(
        keywordId,
        recordingResult,
        targetText,
        userId
      );

      const totalTime = Date.now() - startTime;
      assessment.assessmentTime = totalTime;

      // 检查响应时间
      if (totalTime > this.responseTimeThreshold) {
        console.warn(`发音评估响应时间超标: ${totalTime}ms > ${this.responseTimeThreshold}ms`);
      }

      // 保存评估结果
      await this.saveAssessment(assessment);

      // 记录性能
      performanceMonitor.endFocusModeActivation();
      performanceMonitor.recordInteractionTime(totalTime);

      // 记录分析事件
      await webAnalyticsAdapter.trackEvent({
        eventName: 'pronunciation_assessment_completed',
        parameters: {
          keyword_id: keywordId,
          user_id: userId,
          overall_score: assessment.overallScore,
          assessment_time: totalTime,
          recording_quality: assessment.recordingQuality
        }
      });

      return assessment;

    } catch (error) {
      console.error('发音评估失败:', error);
      
      // 记录错误事件
      await webAnalyticsAdapter.trackEvent({
        eventName: 'pronunciation_assessment_failed',
        parameters: {
          keyword_id: keywordId,
          user_id: userId,
          error: error instanceof Error ? error.message : '未知错误'
        }
      });

      throw error;
    }
  }

  /**
   * 取消录音
   */
  cancelRecording(): void {
    webAudioAdapter.cancelRecording();
  }

  /**
   * 获取录音状态
   */
  getRecordingState() {
    return webAudioAdapter.getRecordingState();
  }

  /**
   * 执行发音评估
   */
  private async assessPronunciation(
    keywordId: string,
    recordingResult: RecordingResult,
    targetText: string,
    userId: string
  ): Promise<PronunciationAssessment> {
    try {
      // 尝试使用讯飞API评估
      let providerResponse: ProviderResponse;
      
      if (this.iflytekConfig.appId && this.iflytekConfig.apiKey) {
        providerResponse = await this.assessWithIflytek(
          recordingResult.base64Data,
          targetText
        );
      } else {
        // 使用模拟评估
        providerResponse = await this.assessWithMock(
          recordingResult,
          targetText
        );
      }

      // 生成完整的评估结果
      const assessment = await this.generateAssessment(
        keywordId,
        recordingResult,
        targetText,
        userId,
        providerResponse
      );

      return assessment;

    } catch (error) {
      console.error('发音评估执行失败:', error);
      
      // 返回默认评估结果
      return this.generateFallbackAssessment(
        keywordId,
        recordingResult,
        targetText,
        userId
      );
    }
  }

  /**
   * 使用讯飞API进行评估
   */
  private async assessWithIflytek(
    audioBase64: string,
    targetText: string
  ): Promise<ProviderResponse> {
    const startTime = Date.now();

    try {
      // 构建讯飞API请求
      const requestData = {
        common: {
          app_id: this.iflytekConfig.appId,
        },
        business: {
          category: 'read_sentence',
          language: 'en_us',
          group: 'pupil',
          text: targetText,
        },
        data: {
          data: audioBase64,
          encoding: 'raw',
          sample_rate: 16000,
          channels: 1,
          bit_depth: 16,
        },
      };

      // 发送请求
      const response = await fetch(this.iflytekConfig.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.generateIflytekAuth(),
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(this.iflytekConfig.timeout)
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`讯飞API请求失败: ${response.status}`);
      }

      const result = await response.json();

      // 解析讯飞响应
      const overallScore = result.data?.read_sentence?.rec_paper?.read_chapter?.score || 0;
      const accuracyScore = result.data?.read_sentence?.rec_paper?.read_chapter?.accuracy_score || 0;
      const fluencyScore = result.data?.read_sentence?.rec_paper?.read_chapter?.fluency_score || 0;
      const completenessScore = result.data?.read_sentence?.rec_paper?.read_chapter?.completeness_score || 0;

      return {
        provider: 'iflytek',
        success: true,
        responseTime,
        overallScore: Math.round(overallScore),
        accuracyScore: Math.round(accuracyScore),
        fluencyScore: Math.round(fluencyScore),
        completenessScore: Math.round(completenessScore),
        rawResponse: result,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('讯飞API评估失败:', error);

      return {
        provider: 'iflytek',
        success: false,
        responseTime,
        overallScore: 0,
        error: error instanceof Error ? error.message : '讯飞API评估失败',
      };
    }
  }

  /**
   * 模拟发音评估（用于开发和测试）
   */
  private async assessWithMock(
    recordingResult: RecordingResult,
    targetText: string
  ): Promise<ProviderResponse> {
    const startTime = Date.now();

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // 基于录音质量生成模拟分数
    const qualityMultiplier = {
      'excellent': 0.9,
      'good': 0.8,
      'fair': 0.7,
      'poor': 0.5
    }[recordingResult.analysis.quality];

    const baseScore = 60 + Math.random() * 30; // 60-90基础分
    const overallScore = Math.round(baseScore * qualityMultiplier);
    
    const responseTime = Date.now() - startTime;

    return {
      provider: 'mock',
      success: true,
      responseTime,
      overallScore,
      accuracyScore: Math.round(overallScore + (Math.random() - 0.5) * 10),
      fluencyScore: Math.round(overallScore + (Math.random() - 0.5) * 15),
      completenessScore: Math.round(overallScore + (Math.random() - 0.5) * 8),
    };
  }

  /**
   * 生成完整评估结果
   */
  private async generateAssessment(
    keywordId: string,
    recordingResult: RecordingResult,
    targetText: string,
    userId: string,
    providerResponse: ProviderResponse
  ): Promise<PronunciationAssessment> {
    // 获取历史分数
    const previousScore = await this.getPreviousScore(userId, keywordId);
    const improvement = previousScore ? providerResponse.overallScore - previousScore : 0;

    // 生成反馈
    const feedback = this.generateFeedback(
      providerResponse.overallScore,
      providerResponse.accuracyScore || 0,
      providerResponse.fluencyScore || 0,
      providerResponse.completenessScore || 0
    );

    // 生成建议
    const recommendations = this.generateRecommendations(
      providerResponse.overallScore,
      targetText
    );

    const assessment: PronunciationAssessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      keywordId,
      userId,
      audioUrl: recordingResult.audioUrl,
      targetText,
      overallScore: providerResponse.overallScore,
      accuracy: providerResponse.accuracyScore || providerResponse.overallScore,
      fluency: providerResponse.fluencyScore || providerResponse.overallScore,
      completeness: providerResponse.completenessScore || providerResponse.overallScore,
      prosody: Math.round(providerResponse.overallScore + (Math.random() - 0.5) * 10),
      feedback,
      recommendations,
      duration: recordingResult.analysis.duration,
      recordingQuality: recordingResult.analysis.quality,
      assessmentTime: 0, // 将在外部设置
      createdAt: new Date().toISOString(),
      previousScore,
      improvement,
    };

    return assessment;
  }

  /**
   * 生成回退评估结果
   */
  private generateFallbackAssessment(
    keywordId: string,
    recordingResult: RecordingResult,
    targetText: string,
    userId: string
  ): PronunciationAssessment {
    const fallbackScore = 70; // 默认分数

    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      keywordId,
      userId,
      audioUrl: recordingResult.audioUrl,
      targetText,
      overallScore: fallbackScore,
      accuracy: fallbackScore,
      fluency: fallbackScore,
      completeness: fallbackScore,
      prosody: fallbackScore,
      feedback: {
        overallMessage: '评估服务暂时不可用，但您的发音练习已记录。',
        strengths: ['坚持练习发音'],
        weaknesses: [],
        specificTips: ['继续练习，保持语音清晰'],
        encouragement: '继续加油！每次练习都是进步。'
      },
      recommendations: ['继续练习发音', '保持录音环境安静'],
      duration: recordingResult.analysis.duration,
      recordingQuality: recordingResult.analysis.quality,
      assessmentTime: 1000,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 生成发音反馈
   */
  private generateFeedback(
    overallScore: number,
    accuracy: number,
    fluency: number,
    completeness: number
  ): PronunciationFeedback {
    const feedback: PronunciationFeedback = {
      overallMessage: '',
      strengths: [],
      weaknesses: [],
      specificTips: [],
      encouragement: ''
    };

    // 总体评价
    if (overallScore >= 90) {
      feedback.overallMessage = '发音非常出色！';
      feedback.encouragement = '您的发音已经达到了很高的水平，继续保持！';
    } else if (overallScore >= 80) {
      feedback.overallMessage = '发音很不错！';
      feedback.encouragement = '您的发音很好，再加把劲就能更上一层楼！';
    } else if (overallScore >= 70) {
      feedback.overallMessage = '发音还可以，有改进空间。';
      feedback.encouragement = '继续练习，您一定能发音得更好！';
    } else {
      feedback.overallMessage = '发音需要多加练习。';
      feedback.encouragement = '不要气馁，多练习就会有进步！';
    }

    // 分析优点
    if (accuracy > 85) feedback.strengths.push('发音准确度很高');
    if (fluency > 85) feedback.strengths.push('语音流利度很好');
    if (completeness > 85) feedback.strengths.push('发音完整度很好');

    // 分析需要改进的地方
    if (accuracy < 70) {
      feedback.weaknesses.push('发音准确度需要提高');
      feedback.specificTips.push('注意每个音素的准确发音');
    }
    if (fluency < 70) {
      feedback.weaknesses.push('语音流利度需要改善');
      feedback.specificTips.push('尝试更自然地连读单词');
    }
    if (completeness < 70) {
      feedback.weaknesses.push('发音完整度需要加强');
      feedback.specificTips.push('确保每个音节都清晰发出');
    }

    return feedback;
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(overallScore: number, targetText: string): string[] {
    const recommendations: string[] = [];

    if (overallScore < 70) {
      recommendations.push('多听标准发音示例');
      recommendations.push('放慢语速，注重准确性');
    } else if (overallScore < 85) {
      recommendations.push('练习语音的自然连读');
      recommendations.push('注意语调和重音');
    } else {
      recommendations.push('保持当前水平');
      recommendations.push('可以尝试更复杂的句子');
    }

    // 基于目标文本的建议
    if (targetText.includes('th')) {
      recommendations.push('特别注意th音的发音');
    }
    if (targetText.includes('r')) {
      recommendations.push('注意r音的卷舌发音');
    }

    return recommendations;
  }

  /**
   * 获取历史分数
   */
  private async getPreviousScore(userId: string, keywordId: string): Promise<number | undefined> {
    try {
      const assessmentsData = await webStorageAdapter.getItem(this.STORAGE_KEY_ASSESSMENTS);
      if (!assessmentsData) return undefined;

      const assessments: PronunciationAssessment[] = JSON.parse(assessmentsData);
      const userAssessments = assessments.filter(a => a.userId === userId && a.keywordId === keywordId);
      
      if (userAssessments.length === 0) return undefined;
      
      // 返回最近的分数
      const latest = userAssessments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      return latest.overallScore;
    } catch (error) {
      console.error('获取历史分数失败:', error);
      return undefined;
    }
  }

  /**
   * 保存评估结果
   */
  private async saveAssessment(assessment: PronunciationAssessment): Promise<void> {
    try {
      // 保存到本地存储
      const existingData = await webStorageAdapter.getItem(this.STORAGE_KEY_ASSESSMENTS);
      const assessments: PronunciationAssessment[] = existingData ? JSON.parse(existingData) : [];
      
      assessments.push(assessment);
      
      // 只保留最近100个评估
      if (assessments.length > 100) {
        assessments.splice(0, assessments.length - 100);
      }
      
      await webStorageAdapter.setItem(this.STORAGE_KEY_ASSESSMENTS, JSON.stringify(assessments));

      // 同步到progressManager
      await this.syncToProgressManager(assessment);

    } catch (error) {
      console.error('保存评估结果失败:', error);
    }
  }

  /**
   * 同步到progressManager
   */
  private async syncToProgressManager(assessment: PronunciationAssessment): Promise<void> {
    try {
      // 将发音评估数据同步到progressManager
      await progressManager.recordPronunciationAssessment(
        assessment.userId,
        assessment.keywordId,
        assessment.overallScore,
        assessment.assessmentTime
      );

      console.log('发音评估结果已同步到progressManager:', assessment.overallScore);
    } catch (error) {
      console.warn('同步到progressManager失败:', error);
    }
  }

  /**
   * 生成讯飞API认证头
   */
  private generateIflytekAuth(): string {
    // 简化的认证实现，实际应该按照讯飞文档实现HMAC-SHA256签名
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = `${this.iflytekConfig.apiKey}:${timestamp}`;
    return `Bearer ${btoa(signature)}`;
  }

  /**
   * 检查录音权限
   */
  async checkMicrophonePermission(): Promise<boolean> {
    return await webAudioAdapter.requestMicrophonePermission();
  }

  /**
   * 检查浏览器音频支持
   */
  checkAudioSupport() {
    return webAudioAdapter.constructor.checkAudioSupport();
  }

  /**
   * 获取用户发音统计
   */
  async getUserPronunciationStats(userId: string): Promise<{
    totalAssessments: number;
    averageScore: number;
    improvement: number;
    recentScores: number[];
  }> {
    try {
      const assessmentsData = await webStorageAdapter.getItem(this.STORAGE_KEY_ASSESSMENTS);
      if (!assessmentsData) {
        return { totalAssessments: 0, averageScore: 0, improvement: 0, recentScores: [] };
      }

      const assessments: PronunciationAssessment[] = JSON.parse(assessmentsData);
      const userAssessments = assessments.filter(a => a.userId === userId);

      if (userAssessments.length === 0) {
        return { totalAssessments: 0, averageScore: 0, improvement: 0, recentScores: [] };
      }

      // 按时间排序
      userAssessments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const totalAssessments = userAssessments.length;
      const averageScore = userAssessments.reduce((sum, a) => sum + a.overallScore, 0) / totalAssessments;
      
      // 计算改进（最近5次vs最早5次的平均分差）
      const firstFive = userAssessments.slice(0, 5);
      const lastFive = userAssessments.slice(-5);
      const firstAvg = firstFive.reduce((sum, a) => sum + a.overallScore, 0) / firstFive.length;
      const lastAvg = lastFive.reduce((sum, a) => sum + a.overallScore, 0) / lastFive.length;
      const improvement = lastAvg - firstAvg;

      const recentScores = userAssessments.slice(-10).map(a => a.overallScore);

      return {
        totalAssessments,
        averageScore: Math.round(averageScore),
        improvement: Math.round(improvement),
        recentScores
      };
    } catch (error) {
      console.error('获取发音统计失败:', error);
      return { totalAssessments: 0, averageScore: 0, improvement: 0, recentScores: [] };
    }
  }
}

// 创建单例实例
export const basicPronunciationService = BasicPronunciationService.getInstance();
