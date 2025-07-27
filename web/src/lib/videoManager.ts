/**
 * 视频内容管理系统
 * 处理视频加载、缓存、字幕同步和关键词高亮
 */

export interface VideoContent {
  id: string;
  title: string;
  url: string;
  duration: number;
  thumbnailUrl?: string;
  subtitleUrl?: string;
  keywords: VideoKeyword[];
  quality: VideoQuality[];
}

export interface VideoKeyword {
  id: string;
  word: string;
  translation: string;
  startTime: number;
  endTime: number;
  isHighlighted?: boolean;
}

export interface VideoQuality {
  label: string;
  url: string;
  resolution: string;
  bitrate: number;
}

export interface SubtitleCue {
  startTime: number;
  endTime: number;
  text: string;
  keywords?: string[];
}

class VideoManager {
  private static instance: VideoManager;
  private videoCache = new Map<string, VideoContent>();
  private subtitleCache = new Map<string, SubtitleCue[]>();
  private preloadedVideos = new Set<string>();

  private constructor() {}

  static getInstance(): VideoManager {
    if (!VideoManager.instance) {
      VideoManager.instance = new VideoManager();
    }
    return VideoManager.instance;
  }

  /**
   * 获取视频内容
   */
  async getVideoContent(videoId: string): Promise<VideoContent | null> {
    // 先从缓存获取
    if (this.videoCache.has(videoId)) {
      return this.videoCache.get(videoId)!;
    }

    try {
      // 模拟从 API 获取视频内容
      const videoContent = await this.fetchVideoContent(videoId);
      
      // 缓存视频内容
      if (videoContent) {
        this.videoCache.set(videoId, videoContent);
      }
      
      return videoContent;
    } catch (error) {
      console.error('Failed to get video content:', error);
      return null;
    }
  }

  /**
   * 模拟获取视频内容的 API 调用
   */
  private async fetchVideoContent(videoId: string): Promise<VideoContent | null> {
    // 模拟不同主题的视频内容
    const mockVideos: Record<string, VideoContent> = {
      'travel_story': {
        id: 'travel_story',
        title: '机场奇遇记',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 180,
        thumbnailUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
        subtitleUrl: '/subtitles/travel_story.vtt',
        keywords: [
          { id: '1', word: 'check-in', translation: '办理登机手续', startTime: 10, endTime: 15 },
          { id: '2', word: 'boarding', translation: '登机', startTime: 25, endTime: 30 },
          { id: '3', word: 'luggage', translation: '行李', startTime: 45, endTime: 50 },
          { id: '4', word: 'departure', translation: '出发', startTime: 60, endTime: 65 },
          { id: '5', word: 'arrival', translation: '到达', startTime: 80, endTime: 85 }
        ],
        quality: [
          { label: '720p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', resolution: '1280x720', bitrate: 2500 },
          { label: '480p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', resolution: '854x480', bitrate: 1500 },
          { label: '360p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', resolution: '640x360', bitrate: 800 }
        ]
      },
      'movie_story': {
        id: 'movie_story',
        title: '咖啡店邂逅',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 240,
        thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        subtitleUrl: '/subtitles/movie_story.vtt',
        keywords: [
          { id: '11', word: 'order', translation: '点餐', startTime: 15, endTime: 20 },
          { id: '12', word: 'coffee', translation: '咖啡', startTime: 35, endTime: 40 },
          { id: '13', word: 'conversation', translation: '对话', startTime: 60, endTime: 65 },
          { id: '14', word: 'meeting', translation: '见面', startTime: 90, endTime: 95 },
          { id: '15', word: 'romance', translation: '浪漫', startTime: 120, endTime: 125 }
        ],
        quality: [
          { label: '720p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', resolution: '1280x720', bitrate: 2500 }
        ]
      },
      'workplace_story': {
        id: 'workplace_story',
        title: '项目会议',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 300,
        thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
        subtitleUrl: '/subtitles/workplace_story.vtt',
        keywords: [
          { id: '16', word: 'presentation', translation: '演示', startTime: 20, endTime: 25 },
          { id: '17', word: 'deadline', translation: '截止日期', startTime: 50, endTime: 55 },
          { id: '18', word: 'budget', translation: '预算', startTime: 80, endTime: 85 },
          { id: '19', word: 'teamwork', translation: '团队合作', startTime: 110, endTime: 115 },
          { id: '20', word: 'strategy', translation: '策略', startTime: 140, endTime: 145 }
        ],
        quality: [
          { label: '720p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', resolution: '1280x720', bitrate: 2500 }
        ]
      }
    };

    return mockVideos[videoId] || null;
  }

  /**
   * 预加载视频
   */
  async preloadVideo(videoId: string): Promise<void> {
    if (this.preloadedVideos.has(videoId)) {
      return;
    }

    try {
      const videoContent = await this.getVideoContent(videoId);
      if (!videoContent) return;

      // 创建视频元素进行预加载
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = videoContent.url;
      
      // 预加载字幕
      if (videoContent.subtitleUrl) {
        await this.loadSubtitles(videoContent.subtitleUrl);
      }

      this.preloadedVideos.add(videoId);
    } catch (error) {
      console.error('Failed to preload video:', error);
    }
  }

  /**
   * 加载字幕文件
   */
  async loadSubtitles(subtitleUrl: string): Promise<SubtitleCue[]> {
    if (this.subtitleCache.has(subtitleUrl)) {
      return this.subtitleCache.get(subtitleUrl)!;
    }

    try {
      // 模拟字幕数据（实际应用中应该从服务器获取 VTT 文件）
      const mockSubtitles = this.generateMockSubtitles(subtitleUrl);
      this.subtitleCache.set(subtitleUrl, mockSubtitles);
      return mockSubtitles;
    } catch (error) {
      console.error('Failed to load subtitles:', error);
      return [];
    }
  }

  /**
   * 生成模拟字幕数据
   */
  private generateMockSubtitles(subtitleUrl: string): SubtitleCue[] {
    const subtitleSets: Record<string, SubtitleCue[]> = {
      '/subtitles/travel_story.vtt': [
        { startTime: 0, endTime: 5, text: 'Welcome to the airport adventure!', keywords: [] },
        { startTime: 10, endTime: 15, text: 'I need to check-in for my flight.', keywords: ['check-in'] },
        { startTime: 25, endTime: 30, text: 'Boarding will begin in 30 minutes.', keywords: ['boarding'] },
        { startTime: 45, endTime: 50, text: 'Where can I collect my luggage?', keywords: ['luggage'] },
        { startTime: 60, endTime: 65, text: 'The departure time is 3 PM.', keywords: ['departure'] },
        { startTime: 80, endTime: 85, text: 'What is the arrival gate?', keywords: ['arrival'] }
      ],
      '/subtitles/movie_story.vtt': [
        { startTime: 0, endTime: 5, text: 'A romantic encounter at the coffee shop.', keywords: [] },
        { startTime: 15, endTime: 20, text: 'I would like to order a coffee.', keywords: ['order'] },
        { startTime: 35, endTime: 40, text: 'This coffee smells amazing.', keywords: ['coffee'] },
        { startTime: 60, endTime: 65, text: 'We had a wonderful conversation.', keywords: ['conversation'] },
        { startTime: 90, endTime: 95, text: 'Nice meeting you here.', keywords: ['meeting'] },
        { startTime: 120, endTime: 125, text: 'There was romance in the air.', keywords: ['romance'] }
      ],
      '/subtitles/workplace_story.vtt': [
        { startTime: 0, endTime: 5, text: 'Project meeting in progress.', keywords: [] },
        { startTime: 20, endTime: 25, text: 'The presentation was excellent.', keywords: ['presentation'] },
        { startTime: 50, endTime: 55, text: 'We need to meet the deadline.', keywords: ['deadline'] },
        { startTime: 80, endTime: 85, text: 'What is our budget for this project?', keywords: ['budget'] },
        { startTime: 110, endTime: 115, text: 'Good teamwork is essential.', keywords: ['teamwork'] },
        { startTime: 140, endTime: 145, text: 'We need a new marketing strategy.', keywords: ['strategy'] }
      ]
    };

    return subtitleSets[subtitleUrl] || [];
  }

  /**
   * 获取当前时间的字幕
   */
  getCurrentSubtitle(subtitles: SubtitleCue[], currentTime: number): SubtitleCue | null {
    return subtitles.find(cue => 
      currentTime >= cue.startTime && currentTime <= cue.endTime
    ) || null;
  }

  /**
   * 获取当前时间的关键词
   */
  getCurrentKeywords(keywords: VideoKeyword[], currentTime: number): VideoKeyword[] {
    return keywords.filter(keyword => 
      currentTime >= keyword.startTime && currentTime <= keyword.endTime
    );
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.videoCache.clear();
    this.subtitleCache.clear();
    this.preloadedVideos.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    videoCount: number;
    subtitleCount: number;
    preloadedCount: number;
  } {
    return {
      videoCount: this.videoCache.size,
      subtitleCount: this.subtitleCache.size,
      preloadedCount: this.preloadedVideos.size
    };
  }
}

// 导出单例实例
export const videoManager = VideoManager.getInstance();
