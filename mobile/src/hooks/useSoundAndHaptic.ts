/**
 * useSoundAndHaptic - V2 声音和触觉反馈Hook
 * 提供组件级别的音效和触觉功能
 * 自动处理音效播放、触觉反馈、动画效果
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { Animated } from 'react-native';
import SoundDesignService, { 
  SoundEffectType,
  BackgroundMusicType,
  AudioSettings
} from '@/services/SoundDesignService';
import HapticFeedbackService, { 
  HapticFeedbackType,
  AnimationType,
  AnimationInstance,
  HapticSettings
} from '@/services/HapticFeedbackService';
import { ContentTheme } from '@/services/ContentManagementService';

// 音效和触觉Hook状态
interface SoundAndHapticState {
  // 音频状态
  audioSettings: AudioSettings | null;
  isBackgroundMusicPlaying: boolean;
  isMuted: boolean;
  
  // 触觉状态
  hapticSettings: HapticSettings | null;
  activeAnimations: AnimationInstance[];
  
  // 加载状态
  loading: boolean;
  error: string | null;
}

/**
 * 声音和触觉反馈Hook
 */
export const useSoundAndHaptic = () => {
  const [state, setState] = useState<SoundAndHapticState>({
    audioSettings: null,
    isBackgroundMusicPlaying: false,
    isMuted: false,
    hapticSettings: null,
    activeAnimations: [],
    loading: false,
    error: null,
  });

  const soundService = SoundDesignService.getInstance();
  const hapticService = HapticFeedbackService.getInstance();
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  // 初始化
  useEffect(() => {
    loadSettings();
    startStatusUpdates();
    
    return () => {
      stopStatusUpdates();
    };
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const audioSettings = soundService.getAudioSettings();
      const hapticSettings = hapticService.getHapticSettings();
      const playbackState = soundService.getPlaybackState();
      const activeAnimations = hapticService.getActiveAnimations();

      setState(prev => ({
        ...prev,
        audioSettings,
        hapticSettings,
        isBackgroundMusicPlaying: playbackState.isBackgroundMusicPlaying,
        isMuted: playbackState.isMuted,
        activeAnimations,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载设置失败',
      }));
    }
  }, []);

  const startStatusUpdates = useCallback(() => {
    updateInterval.current = setInterval(() => {
      const playbackState = soundService.getPlaybackState();
      const activeAnimations = hapticService.getActiveAnimations();
      
      setState(prev => ({
        ...prev,
        isBackgroundMusicPlaying: playbackState.isBackgroundMusicPlaying,
        isMuted: playbackState.isMuted,
        activeAnimations,
      }));
    }, 1000); // 每秒更新一次
  }, []);

  const stopStatusUpdates = useCallback(() => {
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }
  }, []);

  // 音效播放
  const playSound = useCallback(async (type: SoundEffectType, options?: any) => {
    try {
      await soundService.playSoundEffect(type, options);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  // 背景音乐控制
  const playBackgroundMusic = useCallback(async (type: BackgroundMusicType, options?: any) => {
    try {
      await soundService.playBackgroundMusic(type, options);
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }, []);

  const stopBackgroundMusic = useCallback(async () => {
    try {
      await soundService.stopBackgroundMusic();
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  }, []);

  // 主题音乐
  const playThemeMusic = useCallback(async (theme: ContentTheme) => {
    try {
      await soundService.playThemeMusic(theme);
    } catch (error) {
      console.error('Error playing theme music:', error);
    }
  }, []);

  // 触觉反馈
  const triggerHaptic = useCallback(async (type: HapticFeedbackType) => {
    try {
      await hapticService.triggerHapticFeedback(type);
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  }, []);

  // 动画控制
  const createAnimation = useCallback((type: AnimationType, config?: any) => {
    return hapticService.createAnimation(type, config);
  }, []);

  const playAnimation = useCallback((animationId: string, onComplete?: () => void) => {
    hapticService.playAnimation(animationId, onComplete);
  }, []);

  const stopAnimation = useCallback((animationId: string) => {
    hapticService.stopAnimation(animationId);
  }, []);

  // 预设组合效果
  const playKeyCollectEffect = useCallback(async (onComplete?: () => void) => {
    try {
      await playSound('key_collect');
      const animationId = await hapticService.playKeyCollectAnimation(onComplete);
      return animationId;
    } catch (error) {
      console.error('Error playing key collect effect:', error);
      return null;
    }
  }, [playSound]);

  const playBadgeUnlockEffect = useCallback(async (onComplete?: () => void) => {
    try {
      await playSound('badge_unlock');
      const animationId = await hapticService.playBadgeUnlockAnimation(onComplete);
      return animationId;
    } catch (error) {
      console.error('Error playing badge unlock effect:', error);
      return null;
    }
  }, [playSound]);

  const playCorrectAnswerEffect = useCallback(async () => {
    try {
      await Promise.all([
        playSound('bingo'),
        triggerHaptic('success'),
      ]);
    } catch (error) {
      console.error('Error playing correct answer effect:', error);
    }
  }, [playSound, triggerHaptic]);

  const playIncorrectAnswerEffect = useCallback(async () => {
    try {
      await Promise.all([
        playSound('incorrect'),
        triggerHaptic('error'),
      ]);
    } catch (error) {
      console.error('Error playing incorrect answer effect:', error);
    }
  }, [playSound, triggerHaptic]);

  const playAchievementEffect = useCallback(async (onComplete?: () => void) => {
    try {
      await playSound('achievement');
      const animationId = await hapticService.playBadgeUnlockAnimation(onComplete);
      return animationId;
    } catch (error) {
      console.error('Error playing achievement effect:', error);
      return null;
    }
  }, [playSound]);

  // 设置更新
  const updateAudioSettings = useCallback(async (settings: Partial<AudioSettings>) => {
    try {
      await soundService.updateAudioSettings(settings);
      const updatedSettings = soundService.getAudioSettings();
      setState(prev => ({ ...prev, audioSettings: updatedSettings }));
    } catch (error) {
      console.error('Error updating audio settings:', error);
    }
  }, []);

  const updateHapticSettings = useCallback(async (settings: Partial<HapticSettings>) => {
    try {
      await hapticService.updateHapticSettings(settings);
      const updatedSettings = hapticService.getHapticSettings();
      setState(prev => ({ ...prev, hapticSettings: updatedSettings }));
    } catch (error) {
      console.error('Error updating haptic settings:', error);
    }
  }, []);

  // 静音控制
  const toggleMute = useCallback(async () => {
    try {
      await soundService.toggleMute();
      const playbackState = soundService.getPlaybackState();
      setState(prev => ({ ...prev, isMuted: playbackState.isMuted }));
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, []);

  return {
    // 状态
    ...state,
    
    // 音效控制
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    playThemeMusic,
    toggleMute,
    
    // 触觉控制
    triggerHaptic,
    createAnimation,
    playAnimation,
    stopAnimation,
    
    // 预设效果
    playKeyCollectEffect,
    playBadgeUnlockEffect,
    playCorrectAnswerEffect,
    playIncorrectAnswerEffect,
    playAchievementEffect,
    
    // 设置管理
    updateAudioSettings,
    updateHapticSettings,
    
    // 便捷属性
    soundEnabled: state.audioSettings?.soundEffectsEnabled || false,
    musicEnabled: state.audioSettings?.backgroundMusicEnabled || false,
    hapticEnabled: state.hapticSettings?.enabled || false,
    hasActiveAnimations: state.activeAnimations.length > 0,
  };
};

/**
 * 动画Hook
 */
export const useAnimation = (type: AnimationType, config?: any) => {
  const [animation, setAnimation] = useState<AnimationInstance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const hapticService = HapticFeedbackService.getInstance();

  const createAnimation = useCallback(() => {
    const newAnimation = hapticService.createAnimation(type, config);
    setAnimation(newAnimation);
    return newAnimation;
  }, [type, config]);

  const play = useCallback((onComplete?: () => void) => {
    if (!animation) return;

    setIsPlaying(true);
    hapticService.playAnimation(animation.id, () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    });
  }, [animation]);

  const stop = useCallback(() => {
    if (!animation) return;

    hapticService.stopAnimation(animation.id);
    setIsPlaying(false);
  }, [animation]);

  const cleanup = useCallback(() => {
    if (animation) {
      hapticService.cleanupAnimation(animation.id);
      setAnimation(null);
      setIsPlaying(false);
    }
  }, [animation]);

  useEffect(() => {
    createAnimation();
    return cleanup;
  }, [createAnimation, cleanup]);

  return {
    animation,
    isPlaying,
    play,
    stop,
    cleanup,
    animatedValue: animation?.animatedValue,
  };
};

/**
 * 按钮反馈Hook
 */
export const useButtonFeedback = () => {
  const { playSound, triggerHaptic } = useSoundAndHaptic();

  const onPress = useCallback(async () => {
    await Promise.all([
      playSound('button_tap'),
      triggerHaptic('light'),
    ]);
  }, [playSound, triggerHaptic]);

  const onLongPress = useCallback(async () => {
    await Promise.all([
      playSound('button_tap'),
      triggerHaptic('medium'),
    ]);
  }, [playSound, triggerHaptic]);

  return {
    onPress,
    onLongPress,
  };
};

/**
 * 学习反馈Hook
 */
export const useLearningFeedback = () => {
  const { 
    playCorrectAnswerEffect,
    playIncorrectAnswerEffect,
    playKeyCollectEffect,
    playAchievementEffect,
    playSound,
    triggerHaptic,
  } = useSoundAndHaptic();

  const onCorrectAnswer = useCallback(async () => {
    await playCorrectAnswerEffect();
  }, [playCorrectAnswerEffect]);

  const onIncorrectAnswer = useCallback(async () => {
    await playIncorrectAnswerEffect();
  }, [playIncorrectAnswerEffect]);

  const onKeywordLearned = useCallback(async (onComplete?: () => void) => {
    return await playKeyCollectEffect(onComplete);
  }, [playKeyCollectEffect]);

  const onAchievementUnlocked = useCallback(async (onComplete?: () => void) => {
    return await playAchievementEffect(onComplete);
  }, [playAchievementEffect]);

  const onProgressAdvance = useCallback(async () => {
    await Promise.all([
      playSound('progress_advance'),
      triggerHaptic('light'),
    ]);
  }, [playSound, triggerHaptic]);

  const onMagicMoment = useCallback(async () => {
    await Promise.all([
      playSound('magic_moment'),
      triggerHaptic('achievement'),
    ]);
  }, [playSound, triggerHaptic]);

  return {
    onCorrectAnswer,
    onIncorrectAnswer,
    onKeywordLearned,
    onAchievementUnlocked,
    onProgressAdvance,
    onMagicMoment,
  };
};

export default useSoundAndHaptic;
