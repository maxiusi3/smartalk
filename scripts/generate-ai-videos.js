#!/usr/bin/env node

/**
 * SmarTalk AI视频生成脚本
 * 用于批量生成学习内容的AI视频
 */

const fs = require('fs');
const path = require('path');

// 视频生成配置
const VIDEO_CONFIG = {
  // 主视频配置
  mainVideos: [
    {
      id: 'travel-paris-cafe',
      title: '巴黎咖啡馆初遇',
      duration: 60,
      prompt: `Create a cinematic 60-second video sequence:
      
Scene 1 (0-15s): Young Asian man (Alex) enters charming Parisian café in Montmartre. Warm afternoon sunlight through large windows. Friendly female barista (Emma) behind counter with genuine welcoming smile. Cozy wooden furniture, vintage French décor.

Scene 2 (15-30s): Emma enthusiastically explains coffee options, pointing to menu board with animated gestures. Alex listens attentively, slightly nervous but interested. Show coffee beans, espresso machine, aromatic steam rising.

Scene 3 (30-45s): Alex gains confidence making his choice. Emma skillfully prepares signature coffee blend. Show coffee-making process: grinding beans, steaming milk, creating latte art.

Scene 4 (45-60s): Emma serves coffee at window table overlooking Parisian street. Both share warm moment of cultural connection. Alex looks content, Emma smiles warmly. End with cozy café atmosphere.

Style: Cinematic quality, warm golden lighting, authentic French café atmosphere, natural interactions, 4K resolution, smooth camera transitions.`,
    },
    {
      id: 'movies-theater-encounter',
      title: '电影院偶遇',
      duration: 60,
      prompt: `Create a 60-second modern movie theater lobby scene:

Scene 1 (0-15s): Contemporary cinema lobby after evening screening. Sarah (enthusiastic movie fan) and Mike (fellow moviegoer) exit theater into stylish lobby with movie posters, ambient lighting. Other patrons in background.

Scene 2 (15-30s): Animated discussion about film they just watched. Close-up of excited facial expressions, hand gestures, genuine enthusiasm. Brief flashes of sci-fi movie scenes they're discussing.

Scene 3 (30-45s): Deep conversation about cinematography and acting. Show appreciation gestures, engaged body language, professional film discussion. Montage of impressive movie visuals.

Scene 4 (45-60s): Sarah recommends another film to Mike. He shows interest and gratitude. End with both smiling, connected through shared movie passion. Warm theater lobby lighting.

Style: Modern cinematic, contemporary theater atmosphere, natural film enthusiast conversations, 4K quality, smooth lighting transitions.`,
    },
    {
      id: 'workplace-meeting-discussion',
      title: '会议室讨论',
      duration: 60,
      prompt: `Create a 60-second professional office meeting:

Scene 1 (0-15s): Modern conference room with glass walls, large display screen. Lisa (professional project manager) presents to David (engaged team member). Corporate environment with laptops, documents, charts.

Scene 2 (15-30s): Lisa points to project timeline showing tight deadlines. David leans forward showing concern and engagement. Screen displays project status with deadline warnings.

Scene 3 (30-45s): David stands confidently proposing solution with professional gestures. Lisa listens intently, showing growing interest. Collaborative problem-solving atmosphere.

Scene 4 (45-60s): Successful agreement with handshake. Both look satisfied reviewing project plan together. Professional teamwork and solution achievement.

Style: Corporate professional, bright office lighting, modern business environment, natural workplace interactions, 4K quality, clean aesthetic.`,
    },
    {
      id: 'travel-airport-help',
      title: '机场问路',
      duration: 60,
      prompt: `Create a 60-second airport assistance scene:

Scene 1 (0-15s): Busy international airport terminal with travelers and departure boards. Jenny (young Asian woman with luggage) looks confused and lost, checking her boarding pass. Mark (friendly airport staff in uniform) approaches to help. Modern airport environment with clear signage.

Scene 2 (15-30s): Mark points toward terminal directions while explaining shuttle train system. Jenny listens attentively, showing relief. Display airport maps, directional signs, and shuttle train station entrance in background.

Scene 3 (30-45s): Detailed conversation about gate location and timing. Mark gestures toward departure signs and duty-free area. Jenny checks her watch showing concern about flight time. Professional helpful interaction.

Scene 4 (45-60s): Jenny expresses gratitude with relieved smile. Mark gives encouraging farewell gesture. End with Jenny walking confidently toward shuttle station while Mark continues helping other passengers.

Style: Modern airport environment, bright terminal lighting, professional service atmosphere, natural helpful interactions, 4K quality, clear airport signage visible.`,
    },
    {
      id: 'movies-online-review',
      title: '网络影评讨论',
      duration: 60,
      prompt: `Create a 60-second modern café film discussion scene:

Scene 1 (0-15s): Contemporary coffee shop with laptops and film posters on walls. Ryan (young male blogger) and Lisa (film student) sit across from each other with laptops open, discussing movies enthusiastically. Warm café lighting, casual intellectual atmosphere.

Scene 2 (15-30s): Close-up of animated discussion about film techniques. Ryan gestures while explaining narrative structure, Lisa listens intently taking notes. Show laptop screens with film reviews and movie stills in background.

Scene 3 (30-45s): Deep conversation about acting and cinematography. Both show appreciation for film craft through engaged body language and expressions. Display film analysis graphics and movie scenes on laptop screens.

Scene 4 (45-60s): Conclusion with Lisa showing interest in watching the film. Ryan smiles encouragingly. End with both looking satisfied with their intellectual exchange, laptops showing film review websites.

Style: Modern café environment, warm intellectual atmosphere, natural film enthusiast conversation, contemporary setting with technology, 4K quality, cozy lighting.`,
    },
    {
      id: 'workplace-client-presentation',
      title: '客户演示汇报',
      duration: 60,
      prompt: `Create a 60-second professional client presentation scene:

Scene 1 (0-15s): Modern conference room with large screen display and professional presentation setup. Alex (confident project manager) welcomes Catherine (sophisticated business client) for product demonstration. Corporate environment with laptops, documents, and presentation materials.

Scene 2 (15-30s): Alex presents dashboard interface on large screen showing real-time analytics and data visualizations. Catherine observes attentively, showing professional interest. Display modern software interface with charts, graphs, and business metrics.

Scene 3 (30-45s): Technical discussion about system integration and scalability. Both professionals engage in detailed conversation with confident body language. Show cloud infrastructure diagrams and technical architecture on screen.

Scene 4 (45-60s): Successful conclusion with Catherine expressing satisfaction. Alex provides timeline and next steps. End with professional handshake and positive business relationship establishment.

Style: Corporate professional environment, bright presentation lighting, modern business technology, confident professional interactions, 4K quality, clean corporate aesthetic.`,
    },
  ],

  // vTPR视频词汇配置
  vtprKeywords: {
    'travel-chapter1': [
      'Welcome', 'Recommend', 'Signature', 'Perfect', 'Window',
      'Beautiful', 'Wonderful', 'Atmosphere', 'Magical', 'Hope',
      'Smooth', 'Aromatic', 'Choice', 'View', 'Exactly'
    ],
    'travel-chapter2': [
      'Excuse me', 'Looking for', 'Lost', 'Terminal', 'Shuttle',
      'Corridor', 'Journey', 'Run', 'Departure', 'Duty-free',
      'Boards', 'Plenty', 'Reach', 'Saved', 'Safe travels'
    ],
    'movies-chapter1': [
      'Incredible', 'Plot', 'Twist', 'Ending', 'Cinematography',
      'Stunning', 'Soundtrack', 'Emotional', 'Performance', 'Outstanding',
      'Transformation', 'Recommendation', 'Realistic', 'Captured', 'Impressive'
    ],
    'movies-chapter2': [
      'Published', 'Review', 'Brilliant', 'Approach', 'Mixed',
      'Stand out', 'Narrative', 'Unconventional', 'Linear', 'Flashbacks',
      'Complexity', 'Engaged', 'Expectations', 'Exceptional', 'Perspectives'
    ],
    'workplace-chapter1': [
      'Status', 'Contribute', 'Challenges', 'Deadline', 'Obstacles',
      'Prioritize', 'Critical', 'Implement', 'Strategy', 'Iteration',
      'Proposal', 'Teamwork', 'Eager', 'Overcome', 'Elaborate'
    ],
    'workplace-chapter2': [
      'Proposal', 'Requirements', 'Demonstrate', 'Dashboard', 'Real-time',
      'Analytics', 'Operations', 'Interface', 'Integrate', 'Migration',
      'Scalability', 'Infrastructure', 'Accommodate', 'Comprehensive', 'Implementation'
    ]
  }
};

// vTPR视频选项提示词模板
const VTPR_PROMPTS = {
  // 旅行主题提示词
  travel: {
    Welcome: [
      "Café barista opening door with welcoming gesture, warm smile, inviting hand motion, cozy coffee shop entrance, 3 seconds",
      "Airport gate with passengers walking, flight attendant in background, busy travel atmosphere, 3 seconds",
      "Hotel reception with concierge checking in guests, marble lobby, professional service, 3 seconds",
      "Retail store with sales associate arranging products, commercial environment, 3 seconds"
    ],
    Recommend: [
      "Person pointing to menu with enthusiastic recommendation gesture, helpful expression, café setting, 3 seconds",
      "Someone shaking head in disagreement, negative gesture, refusing suggestion, 3 seconds",
      "Person deep in thought, contemplating options, thinking expression, 3 seconds",
      "Quick nodding approval without explanation, simple agreement, 3 seconds"
    ],
    // ... 更多词汇的提示词
  },
  
  // 电影主题提示词
  movies: {
    Incredible: [
      "Person's face showing genuine shock and amazement, eyes wide open, mouth agape, incredible reaction, 3 seconds",
      "Calm neutral expression, no particular emotion, peaceful demeanor, 3 seconds",
      "Disappointed frowning, looking down with dejected expression, unsatisfied, 3 seconds",
      "Confused puzzled look, scratching head, questioning expression, furrowed brow, 3 seconds"
    ],
    Plot: [
      "Animated diagram showing complex story structure with interconnected plot lines, story branches, 3 seconds",
      "Simple linear timeline with basic start-to-finish progression, straightforward sequence, 3 seconds",
      "Character relationship chart with connections between people, family tree style, 3 seconds",
      "Geographic map with locations and travel routes, pins and pathways, 3 seconds"
    ],
    // ... 更多词汇的提示词
  },
  
  // 职场主题提示词
  workplace: {
    Status: [
      "Progress bar showing project completion percentage, status dashboard, professional display, 3 seconds",
      "Static unchanging document, no progress indicators, dormant state, 3 seconds",
      "Detailed status report with charts and metrics, comprehensive analysis, 3 seconds",
      "Empty blank screen with no information, void of status data, 3 seconds"
    ],
    Deadline: [
      "Calendar with specific date circled in red, clock countdown timer, urgent deadline notification, 3 seconds",
      "Clock showing regular time without urgency, peaceful office environment, 3 seconds",
      "Flexible schedule with no specific dates, open calendar with multiple options, 3 seconds",
      "Expired deadline notification, overdue stamps, missed opportunity indicators, 3 seconds"
    ],
    // ... 更多词汇的提示词
  }
};

// AI视频生成工具配置
const AI_TOOLS = {
  runwayml: {
    name: 'Runway ML',
    apiUrl: 'https://api.runwayml.com/v1/generate',
    maxDuration: 16,
    quality: 'high',
    cost: 0.05, // per second
  },
  pika: {
    name: 'Pika Labs',
    apiUrl: 'https://discord.com/api/webhooks/pika',
    maxDuration: 4,
    quality: 'medium',
    cost: 0.01, // per second
  }
};

/**
 * 生成视频生产计划
 */
function generateProductionPlan() {
  console.log('🎬 生成SmarTalk视频生产计划...\n');
  
  const plan = {
    mainVideos: VIDEO_CONFIG.mainVideos.length,
    vtprVideos: 0,
    totalCost: 0,
    timeline: []
  };

  // 计算vTPR视频数量
  Object.values(VIDEO_CONFIG.vtprKeywords).forEach(keywords => {
    plan.vtprVideos += keywords.length * 4; // 每个词汇4个选项
  });

  // 估算成本
  const mainVideoCost = VIDEO_CONFIG.mainVideos.length * 60 * AI_TOOLS.runwayml.cost;
  const vtprVideoCost = plan.vtprVideos * 4 * AI_TOOLS.pika.cost;
  plan.totalCost = mainVideoCost + vtprVideoCost;

  console.log(`📊 生产统计:
  - 主视频: ${plan.mainVideos}个 (60秒每个)
  - vTPR练习视频: ${plan.vtprVideos}个 (4秒每个)
  - 学习章节: 6章 (3主题 × 2章)
  - 核心词汇: 90个 (每章15个)
  - 预估成本: $${plan.totalCost.toFixed(2)}
  - 预计时间: 15-20个工作日\n`);

  return plan;
}

/**
 * 生成Runway ML批处理脚本
 */
function generateRunwayScript() {
  console.log('🚀 生成Runway ML批处理脚本...\n');
  
  const script = `#!/bin/bash
# SmarTalk主视频生成脚本 - Runway ML

echo "🎬 开始生成SmarTalk主视频..."

`;

  VIDEO_CONFIG.mainVideos.forEach((video, index) => {
    script += `
# 生成视频 ${index + 1}: ${video.title}
echo "正在生成: ${video.title}"
curl -X POST "https://api.runwayml.com/v1/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${video.prompt.replace(/"/g, '\\"')}",
    "duration": ${video.duration},
    "resolution": "1920x1080",
    "fps": 30,
    "output_format": "mp4"
  }' \\
  -o "${video.id}.mp4"

echo "✅ ${video.title} 生成完成"
sleep 30  # 避免API限制

`;
  });

  script += `
echo "🎉 所有主视频生成完成！"
`;

  fs.writeFileSync('scripts/runway-generation.sh', script);
  console.log('✅ Runway ML脚本已保存到: scripts/runway-generation.sh');
}

/**
 * 生成Pika Labs批处理脚本
 */
function generatePikaScript() {
  console.log('🎨 生成Pika Labs批处理脚本...\n');
  
  let script = `#!/bin/bash
# SmarTalk vTPR视频生成脚本 - Pika Labs

echo "🎨 开始生成SmarTalk vTPR练习视频..."

`;

  Object.entries(VIDEO_CONFIG.vtprKeywords).forEach(([theme, keywords]) => {
    script += `
echo "📚 生成${theme}主题词汇视频..."

`;
    
    keywords.forEach(keyword => {
      if (VTPR_PROMPTS[theme] && VTPR_PROMPTS[theme][keyword]) {
        VTPR_PROMPTS[theme][keyword].forEach((prompt, index) => {
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
          script += `
# ${keyword} - 选项${optionLetter}
echo "生成: ${keyword} 选项${optionLetter}"
# 这里需要使用Pika Discord Bot命令
# /create ${prompt}
echo "提示词: ${prompt}"
sleep 5

`;
        });
      }
    });
  });

  script += `
echo "🎉 所有vTPR视频生成完成！"
`;

  fs.writeFileSync('scripts/pika-generation.sh', script);
  console.log('✅ Pika Labs脚本已保存到: scripts/pika-generation.sh');
}

/**
 * 生成视频文件组织结构
 */
function generateFileStructure() {
  console.log('📁 生成视频文件组织结构...\n');
  
  const structure = {
    'content/videos/': {
      'main/': {},
      'vtpr/': {
        'travel/': {},
        'movies/': {},
        'workplace/': {}
      },
      'audio/': {},
      'thumbnails/': {}
    }
  };

  // 主视频文件
  VIDEO_CONFIG.mainVideos.forEach(video => {
    structure['content/videos/']['main/'][`${video.id}-subtitled.mp4`] = '带字幕版本';
    structure['content/videos/']['main/'][`${video.id}-no-subs.mp4`] = '无字幕版本';
  });

  // vTPR视频文件
  Object.entries(VIDEO_CONFIG.vtprKeywords).forEach(([theme, keywords]) => {
    keywords.forEach(keyword => {
      ['a', 'b', 'c', 'd'].forEach(option => {
        structure['content/videos/']['vtpr/'][`${theme}/`][`${keyword.toLowerCase()}-option-${option}.mp4`] = `${keyword}选项${option.toUpperCase()}`;
      });
    });
  });

  // 音频文件
  Object.values(VIDEO_CONFIG.vtprKeywords).flat().forEach(keyword => {
    structure['content/videos/']['audio/'][`${keyword.toLowerCase()}.mp3`] = `${keyword}发音音频`;
  });

  console.log('📂 推荐文件组织结构:');
  console.log(JSON.stringify(structure, null, 2));
  
  fs.writeFileSync('content/file-structure.json', JSON.stringify(structure, null, 2));
  console.log('✅ 文件结构已保存到: content/file-structure.json');
}

/**
 * 生成CDN上传脚本
 */
function generateCDNScript() {
  console.log('☁️ 生成CDN上传脚本...\n');
  
  const script = `#!/bin/bash
# SmarTalk视频CDN上传脚本

echo "☁️ 开始上传视频到CDN..."

# 配置CDN信息
CDN_BUCKET="smartalk-content"
CDN_REGION="us-west-2"
CDN_BASE_URL="https://cdn.smartalk.app"

# 上传主视频
echo "📤 上传主视频..."
aws s3 sync content/videos/main/ s3://$CDN_BUCKET/videos/ --region $CDN_REGION

# 上传vTPR视频
echo "📤 上传vTPR练习视频..."
aws s3 sync content/videos/vtpr/ s3://$CDN_BUCKET/vtpr/ --region $CDN_REGION

# 上传音频文件
echo "📤 上传音频文件..."
aws s3 sync content/videos/audio/ s3://$CDN_BUCKET/audio/ --region $CDN_REGION

# 上传缩略图
echo "📤 上传缩略图..."
aws s3 sync content/videos/thumbnails/ s3://$CDN_BUCKET/thumbnails/ --region $CDN_REGION

# 设置缓存策略
echo "⚙️ 配置CDN缓存..."
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "✅ CDN上传完成！"
echo "🌐 访问地址: $CDN_BASE_URL"
`;

  fs.writeFileSync('scripts/cdn-upload.sh', script);
  console.log('✅ CDN上传脚本已保存到: scripts/cdn-upload.sh');
}

/**
 * 主函数
 */
function main() {
  console.log('🎯 SmarTalk AI视频生成工具\n');
  
  // 创建必要的目录
  const dirs = ['scripts', 'content/videos/main', 'content/videos/vtpr', 'content/videos/audio', 'content/videos/thumbnails'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 生成各种脚本和配置
  generateProductionPlan();
  generateRunwayScript();
  generatePikaScript();
  generateFileStructure();
  generateCDNScript();

  console.log('\n🎉 所有脚本和配置文件已生成完成！');
  console.log('\n📋 下一步操作:');
  console.log('1. 获取Runway ML和Pika Labs的API密钥');
  console.log('2. 运行 chmod +x scripts/*.sh 给脚本执行权限');
  console.log('3. 执行 ./scripts/runway-generation.sh 生成主视频');
  console.log('4. 执行 ./scripts/pika-generation.sh 生成vTPR视频');
  console.log('5. 执行 ./scripts/cdn-upload.sh 上传到CDN');
  console.log('6. 运行 npm run seed:real-content 更新数据库');
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  VIDEO_CONFIG,
  VTPR_PROMPTS,
  AI_TOOLS
};