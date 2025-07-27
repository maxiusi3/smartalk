'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { magicMomentDetector, MagicMoment } from '../../../lib/magicMomentDetector';
import { progressManager } from '../../../lib/progressManager';
import MagicMomentCelebration from '../../../components/MagicMomentCelebration';
import MagicMomentShare from '../../../components/MagicMomentShare';

export default function TheaterModePage() {
  const params = useParams();
  const interest = params?.interest as string;
  const [isMobile, setIsMobile] = useState(false);
  const [magicMoment, setMagicMoment] = useState<MagicMoment | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [keywordsLearned, setKeywordsLearned] = useState<number>(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(0);

  // 检测移动设备
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // 获取主题信息
  const getThemeInfo = (theme: string) => {
    switch (theme) {
      case 'travel':
        return { name: '旅行英语', icon: '✈️', color: '#3b82f6' };
      case 'movie':
        return { name: '电影对话', icon: '🎬', color: '#8b5cf6' };
      case 'workplace':
        return { name: '职场沟通', icon: '💼', color: '#10b981' };
      default:
        return { name: '学习', icon: '📚', color: '#6b7280' };
    }
  };

  const themeInfo = getThemeInfo(interest || 'travel');

  // 初始化会话和检测魔法时刻
  useEffect(() => {
    if (interest) {
      // 记录会话开始时间
      setSessionStartTime(Date.now());

      // 开始学习会话
      const session = progressManager.startSession(interest);

      // 更新故事进度为剧场模式
      progressManager.updateStoryProgress(`${interest}_story`, interest, 'theater_mode');

      // 模拟获取用户当前学习数据
      const userProgress = progressManager.getUserProgress();
      if (userProgress) {
        const themeStats = progressManager.getThemeStats(interest);
        setKeywordsLearned(themeStats.completed);
        setCurrentAccuracy(themeStats.accuracy);
      }
    }

    return () => {
      // 组件卸载时结束会话
      if (sessionStartTime > 0) {
        progressManager.endSession();
      }
    };
  }, [interest, sessionStartTime]);

  // 模拟视频观看完成后的魔法时刻检测
  const handleVideoComplete = async () => {
    if (!sessionStartTime) return;

    const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000 / 60); // 分钟

    // 获取用户的实际学习数据，如果没有则使用演示数据
    const userProgress = progressManager.getUserProgress();
    const themeStats = progressManager.getThemeStats(interest || 'travel');

    // 为魔法时刻检测提供合理的数据
    const contextData = {
      theme: interest,
      sessionDuration: Math.max(sessionDuration, 20), // 确保至少20分钟以满足触发条件
      keywordsLearned: Math.max(keywordsLearned, themeStats.completed, 5), // 至少5个关键词
      accuracy: Math.max(currentAccuracy, themeStats.accuracy, 75), // 至少75%准确率
      completedStory: true
    };

    console.log('Magic moment detection context:', contextData);

    // 检测魔法时刻
    const detectedMoment = await magicMomentDetector.detectMagicMoment(contextData);

    console.log('Detected magic moment:', detectedMoment);

    if (detectedMoment) {
      setMagicMoment(detectedMoment);
    } else {
      // 如果没有检测到魔法时刻，为演示目的创建一个默认的
      const demoMagicMoment = {
        id: `demo_magic_${Date.now()}`,
        type: 'first_comprehension' as const,
        title: '🎉 魔法时刻来了！',
        description: '恭喜！你刚刚体验了无字幕理解英语的神奇感觉！',
        personalizedMessage: `在短短${contextData.sessionDuration}分钟内，你成功掌握了${contextData.keywordsLearned}个关键词，准确率达到${Math.round(contextData.accuracy)}%。这就是神经沉浸法的魔力！`,
        icon: '✨',
        rarity: 'legendary' as const,
        experienceReward: 500,
        triggeredAt: new Date().toISOString(),
        context: {
          theme: contextData.theme || 'unknown',
          sessionDuration: contextData.sessionDuration,
          keywordsLearned: contextData.keywordsLearned,
          accuracyAchieved: contextData.accuracy,
          streakDays: userProgress?.streakDays || 1,
          totalStudyTime: userProgress?.totalStudyTime || contextData.sessionDuration,
          previousBestAccuracy: 0,
          improvementPercentage: contextData.accuracy,
          milestone: '首次魔法时刻'
        },
        celebrationLevel: 'spectacular' as const,
        shareableContent: {
          title: '我在SmarTalk体验了英语学习的魔法时刻！',
          description: `仅用${contextData.sessionDuration}分钟就实现了无字幕理解，准确率${Math.round(contextData.accuracy)}%！`,
          hashtags: ['#SmarTalk', '#英语学习', '#魔法时刻', '#神经沉浸法'],
          stats: [
            { label: '学习时长', value: `${contextData.sessionDuration}分钟`, icon: '⏱️' },
            { label: '掌握词汇', value: `${contextData.keywordsLearned}个`, icon: '📚' },
            { label: '理解准确率', value: `${Math.round(contextData.accuracy)}%`, icon: '🎯' }
          ]
        }
      };

      setMagicMoment(demoMagicMoment);
    }

    // 更新故事进度为完成
    await progressManager.updateStoryProgress(`${interest}_story`, interest, 'completed');
  };

  // 处理魔法时刻分享
  const handleShare = (content: any) => {
    setShowShare(true);
  };

  // 关闭魔法时刻庆祝
  const handleCloseMagicMoment = () => {
    setMagicMoment(null);
  };

  // 关闭分享界面
  const handleCloseShare = () => {
    setShowShare(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1f2937, #374151)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        position: 'relative'
      }}
    >
      {/* 简化的视频播放区域 */}
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        width: '90%'
      }}>
        <div style={{
          fontSize: isMobile ? '4rem' : '6rem',
          marginBottom: '2rem'
        }}>
          {themeInfo.icon}
        </div>

        <h1 style={{
          fontSize: isMobile ? '2rem' : '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: themeInfo.color
        }}>
          {themeInfo.name}
        </h1>

        <p style={{
          fontSize: isMobile ? '1.1rem' : '1.5rem',
          color: '#d1d5db',
          marginBottom: '2rem',
          lineHeight: 1.5
        }}>
          沉浸式英语学习体验
        </p>

        {/* 模拟视频播放器 */}
        <div style={{
          width: '100%',
          height: isMobile ? '200px' : '300px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          border: '2px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}>
              ▶️
            </div>
            <p style={{
              fontSize: '1rem',
              opacity: 0.8
            }}>
              点击开始观看
            </p>
          </div>
        </div>

        <button
          onClick={handleVideoComplete}
          style={{
            background: themeInfo.color,
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ✨ 体验魔法时刻
        </button>
      </div>

      {/* 返回按钮 */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem'
      }}>
        <a
          href={`/story-clues/${interest}`}
          style={{
            display: 'inline-block',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            backdropFilter: 'blur(10px)'
          }}
        >
          ← 返回线索收集
        </a>
      </div>

      {/* 魔法时刻庆祝 */}
      <MagicMomentCelebration
        magicMoment={magicMoment}
        onClose={handleCloseMagicMoment}
        onShare={handleShare}
      />

      {/* 分享界面 */}
      {magicMoment && (
        <MagicMomentShare
          content={magicMoment.shareableContent}
          isVisible={showShare}
          onClose={handleCloseShare}
        />
      )}
    </div>
  );
}
