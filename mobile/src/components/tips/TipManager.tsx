import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import TipPopup, { TipContent } from './TipPopup';
import { useAppStore } from '@/store/useAppStore';
import { ApiService } from '@/services/ApiService';

interface TipManagerProps {
  context?: 'onboarding' | 'learning' | 'achievement' | 'general';
  userProgress?: any;
  onTipShown?: (tipId: string) => void;
}

interface TipManagerRef {
  showRandomTip: () => void;
  showSpecificTip: (tipId: string) => void;
  getAvailableTips: () => TipContent[];
}

const TipManager = forwardRef<TipManagerRef, TipManagerProps>(({
  context = 'general',
  userProgress,
  onTipShown,
}, ref) => {
  const { user } = useAppStore();
  const [currentTip, setCurrentTip] = useState<TipContent | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [availableTips, setAvailableTips] = useState<TipContent[]>([]);

  useEffect(() => {
    loadContextualTips();
  }, [context, userProgress]);

  const loadContextualTips = () => {
    const tips = getAllTips();
    const contextualTips = tips.filter(tip => 
      isRelevantForContext(tip, context, userProgress)
    );
    setAvailableTips(contextualTips);
  };

  const getAllTips = (): TipContent[] => [
    {
      id: 'speaking_basics',
      title: '开口说英语的秘诀',
      category: 'speaking',
      icon: '🗣️',
      mainMessage: '很多人担心说错英语，但其实沟通的目标是解决问题，而不是追求完美的语法。记住这两个万能句子，它们能帮你在99%的对话困境中脱身。',
      examples: [
        {
          phrase: 'Sorry, I mean...',
          translation: '抱歉，我的意思是...',
          context: '当你说错话想要纠正时使用',
        },
        {
          phrase: 'How do you say... in English?',
          translation: '...用英语怎么说？',
          context: '当你不知道某个词的英文表达时',
        },
        {
          phrase: 'Could you repeat that, please?',
          translation: '你能再说一遍吗？',
          context: '没听清楚对方说话时',
        },
      ],
      encouragement: '记住，即使是母语者也会犯错误。重要的是勇敢开口，在实践中不断进步。SmarTalk帮你建立的理解能力就是你开口的底气！',
      relatedTips: ['confidence_building', 'listening_tips'],
    },
    {
      id: 'confidence_building',
      title: '建立说英语的自信',
      category: 'confidence',
      icon: '💪',
      mainMessage: '自信来自于准备和练习。你通过SmarTalk学到的每个词汇、理解的每个情境，都是你开口说话的资本。',
      examples: [
        {
          phrase: 'I\'m still learning, but...',
          translation: '我还在学习中，但是...',
          context: '承认自己在学习，降低对方期望',
        },
        {
          phrase: 'Let me think about that...',
          translation: '让我想想...',
          context: '给自己思考和组织语言的时间',
        },
        {
          phrase: 'That\'s a good question.',
          translation: '这是个好问题。',
          context: '争取时间思考如何回答',
        },
      ],
      encouragement: '每个人都有语言学习的过程。你的努力和进步值得被看见。相信自己，勇敢表达！',
      relatedTips: ['speaking_basics', 'practical_phrases'],
    },
    {
      id: 'listening_tips',
      title: '提升英语听力理解',
      category: 'listening',
      icon: '👂',
      mainMessage: '听力是口语的基础。SmarTalk的训练方法让你在理解的基础上自然习得，这正是最有效的学习方式。',
      examples: [
        {
          phrase: 'Could you speak a bit slower?',
          translation: '你能说慢一点吗？',
          context: '对方说话太快时',
        },
        {
          phrase: 'I didn\'t catch that.',
          translation: '我没听清楚。',
          context: '没听懂某个部分时',
        },
        {
          phrase: 'What does ... mean?',
          translation: '...是什么意思？',
          context: '遇到不懂的词汇时',
        },
      ],
      encouragement: '听力提升需要时间，但每一次练习都在积累。继续坚持，你会发现自己的理解能力在不断提高！',
      relatedTips: ['speaking_basics', 'practical_phrases'],
    },
    {
      id: 'practical_phrases',
      title: '日常实用表达',
      category: 'practical',
      icon: '💼',
      mainMessage: '掌握一些高频实用表达，能让你在大多数日常情况下都能应对自如。',
      examples: [
        {
          phrase: 'Excuse me, could you help me?',
          translation: '不好意思，你能帮帮我吗？',
          context: '寻求帮助时的礼貌开场',
        },
        {
          phrase: 'I\'m looking for...',
          translation: '我在找...',
          context: '询问地点或物品时',
        },
        {
          phrase: 'Thank you so much!',
          translation: '非常感谢！',
          context: '表达感谢，比thank you更热情',
        },
        {
          phrase: 'Have a great day!',
          translation: '祝你今天愉快！',
          context: '友好的告别用语',
        },
      ],
      encouragement: '这些简单的表达能让你在英语环境中更加从容。多练习，让它们成为你的自然反应！',
      relatedTips: ['speaking_basics', 'confidence_building'],
    },
    {
      id: 'emergency_phrases',
      title: '紧急情况应急表达',
      category: 'emergency',
      icon: '🆘',
      mainMessage: '在紧急或困难情况下，这些表达能帮你快速获得帮助。',
      examples: [
        {
          phrase: 'I need help.',
          translation: '我需要帮助。',
          context: '遇到困难时的直接求助',
        },
        {
          phrase: 'I don\'t understand.',
          translation: '我不明白。',
          context: '完全听不懂时的诚实表达',
        },
        {
          phrase: 'Can you call someone who speaks Chinese?',
          translation: '你能找个会说中文的人吗？',
          context: '语言障碍严重时的求助',
        },
        {
          phrase: 'Where is the nearest hospital?',
          translation: '最近的医院在哪里？',
          context: '医疗紧急情况',
        },
      ],
      encouragement: '希望你永远不需要用到这些表达，但掌握它们能让你在异国他乡更有安全感。',
      relatedTips: ['practical_phrases'],
    },
    {
      id: 'learning_motivation',
      title: '保持学习动力',
      category: 'confidence',
      icon: '🌟',
      mainMessage: '语言学习是一个长期过程，保持动力和耐心很重要。每一个小进步都值得庆祝！',
      examples: [
        {
          phrase: 'I\'m getting better at English.',
          translation: '我的英语正在进步。',
          context: '肯定自己的进步',
        },
        {
          phrase: 'Practice makes perfect.',
          translation: '熟能生巧。',
          context: '鼓励自己继续练习',
        },
        {
          phrase: 'Every mistake is a learning opportunity.',
          translation: '每个错误都是学习的机会。',
          context: '积极面对错误',
        },
      ],
      encouragement: '你选择了SmarTalk这种科学的学习方法，说明你很聪明。相信过程，享受进步的每一刻！',
      relatedTips: ['confidence_building'],
    },
  ];

  const isRelevantForContext = (
    tip: TipContent, 
    context: string, 
    progress?: any
  ): boolean => {
    switch (context) {
      case 'onboarding':
        return ['speaking_basics', 'confidence_building', 'learning_motivation'].includes(tip.id);
      case 'learning':
        return ['listening_tips', 'practical_phrases', 'confidence_building'].includes(tip.id);
      case 'achievement':
        return ['confidence_building', 'learning_motivation', 'speaking_basics'].includes(tip.id);
      case 'general':
      default:
        return true;
    }
  };

  const showRandomTip = () => {
    if (availableTips.length === 0) return;
    
    const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
    setCurrentTip(randomTip);
    setShowTip(true);
    
    // Track tip shown event
    if (user && onTipShown) {
      onTipShown(randomTip.id);
      ApiService.recordEvent({
        userId: user.id,
        eventType: 'app_foreground', // Using existing event type as placeholder
        eventData: {
          action: 'tip_shown',
          tipId: randomTip.id,
          tipCategory: randomTip.category,
          context,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const showSpecificTip = (tipId: string) => {
    const tip = getAllTips().find(t => t.id === tipId);
    if (tip) {
      setCurrentTip(tip);
      setShowTip(true);
      
      if (user && onTipShown) {
        onTipShown(tip.id);
      }
    }
  };

  const handleCloseTip = () => {
    setShowTip(false);
    
    // Track tip closed event
    if (user && currentTip) {
      ApiService.recordEvent({
        userId: user.id,
        eventType: 'app_background', // Using existing event type as placeholder
        eventData: {
          action: 'tip_closed',
          tipId: currentTip.id,
          context,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const handleRelatedTipPress = (tipId: string) => {
    showSpecificTip(tipId);
  };

  // Expose methods for parent components
  useImperativeHandle(ref, () => ({
    showRandomTip,
    showSpecificTip,
    getAvailableTips: () => availableTips,
  }));

  return (
    <TipPopup
      tip={currentTip}
      visible={showTip}
      onClose={handleCloseTip}
      onRelatedTipPress={handleRelatedTipPress}
    />
  );
};

export default TipManager;
export type { TipContent };