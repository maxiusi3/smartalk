# Requirements Document

## Introduction

SmarTalk V2 is an enhanced language learning platform based on the comprehensive product requirements document (「开芯说SmarTalk」产品需求文档.md). Building on the successful MVP foundation, V2 focuses on implementing the complete "First Deadly Contact" (首次致命接触) experience with enhanced content delivery, improved user psychology, and comprehensive analytics. The platform addresses the "mute English" (哑巴英语) problem through scientifically-backed "comprehensible input" methodology using interactive mini-dramas.

The core innovation is the 15-minute "magic moment" experience that transforms skeptical users into believers through a carefully orchestrated journey from doubt to conviction. The system uses 5 core vocabulary items per mini-drama (reduced from 15 for optimal cognitive load) and implements a sophisticated "Focus Mode" and "Rescue Mode" system to ensure zero user abandonment due to difficulty.

## Requirements

### Requirement 1

**User Story:** As a new user experiencing "mute English" frustration, I want to immediately understand how this app is different from traditional learning methods, so that I can quickly decide if it's worth my time.

#### Acceptance Criteria

1. WHEN a user launches the app for the first time THEN the system SHALL display a splash screen with the tagline "Don't learn a language, live a story"
2. WHEN the splash screen completes THEN the system SHALL present a 3-page animated methodology introduction that can be skipped
3. WHEN showing methodology pages THEN the system SHALL use empathetic copy addressing pain points like "学了10年，还是开不了口？"
4. WHEN explaining the solution THEN the system SHALL use visual metaphors like a gray person becoming colorful through story experience
5. WHEN completing the introduction THEN the system SHALL set clear expectations with "准备好，你的第一个故事即将开始"

### Requirement 2

**User Story:** As a user who wants personalized content, I want to choose my learning theme based on my interests, so that the content feels relevant and engaging to me.

#### Acceptance Criteria

1. WHEN a user reaches interest selection THEN the system SHALL display 3 visually distinct theme cards (travel, movies, workplace)
2. WHEN displaying theme cards THEN the system SHALL use theme-specific colors and imagery (travel: sky blue + sunset orange, movies: deep purple + gold, workplace: business blue + silver)
3. WHEN a user selects a theme THEN the system SHALL load the corresponding content package and store their preference
4. WHEN theme selection is complete THEN the system SHALL transition to the story preview with appropriate theming
5. WHEN loading content THEN the system SHALL display encouraging messages about their upcoming learning journey

### Requirement 3

**User Story:** As a learner, I want to see the complete story I'll be working towards understanding, so that I have a clear goal and can experience the "future promise" of comprehension.

#### Acceptance Criteria

1. WHEN a user completes theme selection THEN the system SHALL play a 30-second mini-drama with subtitles as a "teaser" (体验式预告片)
2. WHEN displaying the teaser THEN the system SHALL highlight the 5 core vocabulary words with visual effects (bounce, glow, pulse) in the subtitles
3. WHEN the teaser ends THEN the system SHALL display the "story clues" interface with 5 locked icons representing vocabulary items
4. WHEN showing story clues THEN the system SHALL use gamified language like "声音钥匙" (sound keys) instead of academic terms like "vocabulary"
5. WHEN presenting the learning goal THEN the system SHALL create anticipation with copy like "集齐所有钥匙，见证奇迹时刻" (collect all keys to witness the magic moment)
6. WHEN displaying progress THEN the system SHALL show "声音钥匙 X/5" format to maintain gamification
7. WHEN a user views locked clues THEN the system SHALL display each as an attractive icon with theme-appropriate visual design

### Requirement 4

**User Story:** As a user learning vocabulary, I want to connect sounds directly to visual meaning through an engaging, pressure-free process, so that I can build natural language intuition.

#### Acceptance Criteria

1. WHEN a user clicks on a locked story clue THEN the system SHALL play the vocabulary audio and display 2-4 video clip options from the same mini-drama
2. WHEN a user selects the correct video clip THEN the system SHALL illuminate the clue with positive feedback, celebratory animation, and "bingo" sound effect
3. WHEN a user selects incorrectly THEN the system SHALL gray out the wrong choice, make it shake slightly, and display encouraging micro-copy like "再想想？" (think again?)
4. WHEN a user makes 2 consecutive errors THEN the system SHALL trigger "Focus Mode" (专注模式) with a semi-transparent overlay, supportive messaging like "别担心，放慢速度有助于大脑吸收" (don't worry, slowing down helps brain absorption), and highlight the correct option with glow effect
5. WHEN in Focus Mode THEN the system SHALL play the audio at 0.8x speed and provide additional visual cues
6. WHEN completing each vocabulary item THEN the system SHALL update progress with "声音钥匙 X/5" format and display encouraging messages like "你的大脑正在建立连接！" (your brain is making connections!)
7. WHEN all attempts are made THEN the system SHALL ensure the user can always proceed to maintain learning flow

### Requirement 5

**User Story:** As a learner who has completed vocabulary learning, I want to immediately verify my progress by watching the story without subtitles, so that I can experience the transformative "magic moment" of comprehension.

#### Acceptance Criteria

1. WHEN a user collects all 5 story clues THEN the system SHALL trigger a milestone achievement page with full-screen congratulatory animation and golden particle effects
2. WHEN the milestone is reached THEN the system SHALL display ceremonial text like "恭喜！你已集齐所有钥匙。准备好见证奇迹了吗？" (Congratulations! You've collected all keys. Ready to witness the magic?) with CTA button "[戴上耳机，见证奇迹]" (Put on headphones, witness the magic)
3. WHEN a user proceeds to the magic moment THEN the system SHALL enter full-screen theater mode with zero UI distractions and play the same 30-second mini-drama without subtitles
4. WHEN the subtitle-free video ends THEN the system SHALL display self-validation feedback with empathetic options: "感觉怎么样？" with choices like "[🤯 完全听懂了！]", "[😲 比我想象的听懂更多！]", "[🙂 听懂了一部分]"
5. WHEN collecting feedback THEN the system SHALL provide strong encouragement regardless of user's choice and award a beautiful virtual badge (e.g., "旅行生存家" for travel theme)
6. WHEN the magic moment is complete THEN the system SHALL record this as the primary "activation" event for analytics
7. WHEN transitioning from theater mode THEN the system SHALL use smooth animations to maintain the emotional impact

### Requirement 6

**User Story:** As a user who has experienced the magic moment, I want to see clear next steps and receive immediately useful tips, so that I'm motivated to continue learning and can apply knowledge right away.

#### Acceptance Criteria

1. WHEN a user completes the magic moment THEN the system SHALL automatically transition to the learning map with the completed chapter marked as "已通关" (completed) with a completion badge
2. WHEN showing the learning map THEN the system SHALL display a locked "Chapter 2" with unlock animation, intriguing title, and attractive thumbnail to create suspense
3. WHEN providing next steps THEN the system SHALL include a clickable speaking tip lightbulb icon with immediately practical conversation advice
4. WHEN a user clicks speaking tips THEN the system SHALL show a card with useful phrases like "Sorry, I mean..." (不好意思，我的意思是...) and "How do you say... in English?" (用英语怎么说...?)
5. WHEN displaying tips THEN the system SHALL emphasize that communication is about problem-solving, not perfection, with encouraging copy
6. WHEN updating the learning map THEN the system SHALL add the completed vocabulary to the Ebbinghaus spaced repetition queue for future review
7. WHEN showing achievements THEN the system SHALL display the earned badge prominently and update the user's achievement wall

### Requirement 7

**User Story:** As a product stakeholder, I want comprehensive analytics tracking throughout the user journey, so that I can measure activation rates and optimize the conversion funnel.

#### Acceptance Criteria

1. WHEN a user progresses through any major step THEN the system SHALL log detailed analytics events with user context
2. WHEN a user completes the subtitle-free video viewing THEN the system SHALL record this as the primary "activation" event
3. WHEN tracking user behavior THEN the system SHALL maintain conversion funnel metrics from app launch through activation
4. WHEN measuring success THEN the system SHALL target ≥30% new user activation rate and ≥40% next-day retention
5. WHEN collecting analytics THEN the system SHALL prepare data for A/B testing different onboarding flows and content presentations

### Requirement 8

**User Story:** As a user on various devices, I want the app to perform smoothly with fast loading and responsive interactions, so that my learning experience feels seamless and professional.

#### Acceptance Criteria

1. WHEN a user launches the app THEN the system SHALL complete startup in less than 2 seconds
2. WHEN loading video content THEN the system SHALL begin playback within 1 second with intelligent preloading
3. WHEN a user interacts with learning elements THEN the system SHALL respond within 100 milliseconds
4. WHEN switching between screens THEN the system SHALL complete transitions within 300 milliseconds with smooth animations
5. WHEN handling errors THEN the system SHALL provide graceful degradation and clear user communication

### Requirement 9

**User Story:** As a content creator, I want a scalable content management system that supports multiple themes and languages, so that we can efficiently produce and manage learning content.

#### Acceptance Criteria

1. WHEN creating new content THEN the system SHALL support structured content templates for mini-dramas and vocabulary
2. WHEN managing themes THEN the system SHALL allow easy addition of new interest categories with consistent formatting
3. WHEN handling media assets THEN the system SHALL integrate with CDN for optimal global content delivery
4. WHEN updating content THEN the system SHALL support versioning and A/B testing of different story variations
5. WHEN scaling content THEN the system SHALL prepare architecture for multiple language pairs beyond English-Chinese

### Requirement 10

**User Story:** As a user with some prior English knowledge, I want the app to quickly assess my current level before I start, so that I can begin with content that is challenging but not overwhelming, making me feel the app is professional and personalized for me.

#### Acceptance Criteria

1. WHEN a user completes the methodology introduction THEN the system SHALL present an option to take a quick placement test or skip and start as a beginner
2. WHEN the user chooses to take the test THEN the system SHALL present a short test (≤3 mins) including "listening-to-choose-picture" and "read-aloud" tasks
3. WHEN the test is completed THEN the system SHALL display a results page with an intuitive CEFR level (e.g., A2), a simple competency radar chart, and a clear call-to-action to start their journey
4. WHEN the user chooses to skip the test THEN the system SHALL assign a default beginner level (A1) and seamlessly transition them to the learning map
5. WHEN designing the test THEN the system SHALL ensure instructions are clear and interactions are simple to prevent user friction

### Requirement 11

**User Story:** As a learner, after understanding a new word's meaning, I want to immediately practice saying it and get instant, actionable feedback on my pronunciation, so that I can build the muscle memory and confidence to speak.

#### Acceptance Criteria

1. WHEN a user correctly identifies a vocabulary item's meaning (Context Guessing) THEN the system SHALL immediately transition to "Echo & Polish" (回声与润色) mode with clear instructions
2. WHEN the user provides a voice sample THEN the system SHALL use a third-party AI service (讯飞, ELSA) to evaluate accuracy, fluency, and completeness within 1.5 seconds
3. WHEN the user's score is high (>85) THEN the system SHALL display "Perfect!" with full "Aqua-Points" reward (+10 points) and celebratory animation
4. WHEN the user's score is moderate (<85) THEN the system SHALL display the score with specific textual feedback mapped to phonetic errors (e.g., "t的发音要更轻哦" - your 't' sound should be softer)
5. WHEN the user fails 3 consecutive pronunciation attempts THEN the system SHALL trigger "Rescue Mode" (救援模式) with a semi-transparent overlay
6. WHEN in Rescue Mode THEN the system SHALL display a slow-motion, close-up video of a native speaker's mouth articulating the word with optional phonetic technique breakdown
7. WHEN the user attempts pronunciation after Rescue Mode THEN the system SHALL mark the item as complete regardless of score but provide reduced rewards (half points or zero)
8. WHEN displaying feedback THEN the system SHALL show loading animation with "分析中..." (analyzing...) text during API processing
9. WHEN providing pronunciation tips THEN the system SHALL maintain an encouraging tone and avoid negative language

### Requirement 12

**User Story:** As a dedicated learner, I want a personal space within the app where I can track my overall progress, review my achievements, and see my learning journey unfold, so that I feel a long-term sense of ownership and accomplishment.

#### Acceptance Criteria

1. WHEN a user is on the Learning Map THEN the system SHALL provide a clear entry point to a "Profile" or "Me" section
2. WHEN a user enters their profile THEN the system SHALL display key statistics such as "Total Learning Time," "Words Mastered," and a visual learning calendar (heatmap)
3. WHEN in the profile THEN the system SHALL feature an "Achievement Wall" displaying all the beautifully designed badges the user has earned from completing chapters
4. WHEN new badges are earned THEN the system SHALL notify the user and visually update the achievement wall, reinforcing positive behavior
5. WHEN viewing statistics THEN the system SHALL present the data in a clean, encouraging, and easy-to-understand visual format

### Requirement 13

**User Story:** As a learner, I worry that I will forget what I've learned, so I want the app to intelligently help me review past content at the right time to build long-term memory.

#### Acceptance Criteria

1. WHEN a user successfully learns a new vocabulary item ("sound key") THEN the system SHALL automatically add this item to a personalized, spaced repetition (SRS) queue
2. WHEN scheduling reviews THEN the system's SRS engine SHALL use an algorithm based on the Ebbinghaus forgetting curve to determine the optimal time for the next review
3. WHEN a user launches the app THEN the system (in a future version, but the backend logic is built now) SHALL be able to present a "Daily Review" session if items are due for review
4. WHEN designing the content database THEN the system's architecture SHALL explicitly support this SRS logic by linking user progress to the content library
5. WHEN a user reviews an item THEN the system SHALL adjust the next review interval based on their performance (easy, medium, hard)

### Requirement 14

**User Story:** As a learner struggling with pronunciation, I want a more intuitive and supportive way to get help instead of just getting a low score, so that I don't feel frustrated and can overcome difficult sounds.

#### Acceptance Criteria

1. WHEN a user fails the pronunciation assessment (score < 85%) for the same vocabulary item 3 times consecutively THEN the system SHALL trigger "Rescue Mode"
2. WHEN "Rescue Mode" is triggered THEN the system SHALL display an overlay featuring a slow-motion, close-up video of a native speaker's mouth articulating the word/phrase
3. WHEN in "Rescue Mode" THEN the system MAY also display a graphical breakdown of key phonetic techniques below the video
4. WHEN the user attempts pronunciation after watching the "Rescue Mode" video THEN the system SHALL mark the vocabulary item as complete regardless of the score, to ensure learning flow
5. WHEN passing via "Rescue Mode" THEN the system SHALL grant a reduced (or zero) "Aqua-Points" reward to incentivize standard passing

### Requirement 15

**User Story:** As a content creator and system administrator, I want a comprehensive content management system that supports theme-based mini-dramas with all required multimedia assets, so that we can efficiently produce and manage learning content at scale.

#### Acceptance Criteria

1. WHEN creating new content THEN the system SHALL support structured templates for 30-second mini-dramas with exactly 5 core vocabulary items per drama
2. WHEN managing themes THEN the system SHALL support the three core themes (travel, movies, workplace) with theme-specific visual styling and color schemes
3. WHEN handling video assets THEN the system SHALL require both subtitled and non-subtitled versions of each mini-drama for the magic moment experience
4. WHEN managing vocabulary THEN the system SHALL require audio pronunciation files, 2-4 video clip options per vocabulary item, and rescue mode mouth articulation videos
5. WHEN organizing content THEN the system SHALL link all assets to specific themes and ensure proper CDN integration for global content delivery
6. WHEN updating content THEN the system SHALL support A/B testing of different story variations and vocabulary selections
7. WHEN scaling content THEN the system SHALL prepare architecture for multiple language pairs beyond English-Chinese

### Requirement 16

**User Story:** As a business stakeholder, I want to validate the core value proposition and measure product-market fit through comprehensive analytics, so that we can make data-driven decisions about product development and optimization.

#### Acceptance Criteria

1. WHEN measuring product success THEN the system SHALL track the north star metric of user activation rate (users completing magic moment / total new users) with target ≥30%
2. WHEN analyzing user behavior THEN the system SHALL provide detailed conversion funnel analysis from app launch through activation and retention
3. WHEN collecting user feedback THEN the system SHALL capture qualitative data about the emotional impact of the magic moment through self-assessment responses
4. WHEN evaluating content effectiveness THEN the system SHALL measure learning outcomes, completion rates, and user satisfaction by theme (travel, movies, workplace)
5. WHEN tracking retention THEN the system SHALL measure next-day retention (≥40% target) and 7-day retention metrics
6. WHEN planning iterations THEN the system SHALL provide data insights for optimizing the "first deadly contact" experience and identifying drop-off points
7. WHEN monitoring system health THEN the system SHALL track performance metrics including video loading times, pronunciation API response times, and error rates

### Requirement 17

**User Story:** As a product manager, I want to ensure the system implements all critical user experience details specified in the comprehensive requirements, so that the final product delivers the intended psychological impact and learning effectiveness.

#### Acceptance Criteria

1. WHEN implementing visual design THEN the system SHALL use the specified color palette (Deep Blue #1A237E, Warm Orange #FF6B35, theme-specific colors) and typography system (PingFang SC for Chinese, SF Pro for English)
2. WHEN handling user errors THEN the system SHALL implement the complete error recovery system with Focus Mode (2 consecutive errors) and Rescue Mode (3 consecutive pronunciation failures)
3. WHEN providing feedback THEN the system SHALL use encouraging micro-copy like "你的大脑正在建立连接！" and avoid any negative or punitive language
4. WHEN managing user flow THEN the system SHALL ensure users can always progress through the learning sequence without getting permanently stuck
5. WHEN implementing gamification THEN the system SHALL use terms like "声音钥匙" (sound keys) instead of academic vocabulary and maintain the treasure hunt metaphor throughout
6. WHEN handling performance THEN the system SHALL meet specified targets: <2s app startup, <1s video loading, <100ms interaction response, <300ms screen transitions
7. WHEN implementing the magic moment THEN the system SHALL create the complete ceremonial experience with proper build-up, full-screen theater mode, and emotional achievement confirmation