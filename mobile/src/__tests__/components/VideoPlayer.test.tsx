import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VideoPlayer from '@/components/video/VideoPlayer';
import { KeywordData } from '@/types/video.types';

// Mock react-native-video
jest.mock('react-native-video', () => {
  const MockVideo = ({ onLoad, onProgress, onEnd, onError, ...props }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    
    React.useEffect(() => {
      // 模拟视频加载完成
      setTimeout(() => {
        onLoad?.({ duration: 60 });
      }, 100);
      
      // 模拟播放进度
      const interval = setInterval(() => {
        onProgress?.({ currentTime: 10, playableDuration: 60 });
      }, 1000);
      
      return () => clearInterval(interval);
    }, []);
    
    return <View testID="mock-video" {...props} />;
  };
  
  return MockVideo;
});

// Mock fetch for subtitle loading
global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve(`1
00:00:02,500 --> 00:00:05,000
Hello world

2
00:00:05,500 --> 00:00:08,000
This is a test subtitle`),
  })
) as jest.Mock;

describe('VideoPlayer', () => {
  const mockKeywords: KeywordData[] = [
    {
      id: 'keyword-1',
      word: 'hello',
      translation: '你好',
      startTime: 2.5,
      endTime: 5.0
    },
    {
      id: 'keyword-2',
      word: 'test',
      translation: '测试',
      startTime: 5.5,
      endTime: 8.0
    }
  ];

  const defaultProps = {
    videoUrl: 'https://example.com/video.mp4',
    subtitleUrl: 'https://example.com/subtitle.srt',
    keywords: mockKeywords
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render video player correctly', () => {
    const { getByTestId } = render(<VideoPlayer {...defaultProps} />);
    
    expect(getByTestId('mock-video')).toBeTruthy();
  });

  it('should show loading state initially', () => {
    const { getByText } = render(<VideoPlayer {...defaultProps} />);
    
    expect(getByText('加载中...')).toBeTruthy();
  });

  it('should load video and hide loading state', async () => {
    const { queryByText } = render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(queryByText('加载中...')).toBeNull();
    });
  });

  it('should call onProgress callback', async () => {
    const onProgress = jest.fn();
    render(<VideoPlayer {...defaultProps} onProgress={onProgress} />);
    
    await waitFor(() => {
      expect(onProgress).toHaveBeenCalled();
    });
  });

  it('should handle video end', async () => {
    const onVideoEnd = jest.fn();
    const { getByTestId } = render(
      <VideoPlayer {...defaultProps} onVideoEnd={onVideoEnd} />
    );
    
    // 模拟视频结束
    const video = getByTestId('mock-video');
    fireEvent(video, 'onEnd');
    
    expect(onVideoEnd).toHaveBeenCalled();
  });

  it('should handle video error', async () => {
    const onError = jest.fn();
    const { getByTestId } = render(
      <VideoPlayer {...defaultProps} onError={onError} />
    );
    
    // 模拟视频错误
    const video = getByTestId('mock-video');
    fireEvent(video, 'onError', {
      error: { code: 1, localizedDescription: 'Test error' }
    });
    
    expect(onError).toHaveBeenCalledWith({
      code: 1,
      message: 'Test error',
      details: expect.any(Object)
    });
  });

  it('should handle keyword click', async () => {
    const onKeywordClick = jest.fn();
    render(<VideoPlayer {...defaultProps} onKeywordClick={onKeywordClick} />);
    
    // 等待组件加载完成
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(defaultProps.subtitleUrl);
    });
    
    // 这里可以添加更多的关键词点击测试
    // 由于涉及到字幕同步，需要模拟时间进度
  });

  it('should auto play when autoPlay is true', () => {
    const { getByTestId } = render(
      <VideoPlayer {...defaultProps} autoPlay={true} />
    );
    
    const video = getByTestId('mock-video');
    expect(video.props.paused).toBe(false);
  });

  it('should not auto play when autoPlay is false', () => {
    const { getByTestId } = render(
      <VideoPlayer {...defaultProps} autoPlay={false} />
    );
    
    const video = getByTestId('mock-video');
    expect(video.props.paused).toBe(true);
  });

  it('should load subtitles when subtitleUrl is provided', async () => {
    render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(defaultProps.subtitleUrl);
    });
  });

  it('should not load subtitles when subtitleUrl is not provided', () => {
    const propsWithoutSubtitle = { ...defaultProps };
    delete propsWithoutSubtitle.subtitleUrl;
    
    render(<VideoPlayer {...propsWithoutSubtitle} />);
    
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle invalid subtitle format gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      text: () => Promise.resolve('Invalid subtitle content')
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Invalid SRT format');
    });
    
    consoleSpy.mockRestore();
  });

  it('should handle subtitle loading error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load subtitles:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});
