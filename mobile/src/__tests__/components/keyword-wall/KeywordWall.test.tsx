import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import KeywordWall from '@/components/keyword-wall/KeywordWall';
import { useAppStore } from '@/store/useAppStore';
import { ApiService } from '@/services/ApiService';
import { SAMPLE_KEYWORDS } from '@/constants/keyword-wall';

// Mock dependencies
jest.mock('@/store/useAppStore');
jest.mock('@/services/ApiService');

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('KeywordWall', () => {
  const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
  const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

  const mockStoreState = {
    user: {
      id: 'test-user-id',
      deviceId: 'test-device-id',
      createdAt: new Date(),
    },
  };

  const mockProps = {
    dramaId: 'test-drama-id',
    userId: 'test-user-id',
    onKeywordClick: jest.fn(),
    onProgressUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppStore.mockReturnValue(mockStoreState as any);
  });

  describe('Component Rendering', () => {
    it('should render keyword wall with title and subtitle', () => {
      const { getByText } = render(<KeywordWall {...mockProps} />);
      
      expect(getByText('故事线索')).toBeTruthy();
      expect(getByText('发现隐藏在剧情中的词汇宝藏')).toBeTruthy();
    });

    it('should render progress indicator when showProgressIndicator is true', () => {
      const { getByText } = render(
        <KeywordWall {...mockProps} showProgressIndicator={true} />
      );
      
      expect(getByText(/已发现.*个线索/)).toBeTruthy();
    });

    it('should not render progress indicator when showProgressIndicator is false', () => {
      const { queryByText } = render(
        <KeywordWall {...mockProps} showProgressIndicator={false} />
      );
      
      expect(queryByText(/已发现.*个线索/)).toBeNull();
    });

    it('should render 15 keyword items', () => {
      const { getAllByTestId } = render(<KeywordWall {...mockProps} />);
      
      // Assuming KeywordItem components have testID
      const keywordItems = getAllByTestId(/keyword-item/);
      expect(keywordItems).toHaveLength(15);
    });
  });

  describe('Data Loading', () => {
    it('should load user progress on mount', async () => {
      mockApiService.getUserProgress.mockResolvedValue([
        {
          id: 'progress-1',
          userId: 'test-user-id',
          dramaId: 'test-drama-id',
          keywordId: 'travel_001',
          status: 'completed',
          attempts: 1,
          correctAttempts: 1,
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      render(<KeywordWall {...mockProps} />);

      await waitFor(() => {
        expect(mockApiService.getUserProgress).toHaveBeenCalledWith(
          'test-user-id',
          'test-drama-id'
        );
      });
    });

    it('should handle API error gracefully', async () => {
      mockApiService.getUserProgress.mockRejectedValue(new Error('Network error'));
      
      const { getByText } = render(<KeywordWall {...mockProps} />);

      await waitFor(() => {
        expect(getByText('加载进度失败，请重试')).toBeTruthy();
      });
    });

    it('should update keywords unlock status based on API response', async () => {
      mockApiService.getUserProgress.mockResolvedValue([
        {
          id: 'progress-1',
          userId: 'test-user-id',
          dramaId: 'test-drama-id',
          keywordId: 'travel_001',
          status: 'completed',
          attempts: 1,
          correctAttempts: 1,
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      render(<KeywordWall {...mockProps} />);

      await waitFor(() => {
        expect(mockProps.onProgressUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            unlockedCount: 1,
            totalCount: 15,
            percentage: expect.any(Number),
          })
        );
      });
    });
  });

  describe('Keyword Interaction', () => {
    it('should call onKeywordClick when unlocked keyword is pressed', async () => {
      // Mock a keyword as unlocked
      mockApiService.getUserProgress.mockResolvedValue([
        {
          id: 'progress-1',
          userId: 'test-user-id',
          dramaId: 'test-drama-id',
          keywordId: 'travel_001',
          status: 'completed',
          attempts: 1,
          correctAttempts: 1,
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const { getByTestId } = render(<KeywordWall {...mockProps} />);

      await waitFor(() => {
        const keywordItem = getByTestId('keyword-item-travel_001');
        fireEvent.press(keywordItem);
        
        expect(mockProps.onKeywordClick).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'travel_001',
            word: 'airport',
            isUnlocked: true,
          })
        );
      });
    });

    it('should not call onKeywordClick when locked keyword is pressed', () => {
      const { getByTestId } = render(<KeywordWall {...mockProps} />);

      const keywordItem = getByTestId('keyword-item-travel_001');
      fireEvent.press(keywordItem);
      
      expect(mockProps.onKeywordClick).not.toHaveBeenCalled();
    });
  });

  describe('Progress Updates', () => {
    it('should update progress when keyword is unlocked', async () => {
      mockApiService.unlockProgress.mockResolvedValue({
        success: true,
        data: {
          keyword: SAMPLE_KEYWORDS[0],
          progress: {
            unlockedCount: 1,
            totalCount: 15,
            percentage: 6.67,
            recentlyUnlocked: [SAMPLE_KEYWORDS[0]],
          },
        },
      });

      const { getByTestId } = render(<KeywordWall {...mockProps} />);

      // Simulate keyword unlock (this would normally come from video player)
      // For testing, we'll call the unlock method directly
      // This would require exposing the method or using a different approach

      await waitFor(() => {
        expect(mockApiService.unlockProgress).toHaveBeenCalled();
      });
    });

    it('should show unlock animation when animationEnabled is true', async () => {
      const { getByTestId } = render(
        <KeywordWall {...mockProps} animationEnabled={true} />
      );

      // Test animation visibility
      // This would require triggering an unlock event
    });

    it('should not show unlock animation when animationEnabled is false', () => {
      const { queryByTestId } = render(
        <KeywordWall {...mockProps} animationEnabled={false} />
      );

      // Test that animation is not shown
      expect(queryByTestId('unlock-animation')).toBeNull();
    });
  });

  describe('Refresh Functionality', () => {
    it('should reload data when pull to refresh is triggered', async () => {
      mockApiService.getUserProgress.mockResolvedValue([]);

      const { getByTestId } = render(<KeywordWall {...mockProps} />);

      const scrollView = getByTestId('keyword-wall-scroll');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(mockApiService.getUserProgress).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unlock API failure gracefully', async () => {
      mockApiService.unlockProgress.mockRejectedValue(new Error('API Error'));

      const { getByTestId } = render(<KeywordWall {...mockProps} />);

      // Simulate unlock attempt
      // Should rollback optimistic update and show error
    });

    it('should show error message when data loading fails', async () => {
      mockApiService.getUserProgress.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<KeywordWall {...mockProps} />);

      await waitFor(() => {
        expect(getByText('加载进度失败，请重试')).toBeTruthy();
      });
    });
  });

  describe('Milestone Detection', () => {
    it('should detect quarter milestone (5 keywords)', async () => {
      const mockProgress = Array.from({ length: 5 }, (_, index) => ({
        id: `progress-${index}`,
        userId: 'test-user-id',
        dramaId: 'test-drama-id',
        keywordId: SAMPLE_KEYWORDS[index].id,
        status: 'completed' as const,
        attempts: 1,
        correctAttempts: 1,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockApiService.getUserProgress.mockResolvedValue(mockProgress);

      render(<KeywordWall {...mockProps} />);

      await waitFor(() => {
        expect(mockProps.onProgressUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            unlockedCount: 5,
            milestoneReached: true,
            milestoneType: 'quarter',
          })
        );
      });
    });

    it('should detect completion milestone (15 keywords)', async () => {
      const mockProgress = SAMPLE_KEYWORDS.map((keyword, index) => ({
        id: `progress-${index}`,
        userId: 'test-user-id',
        dramaId: 'test-drama-id',
        keywordId: keyword.id,
        status: 'completed' as const,
        attempts: 1,
        correctAttempts: 1,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockApiService.getUserProgress.mockResolvedValue(mockProgress);

      render(<KeywordWall {...mockProps} />);

      await waitFor(() => {
        expect(mockProps.onProgressUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            unlockedCount: 15,
            milestoneReached: true,
            milestoneType: 'complete',
          })
        );
      });
    });
  });
});
