'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { contentManager, VTPRExercise } from '../../../lib/contentManager';
import { progressManager } from '../../../lib/progressManager';
import { useProgress } from '../../../hooks/useProgress';
import { userSession } from '../../../lib/userSession';
import VTPRVideoOption from '../../../components/VTPRVideoOption';
// Focus Mode 集成
import { useFocusMode } from '../../../hooks/useFocusMode';
import FocusModeModal from '../../../components/learning/FocusModeModal';
import { FocusModeHighlight, FocusModeIndicator } from '../../../components/learning/FocusModeModal';
// 发音训练集成
import PronunciationTrainer from '../../../components/learning/PronunciationTrainer';
import { usePronunciation } from '../../../hooks/usePronunciation';
// Rescue Mode 集成
import { useRescueMode } from '../../../hooks/useRescueMode';
import { RescueModeIndicator } from '../../../components/learning/RescueModeModal';
// SRS 集成
import { useSRS } from '../../../hooks/useSRS';
import { srsService } from '../../../lib/services/SRSService';
import SRSStatusIndicator from '../../../components/srs/SRSStatusIndicator';

// AI 学习助手集成
import { useLearningPathOptimizer } from '../../../hooks/useLearningPathOptimizer';
import AIAssistantIndicator from '../../../components/advanced/AIAssistantIndicator';

// 高级分析和预测性干预集成
import { PredictiveAlertIndicator } from '../../../components/advanced/PredictiveAlertSystem';

// 系统优化集成
import { useSystemOptimization } from '../../../hooks/useSystemOptimization';

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

  const [currentExercise, setCurrentExercise] = useState<VTPRExercise | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [videoOptions, setVideoOptions] = useState<VideoOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

  // 学习阶段状态
  const [learningPhase, setLearningPhase] = useState<'context_guessing' | 'pronunciation_training' | 'completed'>('context_guessing');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);

  // 使用进度跟踪系统
  const { saveKeywordProgress } = useProgress();

  // Focus Mode 集成
  const {
    isActive: isFocusModeActive,
    recordError: recordFocusModeError,
    recordSuccess: recordFocusModeSuccess,
    supportiveMessage,
    highlightCorrectOption,
    showGlowEffect
  } = useFocusMode();

  // SRS 集成
  const {
    addCard: addSRSCard,
    statistics: srsStatistics,
    isLoading: srsLoading,
    error: srsError
  } = useSRS();

  // 系统优化集成
  const {
    recordUserInteraction,
    recordVideoLoadTime,
    recordPronunciationApiTime
  } = useSystemOptimization();

  // 初始化会话ID
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await userSession.initializeSession();
        const newSessionId = `vtpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    // 加载 vTPR 练习数据
    const loadExercise = async () => {
      if (!interest) return;

      try {
        const exercises = contentManager.getVTPRExercises(interest);
        const currentEx = exercises[exerciseIndex];

        if (currentEx) {
          setCurrentExercise(currentEx);

          // 转换为组件需要的格式
          const options: VideoOption[] = currentEx.options.map(option => ({
            id: option.id,
            videoUrl: option.imageUrl, // 使用图片作为视频占位符
            isCorrect: option.isCorrect,
            description: option.isCorrect ? `正确：${currentEx.translation}` : '错误选项'
          }));

          setVideoOptions(options);
        } else {
          // 如果没有练习数据，使用备用数据
          const fallbackOptions: VideoOption[] = [
            {
              id: '1',
              videoUrl: '/images/placeholder/correct.jpg',
              isCorrect: true,
              description: '正确选项'
            },
            {
              id: '2',
              videoUrl: '/images/placeholder/wrong1.jpg',
              isCorrect: false,
              description: '错误选项1'
            },
            {
              id: '3',
              videoUrl: '/images/placeholder/wrong2.jpg',
              isCorrect: false,
              description: '错误选项2'
            },
            {
              id: '4',
              videoUrl: '/images/placeholder/wrong3.jpg',
              isCorrect: false,
              description: '错误选项3'
            }
          ];
          setVideoOptions(fallbackOptions);
        }
      } catch (error) {
        console.error('Failed to load vTPR exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [interest, exerciseIndex]);

  const handleOptionSelect = async (optionId: string) => {
    setSelectedOption(optionId);
    const option = videoOptions.find(opt => opt.id === optionId);
    if (option) {
      setIsCorrect(option.isCorrect);
      setShowResult(true);
      setAttempts(prev => prev + 1);

      // 记录用户交互
      recordUserInteraction({
        type: 'click',
        element: `vtpr_option_${optionId}`,
        success: option.isCorrect,
        duration: Date.now() - sessionStartTime,
        context: {
          page: 'learning',
          feature: 'vtpr',
          userState: 'learning'
        },
        metadata: {
          exerciseType: 'vtpr',
          optionSelected: optionId,
          isCorrect: option.isCorrect,
          questionId: currentExercise?.id,
          attempts: attempts + 1
        }
      });

      // Focus Mode 错误/成功记录
      if (currentExercise && sessionId) {
        try {
          if (option.isCorrect) {
            // 记录成功，退出Focus Mode
            await recordFocusModeSuccess();

            // 听音辨义阶段完成，进入发音训练阶段
            setTimeout(() => {
              setLearningPhase('pronunciation_training');
            }, 2000); // 2秒后切换到发音训练

          } else {
            // 记录错误，可能触发Focus Mode
            const triggered = await recordFocusModeError(
              currentExercise.keyword,
              sessionId,
              'context_guessing' // 这是"听音辨义"阶段
            );

            if (triggered) {
              console.log('Focus Mode triggered for user');
            }
          }
        } catch (error) {
          console.error('Failed to record Focus Mode event:', error);
        }
      }

      // 保存学习进度到旧系统
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
            attempts: attempts + 1,
            focusModeActive: isFocusModeActive // 添加Focus Mode状态
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }

      // 保存学习进度到新系统
      if (currentExercise && interest) {
        try {
          await progressManager.updateKeywordProgress(
            currentExercise.keyword,
            currentExercise.keyword,
            interest,
            option.isCorrect
          );

          // 如果正确，更新故事进度
          if (option.isCorrect) {
            await progressManager.updateStoryProgress(`${interest}_story`, interest, 'vtpr_training');
          }
        } catch (error) {
          console.error('Failed to save progress to new system:', error);
        }
      }
    }
  };

  // 处理发音训练完成
  const handlePronunciationComplete = async (assessment: any) => {
    setPronunciationScore(assessment.overallScore);

    // 记录发音API响应时间
    if (assessment.assessmentTime) {
      recordPronunciationApiTime(assessment.assessmentTime);
    }

    // 记录用户交互
    recordUserInteraction({
      type: 'voice',
      element: 'pronunciation_trainer',
      success: assessment.overallScore >= 70, // 假设70分以上为成功
      duration: assessment.assessmentTime || 0,
      context: {
        page: 'learning',
        feature: 'pronunciation',
        userState: 'learning'
      },
      metadata: {
        pronunciationScore: assessment.overallScore,
        targetText: currentExercise?.keyword,
        assessmentTime: assessment.assessmentTime
      }
    });

    // 记录发音训练完成事件
    if (keyword && storyId) {
      try {
        await userSession.trackEvent('pronunciation_training_completed', {
          keyword,
          storyId,
          interest,
          pronunciationScore: assessment.overallScore,
          assessmentTime: assessment.assessmentTime,
          sessionId
        });
      } catch (error) {
        console.error('Failed to track pronunciation event:', error);
      }
    }

    // 添加到SRS系统
    if (currentExercise && keyword) {
      try {
        await addSRSCard(
          currentExercise.keyword,
          currentExercise.keyword,
          currentExercise.translation,
          currentExercise.audioUrl,
          {
            storyId: storyId,
            interest: interest,
            difficulty: assessment.overallScore >= 80 ? 2 : assessment.overallScore >= 60 ? 3 : 4
          }
        );

        console.log('SRS card added successfully for keyword:', currentExercise.keyword);
      } catch (error) {
        console.error('Failed to add SRS card:', error);
      }
    }

    // 完成整个学习流程
    setTimeout(() => {
      setLearningPhase('completed');
    }, 3000); // 3秒后显示完成状态
  };

  // 处理发音训练取消
  const handlePronunciationCancel = () => {
    // 返回到听音辨义阶段
    setLearningPhase('context_guessing');
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(false);
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
      {/* Focus Mode 和 Rescue Mode 组件 */}
      <FocusModeModal />
      <FocusModeIndicator />
      <RescueModeIndicator />

      {/* SRS 状态指示器 */}
      <SRSStatusIndicator />

      {/* AI 学习助手指示器 */}
      <AIAssistantIndicator />

      {/* 预测性警报指示器 */}
      <PredictiveAlertIndicator />

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
              选择与单词 "{currentExercise?.keyword || 'loading...'}" 最匹配的视频场景
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
            {currentExercise?.keyword || 'Loading...'}
          </h2>
          <p style={{
            fontSize: '1.5rem',
            color: '#e5e7eb',
            marginBottom: '1rem'
          }}>
            {currentExercise?.translation || '加载中...'}
          </p>
          <p style={{
            color: '#9ca3af',
            fontSize: '1rem'
          }}>
            尝试次数: {attempts}
            {isFocusModeActive && (
              <span style={{
                marginLeft: '1rem',
                color: '#fbbf24',
                fontWeight: 'bold'
              }}>
                🎯 专注模式已激活
              </span>
            )}
          </p>

          {/* Focus Mode 支持消息 */}
          {isFocusModeActive && supportiveMessage && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '0.5rem',
              color: '#fbbf24'
            }}>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {supportiveMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 主要内容区域 - 根据学习阶段显示不同内容 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 听音辨义阶段 */}
        {learningPhase === 'context_guessing' && !showResult && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {videoOptions.map((option, index) => (
              <FocusModeHighlight
                key={option.id}
                isCorrectOption={option.isCorrect}
                className="focus-mode-option"
              >
                <VTPRVideoOption
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
                  onVideoLoadTime={recordVideoLoadTime}
                />
              </FocusModeHighlight>
            ))}
          </div>
        )}

        {/* 听音辨义结果显示 */}
        {learningPhase === 'context_guessing' && showResult && (
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
                ? `你成功解锁了单词 "${currentExercise?.keyword}" 的故事线索！`
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

        {/* 发音训练阶段 */}
        {learningPhase === 'pronunciation_training' && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '2px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎤</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '0.5rem'
              }}>
                发音训练阶段
              </h3>
              <p style={{ color: '#d1d5db', fontSize: '1rem' }}>
                现在请大声朗读单词，我们来评估您的发音
              </p>
            </div>

            <PronunciationTrainer
              keywordId={currentExercise?.keyword || ''}
              targetText={currentExercise?.keyword || ''}
              onAssessmentComplete={handlePronunciationComplete}
              onCancel={handlePronunciationCancel}
              className="max-w-2xl mx-auto"
            />
          </div>
        )}

        {/* 学习完成阶段 */}
        {learningPhase === 'completed' && (
          <div style={{
            textAlign: 'center',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '1rem',
            padding: '3rem',
            border: '2px solid rgba(34, 197, 94, 0.3)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>

            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#22c55e',
              marginBottom: '1rem'
            }}>
              学习完成！
            </h3>

            <p style={{
              color: '#d1d5db',
              fontSize: '1.1rem',
              marginBottom: '2rem'
            }}>
              恭喜您完成了 "{currentExercise?.keyword}" 的完整学习流程
            </p>

            {/* 学习成果展示 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>
                  ✅ 听音辨义
                </div>
                <div style={{ fontSize: '0.9rem', color: '#d1d5db' }}>
                  {attempts} 次尝试完成
                </div>
              </div>

              {pronunciationScore && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    🎤 发音评分
                  </div>
                  <div style={{ fontSize: '1.2rem', color: '#d1d5db' }}>
                    {pronunciationScore} 分
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                🔄 再次练习
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
                🎯 继续收集线索
              </a>
            </div>
          </div>
        )}

        {/* 发音训练阶段 */}
        {learningPhase === 'pronunciation_training' && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '2px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎤</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '0.5rem'
              }}>
                发音训练阶段
              </h3>
              <p style={{ color: '#d1d5db', fontSize: '1rem' }}>
                现在请大声朗读单词，我们来评估您的发音
              </p>
            </div>

            <PronunciationTrainer
              keywordId={currentExercise?.keyword || ''}
              targetText={currentExercise?.keyword || ''}
              onAssessmentComplete={handlePronunciationComplete}
              onCancel={handlePronunciationCancel}
              className="max-w-2xl mx-auto"
            />
          </div>
        )}

        {/* 学习完成阶段 */}
        {learningPhase === 'completed' && (
          <div style={{
            textAlign: 'center',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '1rem',
            padding: '3rem',
            border: '2px solid rgba(34, 197, 94, 0.3)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>

            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#22c55e',
              marginBottom: '1rem'
            }}>
              学习完成！
            </h3>

            <p style={{
              color: '#d1d5db',
              fontSize: '1.1rem',
              marginBottom: '2rem'
            }}>
              恭喜您完成了 "{currentExercise?.keyword}" 的完整学习流程
            </p>

            {/* 学习成果展示 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>
                  ✅ 听音辨义
                </div>
                <div style={{ fontSize: '0.9rem', color: '#d1d5db' }}>
                  {attempts} 次尝试完成
                </div>
              </div>

              {pronunciationScore && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    🎤 发音评分
                  </div>
                  <div style={{ fontSize: '1.2rem', color: '#d1d5db' }}>
                    {pronunciationScore} 分
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                🔄 再次练习
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
                🎯 继续收集线索
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
