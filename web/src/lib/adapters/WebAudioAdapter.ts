/**
 * WebAudioAdapter - Web音频适配器
 * 提供跨浏览器兼容的录音功能，音频质量检测和噪音过滤
 * 替代React Native的录音API，使用MediaRecorder和Web Audio API
 */

export interface AudioConfig {
  sampleRate: number;
  bitDepth: number;
  channels: number;
  format: 'wav' | 'mp3' | 'webm';
  maxDuration: number; // 毫秒
  silenceThreshold: number; // 0-1
  autoStop: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // 毫秒
  audioLevel: number; // 0-1
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface AudioAnalysis {
  duration: number;
  averageVolume: number;
  peakVolume: number;
  silenceRatio: number;
  noiseLevel: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  waveformData: number[]; // 波形数据用于可视化
}

export interface RecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  base64Data: string;
  analysis: AudioAnalysis;
  config: AudioConfig;
}

export class WebAudioAdapter {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  
  private recordingState: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
    quality: 'good'
  };
  
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private animationFrame: number = 0;
  
  // 默认配置
  private static readonly DEFAULT_CONFIG: AudioConfig = {
    sampleRate: 44100,
    bitDepth: 16,
    channels: 1,
    format: 'webm',
    maxDuration: 30000, // 30秒
    silenceThreshold: 0.1,
    autoStop: true
  };

  /**
   * 检查浏览器音频支持
   */
  static checkAudioSupport(): {
    mediaRecorder: boolean;
    webAudio: boolean;
    getUserMedia: boolean;
    supportedFormats: string[];
  } {
    const supportedFormats: string[] = [];
    
    // 检查支持的音频格式
    if (typeof MediaRecorder !== 'undefined') {
      const formats = ['audio/webm', 'audio/mp4', 'audio/wav'];
      formats.forEach(format => {
        if (MediaRecorder.isTypeSupported(format)) {
          supportedFormats.push(format);
        }
      });
    }

    return {
      mediaRecorder: typeof MediaRecorder !== 'undefined',
      webAudio: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      getUserMedia: typeof navigator.mediaDevices?.getUserMedia !== 'undefined',
      supportedFormats
    };
  }

  /**
   * 请求麦克风权限
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('浏览器不支持录音功能');
      }

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      // 立即停止流，只是为了获取权限
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('麦克风权限请求失败:', error);
      return false;
    }
  }

  /**
   * 开始录音
   */
  async startRecording(config?: Partial<AudioConfig>): Promise<void> {
    if (this.recordingState.isRecording) {
      throw new Error('录音已在进行中');
    }

    const finalConfig = { ...WebAudioAdapter.DEFAULT_CONFIG, ...config };

    try {
      // 获取音频流
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: finalConfig.sampleRate,
          channelCount: finalConfig.channels
        }
      });

      // 初始化AudioContext用于音频分析
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      // 初始化MediaRecorder
      const mimeType = this.getSupportedMimeType(finalConfig.format);
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.recordingState.isRecording = false;
        this.stopAudioAnalysis();
      };

      // 开始录音
      this.mediaRecorder.start(100); // 每100ms收集一次数据
      this.startTime = Date.now();
      this.recordingState.isRecording = true;
      this.recordingState.isPaused = false;
      this.recordingState.duration = 0;

      // 开始音频分析
      this.startAudioAnalysis();

      // 自动停止录音
      if (finalConfig.autoStop && finalConfig.maxDuration > 0) {
        setTimeout(() => {
          if (this.recordingState.isRecording) {
            this.stopRecording();
          }
        }, finalConfig.maxDuration);
      }

    } catch (error) {
      this.cleanup();
      throw new Error(`录音启动失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 停止录音
   */
  async stopRecording(): Promise<RecordingResult> {
    if (!this.recordingState.isRecording || !this.mediaRecorder) {
      throw new Error('没有正在进行的录音');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder未初始化'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // 创建音频Blob
          const audioBlob = new Blob(this.audioChunks, { 
            type: this.mediaRecorder?.mimeType || 'audio/webm' 
          });
          
          // 生成URL和base64数据
          const audioUrl = URL.createObjectURL(audioBlob);
          const base64Data = await this.blobToBase64(audioBlob);
          
          // 分析音频质量
          const analysis = await this.analyzeAudio(audioBlob);
          
          const result: RecordingResult = {
            audioBlob,
            audioUrl,
            base64Data,
            analysis,
            config: WebAudioAdapter.DEFAULT_CONFIG
          };

          this.cleanup();
          resolve(result);
        } catch (error) {
          this.cleanup();
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 暂停录音
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.recordingState.isRecording && !this.recordingState.isPaused) {
      this.mediaRecorder.pause();
      this.recordingState.isPaused = true;
    }
  }

  /**
   * 恢复录音
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.recordingState.isRecording && this.recordingState.isPaused) {
      this.mediaRecorder.resume();
      this.recordingState.isPaused = false;
    }
  }

  /**
   * 取消录音
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.recordingState.isRecording) {
      this.mediaRecorder.stop();
      this.cleanup();
    }
  }

  /**
   * 获取当前录音状态
   */
  getRecordingState(): RecordingState {
    if (this.recordingState.isRecording) {
      this.recordingState.duration = Date.now() - this.startTime;
    }
    return { ...this.recordingState };
  }

  /**
   * 开始音频分析
   */
  private startAudioAnalysis(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!this.recordingState.isRecording || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // 计算音频电平
      const sum = dataArray.reduce((acc, value) => acc + value, 0);
      const average = sum / bufferLength;
      this.recordingState.audioLevel = average / 255;

      // 评估录音质量
      this.recordingState.quality = this.assessRealTimeQuality(dataArray);

      this.animationFrame = requestAnimationFrame(analyze);
    };

    analyze();
  }

  /**
   * 停止音频分析
   */
  private stopAudioAnalysis(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
  }

  /**
   * 实时评估录音质量
   */
  private assessRealTimeQuality(frequencyData: Uint8Array): 'excellent' | 'good' | 'fair' | 'poor' {
    const sum = frequencyData.reduce((acc, value) => acc + value, 0);
    const average = sum / frequencyData.length;
    
    if (average > 100) return 'excellent';
    if (average > 60) return 'good';
    if (average > 30) return 'fair';
    return 'poor';
  }

  /**
   * 分析音频质量
   */
  private async analyzeAudio(audioBlob: Blob): Promise<AudioAnalysis> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const duration = audioBuffer.duration * 1000; // 转换为毫秒
      
      // 计算音量统计
      let sum = 0;
      let peak = 0;
      let silentSamples = 0;
      const silenceThreshold = 0.01;
      
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.abs(channelData[i]);
        sum += sample;
        peak = Math.max(peak, sample);
        
        if (sample < silenceThreshold) {
          silentSamples++;
        }
      }
      
      const averageVolume = sum / channelData.length;
      const silenceRatio = silentSamples / channelData.length;
      
      // 生成波形数据（降采样用于可视化）
      const waveformData = this.generateWaveformData(channelData, 100);
      
      // 评估整体质量
      const quality = this.assessAudioQuality(averageVolume, peak, silenceRatio);
      
      await audioContext.close();
      
      return {
        duration,
        averageVolume,
        peakVolume: peak,
        silenceRatio,
        noiseLevel: this.estimateNoiseLevel(channelData),
        quality,
        waveformData
      };
    } catch (error) {
      console.error('音频分析失败:', error);
      return {
        duration: 0,
        averageVolume: 0,
        peakVolume: 0,
        silenceRatio: 1,
        noiseLevel: 0,
        quality: 'poor',
        waveformData: []
      };
    }
  }

  /**
   * 生成波形数据
   */
  private generateWaveformData(channelData: Float32Array, points: number): number[] {
    const blockSize = Math.floor(channelData.length / points);
    const waveformData: number[] = [];
    
    for (let i = 0; i < points; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      let sum = 0;
      
      for (let j = start; j < end && j < channelData.length; j++) {
        sum += Math.abs(channelData[j]);
      }
      
      waveformData.push(sum / blockSize);
    }
    
    return waveformData;
  }

  /**
   * 评估音频质量
   */
  private assessAudioQuality(
    averageVolume: number, 
    peakVolume: number, 
    silenceRatio: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (averageVolume > 0.1 && peakVolume > 0.3 && silenceRatio < 0.3) {
      return 'excellent';
    } else if (averageVolume > 0.05 && peakVolume > 0.2 && silenceRatio < 0.5) {
      return 'good';
    } else if (averageVolume > 0.02 && peakVolume > 0.1 && silenceRatio < 0.7) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * 估算噪音水平
   */
  private estimateNoiseLevel(channelData: Float32Array): number {
    // 简化的噪音估算：计算低音量区域的平均值
    const lowVolumeThreshold = 0.01;
    let lowVolumeSamples = 0;
    let lowVolumeSum = 0;
    
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.abs(channelData[i]);
      if (sample < lowVolumeThreshold) {
        lowVolumeSamples++;
        lowVolumeSum += sample;
      }
    }
    
    return lowVolumeSamples > 0 ? lowVolumeSum / lowVolumeSamples : 0;
  }

  /**
   * 获取支持的MIME类型
   */
  private getSupportedMimeType(format: string): string {
    const mimeTypes = {
      'webm': 'audio/webm',
      'mp4': 'audio/mp4',
      'wav': 'audio/wav'
    };
    
    const preferredType = mimeTypes[format as keyof typeof mimeTypes] || 'audio/webm';
    
    if (MediaRecorder.isTypeSupported(preferredType)) {
      return preferredType;
    }
    
    // 回退到支持的格式
    const fallbacks = ['audio/webm', 'audio/mp4', 'audio/wav'];
    for (const type of fallbacks) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'audio/webm'; // 最后的回退
  }

  /**
   * Blob转Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除data:audio/webm;base64,前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    this.stopAudioAnalysis();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.mediaRecorder = null;
    this.analyser = null;
    this.microphone = null;
    this.audioChunks = [];
    
    this.recordingState = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioLevel: 0,
      quality: 'good'
    };
  }
}

// 创建单例实例
export const webAudioAdapter = new WebAudioAdapter();
