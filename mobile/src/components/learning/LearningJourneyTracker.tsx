import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Animated } from 'react-native';
import { ApiService } from '@/services/ApiService';
import { useAppStore } from '@/store/useAppStore';

const { width: screenWidth } = Dimensions.get('window');

interface JourneyData {
  totalChapters: number;
  completedChapters: number;
  currentChapter: number;
  totalKeywords: number;
  masteredKeywords: number;
  streakDays: number;
  totalTimeSpent: number;
  averageAccuracy: number;
  lastStudyDate: Date | null;
  weeklyGoalProgress: number;
}

interface LearningJourneyTrackerProps {
  onJourneyUpdate: (data: JourneyData) => void;
  showDetailedStats?: boolean;
}

const LearningJourneyTracker: React.FC<LearningJourneyTrackerProps> = ({
  onJourneyUpdate,
  showDetailedStats = false,
}) => {
  const { user, selectedInterest } = useAppStore();
  const [journeyData, setJourneyData] = useState<JourneyData>({
    totalChapters: 5,
    completedChapters: 1,
    currentChapter: 2,
    totalKeywords: 100,
    masteredKeywords: 23,
    streakDays: 3,
    totalTimeSpent: 3600, // in seconds
    averageAccuracy: 0.85,
    lastStudyDate: new Date(),
    weeklyGoalProgress: 0.6,
  });

  const progressAnim = new Animated.Value(0);
  const streakAnim = new Animated.Value(0);

  useEffect(() => {
    loadJourneyData();
    
    // Animate progress indicators
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: journeyData.masteredKeywords / journeyData.totalKeywords,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(streakAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadJourneyData = async () => {
    try {
      if (!user || !selectedInterest) return;

      // For now, use mock data since we don't have a specific analytics endpoint
      // In a real implementation, we would load actual user progress data
      // const userProgress = await ApiService.getUserProgress(user.id, 'current-drama-id');
      
      // Mock progress data for demonstration
      const mockProgress = Array.from({ length: 45 }, (_, i) => ({
        keywordId: `keyword-${i + 1}`,
        isUnlocked: i < journeyData.masteredKeywords,
        accuracy: 0.7 + Math.random() * 0.3, // Random accuracy between 0.7-1.0
        timeSpent: 30 + Math.random() * 60, // Random time 30-90 seconds
        attempts: Math.floor(1 + Math.random() * 3), // 1-3 attempts
      }));

      // Calculate journey metrics from mock data
      const newJourneyData: JourneyData = {
        totalChapters: 5,
        completedChapters: calculateCompletedChapters(mockProgress),
        currentChapter: getCurrentChapter(mockProgress),
        totalKeywords: mockProgress.length,
        masteredKeywords: mockProgress.filter(p => p.isUnlocked && p.accuracy >= 0.8).length,
        streakDays: calculateStreakDays(['2024-01-15', '2024-01-16', '2024-01-17']), // Mock study dates
        totalTimeSpent: mockProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        averageAccuracy: calculateAverageAccuracy(mockProgress),
        lastStudyDate: new Date(),
        weeklyGoalProgress: 0.6, // Mock weekly progress
      };

      setJourneyData(newJourneyData);
      onJourneyUpdate(newJourneyData);

      // Track journey milestone events
      await trackJourneyMilestones(newJourneyData);
    } catch (error) {
      console.error('Failed to load journey data:', error);
    }
  };

  const calculateCompletedChapters = (progress: any[]): number => {
    // Group progress by chapters and count completed ones
    const chapterProgress = groupProgressByChapter(progress);
    return Object.values(chapterProgress).filter(
      (chapter: any) => chapter.completionRate >= 1.0
    ).length;
  };

  const getCurrentChapter = (progress: any[]): number => {
    const chapterProgress = groupProgressByChapter(progress);
    const chapters = Object.keys(chapterProgress).sort();
    
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapterProgress[chapters[i]];
      if (chapter.completionRate < 1.0) {
        return i + 1;
      }
    }
    
    return chapters.length;
  };

  const groupProgressByChapter = (progress: any[]): Record<string, any> => {
    // Mock implementation - in real app, this would group by actual chapter data
    const chapters: Record<string, any> = {};
    const itemsPerChapter = Math.ceil(progress.length / 5);
    
    for (let i = 0; i < 5; i++) {
      const chapterItems = progress.slice(i * itemsPerChapter, (i + 1) * itemsPerChapter);
      const completed = chapterItems.filter(item => item.isUnlocked).length;
      
      chapters[`chapter-${i + 1}`] = {
        totalItems: chapterItems.length,
        completedItems: completed,
        completionRate: chapterItems.length > 0 ? completed / chapterItems.length : 0,
      };
    }
    
    return chapters;
  };

  const calculateStreakDays = (studyDates: string[]): number => {
    if (!studyDates || studyDates.length === 0) return 0;
    
    const sortedDates = studyDates
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const studyDate = new Date(sortedDates[i]);
      studyDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - studyDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateAverageAccuracy = (progress: any[]): number => {
    const completedItems = progress.filter(p => p.isUnlocked && p.accuracy !== undefined);
    if (completedItems.length === 0) return 0;
    
    const totalAccuracy = completedItems.reduce((sum, item) => sum + item.accuracy, 0);
    return totalAccuracy / completedItems.length;
  };

  const calculateWeeklyProgress = (weeklyStats: any): number => {
    // Mock implementation - calculate progress towards weekly goal
    const weeklyGoal = 7; // 7 sessions per week
    const currentWeekSessions = weeklyStats?.sessionsThisWeek || 0;
    return Math.min(currentWeekSessions / weeklyGoal, 1.0);
  };

  const trackJourneyMilestones = async (data: JourneyData) => {
    if (!user) return;

    const milestones = [];

    // Check for various milestones
    if (data.streakDays >= 7) {
      milestones.push({
        type: 'weekly_streak',
        title: '一周连续学习',
        description: `连续学习 ${data.streakDays} 天`,
      });
    }

    if (data.masteredKeywords >= 50) {
      milestones.push({
        type: 'vocabulary_milestone',
        title: '词汇达人',
        description: `掌握了 ${data.masteredKeywords} 个词汇`,
      });
    }

    if (data.completedChapters >= 3) {
      milestones.push({
        type: 'chapter_milestone',
        title: '学习进展',
        description: `完成了 ${data.completedChapters} 个章节`,
      });
    }

    // Track milestone events
    for (const milestone of milestones) {
      await ApiService.recordEvent({
        userId: user.id,
        eventType: 'milestone_reached',
        eventData: {
          milestoneType: milestone.type,
          milestoneTitle: milestone.title,
          journeyData: data,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const getMotivationalMessage = (): string => {
    const { streakDays, masteredKeywords, weeklyGoalProgress } = journeyData;
    
    if (streakDays >= 7) {
      return `🔥 太棒了！你已经连续学习 ${streakDays} 天了！`;
    } else if (masteredKeywords >= 50) {
      return `📚 厉害！你已经掌握了 ${masteredKeywords} 个词汇！`;
    } else if (weeklyGoalProgress >= 0.8) {
      return `🎯 本周目标即将达成，继续加油！`;
    } else {
      return `🌟 每一步都是进步，坚持下去！`;
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 0.8) return '#4CAF50';
    if (progress >= 0.6) return '#FF9800';
    if (progress >= 0.4) return '#2196F3';
    return '#757575';
  };

  if (!showDetailedStats) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Journey Overview */}
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>学习概览</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{journeyData.completedChapters}</Text>
            <Text style={styles.statLabel}>已完成章节</Text>
            <Text style={styles.statTotal}>/ {journeyData.totalChapters}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{journeyData.masteredKeywords}</Text>
            <Text style={styles.statLabel}>掌握词汇</Text>
            <Text style={styles.statTotal}>/ {journeyData.totalKeywords}</Text>
          </View>
          
          <Animated.View 
            style={[
              styles.statCard,
              {
                transform: [
                  {
                    scale: streakAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: '#FF6B35' }]}>
              {journeyData.streakDays}
            </Text>
            <Text style={styles.statLabel}>连续天数</Text>
            <Text style={styles.streakEmoji}>🔥</Text>
          </Animated.View>
        </View>
      </View>

      {/* Progress Visualization */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>学习进度</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: getProgressColor(journeyData.masteredKeywords / journeyData.totalKeywords),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((journeyData.masteredKeywords / journeyData.totalKeywords) * 100)}%
          </Text>
        </View>
        
        <Text style={styles.progressLabel}>
          词汇掌握进度
        </Text>
      </View>

      {/* Weekly Goal */}
      <View style={styles.goalSection}>
        <Text style={styles.sectionTitle}>本周目标</Text>
        
        <View style={styles.goalContainer}>
          <View style={styles.goalBar}>
            <View 
              style={[
                styles.goalFill,
                { width: `${journeyData.weeklyGoalProgress * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.goalText}>
            {Math.round(journeyData.weeklyGoalProgress * 100)}%
          </Text>
        </View>
        
        <Text style={styles.goalLabel}>
          每周学习目标完成度
        </Text>
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationSection}>
        <Text style={styles.motivationText}>
          {getMotivationalMessage()}
        </Text>
      </View>

      {/* Study Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>总学习时长</Text>
          <Text style={styles.statRowValue}>{formatTime(journeyData.totalTimeSpent)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>平均准确率</Text>
          <Text style={styles.statRowValue}>
            {Math.round(journeyData.averageAccuracy * 100)}%
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>上次学习</Text>
          <Text style={styles.statRowValue}>
            {journeyData.lastStudyDate 
              ? journeyData.lastStudyDate.toLocaleDateString('zh-CN')
              : '暂无记录'
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  statTotal: {
    fontSize: 10,
    color: '#BDBDBD',
    marginTop: 2,
  },
  streakEmoji: {
    fontSize: 16,
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    minWidth: 40,
  },
  progressLabel: {
    fontSize: 14,
    color: '#757575',
  },
  goalSection: {
    marginBottom: 24,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 12,
  },
  goalFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  goalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    minWidth: 40,
  },
  goalLabel: {
    fontSize: 14,
    color: '#757575',
  },
  motivationSection: {
    backgroundColor: '#FFF3EF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  motivationText: {
    fontSize: 16,
    color: '#1A237E',
    fontWeight: '500',
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  statRowLabel: {
    fontSize: 14,
    color: '#757575',
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A237E',
  },
});

export default LearningJourneyTracker;
export type { JourneyData };