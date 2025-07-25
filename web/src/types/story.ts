// 故事和词汇学习相关的类型定义

export interface StoryKeyword {
  id: string
  // 词汇的音频文件路径
  audioSrc: string
  // 在故事视频中的高亮时间段
  startTime: number
  endTime: number
  // 用于vTPR学习的视频选项
  videoOptions: VideoOption[]
  // 正确答案的选项ID
  correctOptionId: string
  // 是否已被用户收集（学会）
  isCollected: boolean
  // 图标表示（用于故事线索界面）
  iconSrc: string
  // 图标的位置（在故事线索界面中的布局位置）
  position: {
    x: number
    y: number
  }
}

export interface VideoOption {
  id: string
  // 视频片段的源文件
  videoSrc: string
  // 缩略图
  thumbnailSrc: string
  // 是否为正确答案
  isCorrect: boolean
}

export interface Story {
  id: string
  // 故事主题（travel, movies, workplace）
  theme: 'travel' | 'movies' | 'workplace'
  // 故事标题
  title: string
  // 故事描述
  description: string
  // 带字幕的故事视频（用于预览阶段）
  videoWithSubtitlesSrc: string
  // 无字幕的故事视频（用于魔法时刻）
  videoWithoutSubtitlesSrc: string
  // 故事时长（秒）
  duration: number
  // 15个核心词汇
  keywords: StoryKeyword[]
  // 故事的缩略图
  thumbnailSrc: string
}

export interface LearningProgress {
  storyId: string
  // 当前学习阶段
  currentPhase: 'preview' | 'collecting' | 'magic-moment' | 'completed'
  // 已收集的词汇数量
  collectedKeywords: number
  // 总词汇数量（固定为15）
  totalKeywords: number
  // 学习开始时间
  startTime: Date
  // 各阶段完成时间
  previewCompletedAt?: Date
  collectingCompletedAt?: Date
  magicMomentCompletedAt?: Date
}

// 用户在vTPR学习中的选择记录
export interface VTPRAttempt {
  keywordId: string
  selectedOptionId: string
  isCorrect: boolean
  attemptTime: Date
  // 尝试次数（第几次尝试）
  attemptNumber: number
}

// 学习会话数据
export interface LearningSession {
  sessionId: string
  storyId: string
  userId: string
  startTime: Date
  endTime?: Date
  progress: LearningProgress
  attempts: VTPRAttempt[]
  // 是否完成了魔法时刻体验
  hasExperiencedMagicMoment: boolean
}
