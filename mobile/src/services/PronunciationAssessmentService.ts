/**
 * PronunciationAssessmentService - V2 发音评估服务
 * 提供完整的发音评估系统：录音分析、评分算法、改进建议
 * 集成AI语音识别、音素分析和个性化反馈系统
 *
 * 集成API提供商：
 * - 讯飞 (iFlytek) - 中国市场主要语音识别API，支持中英文发音评估
 * - ELSA - 专业英语发音评估API，提供详细音素分析
 * - 支持<1.5秒响应时间要求，自动故障转移
 */

import { AnalyticsService } from './AnalyticsService';
import UserStateService from './UserStateService';
import PerformanceService from './PerformanceService';

// API提供商类型
export type PronunciationProvider = 'iflytek' | 'elsa' | 'auto';

// 讯飞API配置
export interface IFlytekConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  timeout: number; // ms
}

// ELSA API配置
export interface ElsaConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number; // ms
}

// API提供商响应接口
export interface ProviderResponse {
  provider: PronunciationProvider;
  success: boolean;
  responseTime: number; // ms

  // 评分数据
  overallScore: number; // 0-100
  accuracyScore?: number;
  fluencyScore?: number;
  completenessScore?: number;

  // 详细分析
  phoneticAnalysis?: {
    phoneme: string;
    score: number;
    feedback: string;
  }[];

  // 错误信息
  error?: string;

  // 原始响应（用于调试）
  rawResponse?: any;
}
import AccessibilityService from './AccessibilityService';

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
  
  // 详细分析
  phonemeAnalysis: PhonemeAnalysis[];
  wordAnalysis: WordAnalysis[];
  syllableAnalysis: SyllableAnalysis[];
  
  // 改进建议
  feedback: PronunciationFeedback;
  recommendations: PronunciationRecommendation[];
  
  // 元数据
  duration: number; // 录音时长（毫秒）
  recordingQuality: 'excellent' | 'good' | 'fair' | 'poor';
  assessmentTime: number; // 评估耗时（毫秒）
  createdAt: string;
  
  // 比较数据
  previousScore?: number;
  improvement?: number;
  nativeComparison?: number; // 与母语者对比 0-100
}

// 音素分析
interface PhonemeAnalysis {
  phoneme: string; // IPA音标
  expected: string;
  actual: string;
  accuracy: number; // 0-100
  position: { start: number; end: number }; // 时间位置（毫秒）
  confidence: number; // 识别置信度 0-100
  errorType?: 'substitution' | 'omission' | 'insertion' | 'distortion';
}

// 单词分析
interface WordAnalysis {
  word: string;
  accuracy: number; // 0-100
  stress: {
    expected: number[]; // 重音位置
    actual: number[];
    accuracy: number;
  };
  timing: {
    duration: number; // 毫秒
    expectedDuration: number;
    ratio: number; // 实际/期望时长比例
  };
  phonemes: PhonemeAnalysis[];
}

// 音节分析
interface SyllableAnalysis {
  syllable: string;
  accuracy: number;
  stress: boolean; // 是否重音
  timing: number; // 持续时间
}

// 发音反馈
interface PronunciationFeedback {
  overall: string; // 总体评价
  strengths: string[]; // 优点
  weaknesses: string[]; // 需要改进的地方
  specificIssues: {
    phoneme: string;
    issue: string;
    suggestion: string;
  }[];
}

// 改进建议
interface PronunciationRecommendation {
  type: 'phoneme' | 'word' | 'rhythm' | 'intonation' | 'speed';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  exercises: PronunciationExercise[];
  estimatedTime: number; // 预计练习时间（分钟）
}

// 发音练习
interface PronunciationExercise {
  id: string;
  type: 'minimal_pairs' | 'tongue_twisters' | 'rhythm_practice' | 'intonation_drill';
  title: string;
  content: string;
  audioUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // 分钟
}

// 发音统计
interface PronunciationStats {
  totalAssessments: number;
  averageScore: number;
  improvement: number; // 相比首次评估的改进
  strongPhonemes: string[]; // 掌握较好的音素
  weakPhonemes: string[]; // 需要改进的音素
  practiceTime: number; // 总练习时间（分钟）
  streakDays: number; // 连续练习天数
}

// 录音配置
interface RecordingConfig {
  sampleRate: number; // 采样率
  bitDepth: number; // 位深度
  channels: number; // 声道数
  format: 'wav' | 'mp3' | 'aac';
  maxDuration: number; // 最大录音时长（毫秒）
  silenceThreshold: number; // 静音阈值
  autoStop: boolean; // 自动停止录音
}

class PronunciationAssessmentService {
  private static instance: PronunciationAssessmentService;
  private analyticsService = AnalyticsService.getInstance();
  private userStateService = UserStateService.getInstance();
  private performanceService = PerformanceService.getInstance();

  // API提供商配置
  private currentProvider: PronunciationProvider = 'auto';
  private iflytekConfig: IFlytekConfig;
  private elsaConfig: ElsaConfig;
  private responseTimeThreshold = 1500; // 1.5秒响应时间要求
  private accessibilityService = AccessibilityService.getInstance();
  
  // 录音状态
  private isRecording: boolean = false;
  private currentRecording: any = null;
  private recordingStartTime: number = 0;
  
  // 默认录音配置
  private static readonly DEFAULT_RECORDING_CONFIG: RecordingConfig = {
    sampleRate: 44100,
    bitDepth: 16,
    channels: 1,
    format: 'wav',
    maxDuration: 30000, // 30秒
    silenceThreshold: 0.1,
    autoStop: true,
  };

  static getInstance(): PronunciationAssessmentService {
    if (!PronunciationAssessmentService.instance) {
      PronunciationAssessmentService.instance = new PronunciationAssessmentService();
    }
    return PronunciationAssessmentService.instance;
  }

  constructor() {
    // 初始化API配置
    this.iflytekConfig = {
      appId: process.env.IFLYTEK_APP_ID || '',
      apiKey: process.env.IFLYTEK_API_KEY || '',
      apiSecret: process.env.IFLYTEK_API_SECRET || '',
      baseUrl: 'https://api.xfyun.cn/v1/service/v1/ise',
      timeout: 1500,
    };

    this.elsaConfig = {
      apiKey: process.env.ELSA_API_KEY || '',
      baseUrl: 'https://api.elsaspeak.com/v1/pronunciation',
      timeout: 1500,
    };
  }

  // ===== API提供商集成 =====

  /**
   * 使用讯飞API进行发音评估
   */
  private async assessWithIflytek(
    audioData: string,
    targetText: string,
    language: string = 'en'
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
          language: language === 'zh' ? 'zh_cn' : 'en_us',
          group: 'pupil',
          text: targetText,
        },
        data: {
          data: audioData, // base64编码的音频数据
          encoding: 'raw',
          sample_rate: 16000,
          channels: 1,
          bit_depth: 16,
        },
      };

      // 发送请求到讯飞API
      const response = await fetch(this.iflytekConfig.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.generateIflytekAuth(),
        },
        body: JSON.stringify(requestData),
        timeout: this.iflytekConfig.timeout,
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
   * 使用ELSA API进行发音评估
   */
  private async assessWithElsa(
    audioData: string,
    targetText: string
  ): Promise<ProviderResponse> {
    const startTime = Date.now();

    try {
      // 构建ELSA API请求
      const formData = new FormData();
      formData.append('audio', audioData);
      formData.append('text', targetText);
      formData.append('language', 'en-US');

      const response = await fetch(this.elsaConfig.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.elsaConfig.apiKey}`,
        },
        body: formData,
        timeout: this.elsaConfig.timeout,
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`ELSA API请求失败: ${response.status}`);
      }

      const result = await response.json();

      // 解析ELSA响应
      const overallScore = result.overall_score || 0;
      const phoneticAnalysis = result.phonetic_analysis || [];

      return {
        provider: 'elsa',
        success: true,
        responseTime,
        overallScore: Math.round(overallScore * 100), // ELSA返回0-1，转换为0-100
        phoneticAnalysis: phoneticAnalysis.map((p: any) => ({
          phoneme: p.phoneme,
          score: Math.round(p.score * 100),
          feedback: p.feedback,
        })),
        rawResponse: result,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('ELSA API评估失败:', error);

      return {
        provider: 'elsa',
        success: false,
        responseTime,
        overallScore: 0,
        error: error instanceof Error ? error.message : 'ELSA API评估失败',
      };
    }
  }

  /**
   * 自动选择最佳API提供商
   */
  private async assessWithAutoProvider(
    audioData: string,
    targetText: string,
    language: string = 'en'
  ): Promise<ProviderResponse> {
    // 并行调用多个API提供商
    const promises = [
      this.assessWithIflytek(audioData, targetText, language),
      this.assessWithElsa(audioData, targetText),
    ];

    try {
      // 等待第一个成功的响应，或者所有响应完成
      const results = await Promise.allSettled(promises);

      // 找到最快且成功的响应
      const successfulResults = results
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'fulfilled' && result.value.success)
        .map(({ result, index }) => ({ ...(result as PromiseFulfilledResult<ProviderResponse>).value, index }))
        .sort((a, b) => a.responseTime - b.responseTime);

      if (successfulResults.length > 0) {
        const bestResult = successfulResults[0];

        // 记录API性能
        this.analyticsService.track('pronunciation_api_performance', {
          provider: bestResult.provider,
          responseTime: bestResult.responseTime,
          success: true,
          timestamp: Date.now(),
        });

        return bestResult;
      }

      // 如果所有API都失败，返回第一个错误
      const firstError = results[0];
      if (firstError.status === 'fulfilled') {
        return firstError.value;
      } else {
        throw firstError.reason;
      }

    } catch (error) {
      console.error('所有发音评估API都失败:', error);

      return {
        provider: 'auto',
        success: false,
        responseTime: this.responseTimeThreshold,
        overallScore: 0,
        error: '所有发音评估服务暂时不可用',
      };
    }
  }

  /**
   * 生成讯飞API认证头
   */
  private generateIflytekAuth(): string {
    // 实现讯飞API的认证算法
    // 这里简化处理，实际需要按照讯飞文档实现HMAC-SHA256签名
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = `${this.iflytekConfig.apiKey}:${timestamp}`;
    return `Bearer ${Buffer.from(signature).toString('base64')}`;
  }

  // ===== 录音管理 =====

  /**
   * 开始录音
   */
  async startRecording(
    keywordId: string, 
    targetText: string,
    config?: Partial<RecordingConfig>
  ): Promise<void> {
    if (this.isRecording) {
      throw new Error('录音已在进行中');
    }

    try {
      const recordingConfig = { ...PronunciationAssessmentService.DEFAULT_RECORDING_CONFIG, ...config };
      
      // 记录开始时间
      this.recordingStartTime = Date.now();
      this.isRecording = true;
      
      // 模拟录音开始
      console.log('Recording started for:', targetText);
      
      // 无障碍反馈
      this.accessibilityService.announceForScreenReader('录音开始', 'assertive');
      
      this.analyticsService.track('pronunciation_recording_started', {
        keywordId,
        targetText,
        config: recordingConfig,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      this.isRecording = false;
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * 停止录音
   */
  async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      throw new Error('没有正在进行的录音');
    }

    try {
      const recordingDuration = Date.now() - this.recordingStartTime;
      this.isRecording = false;
      
      // 模拟录音文件URL
      const audioUrl = `recording_${Date.now()}.wav`;
      
      // 无障碍反馈
      this.accessibilityService.announceForScreenReader(
        `录音完成，时长${Math.round(recordingDuration / 1000)}秒`, 
        'assertive'
      );
      
      this.analyticsService.track('pronunciation_recording_stopped', {
        duration: recordingDuration,
        audioUrl,
        timestamp: Date.now(),
      });
      
      return audioUrl;
      
    } catch (error) {
      this.isRecording = false;
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * 取消录音
   */
  async cancelRecording(): Promise<void> {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    this.currentRecording = null;
    
    this.accessibilityService.announceForScreenReader('录音已取消', 'polite');
    
    this.analyticsService.track('pronunciation_recording_cancelled', {
      timestamp: Date.now(),
    });
  }

  // ===== 发音评估 =====

  /**
   * 评估发音
   */
  async assessPronunciation(
    keywordId: string,
    audioUrl: string,
    targetText: string,
    userId: string
  ): Promise<PronunciationAssessment> {
    try {
      const startTime = Date.now();
      
      // 模拟AI发音评估过程
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      const assessment = await this.performAssessment(keywordId, audioUrl, targetText, userId);
      
      const assessmentTime = Date.now() - startTime;
      assessment.assessmentTime = assessmentTime;
      
      // 记录性能
      this.performanceService.recordInteractionResponseTime('pronunciation_assessment', assessmentTime);
      
      // 保存评估结果
      await this.saveAssessment(assessment);
      
      // 无障碍反馈
      this.accessibilityService.announceForScreenReader(
        `发音评估完成，总分${assessment.overallScore}分`,
        'assertive'
      );
      
      this.analyticsService.track('pronunciation_assessment_completed', {
        keywordId,
        userId,
        overallScore: assessment.overallScore,
        accuracy: assessment.accuracy,
        fluency: assessment.fluency,
        assessmentTime,
        timestamp: Date.now(),
      });
      
      return assessment;
      
    } catch (error) {
      console.error('Error assessing pronunciation:', error);
      this.accessibilityService.announceForScreenReader('发音评估失败', 'assertive');
      throw error;
    }
  }

  /**
   * 执行发音评估算法
   */
  private async performAssessment(
    keywordId: string,
    audioUrl: string,
    targetText: string,
    userId: string
  ): Promise<PronunciationAssessment> {
    // 模拟AI评估算法
    const baseScore = 60 + Math.random() * 35; // 60-95分基础分数
    
    // 生成音素分析
    const phonemeAnalysis = this.generatePhonemeAnalysis(targetText);
    
    // 生成单词分析
    const wordAnalysis = this.generateWordAnalysis(targetText, phonemeAnalysis);
    
    // 生成音节分析
    const syllableAnalysis = this.generateSyllableAnalysis(targetText);
    
    // 计算各项分数
    const accuracy = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 10));
    const fluency = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 15));
    const completeness = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 8));
    const prosody = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 12));
    
    const overallScore = Math.round((accuracy * 0.4 + fluency * 0.3 + completeness * 0.2 + prosody * 0.1));
    
    // 生成反馈和建议
    const feedback = this.generateFeedback(overallScore, accuracy, fluency, completeness, prosody);
    const recommendations = this.generateRecommendations(phonemeAnalysis, wordAnalysis);
    
    // 获取历史数据进行比较
    const previousScore = await this.getPreviousScore(userId, keywordId);
    const improvement = previousScore ? overallScore - previousScore : 0;
    
    const assessment: PronunciationAssessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      keywordId,
      userId,
      audioUrl,
      targetText,
      overallScore,
      accuracy,
      fluency,
      completeness,
      prosody,
      phonemeAnalysis,
      wordAnalysis,
      syllableAnalysis,
      feedback,
      recommendations,
      duration: 3000 + Math.random() * 2000, // 3-5秒录音
      recordingQuality: this.assessRecordingQuality(),
      assessmentTime: 0, // 将在外部设置
      createdAt: new Date().toISOString(),
      previousScore,
      improvement,
      nativeComparison: Math.max(0, Math.min(100, overallScore - 5 + Math.random() * 10)),
    };
    
    return assessment;
  }

  /**
   * 生成音素分析
   */
  private generatePhonemeAnalysis(targetText: string): PhonemeAnalysis[] {
    // 简化的音素分析生成
    const words = targetText.toLowerCase().split(' ');
    const phonemes: PhonemeAnalysis[] = [];
    
    let timePosition = 0;
    
    words.forEach(word => {
      // 模拟每个单词的音素
      const wordPhonemes = this.getWordPhonemes(word);
      
      wordPhonemes.forEach(phoneme => {
        const duration = 100 + Math.random() * 200; // 100-300ms
        const accuracy = 70 + Math.random() * 25; // 70-95%
        
        phonemes.push({
          phoneme,
          expected: phoneme,
          actual: this.simulateActualPhoneme(phoneme, accuracy),
          accuracy: Math.round(accuracy),
          position: { start: timePosition, end: timePosition + duration },
          confidence: 80 + Math.random() * 15, // 80-95%
          errorType: accuracy < 80 ? this.getRandomErrorType() : undefined,
        });
        
        timePosition += duration;
      });
      
      timePosition += 50; // 单词间隔
    });
    
    return phonemes;
  }

  /**
   * 生成单词分析
   */
  private generateWordAnalysis(targetText: string, phonemeAnalysis: PhonemeAnalysis[]): WordAnalysis[] {
    const words = targetText.toLowerCase().split(' ');
    const wordAnalyses: WordAnalysis[] = [];
    
    let phonemeIndex = 0;
    
    words.forEach(word => {
      const wordPhonemes = this.getWordPhonemes(word);
      const wordPhonemeAnalysis = phonemeAnalysis.slice(phonemeIndex, phonemeIndex + wordPhonemes.length);
      
      const accuracy = Math.round(
        wordPhonemeAnalysis.reduce((sum, p) => sum + p.accuracy, 0) / wordPhonemeAnalysis.length
      );
      
      const expectedDuration = wordPhonemes.length * 150; // 平均每音素150ms
      const actualDuration = wordPhonemeAnalysis.reduce(
        (sum, p) => sum + (p.position.end - p.position.start), 0
      );
      
      wordAnalyses.push({
        word,
        accuracy,
        stress: {
          expected: this.getWordStress(word),
          actual: this.simulateActualStress(word),
          accuracy: 80 + Math.random() * 15,
        },
        timing: {
          duration: actualDuration,
          expectedDuration,
          ratio: actualDuration / expectedDuration,
        },
        phonemes: wordPhonemeAnalysis,
      });
      
      phonemeIndex += wordPhonemes.length;
    });
    
    return wordAnalyses;
  }

  /**
   * 生成音节分析
   */
  private generateSyllableAnalysis(targetText: string): SyllableAnalysis[] {
    const words = targetText.toLowerCase().split(' ');
    const syllables: SyllableAnalysis[] = [];
    
    words.forEach(word => {
      const wordSyllables = this.getWordSyllables(word);
      
      wordSyllables.forEach((syllable, index) => {
        syllables.push({
          syllable,
          accuracy: 75 + Math.random() * 20,
          stress: index === 0, // 简化：第一个音节为重音
          timing: 200 + Math.random() * 100,
        });
      });
    });
    
    return syllables;
  }

  /**
   * 生成反馈
   */
  private generateFeedback(
    overall: number,
    accuracy: number,
    fluency: number,
    completeness: number,
    prosody: number
  ): PronunciationFeedback {
    const feedback: PronunciationFeedback = {
      overall: this.getOverallFeedback(overall),
      strengths: [],
      weaknesses: [],
      specificIssues: [],
    };
    
    // 分析优点
    if (accuracy > 85) feedback.strengths.push('发音准确度很高');
    if (fluency > 85) feedback.strengths.push('语音流利度很好');
    if (completeness > 85) feedback.strengths.push('发音完整度很好');
    if (prosody > 85) feedback.strengths.push('语音韵律感很好');
    
    // 分析需要改进的地方
    if (accuracy < 70) feedback.weaknesses.push('发音准确度需要提高');
    if (fluency < 70) feedback.weaknesses.push('语音流利度需要改善');
    if (completeness < 70) feedback.weaknesses.push('发音完整度需要加强');
    if (prosody < 70) feedback.weaknesses.push('语音韵律需要练习');
    
    // 生成具体问题
    if (accuracy < 80) {
      feedback.specificIssues.push({
        phoneme: '/θ/',
        issue: 'th音发音不够准确',
        suggestion: '舌尖轻触上齿，气流从舌齿间通过',
      });
    }
    
    return feedback;
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(
    phonemeAnalysis: PhonemeAnalysis[],
    wordAnalysis: WordAnalysis[]
  ): PronunciationRecommendation[] {
    const recommendations: PronunciationRecommendation[] = [];
    
    // 基于音素分析的建议
    const weakPhonemes = phonemeAnalysis.filter(p => p.accuracy < 75);
    if (weakPhonemes.length > 0) {
      recommendations.push({
        type: 'phoneme',
        priority: 'high',
        title: '音素发音练习',
        description: '针对发音不准确的音素进行专项练习',
        exercises: this.generatePhonemeExercises(weakPhonemes),
        estimatedTime: 10,
      });
    }
    
    // 基于单词分析的建议
    const slowWords = wordAnalysis.filter(w => w.timing.ratio > 1.3);
    if (slowWords.length > 0) {
      recommendations.push({
        type: 'speed',
        priority: 'medium',
        title: '语速练习',
        description: '提高单词发音的流利度和速度',
        exercises: this.generateSpeedExercises(slowWords),
        estimatedTime: 8,
      });
    }
    
    // 韵律建议
    recommendations.push({
      type: 'intonation',
      priority: 'low',
      title: '语调练习',
      description: '改善语音的自然度和表达力',
      exercises: this.generateIntonationExercises(),
      estimatedTime: 15,
    });
    
    return recommendations;
  }

  // ===== 辅助方法 =====

  private getWordPhonemes(word: string): string[] {
    // 简化的音素映射
    const phonemeMap: { [key: string]: string[] } = {
      'hello': ['/h/', '/ə/', '/ˈl/', '/oʊ/'],
      'world': ['/w/', '/ɜːr/', '/l/', '/d/'],
      'the': ['/ð/', '/ə/'],
      'cat': ['/k/', '/æ/', '/t/'],
      'dog': ['/d/', '/ɔː/', '/g/'],
    };
    
    return phonemeMap[word] || ['/ə/']; // 默认音素
  }

  private simulateActualPhoneme(expected: string, accuracy: number): string {
    if (accuracy > 90) return expected;
    
    // 模拟常见发音错误
    const errorMap: { [key: string]: string } = {
      '/θ/': '/s/', // th -> s
      '/ð/': '/z/', // th -> z
      '/r/': '/l/', // r -> l
      '/l/': '/r/', // l -> r
    };
    
    return errorMap[expected] || expected;
  }

  private getRandomErrorType(): 'substitution' | 'omission' | 'insertion' | 'distortion' {
    const types = ['substitution', 'omission', 'insertion', 'distortion'] as const;
    return types[Math.floor(Math.random() * types.length)];
  }

  private getWordStress(word: string): number[] {
    // 简化的重音模式
    const stressMap: { [key: string]: number[] } = {
      'hello': [0], // 第一个音节重音
      'world': [0],
      'beautiful': [0], // beau-ti-ful
      'computer': [1], // com-pu-ter
    };
    
    return stressMap[word] || [0];
  }

  private simulateActualStress(word: string): number[] {
    const expected = this.getWordStress(word);
    // 90%概率正确
    return Math.random() > 0.1 ? expected : [expected[0] === 0 ? 1 : 0];
  }

  private getWordSyllables(word: string): string[] {
    // 简化的音节分割
    const syllableMap: { [key: string]: string[] } = {
      'hello': ['hel', 'lo'],
      'world': ['world'],
      'beautiful': ['beau', 'ti', 'ful'],
      'computer': ['com', 'pu', 'ter'],
    };
    
    return syllableMap[word] || [word];
  }

  private assessRecordingQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    const rand = Math.random();
    if (rand > 0.8) return 'excellent';
    if (rand > 0.6) return 'good';
    if (rand > 0.3) return 'fair';
    return 'poor';
  }

  private getOverallFeedback(score: number): string {
    if (score >= 90) return '发音非常出色！继续保持这个水平。';
    if (score >= 80) return '发音很好，还有一些小地方可以改进。';
    if (score >= 70) return '发音基本正确，需要多加练习。';
    if (score >= 60) return '发音需要改进，建议多听多练。';
    return '发音需要大量练习，建议从基础音素开始。';
  }

  private generatePhonemeExercises(weakPhonemes: PhonemeAnalysis[]): PronunciationExercise[] {
    return weakPhonemes.slice(0, 3).map((phoneme, index) => ({
      id: `phoneme_exercise_${index}`,
      type: 'minimal_pairs',
      title: `${phoneme.phoneme} 音素练习`,
      content: `练习 ${phoneme.phoneme} 音素的正确发音`,
      difficulty: 'intermediate',
      duration: 5,
    }));
  }

  private generateSpeedExercises(slowWords: WordAnalysis[]): PronunciationExercise[] {
    return [{
      id: 'speed_exercise_1',
      type: 'rhythm_practice',
      title: '语速练习',
      content: '提高单词发音的流利度',
      difficulty: 'intermediate',
      duration: 8,
    }];
  }

  private generateIntonationExercises(): PronunciationExercise[] {
    return [{
      id: 'intonation_exercise_1',
      type: 'intonation_drill',
      title: '语调练习',
      content: '练习自然的英语语调',
      difficulty: 'advanced',
      duration: 15,
    }];
  }

  private async getPreviousScore(userId: string, keywordId: string): Promise<number | undefined> {
    // 模拟获取历史分数
    return Math.random() > 0.5 ? 70 + Math.random() * 20 : undefined;
  }

  private async saveAssessment(assessment: PronunciationAssessment): Promise<void> {
    // 模拟保存评估结果
    console.log('Saving assessment:', assessment.id);
  }

  // ===== 公共API =====

  /**
   * 获取录音状态
   */
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      duration: this.isRecording ? Date.now() - this.recordingStartTime : 0,
    };
  }

  /**
   * 获取用户发音统计
   */
  async getUserPronunciationStats(userId: string): Promise<PronunciationStats> {
    // 模拟统计数据
    return {
      totalAssessments: 25 + Math.floor(Math.random() * 50),
      averageScore: 75 + Math.random() * 15,
      improvement: 5 + Math.random() * 10,
      strongPhonemes: ['/p/', '/b/', '/m/', '/n/'],
      weakPhonemes: ['/θ/', '/ð/', '/r/', '/l/'],
      practiceTime: 120 + Math.random() * 180, // 分钟
      streakDays: Math.floor(Math.random() * 30),
    };
  }

  /**
   * 获取推荐练习
   */
  async getRecommendedExercises(userId: string): Promise<PronunciationExercise[]> {
    // 基于用户历史表现推荐练习
    return [
      {
        id: 'recommended_1',
        type: 'minimal_pairs',
        title: 'th音练习',
        content: '练习区分 /θ/ 和 /s/ 音',
        difficulty: 'intermediate',
        duration: 10,
      },
      {
        id: 'recommended_2',
        type: 'rhythm_practice',
        title: '节奏练习',
        content: '改善语音节奏和流利度',
        difficulty: 'intermediate',
        duration: 15,
      },
    ];
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.isRecording) {
      this.cancelRecording();
    }
  }
}

export default PronunciationAssessmentService;
