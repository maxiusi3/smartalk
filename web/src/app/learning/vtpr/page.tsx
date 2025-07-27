'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProgress } from '../../../hooks/useProgress';
import { userSession } from '../../../lib/userSession';
import VTPRVideoOption from '../../../components/VTPRVideoOption';

interface VideoOption {
  id: string;
  videoUrl: string;
  isCorrect: boolean;
  description: string;
}

function VTPRContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams?.get('keyword');
  const interest = searchParams?.get('interest');
  const storyId = searchParams?.get('storyId') || `story_${interest}`;

  const [currentKeyword, setCurrentKeyword] = useState('check-in');
  const [currentTranslation, setCurrentTranslation] = useState('办理登机手续');
  const [videoOptions, setVideoOptions] = useState<VideoOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // 使用进度跟踪系统
  const { saveKeywordProgress, getKeywordAttempts } = useProgress();

  useEffect(() => {
    // 模拟视频选项数据
    const mockOptions: VideoOption[] = [
      {
        id: '1',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
        isCorrect: true,
        description: '机场办理登机手续场景'
      },
      {
        id: '2',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_2mb.mp4',
        isCorrect: false,
        description: '餐厅用餐场景'
      },
      {
        id: '3',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_5mb.mp4',
        isCorrect: false,
        description: '购物场景'
      },
      {
        id: '4',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
        isCorrect: false,
        description: '办公室场景'
      }
    ];

    setVideoOptions(mockOptions);
  }, []);

  const handleOptionSelect = async (optionId: string) => {
    setSelectedOption(optionId);
    const option = videoOptions.find(opt => opt.id === optionId);
    if (option) {
      setIsCorrect(option.isCorrect);
      setShowResult(true);
      setAttempts(prev => prev + 1);

      // 保存学习进度
      if (keyword && storyId && typeof window !== 'undefined') {
        try {
          await saveKeywordProgress(storyId, keyword, option.isCorrect, option.isCorrect);

          // 记录学习事件
          await userSession.trackEvent('vtpr_attempt', {
            keyword,
            storyId,
            interest,
            selectedOption: optionId,
            isCorrect: option.isCorrect,
            attempts: attempts + 1
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
    }
  };

  const handleContinue = async () => {
    if (isCorrect) {
      // 记录成功完成事件
      await userSession.trackEvent('keyword_unlocked', {
        keyword,
        storyId,
        interest,
        totalAttempts: attempts
      });

      // 返回故事线索页面，显示解锁成功
      window.location.href = `/story-clues/${interest}?unlocked=${keyword}`;
    } else {
      // 重新开始
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'travel': return '#3b82f6';
      case 'movie': return '#8b5cf6';
      case 'workplace': return '#10b981';
      default: return '#6b7280';
    }
  };

  const themeColor = getThemeColor(interest || 'travel');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      color: 'white'
    }}>
      {/* 头部 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              🎯 VTPR 音画匹配训练
            </h1>
            <p style={{
              color: '#d1d5db',
              fontSize: '1.1rem'
            }}>
              选择与单词 "{currentKeyword}" 最匹配的视频场景
            </p>
          </div>
          <a
            href={`/story-clues/${interest}`}
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            ← 返回故事线索
          </a>
        </div>

        {/* 单词卡片 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: themeColor,
            marginBottom: '1rem'
          }}>
            {currentKeyword}
          </h2>
          <p style={{
            fontSize: '1.5rem',
            color: '#e5e7eb',
            marginBottom: '1rem'
          }}>
            {currentTranslation}
          </p>
          <p style={{
            color: '#9ca3af',
            fontSize: '1rem'
          }}>
            尝试次数: {attempts}
          </p>
        </div>
      </div>

      {/* 视频选项网格 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {!showResult ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {videoOptions.map((option, index) => (
              <VTPRVideoOption
                key={option.id}
                id={option.id}
                videoUrl={option.videoUrl}
                thumbnailUrl={`https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=200&fit=crop`}
                description={option.description}
                isCorrect={option.isCorrect}
                isSelected={selectedOption === option.id}
                optionLabel={String.fromCharCode(65 + index)}
                themeColor={themeColor}
                onSelect={handleOptionSelect}
                disabled={showResult}
              />
            ))}
          </div>
        ) : (
          /* 结果显示 */
          <div style={{
            textAlign: 'center',
            background: isCorrect 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '1rem',
            padding: '3rem',
            border: isCorrect 
              ? '2px solid rgba(34, 197, 94, 0.3)' 
              : '2px solid rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>
              {isCorrect ? '🎉' : '😔'}
            </div>
            
            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: isCorrect ? '#22c55e' : '#ef4444',
              marginBottom: '1rem'
            }}>
              {isCorrect ? '恭喜！答对了！' : '很遗憾，答错了'}
            </h3>
            
            <p style={{
              fontSize: '1.2rem',
              color: '#d1d5db',
              marginBottom: '2rem'
            }}>
              {isCorrect 
                ? `你成功解锁了单词 "${currentKeyword}" 的故事线索！`
                : '不要灰心，再试一次吧！每次尝试都是学习的机会。'
              }
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleContinue}
                style={{
                  background: isCorrect ? '#22c55e' : themeColor,
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                {isCorrect ? '🎯 继续收集线索' : '🔄 重新尝试'}
              </button>
              
              <a
                href={`/story-clues/${interest}`}
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                返回故事线索
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VTPRPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#d1d5db' }}>加载 VTPR 训练中...</p>
        </div>
      </div>
    }>
      <VTPRContent />
    </Suspense>
  );
}
