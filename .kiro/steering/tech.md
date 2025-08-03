# SmarTalk V2 Technical Stack

## Architecture
- **Monorepo**: npm workspaces with backend, mobile, and CMS
- **Backend**: Node.js + Express.js + TypeScript + PostgreSQL + Prisma ORM
- **Mobile**: React Native + TypeScript + Zustand state management
- **CMS**: Content Management System for non-technical creators
- **Database**: PostgreSQL with enhanced schema supporting SRS and detailed analytics
- **CDN**: Global content delivery for video/audio assets

## Tech Stack

### Backend
- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL + Prisma ORM with enhanced schema
- **Authentication**: Device-based anonymous identification + JWT for sessions
- **Validation**: Joi for request validation with Chinese error messages
- **Testing**: Jest + Supertest with comprehensive coverage
- **Security**: Helmet, CORS, bcryptjs, API rate limiting
- **External APIs**: 讯飞/ELSA pronunciation assessment integration
- **Performance**: CDN integration, intelligent caching, content preloading

### Mobile
- **Framework**: React Native 0.72+ with TypeScript
- **State Management**: Zustand with comprehensive learning state persistence
- **Navigation**: React Navigation with complete page flow architecture
- **Video**: react-native-video with dual-video system (subtitled/non-subtitled)
- **Audio**: High-quality pronunciation playback with repeat functionality
- **Storage**: AsyncStorage with cloud sync preparation
- **Testing**: Jest + React Native Testing Library + E2E testing
- **Performance**: <2s startup, <1s video loading, <100ms interactions
- **Accessibility**: WCAG 2.1 AA compliance, screen reader support
- **Internationalization**: i18n framework for future localization

### Content Management System (CMS)
- **Framework**: Web-based visual interface for content creators
- **Validation**: Enforces exactly 5 keywords per 30-second drama
- **Asset Management**: Upload and linking system for audio, video clips, rescue videos
- **Quality Assurance**: Built-in validation preventing incomplete content publication
- **Versioning**: Content versioning and A/B testing capabilities
- **Analytics Integration**: Performance metrics for content optimization

## Common Commands

### Development
```bash
# Start both backend and mobile
npm run dev

# Start individual services
npm run dev:backend
npm run dev:mobile

# Install dependencies
npm run setup
```

### Database
```bash
# Backend database operations
cd backend
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:seed       # Seed test data
npm run db:studio     # Open Prisma Studio
```

### Testing
```bash
npm test              # Run all tests
npm run test:backend  # Backend tests only
npm run test:mobile   # Mobile tests only
```

### Code Quality
```bash
npm run lint          # Lint all code
npm run lint:fix      # Auto-fix linting issues
```

### Mobile Development
```bash
cd mobile
npm run android       # Run on Android
npm run ios          # Run on iOS
npm run typecheck    # TypeScript checking
```

## Performance Requirements (Critical)
Based on the comprehensive Chinese requirements document:

### Mandatory Performance Targets
- **App Startup**: <2 seconds (应用启动时间)
- **Video Loading**: <1 second (视频加载时间)
- **Interaction Response**: <100ms (交互响应时间)
- **Screen Transitions**: <300ms (页面切换时间)
- **Pronunciation API**: <1.5s with "分析中..." loading indicator

### Content Requirements
- **Mini-Drama Duration**: Exactly 30 seconds per drama
- **Keywords Per Drama**: Exactly 5 core vocabulary items
- **Video Clips Per Keyword**: 2-4 clips from same drama for vTPR
- **Video Clip Duration**: 3-5 seconds each, looping
- **Rescue Videos**: Slow-motion mouth articulation required for each keyword

### Error Recovery System
- **Focus Mode**: Triggers after 2 consecutive context guessing errors
- **Rescue Mode**: Triggers after 3 consecutive pronunciation failures
- **Zero Abandonment**: Users must always be able to progress through learning flow

## Build System
- **TypeScript**: Strict mode enabled with path aliases and comprehensive type safety
- **ESLint**: Consistent code style across backend, mobile, and CMS
- **Prisma**: Enhanced database schema with SRS support and detailed analytics
- **Metro**: React Native bundler with performance optimization
- **CDN Integration**: Global content delivery with intelligent caching
- **Testing Pipeline**: Automated testing with performance validation