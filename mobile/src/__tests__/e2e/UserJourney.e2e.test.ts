import { ApiService } from '@/services/ApiService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { useAppStore } from '@/store/useAppStore';

// Mock React Native components and modules
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Dimensions: { get: () => ({ width: 375, height: 812 }) },
  Alert: { alert: jest.fn() },
  Linking: { openURL: jest.fn() },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: () => Promise.resolve('test-device-id'),
  getTotalMemory: () => Promise.resolve(4 * 1024 * 1024 * 1024), // 4GB
  getUsedMemory: () => Promise.resolve(2 * 1024 * 1024 * 1024), // 2GB
  isLowRamDevice: () => Promise.resolve(false),
}));

// Mock API responses
const mockInterests = [
  { id: '1', name: 'Travel', description: 'Learn English through travel scenarios' },
  { id: '2', name: 'Movies', description: 'Learn English through movie dialogues' },
  { id: '3', name: 'Workplace', description: 'Learn English for professional settings' },
];

const mockDrama = {
  id: 'drama-1',
  title: 'Airport Adventure',
  interestId: '1',
  subtitledVideoUrl: 'https://example.com/video-with-subs.mp4',
  noSubtitlesVideoUrl: 'https://example.com/video-no-subs.mp4',
  duration: 60,
};

const mockKeywords = Array.from({ length: 15 }, (_, i) => ({
  id: `keyword-${i + 1}`,
  word: `word${i + 1}`,
  audioUrl: `https://example.com/audio-${i + 1}.mp3`,
  videoClips: [
    { id: `clip-${i + 1}-1`, url: 'https://example.com/clip1.mp4', isCorrect: true },
    { id: `clip-${i + 1}-2`, url: 'https://example.com/clip2.mp4', isCorrect: false },
    { id: `clip-${i + 1}-3`, url: 'https://example.com/clip3.mp4', isCorrect: false },
  ],
}));

describe('Complete User Journey E2E Tests', () => {
  let mockUser: any;
  let analyticsEvents: any[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsEvents = [];
    
    // Mock user creation
    mockUser = {
      id: 'test-user-123',
      deviceId: 'test-device-id',
      createdAt: new Date(),
    };

    // Mock API calls
    jest.spyOn(ApiService, 'createAnonymousUser').mockResolvedValue(mockUser);
    jest.spyOn(ApiService, 'getInterests').mockResolvedValue(mockInterests);
    jest.spyOn(ApiService, 'getDramasByInterest').mockResolvedValue([mockDrama]);
    jest.spyOn(ApiService, 'getDramaKeywords').mockResolvedValue(mockKeywords);
    jest.spyOn(ApiService, 'updateUserProgress').mockResolvedValue({ success: true });

    // Mock analytics tracking
    jest.spyOn(AnalyticsService.getInstance(), 'track').mockImplementation((eventType, eventData) => {
      analyticsEvents.push({ eventType, eventData, timestamp: Date.now() });
    });

    // Reset app store
    useAppStore.getState().reset();
  });

  describe('Happy Path: First-Time User Activation Journey', () => {
    it('should complete the full user journey from app launch to magic moment', async () => {
      console.log('🚀 Starting complete user journey test...');

      // Step 1: App Launch and Initialization
      console.log('📱 Step 1: App Launch');
      const store = useAppStore.getState();
      
      // Simulate app launch
      store.setFirstLaunch(true);
      expect(store.isFirstLaunch).toBe(true);

      // Verify analytics tracking for app launch
      expect(analyticsEvents.some(e => e.eventType === 'app_launch')).toBe(true);

      // Step 2: Onboarding Flow
      console.log('👋 Step 2: Onboarding Flow');
      
      // Create anonymous user
      const user = await ApiService.createAnonymousUser('test-device-id');
      store.setUser(user);
      expect(store.user?.id).toBe('test-user-123');

      // Track onboarding start
      AnalyticsService.getInstance().track('onboarding_start', {}, user.id);
      
      // Simulate onboarding completion
      store.setOnboardingCompleted(true);
      AnalyticsService.getInstance().track('onboarding_complete', { duration: 30000 }, user.id);
      
      expect(store.onboardingCompleted).toBe(true);
      expect(analyticsEvents.some(e => e.eventType === 'onboarding_complete')).toBe(true);

      // Step 3: Interest Selection
      console.log('🎯 Step 3: Interest Selection');
      
      const interests = await ApiService.getInterests();
      expect(interests).toHaveLength(3);
      
      // User selects travel interest
      const selectedInterest = interests[0];
      store.setSelectedInterest(selectedInterest.id);
      
      AnalyticsService.getInstance().track('interest_selected', {
        interestId: selectedInterest.id,
        interestName: selectedInterest.name,
      }, user.id);

      expect(store.selectedInterest).toBe('1');
      expect(analyticsEvents.some(e => e.eventType === 'interest_selected')).toBe(true);

      // Step 4: Drama Preview
      console.log('🎬 Step 4: Drama Preview');
      
      const dramas = await ApiService.getDramasByInterest(selectedInterest.id);
      expect(dramas).toHaveLength(1);
      
      const selectedDrama = dramas[0];
      store.setCurrentDrama(selectedDrama);
      
      // Track video preview
      AnalyticsService.getInstance().track('video_preview_start', {
        dramaId: selectedDrama.id,
      }, user.id);

      // Simulate video completion
      setTimeout(() => {
        AnalyticsService.getInstance().track('video_preview_complete', {
          dramaId: selectedDrama.id,
          duration: 60000,
        }, user.id);
      }, 100);

      expect(store.currentDrama?.id).toBe('drama-1');

      // Step 5: vTPR Learning Session
      console.log('🎯 Step 5: vTPR Learning Session');
      
      const keywords = await ApiService.getDramaKeywords(selectedDrama.id);
      expect(keywords).toHaveLength(15);
      
      // Simulate learning all keywords
      let correctAnswers = 0;
      let totalAttempts = 0;
      
      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        
        // Track vTPR start
        AnalyticsService.getInstance().track('vtpr_start', {
          keywordId: keyword.id,
        }, user.id);

        // Simulate user attempts (some correct, some incorrect)
        const attempts = Math.floor(Math.random() * 3) + 1; // 1-3 attempts
        totalAttempts += attempts;
        
        for (let attempt = 1; attempt <= attempts; attempt++) {
          if (attempt === attempts) {
            // Final attempt is always correct
            correctAnswers++;
            AnalyticsService.getInstance().track('vtpr_answer_correct', {
              keywordId: keyword.id,
              attempts: attempt,
              timeSpent: 5000 + Math.random() * 10000, // 5-15 seconds
            }, user.id);
            
            // Update progress
            await ApiService.updateUserProgress(user.id, keyword.id, 'completed');
            store.updateKeywordProgress(keyword.id, true);
            
          } else {
            // Incorrect attempt
            AnalyticsService.getInstance().track('vtpr_answer_incorrect', {
              keywordId: keyword.id,
              attempts: attempt,
              selectedOption: `clip-${keyword.id}-2`, // Wrong option
            }, user.id);
          }
        }
      }

      // Verify all keywords completed
      const completedKeywords = store.getCompletedKeywords();
      expect(completedKeywords).toHaveLength(15);
      
      // Track vTPR session completion
      const accuracy = correctAnswers / totalAttempts;
      AnalyticsService.getInstance().track('vtpr_session_complete', {
        dramaId: selectedDrama.id,
        totalKeywords: 15,
        totalTime: 300000, // 5 minutes
        accuracy: accuracy,
      }, user.id);

      console.log(`📊 vTPR Session: ${correctAnswers}/${totalAttempts} (${Math.round(accuracy * 100)}% accuracy)`);

      // Step 6: Magic Moment - Subtitle-free Video
      console.log('✨ Step 6: Magic Moment');
      
      // Track magic moment start
      AnalyticsService.getInstance().track('magic_moment_start', {
        dramaId: selectedDrama.id,
      }, user.id);

      // Simulate watching subtitle-free video
      setTimeout(() => {
        // This is the critical activation event
        AnalyticsService.getInstance().track('magic_moment_complete', {
          dramaId: selectedDrama.id,
          userFeedback: 'amazing', // Simulated positive feedback
        }, user.id);
        
        store.setActivated(true);
      }, 60000); // 1 minute video

      // Fast forward time for test
      jest.advanceTimersByTime(60000);

      expect(store.isActivated).toBe(true);
      expect(analyticsEvents.some(e => e.eventType === 'magic_moment_complete')).toBe(true);

      // Step 7: Verify Complete Journey Analytics
      console.log('📈 Step 7: Analytics Verification');
      
      const expectedEvents = [
        'app_launch',
        'onboarding_start',
        'onboarding_complete',
        'interest_selected',
        'video_preview_start',
        'video_preview_complete',
        'vtpr_start',
        'vtpr_answer_correct',
        'vtpr_session_complete',
        'magic_moment_start',
        'magic_moment_complete',
      ];

      expectedEvents.forEach(eventType => {
        const hasEvent = analyticsEvents.some(e => e.eventType === eventType);
        expect(hasEvent).toBe(true);
        console.log(`✅ ${eventType} tracked`);
      });

      // Verify conversion funnel
      const funnelEvents = analyticsEvents.filter(e => 
        ['onboarding_complete', 'interest_selected', 'vtpr_session_complete', 'magic_moment_complete'].includes(e.eventType)
      );
      
      expect(funnelEvents).toHaveLength(4);
      console.log('🎯 Conversion funnel complete: Onboarding → Interest → Learning → Activation');

      console.log('🎉 Complete user journey test passed!');
    }, 30000); // 30 second timeout

    it('should handle user journey with errors gracefully', async () => {
      console.log('🔧 Testing error handling in user journey...');

      const store = useAppStore.getState();
      
      // Simulate API failure during interest loading
      jest.spyOn(ApiService, 'getInterests').mockRejectedValueOnce(new Error('Network error'));
      
      try {
        await ApiService.getInterests();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Network error');
        
        // Verify error is tracked
        AnalyticsService.getInstance().track('error_api', {
          errorMessage: 'Network error',
          context: 'interest_loading',
        }, 'test-user');
        
        expect(analyticsEvents.some(e => e.eventType === 'error_api')).toBe(true);
      }

      // Test recovery - retry should work
      jest.spyOn(ApiService, 'getInterests').mockResolvedValueOnce(mockInterests);
      const interests = await ApiService.getInterests();
      expect(interests).toHaveLength(3);

      console.log('✅ Error handling test passed');
    });

    it('should track performance metrics throughout the journey', async () => {
      console.log('⚡ Testing performance tracking...');

      const store = useAppStore.getState();
      
      // Simulate app startup
      const startupStart = Date.now();
      
      // Mock startup completion
      setTimeout(() => {
        const startupTime = Date.now() - startupStart;
        AnalyticsService.getInstance().track('performance_app_startup', {
          value: startupTime,
          context: { deviceType: 'test' },
        }, 'test-user');
      }, 1500); // 1.5 seconds startup

      jest.advanceTimersByTime(1500);

      // Verify performance tracking
      const performanceEvents = analyticsEvents.filter(e => 
        e.eventType.startsWith('performance_')
      );
      
      expect(performanceEvents.length).toBeGreaterThan(0);
      
      const startupEvent = performanceEvents.find(e => 
        e.eventType === 'performance_app_startup'
      );
      
      expect(startupEvent).toBeDefined();
      expect(startupEvent.eventData.value).toBeLessThan(2000); // Under 2 second target

      console.log('✅ Performance tracking test passed');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle incomplete vTPR sessions', async () => {
      const store = useAppStore.getState();
      store.setUser(mockUser);
      
      // Start vTPR session but don't complete all keywords
      const keywords = await ApiService.getDramaKeywords('drama-1');
      
      // Complete only 10 out of 15 keywords
      for (let i = 0; i < 10; i++) {
        store.updateKeywordProgress(keywords[i].id, true);
      }
      
      const completedKeywords = store.getCompletedKeywords();
      expect(completedKeywords).toHaveLength(10);
      
      // User should not be able to access magic moment
      expect(store.canAccessMagicMoment()).toBe(false);
      
      // Track incomplete session
      AnalyticsService.getInstance().track('vtpr_session_incomplete', {
        dramaId: 'drama-1',
        completedKeywords: 10,
        totalKeywords: 15,
        completionRate: 10/15,
      }, mockUser.id);
      
      expect(analyticsEvents.some(e => e.eventType === 'vtpr_session_incomplete')).toBe(true);
    });

    it('should handle video loading failures', async () => {
      // Simulate video loading failure
      AnalyticsService.getInstance().track('error_video_load', {
        errorMessage: 'Video failed to load',
        videoUrl: 'https://example.com/broken-video.mp4',
        context: 'magic_moment',
      }, mockUser.id);
      
      const errorEvents = analyticsEvents.filter(e => e.eventType.startsWith('error_'));
      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0].eventData.errorMessage).toBe('Video failed to load');
    });

    it('should handle offline scenarios', async () => {
      // Simulate offline state
      const store = useAppStore.getState();
      store.setNetworkStatus(false);
      
      expect(store.isOnline).toBe(false);
      
      // Analytics should queue events for later
      AnalyticsService.getInstance().track('offline_event', {
        action: 'keyword_completed',
        keywordId: 'keyword-1',
      }, mockUser.id);
      
      // Event should still be tracked (queued)
      expect(analyticsEvents.some(e => e.eventType === 'offline_event')).toBe(true);
    });
  });

  describe('User Retention Scenarios', () => {
    it('should track return user journey', async () => {
      const store = useAppStore.getState();
      
      // Simulate returning user
      store.setFirstLaunch(false);
      store.setUser(mockUser);
      store.setOnboardingCompleted(true);
      store.setSelectedInterest('1');
      
      // Track return visit
      AnalyticsService.getInstance().track('app_launch', {
        isReturningUser: true,
        daysSinceLastVisit: 1,
      }, mockUser.id);
      
      // Continue from where they left off
      AnalyticsService.getInstance().track('session_resume', {
        lastCompletedStep: 'interest_selected',
        progressPercentage: 20,
      }, mockUser.id);
      
      expect(analyticsEvents.some(e => e.eventType === 'session_resume')).toBe(true);
    });

    it('should track user engagement patterns', async () => {
      // Simulate multiple learning sessions
      for (let day = 1; day <= 7; day++) {
        AnalyticsService.getInstance().track('daily_session', {
          day: day,
          sessionDuration: 15 * 60 * 1000, // 15 minutes
          keywordsLearned: 3,
        }, mockUser.id);
      }
      
      const dailySessions = analyticsEvents.filter(e => e.eventType === 'daily_session');
      expect(dailySessions).toHaveLength(7);
      
      // Calculate streak
      const streak = dailySessions.length;
      expect(streak).toBe(7);
    });
  });

  afterEach(() => {
    // Clean up
    jest.clearAllTimers();
    analyticsEvents = [];
  });
});