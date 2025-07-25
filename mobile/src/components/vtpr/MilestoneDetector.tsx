import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ApiService } from '@/services/ApiService';
import { useAppStore } from '@/store/useAppStore';

interface MilestoneDetectorProps {
  dramaId: string;
  currentKeywordId: string;
  onMilestoneReached: (milestone: MilestoneType) => void;
  onProgressUpdate: (progress: ProgressData) => void;
}

interface ProgressData {
  totalKeywords: number;
  completedKeywords: number;
  currentStreak: number;
  accuracy: number;
  timeSpent: number;
}

interface MilestoneType {
  type: 'keyword_completed' | 'half_complete' | 'all_complete' | 'perfect_streak' | 'speed_bonus';
  title: string;
  description: string;
  reward?: string;
  triggerMagicMoment?: boolean;
}

interface LearningSession {
  keywordId: string;
  attempts: number;
  timeSpent: number;
  completed: boolean;
  accuracy: number;
}

interface MilestoneDetectorRef {
  recordAttempt: (isCorrect: boolean) => void;
  getProgressPercentage: () => number;
  getEstimatedTimeRemaining: () => number;
  getMotivationalMessage: () => string;
  progressData: ProgressData;
}

const MilestoneDetector = forwardRef<MilestoneDetectorRef, MilestoneDetectorProps>(({
  dramaId,
  currentKeywordId,
  onMilestoneReached,
  onProgressUpdate,
}, ref) => {
  const { user } = useAppStore();
  const [progressData, setProgressData] = useState<ProgressData>({
    totalKeywords: 15,
    completedKeywords: 0,
    currentStreak: 0,
    accuracy: 0,
    timeSpent: 0,
  });
  const [learningSession, setLearningSession] = useState<LearningSession>({
    keywordId: currentKeywordId,
    attempts: 0,
    timeSpent: 0,
    completed: false,
    accuracy: 0,
  });
  const [sessionStartTime] = useState<Date>(new Date());

  useEffect(() => {
    loadProgressData();
  }, [dramaId]);

  useEffect(() => {
    // Reset session when keyword changes
    if (currentKeywordId !== learningSession.keywordId) {
      setLearningSession({
        keywordId: currentKeywordId,
        attempts: 0,
        timeSpent: 0,
        completed: false,
        accuracy: 0,
      });
    }
  }, [currentKeywordId]);

  const loadProgressData = async () => {
    try {
      if (!user) return;

      // Load user progress for this drama
      const progress = await ApiService.getUserProgress(user.id, dramaId);
      const keywords = await ApiService.getDramaKeywords(dramaId);
      
      const completedCount = progress.filter(p => p.status === 'completed' || p.status === 'unlocked').length;
      const totalAccuracy = progress.reduce((sum, p) => sum + (p.correctAttempts / Math.max(p.attempts, 1)), 0) / progress.length;
      const totalTime = progress.length * 30; // Estimate 30 seconds per keyword

      const newProgressData: ProgressData = {
        totalKeywords: keywords.length,
        completedKeywords: completedCount,
        currentStreak: calculateStreak(progress),
        accuracy: totalAccuracy || 0,
        timeSpent: totalTime,
      };

      setProgressData(newProgressData);
      onProgressUpdate(newProgressData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  };

  const calculateStreak = (progress: any[]): number => {
    let streak = 0;
    for (let i = progress.length - 1; i >= 0; i--) {
      if (progress[i].status === 'unlocked' && progress[i].correctAttempts / Math.max(progress[i].attempts, 1) >= 0.8) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const recordAttempt = (isCorrect: boolean) => {
    const currentTime = new Date();
    const timeSpent = (currentTime.getTime() - sessionStartTime.getTime()) / 1000;
    
    setLearningSession(prev => {
      const newAttempts = prev.attempts + 1;
      const newAccuracy = isCorrect ? 1 : prev.accuracy;
      
      return {
        ...prev,
        attempts: newAttempts,
        timeSpent,
        accuracy: newAccuracy,
        completed: isCorrect,
      };
    });

    if (isCorrect) {
      handleKeywordCompleted(timeSpent);
    }
  };

  const handleKeywordCompleted = async (timeSpent: number) => {
    try {
      if (!user) return;

      // Update progress in backend
      await ApiService.unlockProgress({
        userId: user.id,
        dramaId,
        keywordId: currentKeywordId,
        isCorrect: true,
      });
      
      // Update local progress
      const newCompletedCount = progressData.completedKeywords + 1;
      const newProgressData = {
        ...progressData,
        completedKeywords: newCompletedCount,
        currentStreak: progressData.currentStreak + 1,
        timeSpent: progressData.timeSpent + timeSpent,
      };
      
      setProgressData(newProgressData);
      onProgressUpdate(newProgressData);

      // Check for milestones
      checkMilestones(newProgressData, timeSpent);

      // Track analytics
      await ApiService.recordEvent({
        userId: user.id,
        eventType: 'keyword_unlock', // Using existing event type
        eventData: {
          keywordId: currentKeywordId,
          dramaId,
          attempts: learningSession.attempts + 1,
          timeSpent,
          accuracy: 1,
          totalCompleted: newCompletedCount,
          totalKeywords: progressData.totalKeywords,
        },
      });
    } catch (error) {
      console.error('Failed to handle keyword completion:', error);
    }
  };

  const checkMilestones = (progress: ProgressData, sessionTime: number) => {
    const { completedKeywords, totalKeywords, currentStreak } = progress;

    // Keyword completed milestone
    const keywordMilestone: MilestoneType = {
      type: 'keyword_completed',
      title: '词汇掌握！',
      description: `你已经掌握了 "${currentKeywordId}" 这个词汇`,
      reward: '+10 经验值',
    };
    onMilestoneReached(keywordMilestone);

    // Half complete milestone
    if (completedKeywords === Math.floor(totalKeywords / 2)) {
      const halfMilestone: MilestoneType = {
        type: 'half_complete',
        title: '学习过半！',
        description: '你已经完成了一半的词汇学习',
        reward: '解锁新提示功能',
      };
      onMilestoneReached(halfMilestone);
    }

    // Perfect streak milestone
    if (currentStreak >= 5) {
      const streakMilestone: MilestoneType = {
        type: 'perfect_streak',
        title: '连胜达人！',
        description: `连续答对 ${currentStreak} 个词汇`,
        reward: '+25 经验值',
      };
      onMilestoneReached(streakMilestone);
    }

    // Speed bonus milestone
    if (sessionTime < 30) {
      const speedMilestone: MilestoneType = {
        type: 'speed_bonus',
        title: '闪电学习！',
        description: '在30秒内完成词汇学习',
        reward: '+15 经验值',
      };
      onMilestoneReached(speedMilestone);
    }

    // All complete milestone - THE MAGIC MOMENT!
    if (completedKeywords === totalKeywords) {
      const completeMilestone: MilestoneType = {
        type: 'all_complete',
        title: '故事线索收集完成！',
        description: '你已经收集了所有的故事线索，准备好见证奇迹了吗？',
        reward: '解锁剧场模式',
        triggerMagicMoment: true,
      };
      onMilestoneReached(completeMilestone);
    }
  };

  const getProgressPercentage = (): number => {
    return (progressData.completedKeywords / progressData.totalKeywords) * 100;
  };

  const getEstimatedTimeRemaining = (): number => {
    if (progressData.completedKeywords === 0) return 0;
    
    const avgTimePerKeyword = progressData.timeSpent / progressData.completedKeywords;
    const remainingKeywords = progressData.totalKeywords - progressData.completedKeywords;
    
    return Math.round(avgTimePerKeyword * remainingKeywords);
  };

  const getMotivationalMessage = (): string => {
    const percentage = getProgressPercentage();
    
    if (percentage === 0) {
      return '开始你的学习之旅！';
    } else if (percentage < 25) {
      return '很好的开始！继续加油！';
    } else if (percentage < 50) {
      return '你正在稳步前进！';
    } else if (percentage < 75) {
      return '已经过半了！坚持下去！';
    } else if (percentage < 100) {
      return '马上就要完成了！最后冲刺！';
    } else {
      return '恭喜完成所有学习！';
    }
  };

  // Expose methods for parent component
  useImperativeHandle(ref, () => ({
    recordAttempt,
    getProgressPercentage,
    getEstimatedTimeRemaining,
    getMotivationalMessage,
    progressData,
  }));

  return null; // This is a logic-only component
};

export default MilestoneDetector;
export type { MilestoneType, ProgressData, LearningSession };