# SmarTalk Project Structure

## Root Level Organization
```
smartalk-mvp/
├── backend/           # Node.js API server
├── mobile/            # React Native app
├── content/           # Shared media assets
├── docs/              # Documentation
├── .kiro/             # Kiro configuration and specs
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

### Database Models
Core entities follow this hierarchy:
- `User` (device-based anonymous users)
- `Interest` (travel, movies, workplace)
- `Drama` (mini-dramas within interests)
- `Keyword` (vocabulary within dramas)
- `UserProgress` (learning progress tracking)
- `AnalyticsEvent` (user behavior tracking)

### Testing Structure
Tests mirror source structure and use descriptive naming:
- Unit tests for services and utilities
- Component tests for React Native components
- Integration tests for API endpoints
- E2E tests for critical user flows