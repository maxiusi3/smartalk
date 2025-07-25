import { Story } from '@/types/story'

// 旅行主题故事数据
export const travelStory: Story = {
  id: 'travel-airport-story',
  theme: 'travel',
  title: '机场之旅',
  description: '跟随主人公体验完整的机场旅行流程',
  videoWithSubtitlesSrc: '/videos/travel/airport-story-with-subtitles.mp4',
  videoWithoutSubtitlesSrc: '/videos/travel/airport-story-no-subtitles.mp4',
  duration: 30, // 30秒
  thumbnailSrc: '/images/stories/travel-airport-thumbnail.jpg',
  keywords: [
    {
      id: 'check-in',
      audioSrc: '/audio/travel/check-in.mp3',
      startTime: 3,
      endTime: 6,
      iconSrc: '/icons/keywords/check-in.svg',
      position: { x: 120, y: 100 },
      isCollected: false,
      correctOptionId: 'check-in-correct',
      videoOptions: [
        {
          id: 'check-in-correct',
          videoSrc: '/videos/travel/check-in-scene.mp4',
          thumbnailSrc: '/images/travel/check-in-thumb.jpg',
          isCorrect: true
        },
        {
          id: 'check-in-wrong1',
          videoSrc: '/videos/travel/restaurant-scene.mp4',
          thumbnailSrc: '/images/travel/restaurant-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'check-in-wrong2',
          videoSrc: '/videos/travel/shopping-scene.mp4',
          thumbnailSrc: '/images/travel/shopping-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'check-in-wrong3',
          videoSrc: '/videos/travel/hotel-scene.mp4',
          thumbnailSrc: '/images/travel/hotel-thumb.jpg',
          isCorrect: false
        }
      ]
    },
    {
      id: 'security',
      audioSrc: '/audio/travel/security.mp3',
      startTime: 8,
      endTime: 12,
      iconSrc: '/icons/keywords/security.svg',
      position: { x: 250, y: 80 },
      isCollected: false,
      correctOptionId: 'security-correct',
      videoOptions: [
        {
          id: 'security-correct',
          videoSrc: '/videos/travel/security-scene.mp4',
          thumbnailSrc: '/images/travel/security-thumb.jpg',
          isCorrect: true
        },
        {
          id: 'security-wrong1',
          videoSrc: '/videos/travel/customs-scene.mp4',
          thumbnailSrc: '/images/travel/customs-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'security-wrong2',
          videoSrc: '/videos/travel/gate-scene.mp4',
          thumbnailSrc: '/images/travel/gate-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'security-wrong3',
          videoSrc: '/videos/travel/baggage-scene.mp4',
          thumbnailSrc: '/images/travel/baggage-thumb.jpg',
          isCorrect: false
        }
      ]
    },
    {
      id: 'boarding',
      audioSrc: '/audio/travel/boarding.mp3',
      startTime: 15,
      endTime: 18,
      iconSrc: '/icons/keywords/boarding.svg',
      position: { x: 180, y: 160 },
      isCollected: false,
      correctOptionId: 'boarding-correct',
      videoOptions: [
        {
          id: 'boarding-correct',
          videoSrc: '/videos/travel/boarding-scene.mp4',
          thumbnailSrc: '/images/travel/boarding-thumb.jpg',
          isCorrect: true
        },
        {
          id: 'boarding-wrong1',
          videoSrc: '/videos/travel/waiting-scene.mp4',
          thumbnailSrc: '/images/travel/waiting-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'boarding-wrong2',
          videoSrc: '/videos/travel/cafe-scene.mp4',
          thumbnailSrc: '/images/travel/cafe-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'boarding-wrong3',
          videoSrc: '/videos/travel/shop-scene.mp4',
          thumbnailSrc: '/images/travel/shop-thumb.jpg',
          isCorrect: false
        }
      ]
    },
    {
      id: 'luggage',
      audioSrc: '/audio/travel/luggage.mp3',
      startTime: 21,
      endTime: 24,
      iconSrc: '/icons/keywords/luggage.svg',
      position: { x: 320, y: 140 },
      isCollected: false,
      correctOptionId: 'luggage-correct',
      videoOptions: [
        {
          id: 'luggage-correct',
          videoSrc: '/videos/travel/luggage-scene.mp4',
          thumbnailSrc: '/images/travel/luggage-thumb.jpg',
          isCorrect: true
        },
        {
          id: 'luggage-wrong1',
          videoSrc: '/videos/travel/ticket-scene.mp4',
          thumbnailSrc: '/images/travel/ticket-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'luggage-wrong2',
          videoSrc: '/videos/travel/passport-scene.mp4',
          thumbnailSrc: '/images/travel/passport-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'luggage-wrong3',
          videoSrc: '/videos/travel/seat-scene.mp4',
          thumbnailSrc: '/images/travel/seat-thumb.jpg',
          isCorrect: false
        }
      ]
    },
    {
      id: 'coffee',
      audioSrc: '/audio/travel/coffee.mp3',
      startTime: 26,
      endTime: 29,
      iconSrc: '/icons/keywords/coffee.svg',
      position: { x: 200, y: 220 },
      isCollected: false,
      correctOptionId: 'coffee-correct',
      videoOptions: [
        {
          id: 'coffee-correct',
          videoSrc: '/videos/travel/coffee-scene.mp4',
          thumbnailSrc: '/images/travel/coffee-thumb.jpg',
          isCorrect: true
        },
        {
          id: 'coffee-wrong1',
          videoSrc: '/videos/travel/water-scene.mp4',
          thumbnailSrc: '/images/travel/water-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'coffee-wrong2',
          videoSrc: '/videos/travel/food-scene.mp4',
          thumbnailSrc: '/images/travel/food-thumb.jpg',
          isCorrect: false
        },
        {
          id: 'coffee-wrong3',
          videoSrc: '/videos/travel/juice-scene.mp4',
          thumbnailSrc: '/images/travel/juice-thumb.jpg',
          isCorrect: false
        }
      ]
    }
    // 现在只有5个核心词汇，降低学习难度，让用户更快体验成就感
  ]
}

// 电影主题故事数据
export const moviesStory: Story = {
  id: 'movies-cinema-story',
  theme: 'movies',
  title: '电影院体验',
  description: '体验完整的电影院观影流程',
  videoWithSubtitlesSrc: '/videos/movies/cinema-story-with-subtitles.mp4',
  videoWithoutSubtitlesSrc: '/videos/movies/cinema-story-no-subtitles.mp4',
  duration: 30,
  thumbnailSrc: '/images/stories/movies-cinema-thumbnail.jpg',
  keywords: [
    // 电影主题的5个核心词汇
    // 结构与travel相同，这里省略具体实现
  ]
}

// 职场主题故事数据
export const workplaceStory: Story = {
  id: 'workplace-office-story',
  theme: 'workplace',
  title: '职场第一天',
  description: '体验职场新人的第一天工作',
  videoWithSubtitlesSrc: '/videos/workplace/office-story-with-subtitles.mp4',
  videoWithoutSubtitlesSrc: '/videos/workplace/office-story-no-subtitles.mp4',
  duration: 30,
  thumbnailSrc: '/images/stories/workplace-office-thumbnail.jpg',
  keywords: [
    // 职场主题的5个核心词汇
    // 结构与travel相同，这里省略具体实现
  ]
}

// 根据主题获取故事数据
export function getStoryByTheme(theme: string): Story | null {
  // 标准化主题名称
  const normalizedTheme = normalizeTheme(theme)

  switch (normalizedTheme) {
    case 'travel':
      return travelStory
    case 'movies':
      return moviesStory
    case 'workplace':
      return workplaceStory
    default:
      return null
  }
}

// 标准化主题名称，处理URL参数的变体
function normalizeTheme(theme: string): string {
  const themeMap: Record<string, string> = {
    'travel': 'travel',
    'movie': 'movies',
    'movies': 'movies',
    'workplace': 'workplace',
    'work': 'workplace'
  }

  return themeMap[theme.toLowerCase()] || theme
}

// 获取所有故事
export function getAllStories(): Story[] {
  return [travelStory, moviesStory, workplaceStory]
}
