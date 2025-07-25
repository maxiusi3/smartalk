import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRealContent() {
  console.log('🌱 开始播种真实学习内容...');

  try {
    // 清理现有数据
    await prisma.keywordVideoClip.deleteMany();
    await prisma.keyword.deleteMany();
    await prisma.drama.deleteMany();
    await prisma.interest.deleteMany();

    // 创建兴趣主题
    const travelInterest = await prisma.interest.create({
      data: {
        id: 'travel',
        name: 'travel',
        displayName: '旅行',
        description: '在旅行中自然习得英语表达',
        thumbnailUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
        isActive: true,
      },
    });

    const moviesInterest = await prisma.interest.create({
      data: {
        id: 'movies',
        name: 'movies',
        displayName: '电影',
        description: '通过电影讨论提升英语交流',
        thumbnailUrl: 'https://images.unsplash.com/photo-1489185078527-20ad2b3d0b6d?w=400',
        isActive: true,
      },
    });

    const workplaceInterest = await prisma.interest.create({
      data: {
        id: 'workplace',
        name: 'workplace',
        displayName: '职场',
        description: '掌握职场英语沟通技巧',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        isActive: true,
      },
    });

    // 创建旅行主题剧集
    const travelDrama1 = await prisma.drama.create({
      data: {
        id: 'travel-paris-cafe',
        title: '巴黎咖啡馆初遇',
        description: '在巴黎的咖啡馆学会自然对话',
        subtitledVideoUrl: 'https://cdn.smartalk.app/videos/travel-paris-cafe-subtitled.mp4',
        noSubtitlesVideoUrl: 'https://cdn.smartalk.app/videos/travel-paris-cafe-no-subs.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        duration: 60,
        difficulty: 'beginner',
        interestId: travelInterest.id,
        order: 1,
      },
    });

    const travelDrama2 = await prisma.drama.create({
      data: {
        id: 'travel-airport-help',
        title: '机场问路',
        description: '在机场寻求帮助和指路',
        subtitledVideoUrl: 'https://cdn.smartalk.app/videos/travel-airport-help-subtitled.mp4',
        noSubtitlesVideoUrl: 'https://cdn.smartalk.app/videos/travel-airport-help-no-subs.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
        duration: 60,
        difficulty: 'beginner',
        interestId: travelInterest.id,
        order: 2,
      },
    });

    // 创建电影主题剧集
    const moviesDrama1 = await prisma.drama.create({
      data: {
        id: 'movies-theater-encounter',
        title: '电影院偶遇',
        description: '学会讨论电影偏好和推荐',
        subtitledVideoUrl: 'https://cdn.smartalk.app/videos/movies-theater-encounter-subtitled.mp4',
        noSubtitlesVideoUrl: 'https://cdn.smartalk.app/videos/movies-theater-encounter-no-subs.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1489185078527-20ad2b3d0b6d?w=400',
        duration: 60,
        difficulty: 'beginner',
        interestId: moviesInterest.id,
        order: 1,
      },
    });

    const moviesDrama2 = await prisma.drama.create({
      data: {
        id: 'movies-online-review',
        title: '网络影评讨论',
        description: '深入分析电影技巧和表现',
        subtitledVideoUrl: 'https://cdn.smartalk.app/videos/movies-online-review-subtitled.mp4',
        noSubtitlesVideoUrl: 'https://cdn.smartalk.app/videos/movies-online-review-no-subs.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1489185078527-20ad2b3d0b6d?w=400',
        duration: 60,
        difficulty: 'intermediate',
        interestId: moviesInterest.id,
        order: 2,
      },
    });

    // 创建职场主题剧集
    const workplaceDrama1 = await prisma.drama.create({
      data: {
        id: 'workplace-meeting-discussion',
        title: '会议室讨论',
        description: '在团队会议中表达观点',
        subtitledVideoUrl: 'https://cdn.smartalk.app/videos/workplace-meeting-discussion-subtitled.mp4',
        noSubtitlesVideoUrl: 'https://cdn.smartalk.app/videos/workplace-meeting-discussion-no-subs.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        duration: 60,
        difficulty: 'intermediate',
        interestId: workplaceInterest.id,
        order: 1,
      },
    });

    const workplaceDrama2 = await prisma.drama.create({
      data: {
        id: 'workplace-client-presentation',
        title: '客户演示汇报',
        description: '专业的客户产品演示',
        subtitledVideoUrl: 'https://cdn.smartalk.app/videos/workplace-client-presentation-subtitled.mp4',
        noSubtitlesVideoUrl: 'https://cdn.smartalk.app/videos/workplace-client-presentation-no-subs.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        duration: 60,
        difficulty: 'advanced',
        interestId: workplaceInterest.id,
        order: 2,
      },
    });

    // 旅行主题第一章关键词
    const travelKeywords1 = [
      {
        word: 'Welcome',
        pronunciation: '/ˈwelkəm/',
        audioUrl: 'https://cdn.smartalk.app/audio/welcome.mp3',
        subtitleStart: 2.5,
        subtitleEnd: 3.0,
        contextClues: ['咖啡师的热情问候', '友好的欢迎姿态'],
      },
      {
        word: 'Recommend',
        pronunciation: '/ˌrekəˈmend/',
        audioUrl: 'https://cdn.smartalk.app/audio/recommend.mp3',
        subtitleStart: 18.2,
        subtitleEnd: 19.1,
        contextClues: ['询问建议', '寻求推荐'],
      },
      {
        word: 'Signature',
        pronunciation: '/ˈsɪɡnətʃər/',
        audioUrl: 'https://cdn.smartalk.app/audio/signature.mp3',
        subtitleStart: 22.8,
        subtitleEnd: 23.5,
        contextClues: ['特色产品', '招牌咖啡'],
      },
      {
        word: 'Perfect',
        pronunciation: '/ˈpɜːrfɪkt/',
        audioUrl: 'https://cdn.smartalk.app/audio/perfect.mp3',
        subtitleStart: 28.1,
        subtitleEnd: 28.7,
        contextClues: ['表达满意', '完美选择'],
      },
      {
        word: 'Window',
        pronunciation: '/ˈwɪndoʊ/',
        audioUrl: 'https://cdn.smartalk.app/audio/window.mp3',
        subtitleStart: 35.4,
        subtitleEnd: 36.0,
        contextClues: ['靠窗座位', '选择位置'],
      },
      {
        word: 'Beautiful',
        pronunciation: '/ˈbjuːtɪfəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/beautiful.mp3',
        subtitleStart: 38.2,
        subtitleEnd: 39.1,
        contextClues: ['美丽景色', '赞美风景'],
      },
      {
        word: 'Wonderful',
        pronunciation: '/ˈwʌndərfəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/wonderful.mp3',
        subtitleStart: 42.5,
        subtitleEnd: 43.3,
        contextClues: ['精彩体验', '表达兴奋'],
      },
      {
        word: 'Atmosphere',
        pronunciation: '/ˈætməsfɪr/',
        audioUrl: 'https://cdn.smartalk.app/audio/atmosphere.mp3',
        subtitleStart: 50.1,
        subtitleEnd: 51.2,
        contextClues: ['环境氛围', '感受气氛'],
      },
      {
        word: 'Magical',
        pronunciation: '/ˈmædʒɪkəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/magical.mp3',
        subtitleStart: 45.8,
        subtitleEnd: 46.6,
        contextClues: ['神奇感受', '特殊体验'],
      },
      {
        word: 'Hope',
        pronunciation: '/hoʊp/',
        audioUrl: 'https://cdn.smartalk.app/audio/hope.mp3',
        subtitleStart: 55.2,
        subtitleEnd: 55.8,
        contextClues: ['希望期待', '美好愿望'],
      },
      {
        word: 'Smooth',
        pronunciation: '/smuːð/',
        audioUrl: 'https://cdn.smartalk.app/audio/smooth.mp3',
        subtitleStart: 24.1,
        subtitleEnd: 24.7,
        contextClues: ['顺滑口感', '描述咖啡'],
      },
      {
        word: 'Aromatic',
        pronunciation: '/ˌærəˈmætɪk/',
        audioUrl: 'https://cdn.smartalk.app/audio/aromatic.mp3',
        subtitleStart: 25.3,
        subtitleEnd: 26.1,
        contextClues: ['芳香味道', '咖啡香气'],
      },
      {
        word: 'Choice',
        pronunciation: '/tʃɔɪs/',
        audioUrl: 'https://cdn.smartalk.app/audio/choice.mp3',
        subtitleStart: 30.2,
        subtitleEnd: 30.8,
        contextClues: ['做出选择', '确认决定'],
      },
      {
        word: 'View',
        pronunciation: '/vjuː/',
        audioUrl: 'https://cdn.smartalk.app/audio/view.mp3',
        subtitleStart: 37.1,
        subtitleEnd: 37.6,
        contextClues: ['窗外景色', '美丽风景'],
      },
      {
        word: 'Exactly',
        pronunciation: '/ɪɡˈzæktli/',
        audioUrl: 'https://cdn.smartalk.app/audio/exactly.mp3',
        subtitleStart: 53.4,
        subtitleEnd: 54.1,
        contextClues: ['完全同意', '正是如此'],
      },
    ];

    // 旅行主题第二章关键词
    const travelKeywords2 = [
      {
        word: 'Excuse me',
        pronunciation: '/ɪkˈskjuːz miː/',
        audioUrl: 'https://cdn.smartalk.app/audio/excuse-me.mp3',
        subtitleStart: 2.1,
        subtitleEnd: 3.0,
        contextClues: ['礼貌询问', '寻求帮助'],
      },
      {
        word: 'Looking for',
        pronunciation: '/ˈlʊkɪŋ fɔːr/',
        audioUrl: 'https://cdn.smartalk.app/audio/looking-for.mp3',
        subtitleStart: 5.2,
        subtitleEnd: 6.1,
        contextClues: ['寻找地点', '表达需求'],
      },
      {
        word: 'Lost',
        pronunciation: '/lɔːst/',
        audioUrl: 'https://cdn.smartalk.app/audio/lost.mp3',
        subtitleStart: 8.5,
        subtitleEnd: 9.0,
        contextClues: ['迷路困惑', '需要指路'],
      },
      {
        word: 'Terminal',
        pronunciation: '/ˈtɜːrmɪnəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/terminal.mp3',
        subtitleStart: 12.3,
        subtitleEnd: 13.1,
        contextClues: ['机场航站楼', '交通枢纽'],
      },
      {
        word: 'Shuttle',
        pronunciation: '/ˈʃʌtəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/shuttle.mp3',
        subtitleStart: 16.8,
        subtitleEnd: 17.5,
        contextClues: ['穿梭交通', '机场小火车'],
      },
      {
        word: 'Corridor',
        pronunciation: '/ˈkɔːrɪdɔːr/',
        audioUrl: 'https://cdn.smartalk.app/audio/corridor.mp3',
        subtitleStart: 20.2,
        subtitleEnd: 21.0,
        contextClues: ['走廊通道', '指示方向'],
      },
      {
        word: 'Journey',
        pronunciation: '/ˈdʒɜːrni/',
        audioUrl: 'https://cdn.smartalk.app/audio/journey.mp3',
        subtitleStart: 24.1,
        subtitleEnd: 24.8,
        contextClues: ['行程时间', '旅行过程'],
      },
      {
        word: 'Run',
        pronunciation: '/rʌn/',
        audioUrl: 'https://cdn.smartalk.app/audio/run.mp3',
        subtitleStart: 27.5,
        subtitleEnd: 28.0,
        contextClues: ['运行频率', '交通班次'],
      },
      {
        word: 'Departure',
        pronunciation: '/dɪˈpɑːrtʃər/',
        audioUrl: 'https://cdn.smartalk.app/audio/departure.mp3',
        subtitleStart: 35.2,
        subtitleEnd: 36.1,
        contextClues: ['出发标志', '机场指示'],
      },
      {
        word: 'Duty-free',
        pronunciation: '/ˈduːti friː/',
        audioUrl: 'https://cdn.smartalk.app/audio/duty-free.mp3',
        subtitleStart: 38.7,
        subtitleEnd: 39.6,
        contextClues: ['免税购物', '机场商店'],
      },
      {
        word: 'Boards',
        pronunciation: '/bɔːrdz/',
        audioUrl: 'https://cdn.smartalk.app/audio/boards.mp3',
        subtitleStart: 42.3,
        subtitleEnd: 43.0,
        contextClues: ['登机时间', '航班起飞'],
      },
      {
        word: 'Plenty',
        pronunciation: '/ˈplenti/',
        audioUrl: 'https://cdn.smartalk.app/audio/plenty.mp3',
        subtitleStart: 48.1,
        subtitleEnd: 48.8,
        contextClues: ['时间充足', '足够充裕'],
      },
      {
        word: 'Reach',
        pronunciation: '/riːtʃ/',
        audioUrl: 'https://cdn.smartalk.app/audio/reach.mp3',
        subtitleStart: 50.5,
        subtitleEnd: 51.2,
        contextClues: ['到达目的地', '抵达位置'],
      },
      {
        word: 'Saved',
        pronunciation: '/seɪvd/',
        audioUrl: 'https://cdn.smartalk.app/audio/saved.mp3',
        subtitleStart: 54.2,
        subtitleEnd: 54.9,
        contextClues: ['拯救帮助', '解决问题'],
      },
      {
        word: 'Safe travels',
        pronunciation: '/seɪf ˈtrævəlz/',
        audioUrl: 'https://cdn.smartalk.app/audio/safe-travels.mp3',
        subtitleStart: 58.1,
        subtitleEnd: 59.2,
        contextClues: ['旅行祝福', '一路平安'],
      },
    ];

    // 电影主题第一章关键词
    const moviesKeywords1 = [
      {
        word: 'Incredible',
        pronunciation: '/ɪnˈkredəbəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/incredible.mp3',
        subtitleStart: 3.2,
        subtitleEnd: 4.1,
        contextClues: ['不可思议', '强烈赞美'],
      },
      {
        word: 'Plot',
        pronunciation: '/plɑːt/',
        audioUrl: 'https://cdn.smartalk.app/audio/plot.mp3',
        subtitleStart: 5.8,
        subtitleEnd: 6.3,
        contextClues: ['电影情节', '故事线'],
      },
      {
        word: 'Twist',
        pronunciation: '/twɪst/',
        audioUrl: 'https://cdn.smartalk.app/audio/twist.mp3',
        subtitleStart: 7.1,
        subtitleEnd: 7.6,
        contextClues: ['剧情转折', '意外发展'],
      },
      {
        word: 'Ending',
        pronunciation: '/ˈendɪŋ/',
        audioUrl: 'https://cdn.smartalk.app/audio/ending.mp3',
        subtitleStart: 12.4,
        subtitleEnd: 13.0,
        contextClues: ['电影结局', '故事结尾'],
      },
      {
        word: 'Cinematography',
        pronunciation: '/ˌsɪnəməˈtɑːɡrəfi/',
        audioUrl: 'https://cdn.smartalk.app/audio/cinematography.mp3',
        subtitleStart: 18.2,
        subtitleEnd: 19.5,
        contextClues: ['摄影艺术', '视觉呈现'],
      },
      {
        word: 'Stunning',
        pronunciation: '/ˈstʌnɪŋ/',
        audioUrl: 'https://cdn.smartalk.app/audio/stunning.mp3',
        subtitleStart: 20.1,
        subtitleEnd: 20.8,
        contextClues: ['令人惊艳', '视觉震撼'],
      },
      {
        word: 'Soundtrack',
        pronunciation: '/ˈsaʊndtræk/',
        audioUrl: 'https://cdn.smartalk.app/audio/soundtrack.mp3',
        subtitleStart: 25.3,
        subtitleEnd: 26.1,
        contextClues: ['电影配乐', '背景音乐'],
      },
      {
        word: 'Emotional',
        pronunciation: '/ɪˈmoʊʃənəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/emotional.mp3',
        subtitleStart: 27.8,
        subtitleEnd: 28.6,
        contextClues: ['情感场面', '触动人心'],
      },
      {
        word: 'Performance',
        pronunciation: '/pərˈfɔːrməns/',
        audioUrl: 'https://cdn.smartalk.app/audio/performance.mp3',
        subtitleStart: 35.2,
        subtitleEnd: 36.1,
        contextClues: ['演员表演', '表演技巧'],
      },
      {
        word: 'Outstanding',
        pronunciation: '/aʊtˈstændɪŋ/',
        audioUrl: 'https://cdn.smartalk.app/audio/outstanding.mp3',
        subtitleStart: 38.4,
        subtitleEnd: 39.2,
        contextClues: ['杰出表现', '卓越演技'],
      },
      {
        word: 'Transformation',
        pronunciation: '/ˌtrænsfərˈmeɪʃən/',
        audioUrl: 'https://cdn.smartalk.app/audio/transformation.mp3',
        subtitleStart: 41.1,
        subtitleEnd: 42.3,
        contextClues: ['角色转变', '人物成长'],
      },
      {
        word: 'Recommendation',
        pronunciation: '/ˌrekəmenˈdeɪʃən/',
        audioUrl: 'https://cdn.smartalk.app/audio/recommendation.mp3',
        subtitleStart: 52.7,
        subtitleEnd: 53.9,
        contextClues: ['电影推荐', '建议观看'],
      },
      {
        word: 'Realistic',
        pronunciation: '/ˌriəˈlɪstɪk/',
        audioUrl: 'https://cdn.smartalk.app/audio/realistic.mp3',
        subtitleStart: 22.5,
        subtitleEnd: 23.3,
        contextClues: ['逼真效果', '真实感'],
      },
      {
        word: 'Captured',
        pronunciation: '/ˈkæptʃərd/',
        audioUrl: 'https://cdn.smartalk.app/audio/captured.mp3',
        subtitleStart: 30.1,
        subtitleEnd: 30.8,
        contextClues: ['完美呈现', '捕捉情感'],
      },
      {
        word: 'Impressive',
        pronunciation: '/ɪmˈpresɪv/',
        audioUrl: 'https://cdn.smartalk.app/audio/impressive.mp3',
        subtitleStart: 45.2,
        subtitleEnd: 46.0,
        contextClues: ['令人印象深刻', '出色表现'],
      },
    ];

    // 电影主题第二章关键词
    const moviesKeywords2 = [
      {
        word: 'Published',
        pronunciation: '/ˈpʌblɪʃt/',
        audioUrl: 'https://cdn.smartalk.app/audio/published.mp3',
        subtitleStart: 3.1,
        subtitleEnd: 3.8,
        contextClues: ['发表文章', '发布内容'],
      },
      {
        word: 'Review',
        pronunciation: '/rɪˈvjuː/',
        audioUrl: 'https://cdn.smartalk.app/audio/review.mp3',
        subtitleStart: 5.2,
        subtitleEnd: 5.9,
        contextClues: ['电影评论', '分析评价'],
      },
      {
        word: 'Brilliant',
        pronunciation: '/ˈbrɪljənt/',
        audioUrl: 'https://cdn.smartalk.app/audio/brilliant.mp3',
        subtitleStart: 8.5,
        subtitleEnd: 9.3,
        contextClues: ['精彩出色', '才华横溢'],
      },
      {
        word: 'Approach',
        pronunciation: '/əˈproʊtʃ/',
        audioUrl: 'https://cdn.smartalk.app/audio/approach.mp3',
        subtitleStart: 10.1,
        subtitleEnd: 10.8,
        contextClues: ['创作手法', '处理方式'],
      },
      {
        word: 'Mixed',
        pronunciation: '/mɪkst/',
        audioUrl: 'https://cdn.smartalk.app/audio/mixed.mp3',
        subtitleStart: 14.2,
        subtitleEnd: 14.8,
        contextClues: ['混合评价', '不同意见'],
      },
      {
        word: 'Stand out',
        pronunciation: '/stænd aʊt/',
        audioUrl: 'https://cdn.smartalk.app/audio/stand-out.mp3',
        subtitleStart: 17.5,
        subtitleEnd: 18.3,
        contextClues: ['脱颖而出', '与众不同'],
      },
      {
        word: 'Narrative',
        pronunciation: '/ˈnærətɪv/',
        audioUrl: 'https://cdn.smartalk.app/audio/narrative.mp3',
        subtitleStart: 21.1,
        subtitleEnd: 21.9,
        contextClues: ['叙事结构', '故事讲述'],
      },
      {
        word: 'Unconventional',
        pronunciation: '/ˌʌnkənˈvenʃənəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/unconventional.mp3',
        subtitleStart: 23.2,
        subtitleEnd: 24.5,
        contextClues: ['非传统的', '创新独特'],
      },
      {
        word: 'Linear',
        pronunciation: '/ˈlɪniər/',
        audioUrl: 'https://cdn.smartalk.app/audio/linear.mp3',
        subtitleStart: 26.8,
        subtitleEnd: 27.5,
        contextClues: ['线性叙述', '直线发展'],
      },
      {
        word: 'Flashbacks',
        pronunciation: '/ˈflæʃbæks/',
        audioUrl: 'https://cdn.smartalk.app/audio/flashbacks.mp3',
        subtitleStart: 29.1,
        subtitleEnd: 30.0,
        contextClues: ['闪回镜头', '回忆片段'],
      },
      {
        word: 'Complexity',
        pronunciation: '/kəmˈpleksəti/',
        audioUrl: 'https://cdn.smartalk.app/audio/complexity.mp3',
        subtitleStart: 33.5,
        subtitleEnd: 34.4,
        contextClues: ['复杂程度', '难度层次'],
      },
      {
        word: 'Engaged',
        pronunciation: '/ɪnˈɡeɪdʒd/',
        audioUrl: 'https://cdn.smartalk.app/audio/engaged.mp3',
        subtitleStart: 36.2,
        subtitleEnd: 37.0,
        contextClues: ['全神贯注', '深度参与'],
      },
      {
        word: 'Expectations',
        pronunciation: '/ˌekspekˈteɪʃənz/',
        audioUrl: 'https://cdn.smartalk.app/audio/expectations.mp3',
        subtitleStart: 38.8,
        subtitleEnd: 39.9,
        contextClues: ['观众期待', '预期效果'],
      },
      {
        word: 'Exceptional',
        pronunciation: '/ɪkˈsepʃənəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/exceptional.mp3',
        subtitleStart: 43.1,
        subtitleEnd: 44.0,
        contextClues: ['杰出表现', '卓越演技'],
      },
      {
        word: 'Perspectives',
        pronunciation: '/pərˈspektɪvz/',
        audioUrl: 'https://cdn.smartalk.app/audio/perspectives.mp3',
        subtitleStart: 56.2,
        subtitleEnd: 57.3,
        contextClues: ['不同观点', '多元视角'],
      },
    ];

    // 职场主题第一章关键词
    const workplaceKeywords1 = [
      {
        word: 'Status',
        pronunciation: '/ˈsteɪtəs/',
        audioUrl: 'https://cdn.smartalk.app/audio/status.mp3',
        subtitleStart: 8.1,
        subtitleEnd: 8.7,
        contextClues: ['项目状态', '当前情况'],
      },
      {
        word: 'Contribute',
        pronunciation: '/kənˈtrɪbjuːt/',
        audioUrl: 'https://cdn.smartalk.app/audio/contribute.mp3',
        subtitleStart: 12.3,
        subtitleEnd: 13.1,
        contextClues: ['贡献力量', '参与项目'],
      },
      {
        word: 'Challenges',
        pronunciation: '/ˈtʃælɪndʒɪz/',
        audioUrl: 'https://cdn.smartalk.app/audio/challenges.mp3',
        subtitleStart: 16.8,
        subtitleEnd: 17.6,
        contextClues: ['面临挑战', '项目困难'],
      },
      {
        word: 'Deadline',
        pronunciation: '/ˈdedlaɪn/',
        audioUrl: 'https://cdn.smartalk.app/audio/deadline.mp3',
        subtitleStart: 19.2,
        subtitleEnd: 19.9,
        contextClues: ['截止日期', '时间压力'],
      },
      {
        word: 'Obstacles',
        pronunciation: '/ˈɑːbstəkəlz/',
        audioUrl: 'https://cdn.smartalk.app/audio/obstacles.mp3',
        subtitleStart: 24.5,
        subtitleEnd: 25.3,
        contextClues: ['遇到障碍', '需要克服'],
      },
      {
        word: 'Prioritize',
        pronunciation: '/praɪˈɔːrəˌtaɪz/',
        audioUrl: 'https://cdn.smartalk.app/audio/prioritize.mp3',
        subtitleStart: 28.7,
        subtitleEnd: 29.6,
        contextClues: ['优先安排', '重要性排序'],
      },
      {
        word: 'Critical',
        pronunciation: '/ˈkrɪtɪkəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/critical.mp3',
        subtitleStart: 31.1,
        subtitleEnd: 31.8,
        contextClues: ['关键功能', '重要特性'],
      },
      {
        word: 'Implement',
        pronunciation: '/ˈɪmpləment/',
        audioUrl: 'https://cdn.smartalk.app/audio/implement.mp3',
        subtitleStart: 38.4,
        subtitleEnd: 39.2,
        contextClues: ['实施方案', '执行计划'],
      },
      {
        word: 'Strategy',
        pronunciation: '/ˈstrætədʒi/',
        audioUrl: 'https://cdn.smartalk.app/audio/strategy.mp3',
        subtitleStart: 42.6,
        subtitleEnd: 43.4,
        contextClues: ['制定策略', '解决方案'],
      },
      {
        word: 'Iteration',
        pronunciation: '/ˌɪtəˈreɪʃən/',
        audioUrl: 'https://cdn.smartalk.app/audio/iteration.mp3',
        subtitleStart: 48.9,
        subtitleEnd: 49.8,
        contextClues: ['下个版本', '迭代开发'],
      },
      {
        word: 'Proposal',
        pronunciation: '/prəˈpoʊzəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/proposal.mp3',
        subtitleStart: 52.1,
        subtitleEnd: 52.9,
        contextClues: ['提出建议', '解决方案'],
      },
      {
        word: 'Teamwork',
        pronunciation: '/ˈtiːmwɜːrk/',
        audioUrl: 'https://cdn.smartalk.app/audio/teamwork.mp3',
        subtitleStart: 58.3,
        subtitleEnd: 59.1,
        contextClues: ['团队合作', '协作精神'],
      },
      {
        word: 'Eager',
        pronunciation: '/ˈiːɡər/',
        audioUrl: 'https://cdn.smartalk.app/audio/eager.mp3',
        subtitleStart: 10.5,
        subtitleEnd: 11.1,
        contextClues: ['积极渴望', '主动参与'],
      },
      {
        word: 'Overcome',
        pronunciation: '/ˌoʊvərˈkʌm/',
        audioUrl: 'https://cdn.smartalk.app/audio/overcome.mp3',
        subtitleStart: 26.2,
        subtitleEnd: 27.0,
        contextClues: ['克服困难', '解决问题'],
      },
      {
        word: 'Elaborate',
        pronunciation: '/ɪˈlæbəreɪt/',
        audioUrl: 'https://cdn.smartalk.app/audio/elaborate.mp3',
        subtitleStart: 44.7,
        subtitleEnd: 45.6,
        contextClues: ['详细说明', '进一步解释'],
      },
    ];

    // 职场主题第二章关键词
    const workplaceKeywords2 = [
      {
        word: 'Proposal',
        pronunciation: '/prəˈpoʊzəl/',
        audioUrl: 'https://cdn.smartalk.app/audio/proposal.mp3',
        subtitleStart: 4.2,
        subtitleEnd: 5.0,
        contextClues: ['商务提案', '解决方案'],
      },
      {
        word: 'Requirements',
        pronunciation: '/rɪˈkwaɪrmənts/',
        audioUrl: 'https://cdn.smartalk.app/audio/requirements.mp3',
        subtitleStart: 8.5,
        subtitleEnd: 9.6,
        contextClues: ['客户需求', '具体要求'],
      },
      {
        word: 'Demonstrate',
        pronunciation: '/ˈdemənstreɪt/',
        audioUrl: 'https://cdn.smartalk.app/audio/demonstrate.mp3',
        subtitleStart: 12.1,
        subtitleEnd: 13.0,
        contextClues: ['产品演示', '功能展示'],
      },
      {
        word: 'Dashboard',
        pronunciation: '/ˈdæʃbɔːrd/',
        audioUrl: 'https://cdn.smartalk.app/audio/dashboard.mp3',
        subtitleStart: 15.8,
        subtitleEnd: 16.6,
        contextClues: ['数据仪表板', '控制面板'],
      },
      {
        word: 'Real-time',
        pronunciation: '/ˈriːl taɪm/',
        audioUrl: 'https://cdn.smartalk.app/audio/real-time.mp3',
        subtitleStart: 17.2,
        subtitleEnd: 18.0,
        contextClues: ['实时数据', '即时更新'],
      },
      {
        word: 'Analytics',
        pronunciation: '/ˌænəˈlɪtɪks/',
        audioUrl: 'https://cdn.smartalk.app/audio/analytics.mp3',
        subtitleStart: 18.5,
        subtitleEnd: 19.4,
        contextClues: ['数据分析', '业务洞察'],
      },
      {
        word: 'Operations',
        pronunciation: '/ˌɑːpəˈreɪʃənz/',
        audioUrl: 'https://cdn.smartalk.app/audio/operations.mp3',
        subtitleStart: 20.1,
        subtitleEnd: 21.0,
        contextClues: ['业务运营', '操作流程'],
      },
      {
        word: 'Interface',
        pronunciation: '/ˈɪntərfeɪs/',
        audioUrl: 'https://cdn.smartalk.app/audio/interface.mp3',
        subtitleStart: 23.2,
        subtitleEnd: 24.0,
        contextClues: ['用户界面', '交互设计'],
      },
      {
        word: 'Integrate',
        pronunciation: '/ˈɪntɪɡreɪt/',
        audioUrl: 'https://cdn.smartalk.app/audio/integrate.mp3',
        subtitleStart: 26.5,
        subtitleEnd: 27.4,
        contextClues: ['系统集成', '整合融合'],
      },
      {
        word: 'Migration',
        pronunciation: '/maɪˈɡreɪʃən/',
        audioUrl: 'https://cdn.smartalk.app/audio/migration.mp3',
        subtitleStart: 30.8,
        subtitleEnd: 31.7,
        contextClues: ['数据迁移', '系统转移'],
      },
      {
        word: 'Scalability',
        pronunciation: '/ˌskeɪləˈbɪləti/',
        audioUrl: 'https://cdn.smartalk.app/audio/scalability.mp3',
        subtitleStart: 34.1,
        subtitleEnd: 35.2,
        contextClues: ['可扩展性', '规模增长'],
      },
      {
        word: 'Infrastructure',
        pronunciation: '/ˈɪnfrəstrʌktʃər/',
        audioUrl: 'https://cdn.smartalk.app/audio/infrastructure.mp3',
        subtitleStart: 38.5,
        subtitleEnd: 39.8,
        contextClues: ['基础设施', '技术架构'],
      },
      {
        word: 'Accommodate',
        pronunciation: '/əˈkɑːmədeɪt/',
        audioUrl: 'https://cdn.smartalk.app/audio/accommodate.mp3',
        subtitleStart: 41.2,
        subtitleEnd: 42.1,
        contextClues: ['容纳支持', '适应增长'],
      },
      {
        word: 'Comprehensive',
        pronunciation: '/ˌkɑːmprɪˈhensɪv/',
        audioUrl: 'https://cdn.smartalk.app/audio/comprehensive.mp3',
        subtitleStart: 47.8,
        subtitleEnd: 48.9,
        contextClues: ['全面详细', '综合完整'],
      },
      {
        word: 'Implementation',
        pronunciation: '/ˌɪmplɪmenˈteɪʃən/',
        audioUrl: 'https://cdn.smartalk.app/audio/implementation.mp3',
        subtitleStart: 52.1,
        subtitleEnd: 53.4,
        contextClues: ['项目实施', '部署执行'],
      },
    ];

    // 创建关键词和视频选项
    const createKeywordsWithVideos = async (keywords: any[], dramaId: string) => {
      for (const keywordData of keywords) {
        const keyword = await prisma.keyword.create({
          data: {
            word: keywordData.word,
            pronunciation: keywordData.pronunciation,
            audioUrl: keywordData.audioUrl,
            subtitleStart: keywordData.subtitleStart,
            subtitleEnd: keywordData.subtitleEnd,
            contextClues: keywordData.contextClues,
            dramaId: dramaId,
          },
        });

        // 为每个关键词创建4个视频选项
        const videoOptions = [
          {
            url: `https://cdn.smartalk.app/vtpr/${keyword.word.toLowerCase()}-option-a.mp4`,
            thumbnailUrl: `https://cdn.smartalk.app/thumbnails/${keyword.word.toLowerCase()}-a.jpg`,
            isCorrect: true,
            description: `正确选项 - ${keyword.word}的视觉表现`,
          },
          {
            url: `https://cdn.smartalk.app/vtpr/${keyword.word.toLowerCase()}-option-b.mp4`,
            thumbnailUrl: `https://cdn.smartalk.app/thumbnails/${keyword.word.toLowerCase()}-b.jpg`,
            isCorrect: false,
            description: `干扰选项B - ${keyword.word}的对比场景`,
          },
          {
            url: `https://cdn.smartalk.app/vtpr/${keyword.word.toLowerCase()}-option-c.mp4`,
            thumbnailUrl: `https://cdn.smartalk.app/thumbnails/${keyword.word.toLowerCase()}-c.jpg`,
            isCorrect: false,
            description: `干扰选项C - ${keyword.word}的相关场景`,
          },
          {
            url: `https://cdn.smartalk.app/vtpr/${keyword.word.toLowerCase()}-option-d.mp4`,
            thumbnailUrl: `https://cdn.smartalk.app/thumbnails/${keyword.word.toLowerCase()}-d.jpg`,
            isCorrect: false,
            description: `干扰选项D - ${keyword.word}的类似场景`,
          },
        ];

        for (const option of videoOptions) {
          await prisma.keywordVideoClip.create({
            data: {
              ...option,
              keywordId: keyword.id,
            },
          });
        }
      }
    };

    // 创建所有关键词和视频
    await createKeywordsWithVideos(travelKeywords1, travelDrama1.id);
    await createKeywordsWithVideos(travelKeywords2, travelDrama2.id);
    await createKeywordsWithVideos(moviesKeywords1, moviesDrama1.id);
    await createKeywordsWithVideos(moviesKeywords2, moviesDrama2.id);
    await createKeywordsWithVideos(workplaceKeywords1, workplaceDrama1.id);
    await createKeywordsWithVideos(workplaceKeywords2, workplaceDrama2.id);

    console.log('✅ 真实学习内容播种完成！');
    console.log(`📊 创建统计:
    - 兴趣主题: 3个
    - 学习剧集: 6个 (每主题2章)
    - 核心词汇: 90个 (每章15个)
    - vTPR视频: 360个 (每词汇4个选项)`);

  } catch (error) {
    console.error('❌ 播种失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行播种脚本
if (require.main === module) {
  seedRealContent()
    .then(() => {
      console.log('🎉 数据库播种成功完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 播种过程出错:', error);
      process.exit(1);
    });
}

export default seedRealContent;