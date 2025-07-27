// 内容管理系统 - 统一管理所有学习内容
export interface StoryContent {
  id: string;
  theme: 'travel' | 'movie' | 'workplace';
  title: string;
  setting: string;
  characters: string[];
  preview: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  keywordCount: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  keywords: KeywordContent[];
}

export interface KeywordContent {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  context: string;
  imageUrl?: string;
  audioUrl?: string;
  startTime: number; // 在视频中出现的时间点
  endTime: number;
}

export interface VTPRExercise {
  id: string;
  storyId: string;
  keyword: string;
  translation: string;
  audioUrl: string;
  options: {
    id: string;
    imageUrl: string;
    isCorrect: boolean;
  }[];
}

class ContentManager {
  private stories: Map<string, StoryContent> = new Map();
  private vtprExercises: Map<string, VTPRExercise[]> = new Map();

  constructor() {
    this.initializeContent();
  }

  private initializeContent() {
    // 旅行英语故事内容
    const travelStory: StoryContent = {
      id: 'travel_story',
      theme: 'travel',
      title: '巴黎咖啡馆初遇',
      setting: '在巴黎的一个温馨咖啡馆里',
      characters: ['Alex - 中国游客', 'Emma - 法国咖啡师'],
      preview: '一个关于文化交流和温暖人情的美好故事。Alex 第一次来到巴黎，在当地咖啡馆遇到了友善的咖啡师 Emma。通过简单的对话，他们建立了跨越语言和文化的友谊...',
      duration: '60秒',
      difficulty: 'beginner',
      keywordCount: 15,
      videoUrl: '/videos/travel_story.mp4', // 实际视频文件路径
      thumbnailUrl: '/images/travel_thumbnail.jpg',
      keywords: [
        {
          id: 'travel_1',
          word: 'coffee',
          translation: '咖啡',
          pronunciation: '/ˈkɔːfi/',
          context: 'I would like a coffee, please.',
          imageUrl: '/images/keywords/coffee.jpg',
          audioUrl: '/audio/keywords/coffee.mp3',
          startTime: 5.2,
          endTime: 6.8
        },
        {
          id: 'travel_2',
          word: 'tourist',
          translation: '游客',
          pronunciation: '/ˈtʊərɪst/',
          context: 'I am a tourist from China.',
          imageUrl: '/images/keywords/tourist.jpg',
          audioUrl: '/audio/keywords/tourist.mp3',
          startTime: 12.5,
          endTime: 14.1
        },
        {
          id: 'travel_3',
          word: 'friendly',
          translation: '友好的',
          pronunciation: '/ˈfrendli/',
          context: 'The staff here is very friendly.',
          imageUrl: '/images/keywords/friendly.jpg',
          audioUrl: '/audio/keywords/friendly.mp3',
          startTime: 25.3,
          endTime: 26.9
        },
        {
          id: 'travel_4',
          word: 'recommend',
          translation: '推荐',
          pronunciation: '/ˌrekəˈmend/',
          context: 'Can you recommend a good place?',
          imageUrl: '/images/keywords/recommend.jpg',
          audioUrl: '/audio/keywords/recommend.mp3',
          startTime: 35.7,
          endTime: 37.2
        },
        {
          id: 'travel_5',
          word: 'delicious',
          translation: '美味的',
          pronunciation: '/dɪˈlɪʃəs/',
          context: 'This croissant is delicious!',
          imageUrl: '/images/keywords/delicious.jpg',
          audioUrl: '/audio/keywords/delicious.mp3',
          startTime: 48.1,
          endTime: 49.6
        }
      ]
    };

    // 电影对话故事内容
    const movieStory: StoryContent = {
      id: 'movie_story',
      theme: 'movie',
      title: '制片厂的一天',
      setting: '在好莱坞的电影制片厂',
      characters: ['Sarah - 制片人', 'Mike - 导演'],
      preview: '深入电影制作的幕后世界。Sarah 和 Mike 正在为新项目进行紧张的筹备工作，他们需要在有限的时间内做出重要决定，体验真实的好莱坞工作节奏...',
      duration: '75秒',
      difficulty: 'intermediate',
      keywordCount: 18,
      videoUrl: '/videos/movie_story.mp4',
      thumbnailUrl: '/images/movie_thumbnail.jpg',
      keywords: [
        {
          id: 'movie_1',
          word: 'producer',
          translation: '制片人',
          pronunciation: '/prəˈduːsər/',
          context: 'The producer is responsible for the budget.',
          imageUrl: '/images/keywords/producer.jpg',
          audioUrl: '/audio/keywords/producer.mp3',
          startTime: 8.3,
          endTime: 9.8
        },
        {
          id: 'movie_2',
          word: 'director',
          translation: '导演',
          pronunciation: '/dəˈrektər/',
          context: 'The director has a clear vision for this film.',
          imageUrl: '/images/keywords/director.jpg',
          audioUrl: '/audio/keywords/director.mp3',
          startTime: 15.6,
          endTime: 17.1
        },
        {
          id: 'movie_3',
          word: 'script',
          translation: '剧本',
          pronunciation: '/skrɪpt/',
          context: 'We need to revise the script.',
          imageUrl: '/images/keywords/script.jpg',
          audioUrl: '/audio/keywords/script.mp3',
          startTime: 28.4,
          endTime: 29.9
        },
        {
          id: 'movie_4',
          word: 'budget',
          translation: '预算',
          pronunciation: '/ˈbʌdʒɪt/',
          context: 'We are over budget on this project.',
          imageUrl: '/images/keywords/budget.jpg',
          audioUrl: '/audio/keywords/budget.mp3',
          startTime: 42.7,
          endTime: 44.2
        },
        {
          id: 'movie_5',
          word: 'deadline',
          translation: '截止日期',
          pronunciation: '/ˈdedlaɪn/',
          context: 'We must meet the deadline.',
          imageUrl: '/images/keywords/deadline.jpg',
          audioUrl: '/audio/keywords/deadline.mp3',
          startTime: 58.9,
          endTime: 60.4
        }
      ]
    };

    // 职场沟通故事内容
    const workplaceStory: StoryContent = {
      id: 'workplace_story',
      theme: 'workplace',
      title: '项目启动会议',
      setting: '在现代化的办公室会议室',
      characters: ['Lisa - 项目经理', 'David - 团队成员'],
      preview: '一个关于团队协作和职场沟通的故事。Lisa 正在主持新项目的启动会议，需要与团队成员协调各项工作安排，展现专业的职场英语交流技巧...',
      duration: '90秒',
      difficulty: 'advanced',
      keywordCount: 20,
      videoUrl: '/videos/workplace_story.mp4',
      thumbnailUrl: '/images/workplace_thumbnail.jpg',
      keywords: [
        {
          id: 'workplace_1',
          word: 'meeting',
          translation: '会议',
          pronunciation: '/ˈmiːtɪŋ/',
          context: 'Let\'s start the meeting.',
          imageUrl: '/images/keywords/meeting.jpg',
          audioUrl: '/audio/keywords/meeting.mp3',
          startTime: 3.5,
          endTime: 5.0
        },
        {
          id: 'workplace_2',
          word: 'project',
          translation: '项目',
          pronunciation: '/ˈprɒdʒekt/',
          context: 'This project is very important.',
          imageUrl: '/images/keywords/project.jpg',
          audioUrl: '/audio/keywords/project.mp3',
          startTime: 12.8,
          endTime: 14.3
        },
        {
          id: 'workplace_3',
          word: 'deadline',
          translation: '截止日期',
          pronunciation: '/ˈdedlaɪn/',
          context: 'What is the deadline for this task?',
          imageUrl: '/images/keywords/deadline.jpg',
          audioUrl: '/audio/keywords/deadline.mp3',
          startTime: 25.1,
          endTime: 26.6
        },
        {
          id: 'workplace_4',
          word: 'responsibility',
          translation: '责任',
          pronunciation: '/rɪˌspɒnsəˈbɪləti/',
          context: 'Each team member has their responsibility.',
          imageUrl: '/images/keywords/responsibility.jpg',
          audioUrl: '/audio/keywords/responsibility.mp3',
          startTime: 38.4,
          endTime: 40.9
        },
        {
          id: 'workplace_5',
          word: 'collaborate',
          translation: '合作',
          pronunciation: '/kəˈlæbəreɪt/',
          context: 'We need to collaborate effectively.',
          imageUrl: '/images/keywords/collaborate.jpg',
          audioUrl: '/audio/keywords/collaborate.mp3',
          startTime: 52.7,
          endTime: 54.2
        }
      ]
    };

    // 存储故事内容
    this.stories.set('travel', travelStory);
    this.stories.set('movie', movieStory);
    this.stories.set('workplace', workplaceStory);

    // 初始化 vTPR 练习
    this.initializeVTPRExercises();
  }

  private initializeVTPRExercises() {
    // 为每个故事创建 vTPR 练习
    this.stories.forEach((story, theme) => {
      const exercises: VTPRExercise[] = story.keywords.slice(0, 5).map((keyword, index) => ({
        id: `${theme}_vtpr_${index + 1}`,
        storyId: story.id,
        keyword: keyword.word,
        translation: keyword.translation,
        audioUrl: keyword.audioUrl || `/audio/vtpr/${keyword.word}.mp3`,
        options: [
          {
            id: `${theme}_option_${index}_1`,
            imageUrl: keyword.imageUrl || `/images/vtpr/${keyword.word}_correct.jpg`,
            isCorrect: true
          },
          {
            id: `${theme}_option_${index}_2`,
            imageUrl: `/images/vtpr/${keyword.word}_wrong1.jpg`,
            isCorrect: false
          },
          {
            id: `${theme}_option_${index}_3`,
            imageUrl: `/images/vtpr/${keyword.word}_wrong2.jpg`,
            isCorrect: false
          },
          {
            id: `${theme}_option_${index}_4`,
            imageUrl: `/images/vtpr/${keyword.word}_wrong3.jpg`,
            isCorrect: false
          }
        ]
      }));
      
      this.vtprExercises.set(theme, exercises);
    });
  }

  // 获取故事内容
  getStory(theme: string): StoryContent | null {
    return this.stories.get(theme) || null;
  }

  // 获取所有故事
  getAllStories(): StoryContent[] {
    return Array.from(this.stories.values());
  }

  // 获取故事的关键词
  getStoryKeywords(theme: string): KeywordContent[] {
    const story = this.stories.get(theme);
    return story ? story.keywords : [];
  }

  // 获取 vTPR 练习
  getVTPRExercises(theme: string): VTPRExercise[] {
    return this.vtprExercises.get(theme) || [];
  }

  // 获取特定的 vTPR 练习
  getVTPRExercise(theme: string, exerciseIndex: number): VTPRExercise | null {
    const exercises = this.vtprExercises.get(theme);
    return exercises && exercises[exerciseIndex] ? exercises[exerciseIndex] : null;
  }

  // 预加载内容（用于优化用户体验）
  async preloadContent(theme: string): Promise<void> {
    const story = this.stories.get(theme);
    if (!story) return;

    // 预加载视频
    if (story.videoUrl) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = story.videoUrl;
    }

    // 预加载关键词音频
    story.keywords.forEach(keyword => {
      if (keyword.audioUrl) {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.src = keyword.audioUrl;
      }
    });

    // 预加载图片
    const imagesToPreload = [
      story.thumbnailUrl,
      ...story.keywords.map(k => k.imageUrl).filter(Boolean)
    ].filter(Boolean) as string[];

    await Promise.all(
      imagesToPreload.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  }
}

// 导出单例实例
export const contentManager = new ContentManager();
