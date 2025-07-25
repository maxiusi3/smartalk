import { ConversionFunnelTracker } from '@/services/ConversionFunnelTracker';
import { AnalyticsService } from '@/services/AnalyticsService';

// Mock AnalyticsService
jest.mock('@/services/AnalyticsService');

describe('ConversionFunnelTracker', () => {
  let tracker: ConversionFunnelTracker;
  let mockAnalytics: jest.Mocked<AnalyticsService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAnalytics = AnalyticsService.getInstance() as jest.Mocked<AnalyticsService>;
    tracker = new ConversionFunnelTracker();
  });

  describe('Funnel Step Tracking', () => {
    it('should track app launch as funnel entry point', () => {
      const userId = 'test-user-123';
      
      tracker.trackAppLaunch(userId);
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'funnel_app_launch',
        expect.objectContaining({
          funnelStep: 1,
          stepName: 'app_launch',
          userId,
        }),
        userId
      );
    });

    it('should track onboarding completion', () => {
      const userId = 'test-user-123';
      const duration = 45000; // 45 seconds
      
      tracker.trackOnboardingComplete(userId, duration);
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'funnel_onboarding_complete',
        expect.objectContaining({
          funnelStep: 2,
          stepName: 'onboarding_complete',
          duration,
          userId,
        }),
        userId
      );
    });

    it('should track interest selection', () => {
      const userId = 'test-user-123';
      const interestId = 'travel';
      
      tracker.trackInterestSelected(userId, interestId);
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'funnel_interest_selected',
        expect.objectContaining({
          funnelStep: 3,
          stepName: 'interest_selected',
          interestId,
          userId,
        }),
        userId
      );
    });

    it('should track vTPR session completion', () => {
      const userId = 'test-user-123';
      const sessionData = {
        dramaId: 'drama-1',
        keywordsCompleted: 15,
        totalKeywords: 15,
        accuracy: 0.87,
        sessionDuration: 300000, // 5 minutes
      };
      
      tracker.trackVTPRComplete(userId, sessionData);
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'funnel_vtpr_complete',
        expect.objectContaining({
          funnelStep: 4,
          stepName: 'vtpr_complete',
          ...sessionData,
          userId,
        }),
        userId
      );
    });

    it('should track magic moment activation', () => {
      const userId = 'test-user-123';
      const dramaId = 'drama-1';
      const userFeedback = 'amazing';
      
      tracker.trackActivation(userId, dramaId, userFeedback);
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'funnel_activation',
        expect.objectContaining({
          funnelStep: 5,
          stepName: 'activation',
          dramaId,
          userFeedback,
          userId,
        }),
        userId
      );
    });
  });

  describe('Funnel Analytics', () => {
    it('should calculate conversion rates between steps', () => {
      const funnelData = [
        { step: 'app_launch', users: 1000 },
        { step: 'onboarding_complete', users: 800 },
        { step: 'interest_selected', users: 700 },
        { step: 'vtpr_complete', users: 500 },
        { step: 'activation', users: 400 },
      ];
      
      const conversionRates = tracker.calculateConversionRates(funnelData);
      
      expect(conversionRates).toEqual({
        'onboarding_complete': 0.8, // 800/1000
        'interest_selected': 0.875, // 700/800
        'vtpr_complete': 0.714, // 500/700 (rounded)
        'activation': 0.8, // 400/500
        'overall': 0.4, // 400/1000
      });
    });

    it('should identify funnel drop-off points', () => {
      const funnelData = [
        { step: 'app_launch', users: 1000 },
        { step: 'onboarding_complete', users: 900 }, // 10% drop
        { step: 'interest_selected', users: 850 }, // 5.6% drop
        { step: 'vtpr_complete', users: 400 }, // 52.9% drop - major drop-off
        { step: 'activation', users: 380 }, // 5% drop
      ];
      
      const dropOffPoints = tracker.identifyDropOffPoints(funnelData, 0.2); // 20% threshold
      
      expect(dropOffPoints).toHaveLength(1);
      expect(dropOffPoints[0]).toEqual({
        fromStep: 'interest_selected',
        toStep: 'vtpr_complete',
        dropOffRate: 0.529, // 52.9% drop
        usersLost: 450,
      });
    });

    it('should track user progression through funnel', () => {
      const userId = 'test-user-123';
      
      // User progresses through funnel
      tracker.trackAppLaunch(userId);
      tracker.trackOnboardingComplete(userId, 30000);
      tracker.trackInterestSelected(userId, 'travel');
      
      const progression = tracker.getUserProgression(userId);
      
      expect(progression).toEqual({
        userId,
        currentStep: 3,
        currentStepName: 'interest_selected',
        completedSteps: ['app_launch', 'onboarding_complete', 'interest_selected'],
        progressPercentage: 0.6, // 3/5 steps
        timeInFunnel: expect.any(Number),
      });
    });
  });

  describe('Cohort Analysis', () => {
    it('should track cohort performance', () => {
      const cohortId = '2024-01-15'; // Daily cohort
      const cohortData = {
        totalUsers: 100,
        activatedUsers: 45,
        avgTimeToActivation: 1800000, // 30 minutes
        topDropOffStep: 'vtpr_complete',
      };
      
      tracker.trackCohortPerformance(cohortId, cohortData);
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'cohort_performance',
        expect.objectContaining({
          cohortId,
          activationRate: 0.45,
          ...cohortData,
        })
      );
    });

    it('should compare cohort performance over time', () => {
      const cohorts = [
        { id: '2024-01-01', activationRate: 0.35, totalUsers: 100 },
        { id: '2024-01-02', activationRate: 0.42, totalUsers: 120 },
        { id: '2024-01-03', activationRate: 0.48, totalUsers: 110 },
      ];
      
      const comparison = tracker.compareCohorts(cohorts);
      
      expect(comparison).toEqual({
        trend: 'improving',
        avgActivationRate: 0.417, // (0.35 + 0.42 + 0.48) / 3
        bestPerformingCohort: '2024-01-03',
        worstPerformingCohort: '2024-01-01',
        improvementRate: 0.37, // (0.48 - 0.35) / 0.35
      });
    });
  });

  describe('A/B Testing Integration', () => {
    it('should track funnel performance by experiment variant', () => {
      const userId = 'test-user-123';
      const experimentId = 'onboarding_flow_v2';
      const variant = 'treatment';
      
      tracker.trackExperimentFunnelStep(userId, experimentId, variant, 'onboarding_complete');
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'experiment_funnel_step',
        expect.objectContaining({
          experimentId,
          variant,
          funnelStep: 2,
          stepName: 'onboarding_complete',
          userId,
        }),
        userId
      );
    });

    it('should calculate experiment impact on conversion', () => {
      const experimentResults = {
        control: { users: 500, activated: 180 }, // 36% activation
        treatment: { users: 500, activated: 220 }, // 44% activation
      };
      
      const impact = tracker.calculateExperimentImpact(experimentResults);
      
      expect(impact).toEqual({
        controlActivationRate: 0.36,
        treatmentActivationRate: 0.44,
        relativeImprovement: 0.222, // (0.44 - 0.36) / 0.36
        absoluteImprovement: 0.08,
        statisticalSignificance: expect.any(Number),
      });
    });
  });

  describe('Real-time Funnel Monitoring', () => {
    it('should detect funnel anomalies', () => {
      const currentHourData = {
        app_launch: 100,
        onboarding_complete: 45, // 45% vs expected 80%
        interest_selected: 40,
        vtpr_complete: 35,
        activation: 30,
      };
      
      const expectedRates = {
        onboarding_complete: 0.8,
        interest_selected: 0.9,
        vtpr_complete: 0.7,
        activation: 0.8,
      };
      
      const anomalies = tracker.detectAnomalies(currentHourData, expectedRates, 0.2); // 20% threshold
      
      expect(anomalies).toHaveLength(1);
      expect(anomalies[0]).toEqual({
        step: 'onboarding_complete',
        expectedRate: 0.8,
        actualRate: 0.45,
        deviation: -0.4375, // (0.45 - 0.8) / 0.8
        severity: 'high',
      });
    });

    it('should trigger alerts for critical funnel drops', () => {
      const criticalDrop = {
        step: 'vtpr_complete',
        expectedRate: 0.7,
        actualRate: 0.3,
        deviation: -0.571,
        severity: 'critical',
      };
      
      const alertTriggered = tracker.shouldTriggerAlert(criticalDrop);
      
      expect(alertTriggered).toBe(true);
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'funnel_alert',
        expect.objectContaining({
          alertType: 'critical_drop',
          step: 'vtpr_complete',
          severity: 'critical',
          deviation: -0.571,
        })
      );
    });
  });

  describe('Funnel Optimization Insights', () => {
    it('should provide optimization recommendations', () => {
      const funnelAnalysis = {
        majorDropOff: 'vtpr_complete',
        dropOffRate: 0.6,
        avgTimeAtStep: 180000, // 3 minutes
        commonExitReasons: ['too_difficult', 'technical_issues'],
      };
      
      const recommendations = tracker.generateOptimizationRecommendations(funnelAnalysis);
      
      expect(recommendations).toContain('Simplify vTPR difficulty progression');
      expect(recommendations).toContain('Improve technical stability');
      expect(recommendations).toContain('Add progress encouragement at 3-minute mark');
    });

    it('should track optimization experiment results', () => {
      const optimizationId = 'vtpr_difficulty_adjustment';
      const results = {
        beforeOptimization: { conversionRate: 0.4, avgTime: 300000 },
        afterOptimization: { conversionRate: 0.55, avgTime: 240000 },
        sampleSize: 1000,
        confidenceLevel: 0.95,
      };
      
      tracker.trackOptimizationResults(optimizationId, results);
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'funnel_optimization_results',
        expect.objectContaining({
          optimizationId,
          improvementRate: 0.375, // (0.55 - 0.4) / 0.4
          timeReduction: 60000, // 300000 - 240000
          ...results,
        })
      );
    });
  });
});