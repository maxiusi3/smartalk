# SmarTalk Technical Stack

## Architecture
- **Monorepo**: npm workspaces with backend and mobile apps
- **Backend**: Node.js + Express.js + TypeScript + PostgreSQL + Prisma ORM
- **Mobile**: React Native + TypeScript + Zustand state management
- **Database**: PostgreSQL with Prisma schema-first approach

## Tech Stack

### Backend
- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT tokens for user sessions
- **Validation**: Joi for request validation
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, bcryptjs

### Mobile
- **Framework**: React Native 0.72+ with TypeScript
- **State Management**: Zustand with persistence
- **Navigation**: React Navigation
- **Video**: react-native-video
- **Storage**: AsyncStorage
- **Testing**: Jest + React Native Testing Library

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

## Build System
- **TypeScript**: Strict mode enabled with path aliases
- **ESLint**: Consistent code style across backend and mobile
- **Prisma**: Database schema management and type generation
- **Metro**: React Native bundler with custom configuration