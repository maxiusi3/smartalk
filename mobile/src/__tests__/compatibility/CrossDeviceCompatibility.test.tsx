import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { InterestSelectionScreen } from '@/screens/InterestSelectionScreen';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { KeywordWall } from '@/components/keyword-wall/KeywordWall';
import { vTPRScreen } from '@/components/vtpr/vTPRScreen';

/**
 * Cross-Device Compatibility Tests
 * Ensures SmarTalk MVP works across different devices, screen sizes, and orientations
 */
describe('Cross-Device Compatibility', () => {
  // Device configurations to test
  const deviceConfigurations = [
    {
      name: 'iPhone SE (Small)',
      width: 320,
      height: 568,
      pixelRatio: 2,
      platform: 'ios',
    },
    {
      name: 'iPhone 13 (Standard)',
      width: 390,
      height: 844,
      pixelRatio: 3,
      platform: 'ios',
    },
    {
      name: 'iPhone 13 Pro Max (Large)',
      width: 428,
      height: 926,
      pixelRatio: 3,
      platform: 'ios',
    },
    {
      name: 'Samsung Galaxy S21 (Android)',
      width: 360,
      height: 800,
      pixelRatio: 3,
      platform: 'android',
    },
    {
      name: 'iPad (Tablet)',
      width: 768,
      height: 1024,
      pixelRatio: 2,
      platform: 'ios',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Size Adaptability', () => {
    deviceConfigurations.forEach(device => {
      describe(`${device.name} (${device.width}x${device.height})`, () => {
        beforeEach(() => {
          // Mock device dimensions
          jest.spyOn(Dimensions, 'get').mockReturnValue({
            width: device.width,
            height: device.height,
            scale: device.pixelRatio,
            fontScale: 1,
          });
        });

        it('should render onboarding flow properly', () => {
          render(<OnboardingFlow />);
          
          // Check that content fits within screen bounds
          const container = screen.getByTestId('onboarding-container');
          expect(container.props.style.width).toBeLessThanOrEqual(device.width);
          expect(container.props.style.height).toBeLessThanOrEqual(device.height);
          
          // Verify responsive layout
          if (device.width < 375) {
            // Small screen adjustments
            expect(screen.getByTestId('compact-layout')).toBeTruthy();
          } else {
            // Standard layout
            expect(screen.getByTestId('standard-layout')).toBeTruthy();
          }
          
          console.log(`✅ ${device.name}: Onboarding layout validated`);
        });

        it('should adapt interest selection cards', () => {
          const mockInterests = [
            { id: '1', name: 'Travel', description: 'Learn English through travel scenarios' },
            { id: '2', name: 'Movies', description: 'Learn English through movie dialogues' },
            { id: '3', name: 'Workplace', description: 'Learn English for professional settings' },
          ];

          render(<InterestSelectionScreen interests={mockInterests} />);
          
          const cardContainer = screen.getByTestId('interest-cards-container');
          
          if (device.width < 375) {
            // Single column layout for small screens
            expect(cardContainer.props.style.flexDirection).toBe('column');
          } else if (device.width > 600) {
            // Multi-column layout for tablets
            expect(cardContainer.props.style.flexDirection).toBe('row');
            expect(cardContainer.props.style.flexWrap).toBe('wrap');
          } else {
            // Standard layout
            expect(cardContainer.props.style.flexDirection).toBe('column');
          }
          
          console.log(`✅ ${device.name}: Interest cards layout validated`);
        });

        it('should optimize video player for screen size', () => {
          const mockVideo = {
            uri: 'https://example.com/video.mp4',
            subtitles: 'https://example.com/subtitles.srt',
          };

          render(<VideoPlayer source={mockVideo} />);
          
          const videoContainer = screen.getByTestId('video-container');
          const aspectRatio = 16 / 9; // Standard video aspect ratio
          
          // Calculate optimal video size for device
          const maxWidth = device.width - 32; // Account for padding
          const maxHeight = device.height * 0.4; // Max 40% of screen height
          
          const videoWidth = Math.min(maxWidth, maxHeight * aspectRatio);
          const videoHeight = videoWidth / aspectRatio;
          
          expect(videoContainer.props.style.width).toBeLessThanOrEqual(videoWidth);
          expect(videoContainer.props.style.height).toBeLessThanOrEqual(videoHeight);
          
          console.log(`✅ ${device.name}: Video player size optimized`);
        });

        it('should adapt keyword wall grid', () => {
          const mockKeywords = Array.from({ length: 15 }, (_, i) => ({
            id: `keyword-${i + 1}`,
            word: `word${i + 1}`,
            unlocked: i < 5,
          }));

          render(<KeywordWall keywords={mockKeywords} />);
          
          const grid = screen.getByTestId('keyword-grid');
          
          // Calculate optimal grid columns based on screen width
          let expectedColumns;
          if (device.width < 375) {
            expectedColumns = 3; // Small screens
          } else if (device.width > 600) {
            expectedColumns = 5; // Tablets
          } else {
            expectedColumns = 4; // Standard phones
          }
          
          expect(grid.props.numColumns).toBe(expectedColumns);
          
          console.log(`✅ ${device.name}: Keyword grid (${expectedColumns} columns) validated`);
        });

        it('should optimize vTPR interface layout', () => {
          const mockKeyword = {
            id: 'keyword-1',
            word: 'hello',
            audioUrl: 'https://example.com/hello.mp3',
            videoClips: [
              { id: 'clip-1', url: 'https://example.com/clip1.mp4', isCorrect: true },
              { id: 'clip-2', url: 'https://example.com/clip2.mp4', isCorrect: false },
              { id: 'clip-3', url: 'https://example.com/clip3.mp4', isCorrect: false },
            ],
          };

          render(<vTPRScreen keyword={mockKeyword} />);
          
          const videoOptions = screen.getByTestId('video-options-container');
          
          if (device.width < 375) {
            // Vertical layout for small screens
            expect(videoOptions.props.style.flexDirection).toBe('column');
          } else {
            // Grid layout for larger screens
            expect(videoOptions.props.style.flexDirection).toBe('row');
            expect(videoOptions.props.style.flexWrap).toBe('wrap');
          }
          
          console.log(`✅ ${device.name}: vTPR layout optimized`);
        });
      });
    });
  });

  describe('Orientation Support', () => {
    const orientations = [
      { name: 'Portrait', width: 390, height: 844 },
      { name: 'Landscape', width: 844, height: 390 },
    ];

    orientations.forEach(orientation => {
      it(`should handle ${orientation.name.toLowerCase()} orientation`, () => {
        jest.spyOn(Dimensions, 'get').mockReturnValue({
          width: orientation.width,
          height: orientation.height,
          scale: 3,
          fontScale: 1,
        });

        render(<OnboardingFlow />);
        
        const container = screen.getByTestId('onboarding-container');
        
        if (orientation.name === 'Landscape') {
          // Landscape-specific adjustments
          expect(container.props.style.flexDirection).toBe('row');
          expect(screen.getByTestId('landscape-layout')).toBeTruthy();
        } else {
          // Portrait layout
          expect(container.props.style.flexDirection).toBe('column');
          expect(screen.getByTestId('portrait-layout')).toBeTruthy();
        }
        
        console.log(`✅ ${orientation.name} orientation supported`);
      });
    });

    it('should handle orientation changes dynamically', () => {
      const { rerender } = render(<VideoPlayer source={{}} />);
      
      // Start in portrait
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 390,
        height: 844,
        scale: 3,
        fontScale: 1,
      });
      
      rerender(<VideoPlayer source={{}} />);
      expect(screen.getByTestId('portrait-video-layout')).toBeTruthy();
      
      // Switch to landscape
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 844,
        height: 390,
        scale: 3,
        fontScale: 1,
      });
      
      rerender(<VideoPlayer source={{}} />);
      expect(screen.getByTestId('landscape-video-layout')).toBeTruthy();
      
      console.log('✅ Dynamic orientation changes handled');
    });
  });

  describe('Platform-Specific Adaptations', () => {
    it('should adapt to iOS design patterns', () => {
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Platform: { OS: 'ios' },
      }));

      render(<OnboardingFlow />);
      
      // Check iOS-specific styling
      const button = screen.getByRole('button');
      expect(button.props.style.borderRadius).toBe(8); // iOS rounded corners
      expect(button.props.style.shadowOpacity).toBeGreaterThan(0); // iOS shadows
      
      console.log('✅ iOS design patterns applied');
    });

    it('should adapt to Android design patterns', () => {
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Platform: { OS: 'android' },
      }));

      render(<OnboardingFlow />);
      
      // Check Android-specific styling
      const button = screen.getByRole('button');
      expect(button.props.style.elevation).toBeGreaterThan(0); // Android elevation
      expect(button.props.style.borderRadius).toBe(4); // Android rounded corners
      
      console.log('✅ Android design patterns applied');
    });
  });

  describe('Performance Across Devices', () => {
    it('should optimize for low-end devices', () => {
      // Mock low-end device characteristics
      const lowEndDevice = {
        width: 320,
        height: 568,
        pixelRatio: 1,
        totalMemory: 1024 * 1024 * 1024, // 1GB RAM
      };

      jest.spyOn(Dimensions, 'get').mockReturnValue(lowEndDevice);

      render(<KeywordWall keywords={Array.from({ length: 15 }, (_, i) => ({ id: `${i}` }))} />);
      
      // Verify performance optimizations
      const animatedElements = screen.getAllByTestId('keyword-animation');
      expect(animatedElements.length).toBeLessThan(5); // Limit animations on low-end devices
      
      console.log('✅ Low-end device optimizations applied');
    });

    it('should utilize high-end device capabilities', () => {
      // Mock high-end device characteristics
      const highEndDevice = {
        width: 428,
        height: 926,
        pixelRatio: 3,
        totalMemory: 8 * 1024 * 1024 * 1024, // 8GB RAM
      };

      jest.spyOn(Dimensions, 'get').mockReturnValue(highEndDevice);

      render(<vTPRScreen keyword={{}} />);
      
      // Verify enhanced features for high-end devices
      expect(screen.getByTestId('enhanced-animations')).toBeTruthy();
      expect(screen.getByTestId('high-quality-video-preview')).toBeTruthy();
      
      console.log('✅ High-end device capabilities utilized');
    });
  });

  describe('Network Condition Adaptations', () => {
    it('should adapt to slow network conditions', () => {
      // Mock slow network
      global.navigator = {
        ...global.navigator,
        connection: {
          effectiveType: '2g',
          downlink: 0.5,
        },
      };

      render(<VideoPlayer source={{ uri: 'https://example.com/video.mp4' }} />);
      
      // Verify low-bandwidth optimizations
      expect(screen.getByTestId('low-quality-video-option')).toBeTruthy();
      expect(screen.getByText(/optimized for slow connection/i)).toBeTruthy();
      
      console.log('✅ Slow network adaptations applied');
    });

    it('should utilize fast network conditions', () => {
      // Mock fast network
      global.navigator = {
        ...global.navigator,
        connection: {
          effectiveType: '4g',
          downlink: 10,
        },
      };

      render(<VideoPlayer source={{ uri: 'https://example.com/video.mp4' }} />);
      
      // Verify high-bandwidth features
      expect(screen.getByTestId('high-quality-video-option')).toBeTruthy();
      expect(screen.getByTestId('video-preloading-enabled')).toBeTruthy();
      
      console.log('✅ Fast network capabilities utilized');
    });
  });

  describe('Accessibility Across Devices', () => {
    it('should maintain accessibility on small screens', () => {
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 320,
        height: 568,
        scale: 2,
        fontScale: 1,
      });

      render(<InterestSelectionScreen interests={[]} />);
      
      // Verify touch targets are still accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.props.style.minHeight).toBeGreaterThanOrEqual(44); // iOS minimum
        expect(button.props.style.minWidth).toBeGreaterThanOrEqual(44);
      });
      
      console.log('✅ Small screen accessibility maintained');
    });

    it('should scale text appropriately across devices', () => {
      const devices = [
        { width: 320, expectedFontScale: 0.9 },
        { width: 390, expectedFontScale: 1.0 },
        { width: 428, expectedFontScale: 1.1 },
      ];

      devices.forEach(device => {
        jest.spyOn(Dimensions, 'get').mockReturnValue({
          width: device.width,
          height: 800,
          scale: 3,
          fontScale: device.expectedFontScale,
        });

        render(<OnboardingFlow />);
        
        const headingText = screen.getByText(/welcome to smartalk/i);
        const expectedFontSize = 24 * device.expectedFontScale;
        expect(headingText.props.style.fontSize).toBeCloseTo(expectedFontSize, 1);
      });
      
      console.log('✅ Text scaling across devices validated');
    });
  });

  describe('Device-Specific Features', () => {
    it('should utilize device haptic feedback when available', () => {
      const mockHaptics = {
        impactAsync: jest.fn(),
        selectionAsync: jest.fn(),
      };

      jest.doMock('expo-haptics', () => mockHaptics);

      render(<vTPRScreen keyword={{}} />);
      
      // Simulate correct answer
      const videoOption = screen.getByTestId('video-option-1');
      videoOption.props.onPress();
      
      expect(mockHaptics.impactAsync).toHaveBeenCalled();
      
      console.log('✅ Haptic feedback integration validated');
    });

    it('should adapt to device safe areas', () => {
      // Mock device with notch/safe areas
      jest.doMock('react-native-safe-area-context', () => ({
        useSafeAreaInsets: () => ({
          top: 44,
          bottom: 34,
          left: 0,
          right: 0,
        }),
      }));

      render(<OnboardingFlow />);
      
      const container = screen.getByTestId('safe-area-container');
      expect(container.props.style.paddingTop).toBe(44);
      expect(container.props.style.paddingBottom).toBe(34);
      
      console.log('✅ Safe area adaptations applied');
    });
  });
});