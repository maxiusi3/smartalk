import { KeywordItem, KeywordWallTheme, KeywordWallAnimations, KeywordWallConfig, ResponsiveConfig } from '@/types/keyword-wall.types';

// Keyword Wall配置
export const KEYWORD_WALL_CONFIG: KeywordWallConfig = {
  totalKeywords: 15,
  gridColumns: 3,
  animationEnabled: true,
  autoSave: true,
  offlineMode: true,
  debugMode: false,
  milestones: [5, 10, 15],
  achievements: [],
};

// 示例关键词数据
export const SAMPLE_KEYWORDS: KeywordItem[] = [
  // 旅行主题 (5个)
  {
    id: 'travel_001',
    word: 'airport',
    translation: '机场',
    icon: '✈️',
    category: 'travel',
    difficulty: 'basic',
    contextSentence: 'We arrived at the airport early.',
    isUnlocked: false,
    sortOrder: 1,
  },
  {
    id: 'travel_002',
    word: 'hotel',
    translation: '酒店',
    icon: '🏨',
    category: 'travel',
    difficulty: 'basic',
    contextSentence: 'The hotel room was very comfortable.',
    isUnlocked: false,
    sortOrder: 2,
  },
  {
    id: 'travel_003',
    word: 'passport',
    translation: '护照',
    icon: '📘',
    category: 'travel',
    difficulty: 'basic',
    contextSentence: 'Please show me your passport.',
    isUnlocked: false,
    sortOrder: 3,
  },
  {
    id: 'travel_004',
    word: 'luggage',
    translation: '行李',
    icon: '🧳',
    category: 'travel',
    difficulty: 'basic',
    contextSentence: 'My luggage is too heavy.',
    isUnlocked: false,
    sortOrder: 4,
  },
  {
    id: 'travel_005',
    word: 'ticket',
    translation: '票',
    icon: '🎫',
    category: 'travel',
    difficulty: 'basic',
    contextSentence: 'I need to buy a train ticket.',
    isUnlocked: false,
    sortOrder: 5,
  },

  // 影视主题 (5个)
  {
    id: 'movies_001',
    word: 'amazing',
    translation: '令人惊叹的',
    icon: '🤩',
    category: 'movies',
    difficulty: 'basic',
    contextSentence: 'That was an amazing performance!',
    isUnlocked: false,
    sortOrder: 6,
  },
  {
    id: 'movies_002',
    word: 'romantic',
    translation: '浪漫的',
    icon: '💕',
    category: 'movies',
    difficulty: 'basic',
    contextSentence: 'It was a very romantic scene.',
    isUnlocked: false,
    sortOrder: 7,
  },
  {
    id: 'movies_003',
    word: 'adventure',
    translation: '冒险',
    icon: '🗺️',
    category: 'movies',
    difficulty: 'intermediate',
    contextSentence: 'They went on an exciting adventure.',
    isUnlocked: false,
    sortOrder: 8,
  },
  {
    id: 'movies_004',
    word: 'mystery',
    translation: '神秘',
    icon: '🔍',
    category: 'movies',
    difficulty: 'intermediate',
    contextSentence: 'The mystery was finally solved.',
    isUnlocked: false,
    sortOrder: 9,
  },
  {
    id: 'movies_005',
    word: 'friendship',
    translation: '友谊',
    icon: '🤝',
    category: 'movies',
    difficulty: 'basic',
    contextSentence: 'Their friendship lasted forever.',
    isUnlocked: false,
    sortOrder: 10,
  },

  // 职场主题 (5个)
  {
    id: 'workplace_001',
    word: 'meeting',
    translation: '会议',
    icon: '👥',
    category: 'workplace',
    difficulty: 'basic',
    contextSentence: 'We have a meeting at 3 PM.',
    isUnlocked: false,
    sortOrder: 11,
  },
  {
    id: 'workplace_002',
    word: 'presentation',
    translation: '演示',
    icon: '📊',
    category: 'workplace',
    difficulty: 'intermediate',
    contextSentence: 'The presentation was very informative.',
    isUnlocked: false,
    sortOrder: 12,
  },
  {
    id: 'workplace_003',
    word: 'deadline',
    translation: '截止日期',
    icon: '⏰',
    category: 'workplace',
    difficulty: 'intermediate',
    contextSentence: 'The deadline is next Friday.',
    isUnlocked: false,
    sortOrder: 13,
  },
  {
    id: 'workplace_004',
    word: 'project',
    translation: '项目',
    icon: '📋',
    category: 'workplace',
    difficulty: 'basic',
    contextSentence: 'This project is very important.',
    isUnlocked: false,
    sortOrder: 14,
  },
  {
    id: 'workplace_005',
    word: 'teamwork',
    translation: '团队合作',
    icon: '🤝',
    category: 'workplace',
    difficulty: 'intermediate',
    contextSentence: 'Good teamwork is essential.',
    isUnlocked: false,
    sortOrder: 15,
  },
];

// 主题配置
export const KEYWORD_WALL_THEME: KeywordWallTheme = {
  colors: {
    locked: '#E0E0E0',
    unlocked: '#4CAF50',
    recentlyUnlocked: '#FF9800',
    background: '#FFFFFF',
    text: '#333333',
    progress: '#2196F3',
    accent: '#9C27B0',
  },
  fonts: {
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    keyword: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    progress: {
      fontSize: 18,
      fontWeight: 'bold',
      lineHeight: 24,
    },
  },
  spacing: {
    grid: 12,
    item: 8,
    container: 16,
  },
  borderRadius: {
    item: 12,
    progress: 8,
  },
  shadows: {
    locked: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    unlocked: {
      shadowColor: '#4CAF50',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    progress: {
      shadowColor: '#2196F3',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
  },
};

// 动画配置
export const KEYWORD_WALL_ANIMATIONS: KeywordWallAnimations = {
  unlock: {
    duration: 800,
    delay: 0,
    easing: 'ease-out',
    particleEffect: true,
    glowEffect: true,
    scaleEffect: true,
  },
  progress: {
    duration: 500,
    delay: 200,
    easing: 'ease-in-out',
    particleEffect: false,
    glowEffect: false,
    scaleEffect: false,
  },
  entrance: {
    duration: 300,
    delay: 100,
    easing: 'ease-out',
    particleEffect: false,
    glowEffect: false,
    scaleEffect: true,
  },
  hover: {
    duration: 200,
    delay: 0,
    easing: 'ease-in-out',
    particleEffect: false,
    glowEffect: true,
    scaleEffect: true,
  },
};

// 响应式配置
export const RESPONSIVE_CONFIG: ResponsiveConfig = {
  phone: {
    columns: 3,
    rows: 5,
    itemSize: 80,
    spacing: 12,
    containerWidth: 300,
    containerHeight: 500,
  },
  tablet: {
    columns: 5,
    rows: 3,
    itemSize: 100,
    spacing: 16,
    containerWidth: 580,
    containerHeight: 380,
  },
  landscape: {
    columns: 5,
    rows: 3,
    itemSize: 90,
    spacing: 14,
    containerWidth: 520,
    containerHeight: 340,
  },
};

// 文案常量
export const KEYWORD_WALL_TEXTS = {
  title: '故事线索',
  subtitle: '发现隐藏在剧情中的词汇宝藏',
  progressLabel: '已发现',
  progressSuffix: '个线索',
  progressFormat: 'Story clues discovered: {current}/{total}',
  progressFormatCN: '已发现 {current}/{total} 个线索',
  emptyState: '开始观看视频来解锁词汇',
  loadingText: '加载中...',
  errorText: '加载失败，请重试',
  completedTitle: '恭喜！',
  completedMessage: '你已经发现了所有的故事线索！',
  milestones: {
    quarter: '太棒了！你已经发现了四分之一的线索！',
    half: '很好！你已经发现了一半的线索！',
    three_quarters: '出色！你已经发现了四分之三的线索！',
    complete: '完美！你已经发现了所有的故事线索！',
  },
};

// 里程碑配置
export const MILESTONES = [
  { count: 5, type: 'quarter', celebration: true },
  { count: 10, type: 'half', celebration: true },
  { count: 15, type: 'complete', celebration: true },
];

// 成就配置
export const ACHIEVEMENTS = [
  {
    id: 'first_unlock',
    type: 'milestone',
    title: '初次发现',
    description: '解锁第一个故事线索',
    icon: '🔓',
    points: 10,
  },
  {
    id: 'quarter_complete',
    type: 'milestone',
    title: '小有收获',
    description: '解锁25%的故事线索',
    icon: '🌟',
    points: 25,
  },
  {
    id: 'half_complete',
    type: 'milestone',
    title: '进展顺利',
    description: '解锁50%的故事线索',
    icon: '⭐',
    points: 50,
  },
  {
    id: 'complete_all',
    type: 'milestone',
    title: '故事大师',
    description: '解锁所有故事线索',
    icon: '🏆',
    points: 100,
  },
];

// 设备类型检测
export const getDeviceType = (width: number, height: number) => {
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  if (isTablet) {
    return isLandscape ? 'landscape' : 'tablet';
  }
  return 'phone';
};

// 网格布局计算
export const calculateGridLayout = (containerWidth: number, containerHeight: number, itemCount: number) => {
  const deviceType = getDeviceType(containerWidth, containerHeight);
  const config = RESPONSIVE_CONFIG[deviceType];
  
  const availableWidth = containerWidth - (config.spacing * 2);
  const availableHeight = containerHeight - (config.spacing * 2);
  
  const itemsPerRow = Math.min(config.columns, Math.ceil(Math.sqrt(itemCount)));
  const rows = Math.ceil(itemCount / itemsPerRow);
  
  const itemWidth = (availableWidth - (config.spacing * (itemsPerRow - 1))) / itemsPerRow;
  const itemHeight = (availableHeight - (config.spacing * (rows - 1))) / rows;
  
  const itemSize = Math.min(itemWidth, itemHeight, config.itemSize);
  
  return {
    columns: itemsPerRow,
    rows,
    itemSize,
    spacing: config.spacing,
    containerWidth: availableWidth,
    containerHeight: availableHeight,
  };
};
