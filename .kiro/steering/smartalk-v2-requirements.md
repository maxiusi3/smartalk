---
inclusion: manual
---

# SmarTalk V2 Development Requirements

This steering document contains critical requirements and implementation details from the comprehensive Chinese requirements document (「开芯说SmarTalk」产品需求文档.md) that must be followed during development.

## Critical Implementation Requirements

### 1. Performance Targets (Non-Negotiable)
- **App Startup**: <2 seconds (应用启动时间)
- **Video Loading**: <1 second (视频加载时间) 
- **Interaction Response**: <100 milliseconds (交互响应时间)
- **Screen Transitions**: <300 milliseconds (页面切换时间)
- **Pronunciation API Response**: <1.5 seconds with "分析中..." loading indicator

### 2. Content Structure (Exact Requirements)
- **Mini-Drama Duration**: Exactly 30 seconds per drama
- **Keywords Per Drama**: Exactly 5 core vocabulary items (not 15)
- **Video Clips Per Keyword**: 2-4 clips from same drama for vTPR exercises
- **Video Clip Duration**: 3-5 seconds each, must loop continuously
- **Rescue Videos**: Slow-motion mouth articulation required for each keyword

### 3. Error Recovery System (Zero-Abandonment)
- **Focus Mode (专注模式)**: 
  - Triggers after exactly 2 consecutive context guessing errors
  - Semi-transparent overlay with message: "别担心，放慢速度有助于大脑吸收"
  - Audio plays at 0.8x speed with correct option highlighted
- **Rescue Mode (救援模式)**:
  - Triggers after exactly 3 consecutive pronunciation failures
  - Shows slow-motion native speaker mouth video
  - Final attempt required but force pass regardless of score
  - Reduced/zero Aqua-Points reward

### 4. Gamification Language (Critical for UX)
- Use "声音钥匙" (sound keys) instead of "vocabulary" or "words"
- Progress indicator: "声音钥匙 X/5" format
- Encouraging micro-copy: "你的大脑正在建立连接！"
- Treasure hunt metaphor: "集齐所有钥匙，见证奇迹时刻"
- Never use academic or punitive language

### 5. Magic Moment Orchestration (Core Value Proposition)
- **Build-up Phase**: 3-second mandatory pause with black screen fade
- **Ceremonial Text**: "恭喜！你已集齐所有钥匙。准备好见证奇迹了吗？"
- **CTA Button**: "戴上耳机，见证奇迹"
- **Theater Mode**: Full-screen, zero UI, vignette effect, automatic start
- **Afterglow**: Hold final frame for 2 seconds before feedback
- **Self-Assessment**: "🤯 完全听懂了！", "😲 比我想象的听懂更多！", "🙂 听懂了一部分"

### 6. Theme-Specific Requirements
- **Travel Theme**: Sky Blue #2196F3 + Sunset Orange #FF9800
- **Movies Theme**: Deep Purple #673AB7 + Gold #FFC107  
- **Workplace Theme**: Business Blue #1976D2 + Silver #90A4AE
- **Badge Names**: "旅行生存家" (travel), "电影达人" (movies), "职场精英" (workplace)

### 7. Spaced Repetition System (SRS)
- **Entry Trigger**: Keywords added to SRS queue only after magic moment completion
- **First Review**: Scheduled for T+24 hours after chapter completion
- **Review Interface**: Fast 2-minute sessions for 5-10 words
- **Self-Assessment**: "😎 秒懂", "🤔 想了一下", "🤯 忘了"
- **Algorithm**: SM-2 based intervals (Instantly: ×2.5, Think: ×1.5, Forgot: reset to 24h)

### 8. User State Persistence (Critical for Retention)
- **Session Recovery**: Users return to learning map with "进行中" status and "进度 X/5"
- **First Launch Detection**: `is_first_launch = true` forces methodology flow
- **Progress Granularity**: Track at keyword level with attempt counts
- **No Lost Progress**: App interruption must not lose user progress

### 9. Accessibility and Compliance (Required)
- **WCAG 2.1 AA**: Color contrast ratios for all UI elements
- **Screen Reader Support**: Descriptive labels for all interactive elements
- **Reduced Motion**: Disable non-essential animations if OS setting enabled
- **Privacy Policy**: In-app page explaining data collection and usage
- **Account Deletion**: Simple, discoverable functionality as required by app stores

### 10. Analytics Events (Business Critical)
- **Magic Moment Tracking**: `magic_moment_initiated`, `magic_moment_completed`, `magic_moment_feedback_given`
- **Error Recovery**: `focus_mode_triggered`, `rescue_mode_triggered`
- **SRS Engagement**: `srs_session_started`, `srs_card_reviewed`
- **Conversion Funnel**: Track from app launch through activation
- **North Star Metric**: User activation rate ≥30% (users completing magic moment / total new users)

## Development Guidelines

### Code Quality Standards
- **TypeScript**: Strict mode enabled with comprehensive type safety
- **Testing**: Unit tests for all business logic, integration tests for user flows
- **Performance**: Continuous validation of all performance targets
- **Error Handling**: Graceful degradation and user-friendly error messages

### Content Management
- **CMS Validation**: Enforce exactly 5 keywords per drama with all required assets
- **Asset Verification**: Validate audio quality, video timing, rescue video presence
- **Content Versioning**: Support A/B testing and safe content updates
- **Quality Assurance**: Built-in checks preventing incomplete content publication

### User Experience Priorities
1. **Zero Abandonment**: Users must always be able to progress
2. **Emotional Design**: Every interaction builds confidence and achievement
3. **Performance**: Meet all specified timing requirements
4. **Accessibility**: Inclusive design for diverse user needs
5. **Cultural Sensitivity**: Chinese-optimized copy and emotional resonance

## Success Validation Criteria
- **User Activation Rate**: ≥30% completing magic moment
- **Next-Day Retention**: ≥40% returning within 24 hours
- **Core Learning Success**: ≥80% completing without rescue mode
- **Performance Compliance**: All timing targets met consistently
- **Error Recovery Effectiveness**: <5% user abandonment due to difficulty

This document serves as the definitive guide for SmarTalk V2 development. All implementation decisions should align with these requirements to ensure the product delivers the intended "First Deadly Contact" experience that transforms skeptical users into believers.