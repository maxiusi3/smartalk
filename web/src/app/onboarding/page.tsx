'use client'

import { useState, useEffect } from 'react';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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

  const steps = [
    {
      title: "告别哑巴英语",
      subtitle: "你是否也有这样的困扰？",
      content: "学了十几年英语，考试成绩不错，但一开口就紧张？看美剧听不懂，和外国人交流时大脑一片空白？",
      icon: "😔",
      bgColor: "#f3f4f6"
    },
    {
      title: "神经沉浸法",
      subtitle: "科学的语言习得方式",
      content: "基于克拉申输入假说，通过可理解输入(i+1)在低焦虑环境中自然习得语言。就像婴儿学母语一样，先理解，再表达。",
      icon: "🧠",
      bgColor: "#e0f2fe"
    },
    {
      title: "30分钟见证奇迹",
      subtitle: "体验无字幕理解的魔法时刻",
      content: "通过互动式迷你剧情，先收集故事线索，再观看无字幕视频。当你发现自己能听懂时，那就是语言习得的魔法时刻！",
      icon: "✨",
      bgColor: "#f0f9ff"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 跳转到学习中心
      window.location.href = '/learning';
    }
  };

  const handleSkip = () => {
    window.location.href = '/learning';
  };

  const currentStepData = steps[currentStep];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${currentStepData.bgColor} 0%, #ffffff 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '2rem 1rem' : '2rem',
      fontFamily: 'system-ui, sans-serif',
      transition: 'background 0.5s ease'
    }}>
      {/* 跳过按钮 */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'transparent',
          border: 'none',
          color: '#6b7280',
          fontSize: '1rem',
          cursor: 'pointer',
          padding: '0.5rem 1rem'
        }}
      >
        跳过
      </button>

      {/* 主要内容 */}
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        {/* 图标 */}
        <div style={{
          fontSize: isMobile ? '4rem' : '6rem',
          marginBottom: '2rem',
          animation: 'bounce 2s infinite'
        }}>
          {currentStepData.icon}
        </div>

        {/* 标题 */}
        <h1 style={{
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem',
          lineHeight: 1.2
        }}>
          {currentStepData.title}
        </h1>

        {/* 副标题 */}
        <h2 style={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          color: '#4b5563',
          marginBottom: '2rem',
          fontWeight: '500'
        }}>
          {currentStepData.subtitle}
        </h2>

        {/* 内容 */}
        <p style={{
          fontSize: isMobile ? '1rem' : '1.1rem',
          color: '#6b7280',
          lineHeight: 1.6,
          marginBottom: '3rem',
          maxWidth: '500px',
          margin: '0 auto 3rem'
        }}>
          {currentStepData.content}
        </p>

        {/* 进度指示器 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '3rem'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: index === currentStep ? '#3b82f6' : '#d1d5db',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* 下一步按钮 */}
        <button
          onClick={handleNext}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            padding: isMobile ? '1rem 2rem' : '1.25rem 3rem',
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
          }}
        >
          {currentStep === steps.length - 1 ? '开始体验 🚀' : '继续'}
        </button>
      </div>

      {/* CSS 动画 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `
      }} />
    </div>
  );
}

