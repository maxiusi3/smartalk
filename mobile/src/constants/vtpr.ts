import { vTPRTheme } from '@/types/vtpr.types';

// vTPR主题配置
export const VTPR_THEME: vTPRTheme = {
  colors: {
    primary: '#FF6B35',
    secondary: '#4CAF50',
    correct: '#4CAF50',
    incorrect: '#FF9800',
    neutral: '#757575',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#1A237E',
    accent: '#2196F3',
  },
  fonts: {
    title: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    keyword: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    feedback: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    option: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    hint: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// vTPR文本内容
export const VTPR_TEXTS = {
  audioPlayer: {
    loading: '正在加载声音线索...',
    error: '声音线索加载失败',
    playButton: '播放',
    pauseButton: '暂停',
    replayButton: '重播',
  },
  videoSelector: {
    instruction: '选择匹配的画面:',
    loading: '正在加载画面选项...',
    error: '画面选项加载失败',
    selected: '已选择',
  },
  feedback: {
    correct: '很棒！你找到了正确的画面',
    incorrect: '别担心，你的大脑正在建立连接！',
    encouragement: '每一次尝试都让你更接近理解',
    milestone: '恭喜！你已经集齐了所有故事线索',
    loading: '正在处理...',
  },
  navigation: {
    back: '返回',
    skip: '跳过',
    next: '下一个故事线索',
    complete: '解锁剧情',
    retry: '重新尝试',
  },
  progress: {
    attempts: '尝试次数',
    timeSpent: '探索时间',
    accuracy: '发现准确率',
    completed: '已发现',
    remaining: '待发现',
    storyProgress: '故事线索发现进度：已发现',
    totalClues: '个线索',
  },
  errors: {
    networkError: '网络连接失败，请检查网络后重试',
    loadError: '内容加载失败',
    saveError: '保存失败，请重试',
    unknownError: '发生未知错误',
  },
  hints: {
    audioHint: '💡 提示：仔细听音频中的关键信息',
    visualHint: '💡 提示：注意画面中的细节',
    contextHint: '💡 提示：结合语境理解词汇含义',
  },
};

// vTPR配置常量
export const VTPR_CONFIG = {
  maxAttempts: 3,
  autoPlayAudio: true,
  showHints: true,
  hintDelay: 3000, // 3秒后显示提示
  feedbackDuration: 2000, // 反馈显示2秒
  audioVolume: 0.8,
  videoPreviewEnabled: true,
  celebrationEnabled: true,
  
  // 动画配置
  animations: {
    selection: {
      duration: 200,
      easing: 'ease-out',
    },
    feedback: {
      duration: 300,
      easing: 'ease-in-out',
    },
    transition: {
      duration: 250,
      easing: 'ease-out',
    },
    celebration: {
      duration: 1000,
      easing: 'ease-out',
      repeat: false,
    },
  },
  
  // 布局配置
  layout: {
    videoGridColumns: 2,
    videoOptionAspectRatio: 16 / 9,
    audioPlayerHeight: 120,
    headerHeight: 60,
    minTouchTarget: 44,
  },
  
  // 性能配置
  performance: {
    videoPreloadCount: 2,
    audioPreloadEnabled: true,
    imageCompressionQuality: 0.8,
    maxCacheSize: 100 * 1024 * 1024, // 100MB
  },
};

// 事件类型常量
export const VTPR_EVENTS = {
  AUDIO_PLAY: 'vtpr_audio_play',
  AUDIO_PAUSE: 'vtpr_audio_pause',
  AUDIO_COMPLETE: 'vtpr_audio_complete',
  OPTION_SELECT: 'vtpr_option_select',
  ANSWER_CORRECT: 'vtpr_answer_correct',
  ANSWER_INCORRECT: 'vtpr_answer_incorrect',
  HINT_USED: 'vtpr_hint_used',
  SESSION_START: 'vtpr_session_start',
  SESSION_COMPLETE: 'vtpr_session_complete',
  SESSION_SKIP: 'vtpr_session_skip',
  ERROR_OCCURRED: 'vtpr_error_occurred',
} as const;

// 难度级别配置
export const DIFFICULTY_CONFIG = {
  easy: {
    maxAttempts: 5,
    hintDelay: 2000,
    videoOptions: 4,
    showHints: true,
  },
  medium: {
    maxAttempts: 3,
    hintDelay: 4000,
    videoOptions: 4,
    showHints: true,
  },
  hard: {
    maxAttempts: 2,
    hintDelay: 6000,
    videoOptions: 3,
    showHints: false,
  },
};

// 成就系统配置
export const ACHIEVEMENT_CONFIG = {
  firstCorrect: {
    id: 'first_correct',
    title: '🎉 初次发现',
    description: '太棒了！你发现了第一个故事线索，这是一个美妙的开始！',
    icon: '🎉',
    points: 10,
    celebration: '你的大脑刚刚点亮了第一个神经连接！',
  },
  perfectRound: {
    id: 'perfect_round',
    title: '⭐ 完美探索',
    description: '不可思议！你一次性发现了所有故事线索，这就是语言直觉的力量！',
    icon: '⭐',
    points: 50,
    celebration: '你的英语思维已经觉醒了！',
  },
  speedExplorer: {
    id: 'speed_explorer',
    title: '⚡ 敏锐探索者',
    description: '闪电般的反应！你在30秒内发现了故事线索，说明这个词汇已经深深印在你心里了！',
    icon: '⚡',
    points: 25,
    celebration: '你的语言直觉正在快速发展！',
  },
  persistent: {
    id: 'persistent',
    title: '💪 坚持不懈',
    description: '持续的探索让你连续发现了10个故事线索，你的大脑正在建立强大的语言模式！',
    icon: '💪',
    points: 30,
    celebration: '坚持就是胜利，你正在重塑你的语言能力！',
  },
  storyMaster: {
    id: 'story_master',
    title: '📚 故事大师',
    description: '恭喜！你已经完全解锁了这个故事的所有秘密，成为了真正的故事大师！',
    icon: '📚',
    points: 100,
    celebration: '你已经掌握了这个故事的语言精髓！',
  },
  neuralConnection: {
    id: 'neural_connection',
    title: '🧠 神经连接',
    description: '你的大脑正在建立新的神经连接，每个发现都让你的英语能力更强大！',
    icon: '🧠',
    points: 20,
    celebration: '感受到大脑中新连接的形成了吗？',
  },
};

// 错误代码
export const ERROR_CODES = {
  AUDIO_LOAD_ERROR: 'AUDIO_LOAD_ERROR',
  VIDEO_LOAD_ERROR: 'VIDEO_LOAD_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PLAYBACK_ERROR: 'PLAYBACK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  API_ERROR: 'API_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
} as const;

// 默认配置
export const DEFAULT_VTPR_STATE = {
  currentKeyword: null,
  videoOptions: [],
  selectedOption: null,
  showResult: false,
  isCorrect: null,
  attempts: 0,
  isLoading: false,
  error: null,
  showFeedback: false,
  feedbackType: 'info' as const,
  feedbackMessage: '',
  hintsUsed: 0,
  timeSpent: 0,
  startTime: new Date(),
};