/**
 * 内容预加载系统
 * 智能预加载视频、图片和其他资源以提升用户体验
 */

import { videoManager } from './videoManager';

interface PreloadTask {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'loading' | 'loaded' | 'error';
  progress: number;
  element?: HTMLVideoElement | HTMLImageElement | HTMLAudioElement;
}

class ContentPreloader {
  private static instance: ContentPreloader;
  private tasks = new Map<string, PreloadTask>();
  private activeLoads = new Set<string>();
  private maxConcurrentLoads = 3;
  private loadQueue: string[] = [];

  private constructor() {}

  static getInstance(): ContentPreloader {
    if (!ContentPreloader.instance) {
      ContentPreloader.instance = new ContentPreloader();
    }
    return ContentPreloader.instance;
  }

  /**
   * 添加预加载任务
   */
  addTask(
    id: string,
    type: 'video' | 'image' | 'audio',
    url: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    if (this.tasks.has(id)) {
      return; // 任务已存在
    }

    const task: PreloadTask = {
      id,
      type,
      url,
      priority,
      status: 'pending',
      progress: 0
    };

    this.tasks.set(id, task);
    this.scheduleLoad(id);
  }

  /**
   * 批量添加预加载任务
   */
  addBatchTasks(tasks: Array<{
    id: string;
    type: 'video' | 'image' | 'audio';
    url: string;
    priority?: 'high' | 'medium' | 'low';
  }>): void {
    tasks.forEach(task => {
      this.addTask(task.id, task.type, task.url, task.priority);
    });
  }

  /**
   * 调度加载任务
   */
  private scheduleLoad(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') {
      return;
    }

    // 按优先级排序队列
    this.loadQueue.push(taskId);
    this.loadQueue.sort((a, b) => {
      const taskA = this.tasks.get(a)!;
      const taskB = this.tasks.get(b)!;
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[taskB.priority] - priorityOrder[taskA.priority];
    });

    this.processQueue();
  }

  /**
   * 处理加载队列
   */
  private async processQueue(): Promise<void> {
    while (
      this.loadQueue.length > 0 && 
      this.activeLoads.size < this.maxConcurrentLoads
    ) {
      const taskId = this.loadQueue.shift()!;
      const task = this.tasks.get(taskId);
      
      if (!task || task.status !== 'pending') {
        continue;
      }

      this.activeLoads.add(taskId);
      this.loadTask(taskId).finally(() => {
        this.activeLoads.delete(taskId);
        this.processQueue(); // 继续处理队列
      });
    }
  }

  /**
   * 加载单个任务
   */
  private async loadTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'loading';

    try {
      switch (task.type) {
        case 'video':
          await this.loadVideo(task);
          break;
        case 'image':
          await this.loadImage(task);
          break;
        case 'audio':
          await this.loadAudio(task);
          break;
      }
      
      task.status = 'loaded';
      task.progress = 100;
    } catch (error) {
      console.error(`Failed to preload ${task.type} ${task.url}:`, error);
      task.status = 'error';
    }
  }

  /**
   * 预加载视频
   */
  private async loadVideo(task: PreloadTask): Promise<void> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      
      const handleLoadedMetadata = () => {
        task.progress = 50;
        // 预加载一小部分内容
        video.currentTime = 1;
      };

      const handleCanPlay = () => {
        task.progress = 100;
        task.element = video;
        resolve();
      };

      const handleError = () => {
        reject(new Error(`Failed to load video: ${task.url}`));
      };

      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const buffered = video.buffered.end(0);
          const duration = video.duration || 1;
          task.progress = Math.min(90, (buffered / duration) * 100);
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.addEventListener('progress', handleProgress);

      video.src = task.url;
    });
  }

  /**
   * 预加载图片
   */
  private async loadImage(task: PreloadTask): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        task.progress = 100;
        task.element = img;
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${task.url}`));
      };

      img.src = task.url;
    });
  }

  /**
   * 预加载音频
   */
  private async loadAudio(task: PreloadTask): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      const handleCanPlay = () => {
        task.progress = 100;
        task.element = audio;
        resolve();
      };

      const handleError = () => {
        reject(new Error(`Failed to load audio: ${task.url}`));
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);

      audio.src = task.url;
    });
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): PreloadTask | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * 获取所有任务状态
   */
  getAllTasks(): PreloadTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取加载统计
   */
  getStats(): {
    total: number;
    pending: number;
    loading: number;
    loaded: number;
    error: number;
    progress: number;
  } {
    const tasks = Array.from(this.tasks.values());
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      loading: tasks.filter(t => t.status === 'loading').length,
      loaded: tasks.filter(t => t.status === 'loaded').length,
      error: tasks.filter(t => t.status === 'error').length,
      progress: 0
    };

    if (stats.total > 0) {
      const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
      stats.progress = Math.round(totalProgress / stats.total);
    }

    return stats;
  }

  /**
   * 清除已完成的任务
   */
  clearCompletedTasks(): void {
    for (const [id, task] of this.tasks.entries()) {
      if (task.status === 'loaded' || task.status === 'error') {
        this.tasks.delete(id);
      }
    }
  }

  /**
   * 清除所有任务
   */
  clearAllTasks(): void {
    this.tasks.clear();
    this.loadQueue.length = 0;
    this.activeLoads.clear();
  }

  /**
   * 预加载学习内容
   */
  async preloadLearningContent(interest: string): Promise<void> {
    const videoId = `${interest}_story`;
    
    try {
      // 预加载主视频
      const videoContent = await videoManager.getVideoContent(videoId);
      if (videoContent) {
        this.addTask(
          `video_${videoId}`,
          'video',
          videoContent.url,
          'high'
        );

        // 预加载缩略图
        if (videoContent.thumbnailUrl) {
          this.addTask(
            `thumb_${videoId}`,
            'image',
            videoContent.thumbnailUrl,
            'medium'
          );
        }

        // 预加载不同质量的视频
        videoContent.quality.forEach((quality, index) => {
          if (index > 0) { // 跳过第一个（已经加载）
            this.addTask(
              `video_${videoId}_${quality.label}`,
              'video',
              quality.url,
              'low'
            );
          }
        });
      }

      // 预加载 VTPR 选项视频
      const vtprOptions = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      ];

      vtprOptions.forEach((url, index) => {
        this.addTask(
          `vtpr_option_${index}`,
          'video',
          url,
          'medium'
        );
      });

    } catch (error) {
      console.error('Failed to preload learning content:', error);
    }
  }

  /**
   * 设置最大并发加载数
   */
  setMaxConcurrentLoads(max: number): void {
    this.maxConcurrentLoads = Math.max(1, Math.min(10, max));
  }
}

// 导出单例实例
export const contentPreloader = ContentPreloader.getInstance();
