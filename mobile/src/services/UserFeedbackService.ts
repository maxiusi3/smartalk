import { AnalyticsService } from './AnalyticsService';
import { ApiService } from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FeedbackData {
  userId: string;
  feedbackType: 'magic_moment' | 'learning_experience' | 'usability' | 'emotional_impact' | 'bug_report';
  rating: number; // 1-5 scale
  comment?: string;
  context: {
    screen: string;
    timestamp: number;
    sessionDuration: number;
    completedSteps: string[];
  };
  emotionalResponse?: {
    satisfaction: number; // 1-5
    confidence: number; // 1-5
    motivation: number; // 1-5
    frustration: number; // 1-5
  };
  usabilityMetrics?: {
    taskCompletionRate: number;
    timeToComplete: number;
    errorCount: number;
    helpRequests: number;
  };
  deviceInfo: {
    platform: string;
    screenSize: { width: number; height: number };
    appVersion: string;
  };
}

export interface FeedbackPrompt {
  id: string;
  type: 'rating' | 'multiple_choice' | 'text' | 'emotion_scale';
  question: string;
  options?: string[];
  required: boolean;
  trigger: {
    event: string;
    delay?: number;
    conditions?: Record<string, any>;
  };
}

export interface UserSentiment {
  overall: number;
  trends: {
    satisfaction: number[];
    confidence: number[];
    motivation: number[];
  };
  keyInsights: string[];
  recommendations: string[];
}

/**
 * User Feedback Service
 * Collects and analyzes user feedback for UX validation and improvement
 */
export class UserFeedbackService {
  private static instance: UserFeedbackService;
  private feedbackQueue: FeedbackData[] = [];
  private activeFeedbackPrompts: Map<string, FeedbackPrompt> = new Map();
  private userSentimentHistory: Map<string, FeedbackData[]> = new Map();

  private constructor() {
    this.initializeFeedbackPrompts();
  }

  public static getInstance(): UserFeedbackService {
    if (!UserFeedbackService.instance) {
      UserFeedbackService.instance = new UserFeedbackService();
    }
    return UserFeedbackService.instance;
  }

  /**
   * Initialize feedback prompts for different user journey stages
   */
  private initializeFeedbackPrompts(): void {
    const prompts: FeedbackPrompt[] = [
      {
        id: 'onboarding_completion',
        type: 'rating',
        question: 'How clear was the onboarding process?',
        required: false,
        trigger: {
          event: 'onboarding_complete',
          delay: 2000, // 2 seconds after completion
        },
      },
      {
        id: 'interest_selection_satisfaction',
        type: 'multiple_choice',
        question: 'Did you find an interest category that matches your learning goals?',
        options: ['Perfect match', 'Good enough', 'Somewhat relevant', 'Not really', 'Not at all'],
        required: false,
        trigger: {
          event: 'interest_selected',
          delay: 1000,
        },
      },
      {
        id: 'vtpr_difficulty',
        type: 'rating',
        question: 'How was the difficulty level of the vocabulary exercises?',
        required: false,
        trigger: {
          event: 'vtpr_session_complete',
          conditions: { accuracy: { $lt: 0.7 } }, // Only if accuracy < 70%
        },
      },
      {
        id: 'magic_moment_impact',
        type: 'emotion_scale',
        question: 'How did you feel when watching the video without subtitles?',
        required: true,
        trigger: {
          event: 'magic_moment_complete',
          delay: 3000,
        },
      },
      {
        id: 'learning_confidence',
        type: 'rating',
        question: 'How confident do you feel about your English learning progress?',
        required: false,
        trigger: {
          event: 'achievement_screen_viewed',
          delay: 5000,
        },
      },
    ];

    prompts.forEach(prompt => {
      this.activeFeedbackPrompts.set(prompt.id, prompt);
    });
  }

  /**
   * Collect user feedback
   */
  public async collectFeedback(feedbackData: Partial<FeedbackData>): Promise<void> {
    try {
      const completeFeedback: FeedbackData = {
        userId: feedbackData.userId || 'anonymous',
        feedbackType: feedbackData.feedbackType || 'learning_experience',
        rating: feedbackData.rating || 0,
        comment: feedbackData.comment,
        context: {
          screen: feedbackData.context?.screen || 'unknown',
          timestamp: Date.now(),
          sessionDuration: feedbackData.context?.sessionDuration || 0,
          completedSteps: feedbackData.context?.completedSteps || [],
        },
        emotionalResponse: feedbackData.emotionalResponse,
        usabilityMetrics: feedbackData.usabilityMetrics,
        deviceInfo: {
          platform: feedbackData.deviceInfo?.platform || 'unknown',
          screenSize: feedbackData.deviceInfo?.screenSize || { width: 0, height: 0 },
          appVersion: feedbackData.deviceInfo?.appVersion || '1.0.0',
        },
      };

      // Store feedback locally
      this.feedbackQueue.push(completeFeedback);
      await this.saveFeedbackLocally(completeFeedback);

      // Update user sentiment history
      this.updateUserSentimentHistory(completeFeedback);

      // Send to analytics
      AnalyticsService.getInstance().track('user_feedback_collected', {
        feedbackType: completeFeedback.feedbackType,
        rating: completeFeedback.rating,
        hasComment: !!completeFeedback.comment,
        emotionalResponse: completeFeedback.emotionalResponse,
      }, completeFeedback.userId);

      // Send to backend
      await this.sendFeedbackToBackend(completeFeedback);

      console.log('✅ User feedback collected successfully');
    } catch (error) {
      console.error('❌ Failed to collect user feedback:', error);
      AnalyticsService.getInstance().track('feedback_collection_error', {
        error: error.message,
      });
    }
  }

  /**
   * Trigger feedback prompt based on user event
   */
  public async triggerFeedbackPrompt(eventType: string, eventData?: Record<string, any>): Promise<FeedbackPrompt | null> {
    try {
      // Find matching prompts
      const matchingPrompts = Array.from(this.activeFeedbackPrompts.values()).filter(prompt => {
        if (prompt.trigger.event !== eventType) return false;

        // Check conditions if specified
        if (prompt.trigger.conditions && eventData) {
          return this.evaluateConditions(prompt.trigger.conditions, eventData);
        }

        return true;
      });

      if (matchingPrompts.length === 0) return null;

      // Select the most relevant prompt (for now, just take the first)
      const selectedPrompt = matchingPrompts[0];

      // Apply delay if specified
      if (selectedPrompt.trigger.delay) {
        setTimeout(() => {
          this.showFeedbackPrompt(selectedPrompt);
        }, selectedPrompt.trigger.delay);
      } else {
        this.showFeedbackPrompt(selectedPrompt);
      }

      return selectedPrompt;
    } catch (error) {
      console.error('❌ Failed to trigger feedback prompt:', error);
      return null;
    }
  }

  /**
   * Analyze user sentiment from feedback history
   */
  public analyzeUserSentiment(userId: string): UserSentiment {
    const userFeedback = this.userSentimentHistory.get(userId) || [];
    
    if (userFeedback.length === 0) {
      return {
        overall: 0,
        trends: { satisfaction: [], confidence: [], motivation: [] },
        keyInsights: ['No feedback data available'],
        recommendations: ['Encourage user to provide feedback'],
      };
    }

    // Calculate overall sentiment
    const overallRating = userFeedback.reduce((sum, feedback) => sum + feedback.rating, 0) / userFeedback.length;

    // Extract emotional trends
    const emotionalTrends = {
      satisfaction: userFeedback.map(f => f.emotionalResponse?.satisfaction || 0).filter(v => v > 0),
      confidence: userFeedback.map(f => f.emotionalResponse?.confidence || 0).filter(v => v > 0),
      motivation: userFeedback.map(f => f.emotionalResponse?.motivation || 0).filter(v => v > 0),
    };

    // Generate insights
    const keyInsights = this.generateInsights(userFeedback);
    const recommendations = this.generateRecommendations(userFeedback, overallRating);

    return {
      overall: overallRating,
      trends: emotionalTrends,
      keyInsights,
      recommendations,
    };
  }

  /**
   * Get aggregated feedback analytics
   */
  public getAggregatedFeedback(): {
    totalResponses: number;
    averageRating: number;
    feedbackByType: Record<string, number>;
    emotionalMetrics: {
      satisfaction: number;
      confidence: number;
      motivation: number;
      frustration: number;
    };
    commonIssues: string[];
    positiveHighlights: string[];
  } {
    const allFeedback = Array.from(this.userSentimentHistory.values()).flat();
    
    if (allFeedback.length === 0) {
      return {
        totalResponses: 0,
        averageRating: 0,
        feedbackByType: {},
        emotionalMetrics: { satisfaction: 0, confidence: 0, motivation: 0, frustration: 0 },
        commonIssues: [],
        positiveHighlights: [],
      };
    }

    // Calculate metrics
    const totalResponses = allFeedback.length;
    const averageRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalResponses;

    // Group by feedback type
    const feedbackByType = allFeedback.reduce((acc, feedback) => {
      acc[feedback.feedbackType] = (acc[feedback.feedbackType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate emotional metrics
    const emotionalResponses = allFeedback.filter(f => f.emotionalResponse);
    const emotionalMetrics = {
      satisfaction: this.calculateAverage(emotionalResponses.map(f => f.emotionalResponse!.satisfaction)),
      confidence: this.calculateAverage(emotionalResponses.map(f => f.emotionalResponse!.confidence)),
      motivation: this.calculateAverage(emotionalResponses.map(f => f.emotionalResponse!.motivation)),
      frustration: this.calculateAverage(emotionalResponses.map(f => f.emotionalResponse!.frustration)),
    };

    // Extract common issues and highlights
    const commonIssues = this.extractCommonIssues(allFeedback);
    const positiveHighlights = this.extractPositiveHighlights(allFeedback);

    return {
      totalResponses,
      averageRating,
      feedbackByType,
      emotionalMetrics,
      commonIssues,
      positiveHighlights,
    };
  }

  /**
   * Export feedback data for analysis
   */
  public async exportFeedbackData(): Promise<string> {
    try {
      const allFeedback = Array.from(this.userSentimentHistory.values()).flat();
      const aggregatedData = this.getAggregatedFeedback();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        summary: aggregatedData,
        detailedFeedback: allFeedback,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export feedback data:', error);
      throw error;
    }
  }

  // Private helper methods

  private async saveFeedbackLocally(feedback: FeedbackData): Promise<void> {
    try {
      const key = `feedback_${feedback.userId}_${feedback.context.timestamp}`;
      await AsyncStorage.setItem(key, JSON.stringify(feedback));
    } catch (error) {
      console.error('Failed to save feedback locally:', error);
    }
  }

  private updateUserSentimentHistory(feedback: FeedbackData): void {
    const userHistory = this.userSentimentHistory.get(feedback.userId) || [];
    userHistory.push(feedback);
    
    // Keep only last 50 feedback entries per user
    if (userHistory.length > 50) {
      userHistory.splice(0, userHistory.length - 50);
    }
    
    this.userSentimentHistory.set(feedback.userId, userHistory);
  }

  private async sendFeedbackToBackend(feedback: FeedbackData): Promise<void> {
    try {
      await ApiService.post('/feedback', feedback);
    } catch (error) {
      console.error('Failed to send feedback to backend:', error);
      // Store for retry later
      await AsyncStorage.setItem(`pending_feedback_${Date.now()}`, JSON.stringify(feedback));
    }
  }

  private evaluateConditions(conditions: Record<string, any>, eventData: Record<string, any>): boolean {
    for (const [key, condition] of Object.entries(conditions)) {
      const value = eventData[key];
      
      if (typeof condition === 'object') {
        if (condition.$lt && value >= condition.$lt) return false;
        if (condition.$gt && value <= condition.$gt) return false;
        if (condition.$eq && value !== condition.$eq) return false;
      } else {
        if (value !== condition) return false;
      }
    }
    
    return true;
  }

  private showFeedbackPrompt(prompt: FeedbackPrompt): void {
    // This would trigger the UI to show the feedback prompt
    // For now, we'll just log it
    console.log(`📝 Showing feedback prompt: ${prompt.question}`);
    
    AnalyticsService.getInstance().track('feedback_prompt_shown', {
      promptId: prompt.id,
      promptType: prompt.type,
      question: prompt.question,
    });
  }

  private generateInsights(feedback: FeedbackData[]): string[] {
    const insights: string[] = [];
    
    // Analyze rating trends
    const ratings = feedback.map(f => f.rating);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    
    if (avgRating >= 4) {
      insights.push('User shows high satisfaction with the learning experience');
    } else if (avgRating <= 2) {
      insights.push('User experiencing significant challenges - needs attention');
    }

    // Analyze emotional responses
    const emotionalResponses = feedback.filter(f => f.emotionalResponse);
    if (emotionalResponses.length > 0) {
      const avgConfidence = emotionalResponses.reduce((sum, f) => sum + f.emotionalResponse!.confidence, 0) / emotionalResponses.length;
      if (avgConfidence >= 4) {
        insights.push('User confidence is building well through the learning process');
      } else if (avgConfidence <= 2) {
        insights.push('User confidence needs boosting - consider easier progression');
      }
    }

    // Analyze feedback frequency
    if (feedback.length >= 5) {
      insights.push('User is actively engaged and providing regular feedback');
    }

    return insights;
  }

  private generateRecommendations(feedback: FeedbackData[], overallRating: number): string[] {
    const recommendations: string[] = [];
    
    if (overallRating < 3) {
      recommendations.push('Consider personalizing the learning difficulty');
      recommendations.push('Provide additional support and guidance');
    }

    // Check for usability issues
    const usabilityFeedback = feedback.filter(f => f.usabilityMetrics);
    if (usabilityFeedback.some(f => f.usabilityMetrics!.errorCount > 3)) {
      recommendations.push('Review UI/UX for common error patterns');
    }

    // Check emotional responses
    const lowMotivation = feedback.some(f => f.emotionalResponse?.motivation && f.emotionalResponse.motivation <= 2);
    if (lowMotivation) {
      recommendations.push('Add more motivational elements and progress celebration');
    }

    return recommendations;
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private extractCommonIssues(feedback: FeedbackData[]): string[] {
    const issues: string[] = [];
    
    // Analyze comments for common issues
    const comments = feedback.filter(f => f.comment).map(f => f.comment!.toLowerCase());
    
    const commonKeywords = ['difficult', 'confusing', 'slow', 'bug', 'error', 'problem'];
    commonKeywords.forEach(keyword => {
      const count = comments.filter(comment => comment.includes(keyword)).length;
      if (count >= 3) {
        issues.push(`Multiple users report issues with: ${keyword}`);
      }
    });

    return issues;
  }

  private extractPositiveHighlights(feedback: FeedbackData[]): string[] {
    const highlights: string[] = [];
    
    // Analyze comments for positive feedback
    const comments = feedback.filter(f => f.comment).map(f => f.comment!.toLowerCase());
    
    const positiveKeywords = ['love', 'great', 'amazing', 'helpful', 'easy', 'fun'];
    positiveKeywords.forEach(keyword => {
      const count = comments.filter(comment => comment.includes(keyword)).length;
      if (count >= 3) {
        highlights.push(`Users appreciate: ${keyword} experience`);
      }
    });

    return highlights;
  }
}

export const userFeedbackService = UserFeedbackService.getInstance();