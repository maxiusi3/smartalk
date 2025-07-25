# Requirements Document

## Introduction

SmarTalk MVP is an innovative language learning platform that uses a scientifically-backed "comprehensible input" methodology through interactive mini-dramas. While the MVP version targets English learning for Chinese speakers to solve the "mute English" problem, the platform is designed to eventually support multiple native-target language pairs for immersive language acquisition. The MVP focuses on delivering a powerful "first deadly contact" experience that converts skeptical users into believers within their first 30-minute session.

## Requirements

### Requirement 1

**User Story:** As a new user with basic English knowledge but poor listening/speaking skills, I want to experience a personalized onboarding flow that addresses my specific interests, so that I feel the app understands my needs and learning goals.

#### Acceptance Criteria

1. WHEN a user launches the app for the first time THEN the system SHALL display a pain-point resonance page with compelling copy addressing "mute English" issues
2. WHEN a user proceeds through onboarding THEN the system SHALL present 2-3 animated pages explaining the "neural immersion method" in simple terms
3. WHEN a user reaches the interest selection page THEN the system SHALL display 2-3 visually appealing card options (travel, movies, workplace) for personalized content
4. WHEN a user selects an interest category THEN the system SHALL load the corresponding themed content package for their learning journey

### Requirement 2

**User Story:** As a learner, I want to first see the complete story I'll be working towards understanding, so that I have a clear goal and motivation for the learning process.

#### Acceptance Criteria

1. WHEN a user completes interest selection THEN the system SHALL play a 1-minute mini-drama video with subtitles matching their chosen theme
2. WHEN the video plays THEN the system SHALL highlight 15 core vocabulary words in the subtitles with visual effects
3. WHEN the video ends THEN the system SHALL display a "story clues" interface showing 15 icons representing the core vocabulary
4. WHEN displaying the clues interface THEN the system SHALL use gamified language like "collect story clues" instead of academic terminology

### Requirement 3

**User Story:** As a user, I want to learn vocabulary through an engaging, pressure-free interactive process that connects sounds directly to visual meaning, so that I can build language intuition naturally.

#### Acceptance Criteria

1. WHEN a user clicks on any story clue icon THEN the system SHALL play the vocabulary audio and display 2-4 related video clip options
2. WHEN a user selects the correct video clip THEN the system SHALL illuminate the clue icon and play positive audio feedback
3. WHEN a user selects an incorrect option THEN the system SHALL gray out the wrong choice without negative feedback and display encouraging micro-copy
4. WHEN a user completes each vocabulary item THEN the system SHALL update the progress indicator showing "Story clues discovered: X/15"
5. WHEN a user makes an error THEN the system SHALL display supportive messages like "Don't worry, your brain is making connections!"

### Requirement 4

**User Story:** As a learner who has completed the vocabulary learning, I want to immediately verify my progress by watching the story without subtitles, so that I can experience the "magic moment" of comprehension.

#### Acceptance Criteria

1. WHEN a user collects all 15 story clues THEN the system SHALL trigger a milestone achievement with special animation and ceremonial text
2. WHEN the milestone is reached THEN the system SHALL display encouraging text like "Ready to witness the magic? Put on headphones for best effect!"
3. WHEN a user proceeds to the magic moment THEN the system SHALL play the same mini-drama in full-screen "theater mode" without subtitles
4. WHEN the subtitle-free video ends THEN the system SHALL display an empathetic achievement confirmation page with emotional resonance copy
5. WHEN showing the achievement page THEN the system SHALL accurately describe the user's psychological experience and provide strong value affirmation

### Requirement 5

**User Story:** As a user who has experienced the magic moment, I want to see clear next steps and receive practical tips I can use immediately, so that I'm motivated to continue my learning journey.

#### Acceptance Criteria

1. WHEN a user completes the magic moment THEN the system SHALL display a visual learning map with the first node illuminated
2. WHEN showing the learning map THEN the system SHALL display a locked "Chapter 2" node with intriguing title and thumbnail to create suspense
3. WHEN displaying next steps THEN the system SHALL include a clickable "speaking tip" lightbulb icon with practical conversation advice
4. WHEN a user clicks the speaking tip THEN the system SHALL show a card with immediately useful phrases like "Sorry, I mean..." and "How do you say... in English?"
5. WHEN providing tips THEN the system SHALL emphasize that communication is about problem-solving, not perfection

### Requirement 6

**User Story:** As a product stakeholder, I want comprehensive analytics tracking throughout the user journey, so that I can measure the effectiveness of our core learning loop and optimize conversion rates.

#### Acceptance Criteria

1. WHEN a user progresses through any major step THEN the system SHALL log the event with timestamp and user context
2. WHEN a user completes the subtitle-free video viewing THEN the system SHALL record this as an "activation" event for our north star metric
3. WHEN a user provides self-assessment feedback THEN the system SHALL capture and categorize their response for analysis
4. WHEN tracking user behavior THEN the system SHALL maintain a conversion funnel from app launch through activation
5. WHEN measuring success THEN the system SHALL calculate new user activation rate as (users who watched subtitle-free video / total new users) * 100%

### Requirement 7

**User Story:** As a user on a mobile device, I want the app to perform smoothly with fast loading times and responsive interactions, so that my learning experience is seamless and engaging.

#### Acceptance Criteria

1. WHEN a user launches the app THEN the system SHALL start up in less than 3 seconds
2. WHEN loading video content THEN the system SHALL begin playback within 1 second of user request
3. WHEN a user interacts with vTPR elements THEN the system SHALL respond to touches within 100 milliseconds
4. WHEN playing videos THEN the system SHALL maintain smooth playback without stuttering or buffering interruptions
5. WHEN switching between app screens THEN the system SHALL complete transitions within 300 milliseconds