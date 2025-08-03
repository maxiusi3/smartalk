# SmarTalk Project Structure

## Root Level Organization
```
smartalk-v2/
├── backend/           # Node.js API server with enhanced CMS
├── mobile/            # React Native app with comprehensive features
├── cms/               # Content Management System for creators
├── content/           # Structured media assets by theme
├── docs/              # Enhanced documentation and specifications
├── .kiro/             # Kiro configuration with V2 specs
│   └── specs/
│       ├── smartalk-mvp/     # Original MVP specs
│       └── smartalk-v2/      # Enhanced V2 specifications
├── infrastructure/    # Production deployment configurations
├── monitoring/        # System monitoring and alerting
└── package.json       # Workspace configuration
```

## Backend Structure (`backend/`)
```
backend/
├── src/
│   ├── controllers/   # Request handlers (AnalyticsController, etc.)
│   ├── services/      # Business logic (AnalyticsService, etc.)
│   ├── routes/        # Express route definitions
│   ├── middleware/    # Custom middleware (auth, validation, etc.)
│   ├── utils/         # Utility functions (database, validation)
│   ├── types/         # TypeScript type definitions
│   ├── scripts/       # Database seeding and utilities
│   └── __tests__/     # Test files mirroring src structure
├── prisma/
│   └── schema.prisma  # Database schema definition
├── content/           # Media files (videos, audio, images)
└── dist/              # Compiled JavaScript output
```

## Mobile Structure (`mobile/`)
```
mobile/
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── onboarding/    # Onboarding flow components
│   │   ├── video/         # Video player components
│   │   ├── vtpr/          # vTPR practice components
│   │   └── keyword-wall/  # Keyword wall components
│   ├── screens/       # Screen-level components
│   ├── navigation/    # Navigation configuration
│   ├── services/      # API and analytics services
│   ├── store/         # Zustand state management
│   ├── types/         # TypeScript definitions
│   ├── utils/         # Helper functions
│   ├── constants/     # App constants and configuration
│   └── __tests__/     # Test files
├── android/           # Android native code
├── ios/               # iOS native code
└── assets/            # Static assets
```

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `VideoPlayer.tsx`)
- **Services**: PascalCase with Service suffix (e.g., `AnalyticsService.ts`)
- **Controllers**: PascalCase with Controller suffix (e.g., `AnalyticsController.ts`)
- **Types**: camelCase with .types.ts suffix (e.g., `vtpr.types.ts`)
- **Tests**: Match source file with .test.ts/.test.tsx suffix

### Path Aliases
Both backend and mobile use TypeScript path aliases:
- `@/*` - src root
- `@/components/*` - components directory
- `@/services/*` - services directory
- `@/types/*` - types directory
- `@/utils/*` - utilities directory

### Content Organization
Media files organized by type and theme:
```
content/
├── videos/
│   ├── movies/
│   ├── travel/
│   └── workplace/
├── audio/
├── images/
├── subtitles/
└── clips/
```

### Enhanced Database Models
Core entities with V2 enhancements:
- `User` (device-based anonymous with learning motivation, activation cohort)
- `Interest` (travel, movies, workplace with theme-specific colors)
- `Drama` (30-second mini-dramas with dual video system)
- `Keyword` (exactly 5 per drama with SRS data, rescue videos)
- `KeywordVideoClip` (2-4 clips per keyword from same drama)
- `UserProgress` (detailed attempt tracking with error recovery data)
- `AnalyticsEvent` (enhanced events for magic moment tracking)
- `SRSQueue` (spaced repetition scheduling with SM-2 algorithm)
- `Badge` (theme-specific achievements with visual designs)

### Content Structure Requirements
Based on comprehensive Chinese requirements:
```
content/
├── dramas/
│   ├── travel/
│   │   ├── chapter1/
│   │   │   ├── subtitled.mp4      # 30-second teaser
│   │   │   ├── no-subtitles.mp4   # Magic moment version
│   │   │   └── keywords/          # Exactly 5 keywords
│   │   │       ├── keyword1/
│   │   │       │   ├── audio.mp3
│   │   │       │   ├── clip1.mp4  # 3-5 seconds
│   │   │       │   ├── clip2.mp4
│   │   │       │   ├── clip3.mp4
│   │   │       │   └── rescue-mouth.mp4
│   │   │       └── ...
│   │   └── chapter2/
│   ├── movies/
│   └── workplace/
├── audio/
├── images/
└── rescue-videos/
```

### Error Recovery System Architecture
Critical components for zero-abandonment experience:
- `FocusModeController` (triggers at 2 consecutive context errors)
- `RescueModeController` (triggers at 3 consecutive pronunciation failures)
- `ErrorRecoveryAnalytics` (tracks effectiveness and optimization)
- `ProgressPersistence` (ensures no lost progress on app interruption)

### Testing Structure
Tests mirror source structure and use descriptive naming:
- Unit tests for services and utilities
- Component tests for React Native components
- Integration tests for API endpoints
- E2E tests for critical user flows