/**
 * 情感化反馈文案常量
 * 提供鼓励性、温暖的用户反馈文案
 */

export interface FeedbackMessage {
  title: string;
  message: string;
  emoji?: string;
  tone: 'encouraging' | 'celebrating' | 'supportive' | 'motivating';
}

/**
 * 错误反馈文案 - 鼓励性表达
 */
export const ERROR_FEEDBACK: Record<string, FeedbackMessage> = {
  // 通用错误反馈
  GENERAL_ERROR: {
    title: '别担心！',
    message: '你的大脑正在建立连接！每一次尝试都让你更接近成功。',
    emoji: '🧠✨',
    tone: 'encouraging',
  },

  NETWORK_ERROR: {
    title: '稍等一下',
    message: '网络小憩中，就像大脑需要休息一样。让我们重新连接吧！',
    emoji: '🌐💤',
    tone: 'supportive',
  },

  LOADING_ERROR: {
    title: '内容正在路上',
    message: '好故事值得等待！我们正在为你准备精彩的内容。',
    emoji: '📚🚀',
    tone: 'encouraging',
  },

  // 学习相关错误反馈
  WRONG_ANSWER: {
    title: '很棒的尝试！',
    message: '每个错误都是大脑学习的机会。你正在建立新的神经连接！',
    emoji: '🌟🧠',
    tone: 'encouraging',
  },

  MULTIPLE_WRONG_ANSWERS: {
    title: '坚持就是胜利！',
    message: '你的大脑正在努力工作。这个词汇很快就会成为你的朋友！',
    emoji: '💪✨',
    tone: 'motivating',
  },

  TIMEOUT: {
    title: '慢慢来',
    message: '语言学习不是竞速比赛。给自己一些时间，让理解自然发生。',
    emoji: '🕰️🌱',
    tone: 'supportive',
  },

  // 进度相关反馈
  PROGRESS_LOST: {
    title: '没关系！',
    message: '真正的学习在你的大脑里，不会丢失。让我们重新开始这段美妙的旅程！',
    emoji: '🧠💎',
    tone: 'encouraging',
  },

  SYNC_ERROR: {
    title: '数据在路上',
    message: '你的进步很珍贵，我们正在努力为你保存每一个成就！',
    emoji: '☁️💾',
    tone: 'supportive',
  },
};

/**
 * 成功反馈文案 - 庆祝性表达
 */
export const SUCCESS_FEEDBACK: Record<string, FeedbackMessage> = {
  FIRST_CORRECT: {
    title: '太棒了！',
    message: '你刚刚在大脑中点亮了一个新的神经连接！这就是语言习得的魔法时刻。',
    emoji: '🎉🧠',
    tone: 'celebrating',
  },

  STREAK_3: {
    title: '你在火力全开！',
    message: '连续3个正确！你的大脑正在建立强大的语言模式。',
    emoji: '🔥🎯',
    tone: 'celebrating',
  },

  STREAK_5: {
    title: '神经网络激活！',
    message: '连续5个正确！你的语言直觉正在觉醒。',
    emoji: '⚡🧠',
    tone: 'celebrating',
  },

  PERFECT_ROUND: {
    title: '完美的语言直觉！',
    message: '全部正确！你的大脑已经开始用英语思考了。这就是我们想要的效果！',
    emoji: '🌟🎭',
    tone: 'celebrating',
  },

  FAST_RESPONSE: {
    title: '闪电反应！',
    message: '你的反应如此迅速，说明这个词汇已经深深印在你的语言中枢里了！',
    emoji: '⚡💫',
    tone: 'celebrating',
  },

  LEVEL_COMPLETE: {
    title: '故事线索收集完成！',
    message: '你已经解锁了这个故事的所有秘密。准备好迎接下一个冒险了吗？',
    emoji: '🗝️📖',
    tone: 'celebrating',
  },
};

/**
 * 进度反馈文案 - 激励性表达
 */
export const PROGRESS_FEEDBACK: Record<string, FeedbackMessage> = {
  HALFWAY: {
    title: '你已经走了一半！',
    message: '每个词汇都让你更接近流利。你的大脑正在重新布线，为英语思维做准备。',
    emoji: '🚶‍♀️🎯',
    tone: 'motivating',
  },

  ALMOST_DONE: {
    title: '就差一点点！',
    message: '你几乎要完成这个故事了！最后的几个线索正等着你去发现。',
    emoji: '🏃‍♀️🏁',
    tone: 'motivating',
  },

  DAILY_GOAL: {
    title: '今日目标达成！',
    message: '你的大脑今天又成长了一点。持续的练习正在塑造你的语言能力！',
    emoji: '🎯✅',
    tone: 'celebrating',
  },

  COMEBACK: {
    title: '欢迎回来！',
    message: '你的大脑一直在后台处理之前学过的内容。让我们继续这段语言之旅！',
    emoji: '🌅🧠',
    tone: 'encouraging',
  },
};

/**
 * 鼓励性提示文案
 */
export const ENCOURAGEMENT_TIPS: Record<string, FeedbackMessage> = {
  BRAIN_SCIENCE: {
    title: '科学小贴士',
    message: '研究表明，犯错时大脑的学习活动最活跃。每个"错误"都在强化你的记忆！',
    emoji: '🔬🧠',
    tone: 'encouraging',
  },

  NATURAL_LEARNING: {
    title: '自然学习法',
    message: '就像婴儿学母语一样，你的大脑正在通过模式识别自然习得英语。',
    emoji: '👶🌱',
    tone: 'encouraging',
  },

  PATIENCE: {
    title: '给自己一些耐心',
    message: '语言习得需要时间，就像种子需要时间发芽。你正在做得很好！',
    emoji: '🌱⏰',
    tone: 'supportive',
  },

  IMMERSION: {
    title: '沉浸的力量',
    message: '通过故事学习让你的大脑在自然语境中建立连接，这比死记硬背有效100倍！',
    emoji: '🌊📚',
    tone: 'encouraging',
  },
};

/**
 * 根据情况获取合适的反馈文案
 */
export function getFeedbackMessage(
  type: 'error' | 'success' | 'progress' | 'encouragement',
  key: string,
  fallback?: FeedbackMessage
): FeedbackMessage {
  let feedbackMap: Record<string, FeedbackMessage>;
  
  switch (type) {
    case 'error':
      feedbackMap = ERROR_FEEDBACK;
      break;
    case 'success':
      feedbackMap = SUCCESS_FEEDBACK;
      break;
    case 'progress':
      feedbackMap = PROGRESS_FEEDBACK;
      break;
    case 'encouragement':
      feedbackMap = ENCOURAGEMENT_TIPS;
      break;
    default:
      feedbackMap = ERROR_FEEDBACK;
  }

  return feedbackMap[key] || fallback || ERROR_FEEDBACK.GENERAL_ERROR;
}

/**
 * 根据错误次数获取递进式鼓励文案
 */
export function getProgressiveEncouragement(attemptCount: number): FeedbackMessage {
  if (attemptCount === 1) {
    return ERROR_FEEDBACK.WRONG_ANSWER;
  } else if (attemptCount === 2) {
    return {
      title: '再试一次！',
      message: '你的大脑正在分析模式。下一次尝试会更接近答案！',
      emoji: '🎯🧠',
      tone: 'encouraging',
    };
  } else if (attemptCount === 3) {
    return {
      title: '坚持下去！',
      message: '复杂的神经连接需要时间建立。你正在做一件了不起的事情！',
      emoji: '💪🌟',
      tone: 'motivating',
    };
  } else {
    return {
      title: '你很勇敢！',
      message: '持续的尝试正在训练你的语言直觉。每一次都让你更强大！',
      emoji: '🦁💎',
      tone: 'motivating',
    };
  }
}

/**
 * 根据成功连击数获取庆祝文案
 */
export function getStreakCelebration(streakCount: number): FeedbackMessage {
  if (streakCount >= 10) {
    return {
      title: '语言大师模式！',
      message: `连续${streakCount}个正确！你的英语直觉已经觉醒，这就是我们追求的自然状态！`,
      emoji: '👑🧠',
      tone: 'celebrating',
    };
  } else if (streakCount >= 7) {
    return {
      title: '神经网络全面激活！',
      message: `连续${streakCount}个正确！你的大脑正在用英语思考！`,
      emoji: '🚀🧠',
      tone: 'celebrating',
    };
  } else if (streakCount >= 5) {
    return SUCCESS_FEEDBACK.STREAK_5;
  } else if (streakCount >= 3) {
    return SUCCESS_FEEDBACK.STREAK_3;
  } else {
    return SUCCESS_FEEDBACK.FIRST_CORRECT;
  }
}
