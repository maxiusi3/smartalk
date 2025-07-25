import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { AnalyticsService } from '@/services/AnalyticsService';
import { UserFeedbackService } from '@/services/UserFeedbackService';

/**
 * Onboarding Flow Usability Tests
 * Tests the onboarding experience with focus on usability and user experience
 */
describe('OnboardingFlow Usability Tests', () => {
  let mockAnalytics: jest.SpyInstance;
  let mockFeedback: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAnalytics = jest.spyOn(AnalyticsService.getInstance(), 'track');
    mockFeedback = jest.spyOn(UserFeedbackService.getInstance(), 'collectFeedback');
  });

  describe('Alex Persona User Journey', () => {
    /**
     * Alex: 33-year-old e-commerce manager with basic English knowledge
     * but poor listening/speaking skills. Skeptical about language learning apps.
     */
    it('should address Alex persona pain points in onboarding', async () => {
      render(<OnboardingFlow />);

      // Step 1: Pain-point resonance
      expect(screen.getByText(/tired of understanding english but not being able to speak/i)).toBeTruthy();
      expect(screen.getByText(/mute english/i)).toBeTruthy();
      
      // Verify emotional connection
      const painPointText = screen.getByTestId('pain-point-message');
      expect(painPointText.props.children).toContain('workplace meetings');
      expect(painPointText.props.children).toContain('confident speaking');

      // Track resonance
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_pain_point_viewed',
        expect.objectContaining({
          persona: 'alex',
          painPoint: 'mute_english',
        })
      );

      console.log('✅ Alex persona pain points addressed');
    });

    it('should build trust through scientific method explanation', async () => {
      render(<OnboardingFlow />);

      // Navigate to method explanation
      const continueButton = screen.getByLabelText(/continue/i);
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/neural immersion method/i)).toBeTruthy();
        expect(screen.getByText(/scientifically proven/i)).toBeTruthy();
        expect(screen.getByText(/comprehensible input/i)).toBeTruthy();
      });

      // Verify trust-building elements
      expect(screen.getByTestId('scientific-backing')).toBeTruthy();
      expect(screen.getByTestId('success-statistics')).toBeTruthy();

      console.log('✅ Trust-building through scientific explanation validated');
    });

    it('should provide clear value proposition for busy professionals', async () => {
      render(<OnboardingFlow />);

      // Navigate through onboarding
      const continueButton = screen.getByLabelText(/continue/i);
      fireEvent.press(continueButton);
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/30 minutes to breakthrough/i)).toBeTruthy();
        expect(screen.getByText(/no memorization required/i)).toBeTruthy();
        expect(screen.getByText(/immediate results/i)).toBeTruthy();
      });

      // Verify value props resonate with Alex's constraints
      expect(screen.getByTestId('time-commitment')).toBeTruthy();
      expect(screen.getByTestId('no-homework-promise')).toBeTruthy();

      console.log('✅ Value proposition for busy professionals validated');
    });
  });

  describe('Onboarding Usability Metrics', () => {
    it('should complete onboarding within optimal time', async () => {
      const startTime = Date.now();
      
      render(<OnboardingFlow />);

      // Simulate user progressing through onboarding
      const continueButtons = screen.getAllByLabelText(/continue/i);
      
      for (const button of continueButtons) {
        fireEvent.press(button);
        await waitFor(() => {}, { timeout: 500 });
      }

      const completionTime = Date.now() - startTime;
      
      // Onboarding should complete in under 2 minutes for optimal UX
      expect(completionTime).toBeLessThan(120000);

      // Track completion time
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_completion_time',
        expect.objectContaining({
          duration: expect.any(Number),
          stepsCompleted: expect.any(Number),
        })
      );

      console.log(`✅ Onboarding completed in ${completionTime}ms`);
    });

    it('should track user engagement throughout onboarding', async () => {
      render(<OnboardingFlow />);

      // Simulate user interactions
      const continueButton = screen.getByLabelText(/continue/i);
      fireEvent.press(continueButton);

      // Check engagement tracking
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_step_engagement',
        expect.objectContaining({
          step: 1,
          timeSpent: expect.any(Number),
          interactionType: 'continue',
        })
      );

      // Simulate pause (user reading content)
      await waitFor(() => {}, { timeout: 3000 });
      jest.advanceTimersByTime(3000);

      fireEvent.press(continueButton);

      // Verify engagement metrics
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_step_engagement',
        expect.objectContaining({
          step: 2,
          timeSpent: expect.any(Number),
          readingTime: expect.any(Number),
        })
      );

      console.log('✅ User engagement tracking validated');
    });

    it('should handle skip functionality appropriately', async () => {
      render(<OnboardingFlow />);

      const skipButton = screen.getByLabelText(/skip/i);
      fireEvent.press(skipButton);

      // Verify skip confirmation
      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to skip/i)).toBeTruthy();
      });

      const confirmSkip = screen.getByLabelText(/yes, skip/i);
      fireEvent.press(confirmSkip);

      // Track skip behavior
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_skipped',
        expect.objectContaining({
          stepsCompleted: expect.any(Number),
          skipReason: 'user_choice',
        })
      );

      console.log('✅ Skip functionality validated');
    });
  });

  describe('Onboarding Accessibility', () => {
    it('should provide proper screen reader support', () => {
      render(<OnboardingFlow />);

      // Check accessibility labels
      expect(screen.getByLabelText(/welcome to smartalk/i)).toBeTruthy();
      expect(screen.getByLabelText(/continue to next step/i)).toBeTruthy();
      expect(screen.getByLabelText(/skip onboarding/i)).toBeTruthy();

      // Verify content hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
      expect(screen.getAllByRole('button')).toHaveLength(2); // Continue and Skip

      console.log('✅ Screen reader support validated');
    });

    it('should support keyboard navigation', () => {
      render(<OnboardingFlow />);

      const continueButton = screen.getByLabelText(/continue/i);
      const skipButton = screen.getByLabelText(/skip/i);

      // Verify focusable elements
      expect(continueButton.props.accessible).toBe(true);
      expect(skipButton.props.accessible).toBe(true);

      // Check tab order
      expect(continueButton.props.accessibilityRole).toBe('button');
      expect(skipButton.props.accessibilityRole).toBe('button');

      console.log('✅ Keyboard navigation support validated');
    });

    it('should adapt to large text settings', () => {
      // Mock large text preference
      jest.spyOn(require('react-native').AccessibilityInfo, 'isLargeTextEnabled')
        .mockResolvedValue(true);

      render(<OnboardingFlow />);

      const headingText = screen.getByText(/welcome to smartalk/i);
      expect(headingText.props.style.fontSize).toBeGreaterThan(20);

      console.log('✅ Large text adaptation validated');
    });
  });

  describe('Onboarding Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      jest.spyOn(require('@/services/ApiService').ApiService, 'createAnonymousUser')
        .mockRejectedValue(new Error('Network error'));

      render(<OnboardingFlow />);

      // Complete onboarding
      const continueButton = screen.getByLabelText(/continue/i);
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/connection issue/i)).toBeTruthy();
        expect(screen.getByLabelText(/retry/i)).toBeTruthy();
      });

      // Verify error tracking
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_error',
        expect.objectContaining({
          errorType: 'network',
          errorMessage: 'Network error',
        })
      );

      console.log('✅ Network error handling validated');
    });

    it('should provide helpful error recovery', async () => {
      render(<OnboardingFlow />);

      // Simulate error state
      const errorState = screen.getByTestId('error-container');
      expect(errorState).toBeTruthy();

      // Check recovery options
      expect(screen.getByLabelText(/retry/i)).toBeTruthy();
      expect(screen.getByLabelText(/continue offline/i)).toBeTruthy();

      const retryButton = screen.getByLabelText(/retry/i);
      fireEvent.press(retryButton);

      // Verify retry attempt
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_error_recovery',
        expect.objectContaining({
          recoveryAction: 'retry',
        })
      );

      console.log('✅ Error recovery options validated');
    });
  });

  describe('Onboarding Personalization', () => {
    it('should adapt content based on user characteristics', async () => {
      const userProfile = {
        age: 33,
        profession: 'manager',
        englishLevel: 'intermediate',
        learningGoal: 'speaking_confidence',
      };

      render(<OnboardingFlow userProfile={userProfile} />);

      // Verify personalized content
      expect(screen.getByText(/perfect for busy managers/i)).toBeTruthy();
      expect(screen.getByText(/intermediate level/i)).toBeTruthy();
      expect(screen.getByText(/speaking confidence/i)).toBeTruthy();

      console.log('✅ Content personalization validated');
    });

    it('should collect user preferences during onboarding', async () => {
      render(<OnboardingFlow />);

      // Navigate to preference collection
      const continueButton = screen.getByLabelText(/continue/i);
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/what's your main goal/i)).toBeTruthy();
      });

      // Select preference
      const speakingGoal = screen.getByLabelText(/improve speaking/i);
      fireEvent.press(speakingGoal);

      // Verify preference tracking
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_preference_selected',
        expect.objectContaining({
          preferenceType: 'learning_goal',
          selectedValue: 'speaking',
        })
      );

      console.log('✅ User preference collection validated');
    });
  });

  describe('Onboarding Completion and Transition', () => {
    it('should smoothly transition to interest selection', async () => {
      render(<OnboardingFlow />);

      // Complete all onboarding steps
      const continueButtons = screen.getAllByLabelText(/continue/i);
      
      for (const button of continueButtons) {
        fireEvent.press(button);
        await waitFor(() => {}, { timeout: 500 });
      }

      // Verify completion
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_completed',
        expect.objectContaining({
          completionRate: 1.0,
          totalTime: expect.any(Number),
        })
      );

      // Check transition to next screen
      await waitFor(() => {
        expect(screen.getByText(/choose your interest/i)).toBeTruthy();
      });

      console.log('✅ Smooth transition to interest selection validated');
    });

    it('should collect post-onboarding feedback', async () => {
      render(<OnboardingFlow />);

      // Complete onboarding
      const continueButtons = screen.getAllByLabelText(/continue/i);
      for (const button of continueButtons) {
        fireEvent.press(button);
      }

      // Verify feedback prompt
      await waitFor(() => {
        expect(screen.getByText(/how was the introduction/i)).toBeTruthy();
      });

      const rating = screen.getByLabelText(/rate 5 stars/i);
      fireEvent.press(rating);

      // Verify feedback collection
      expect(mockFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          feedbackType: 'onboarding_experience',
          rating: 5,
        })
      );

      console.log('✅ Post-onboarding feedback collection validated');
    });
  });

  describe('Onboarding Performance', () => {
    it('should load quickly on app startup', async () => {
      const startTime = Date.now();
      
      render(<OnboardingFlow />);
      
      // Verify content is rendered quickly
      await waitFor(() => {
        expect(screen.getByText(/welcome to smartalk/i)).toBeTruthy();
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1000); // Under 1 second

      console.log(`✅ Onboarding loaded in ${loadTime}ms`);
    });

    it('should handle animations smoothly', async () => {
      render(<OnboardingFlow />);

      // Check for animation elements
      const animatedElements = screen.getAllByTestId('animated-element');
      expect(animatedElements.length).toBeGreaterThan(0);

      // Verify animations don't block interaction
      const continueButton = screen.getByLabelText(/continue/i);
      fireEvent.press(continueButton);

      // Should respond immediately despite animations
      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_step_engagement',
        expect.any(Object)
      );

      console.log('✅ Smooth animations validated');
    });
  });
});