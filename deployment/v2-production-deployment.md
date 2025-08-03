# SmarTalk V2 Production Deployment Plan

## Overview
This document outlines the comprehensive deployment plan for SmarTalk V2, including all enhanced features, services, and infrastructure requirements.

## Pre-Deployment Checklist

### 1. Infrastructure Requirements
- [x] PostgreSQL database (migrated from SQLite)
- [x] Redis for caching and session management
- [x] CDN configuration for video/audio content delivery
- [x] SSL certificates and domain configuration
- [x] Monitoring and analytics systems

### 2. API Integrations
- [ ] 讯飞 (iFlytek) API credentials configured
- [ ] ELSA API credentials configured
- [ ] CDN provider API keys configured
- [ ] Analytics service integration

### 3. V2 Enhanced Services Verification
- [x] StoryDrivenLearningService.ts - 30-second video processing pipeline
- [x] FocusModeController.ts - 2-error trigger for context guessing
- [x] RescueModeController.ts - 3-failure trigger for pronunciation training
- [x] PronunciationAssessmentService.ts - Dual API integration (讯飞/ELSA)
- [x] EnhancedVideoPlayerService.ts - Dual-mode architecture (Teaser/Magic Moment)
- [x] SubtitleEngine.ts - Dynamic highlighting effects (bounce/glow/pulse)
- [x] ContentManagementService.ts - 5-step wizard enforcing exactly 5 keywords
- [x] AssetValidationService.ts - Comprehensive asset validation
- [x] ContentQualityAssuranceService.ts - 5-keyword validation system

## Environment Configuration

### Production Environment Variables (.env.production)
```bash
# Database Configuration
DATABASE_URL="postgresql://smartalk_user:${POSTGRES_PASSWORD}@postgres:5432/smartalk_v2_prod"

# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Security
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://app.smartalk.com

# 讯飞 API Configuration
IFLYTEK_APP_ID=${IFLYTEK_APP_ID}
IFLYTEK_API_KEY=${IFLYTEK_API_KEY}
IFLYTEK_API_SECRET=${IFLYTEK_API_SECRET}
IFLYTEK_BASE_URL=https://api.xfyun.cn

# ELSA API Configuration
ELSA_API_KEY=${ELSA_API_KEY}
ELSA_BASE_URL=https://api.elsaspeak.com
ELSA_TIMEOUT=1500

# CDN Configuration
CDN_PROVIDER=cloudflare
CDN_BASE_URL=https://cdn.smartalk.com
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}

# File Storage
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=smartalk-v2-content

# Performance Targets
VIDEO_LOADING_TARGET=1000
API_RESPONSE_TARGET=1500
STARTUP_TIME_TARGET=2000

# Analytics
ANALYTICS_ENABLED=true
MIXPANEL_TOKEN=${MIXPANEL_TOKEN}
GOOGLE_ANALYTICS_ID=${GOOGLE_ANALYTICS_ID}

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
LOG_LEVEL=info
HEALTH_CHECK_INTERVAL=30000

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Content Validation
ENFORCE_5_KEYWORDS=true
ENFORCE_30_SECOND_DURATION=true
DURATION_TOLERANCE=0.5

# Error Recovery Configuration
FOCUS_MODE_ENABLED=true
RESCUE_MODE_ENABLED=true
FOCUS_MODE_TRIGGER_THRESHOLD=2
RESCUE_MODE_TRIGGER_THRESHOLD=3
```

## Deployment Steps

### Step 1: Pre-Deployment Verification
```bash
# Verify all V2 services are implemented
echo "Verifying V2 service implementations..."

# Check critical service files
services=(
  "mobile/src/services/StoryDrivenLearningService.ts"
  "mobile/src/services/FocusModeController.ts"
  "mobile/src/services/RescueModeController.ts"
  "mobile/src/services/PronunciationAssessmentService.ts"
  "mobile/src/services/EnhancedVideoPlayerService.ts"
  "mobile/src/services/SubtitleEngine.ts"
  "mobile/src/services/ContentManagementService.ts"
  "mobile/src/services/AssetValidationService.ts"
  "mobile/src/services/ContentQualityAssuranceService.ts"
)

for service in "${services[@]}"; do
  if [ -f "$service" ]; then
    echo "✅ $service - Found"
  else
    echo "❌ $service - Missing"
    exit 1
  fi
done
```

### Step 2: Database Migration to V2 Schema
```bash
# Run V2 database migrations
echo "Running V2 database migrations..."

# Backup existing database
pg_dump $DATABASE_URL > backup_v1_$(date +%Y%m%d_%H%M%S).sql

# Run Prisma migrations for V2 schema
npx prisma migrate deploy

# Verify migration success
npx prisma db seed
```

### Step 3: Build and Deploy V2 Services
```bash
# Build V2 backend with all enhanced services
echo "Building V2 backend..."
cd backend
npm run build:production

# Build V2 mobile application
echo "Building V2 mobile application..."
cd ../mobile
npm run build:production

# Deploy using enhanced deployment script
cd ../
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh deploy
```

### Step 4: Configure API Integrations
```bash
# Test 讯飞 API integration
echo "Testing 讯飞 API integration..."
curl -X POST "https://api.smartalk.com/api/v2/pronunciation/assess" \
  -H "Content-Type: application/json" \
  -d '{"provider": "iflytek", "audio": "test_audio_base64", "text": "hello"}'

# Test ELSA API integration
echo "Testing ELSA API integration..."
curl -X POST "https://api.smartalk.com/api/v2/pronunciation/assess" \
  -H "Content-Type: application/json" \
  -d '{"provider": "elsa", "audio": "test_audio_base64", "text": "hello"}'
```

### Step 5: CDN Configuration and Content Upload
```bash
# Configure CDN for V2 content delivery
echo "Configuring CDN for V2..."

# Upload sample content to test CDN
node scripts/upload-sample-content.js

# Test video loading performance
echo "Testing video loading performance..."
curl -w "@curl-format.txt" -o /dev/null -s "https://cdn.smartalk.com/videos/sample-30s-drama.mp4"
```

## Performance Verification

### Critical Performance Targets
- **Startup Time**: <2 seconds
- **Video Loading**: <1 second
- **API Response Time**: <1.5 seconds (讯飞/ELSA)
- **Magic Moment Transition**: <500ms

### Performance Test Script
```bash
#!/bin/bash
# performance-test.sh

echo "Running V2 performance tests..."

# Test startup time
start_time=$(date +%s%N)
curl -s "https://api.smartalk.com/api/v2/health" > /dev/null
end_time=$(date +%s%N)
startup_time=$(( (end_time - start_time) / 1000000 ))
echo "Startup time: ${startup_time}ms (target: <2000ms)"

# Test video loading
start_time=$(date +%s%N)
curl -s "https://cdn.smartalk.com/videos/sample-drama.mp4" > /dev/null
end_time=$(date +%s%N)
video_loading_time=$(( (end_time - start_time) / 1000000 ))
echo "Video loading time: ${video_loading_time}ms (target: <1000ms)"

# Test pronunciation API
start_time=$(date +%s%N)
curl -s -X POST "https://api.smartalk.com/api/v2/pronunciation/assess" \
  -H "Content-Type: application/json" \
  -d '{"provider": "iflytek", "audio": "test", "text": "hello"}' > /dev/null
end_time=$(date +%s%N)
api_response_time=$(( (end_time - start_time) / 1000000 ))
echo "API response time: ${api_response_time}ms (target: <1500ms)"
```

## Post-Deployment Verification

### Functional Tests
1. **30-Second Video Processing Pipeline**
   - Upload 30-second video
   - Verify duration validation (±0.5s tolerance)
   - Check automatic subtitle generation
   - Verify exactly 5 keyword extraction

2. **Dual-Mode Video Player**
   - Test Teaser Mode (with subtitles)
   - Test Magic Moment Mode (without subtitles)
   - Verify smooth mode transitions

3. **Error Recovery Systems**
   - Test Focus Mode trigger (2 consecutive errors)
   - Test Rescue Mode trigger (3 pronunciation failures)
   - Verify proper phase separation

4. **Content Management Wizard**
   - Test 5-step creation wizard
   - Verify 5-keyword enforcement
   - Test asset validation system

### Monitoring Setup
```bash
# Configure monitoring dashboards
echo "Setting up V2 monitoring..."

# Grafana dashboard for V2 metrics
curl -X POST "http://grafana:3000/api/dashboards/db" \
  -H "Content-Type: application/json" \
  -d @monitoring/v2-dashboard.json

# Set up alerts for performance targets
curl -X POST "http://grafana:3000/api/alerts" \
  -H "Content-Type: application/json" \
  -d @monitoring/v2-alerts.json
```

## Rollback Plan

### Emergency Rollback Procedure
```bash
# If deployment fails, rollback to V1
echo "Initiating emergency rollback to V1..."

# Restore V1 database
psql $DATABASE_URL < backup_v1_latest.sql

# Deploy V1 containers
docker-compose -f docker/docker-compose.v1.yml up -d

# Verify V1 functionality
curl -f "https://api.smartalk.com/api/v1/health"
```

## Success Criteria

### Deployment Success Indicators
- [ ] All V2 services responding correctly
- [ ] Performance targets met (<2s startup, <1s video loading, <1.5s API)
- [ ] 讯飞/ELSA APIs responding within SLA
- [ ] Focus Mode and Rescue Mode functioning correctly
- [ ] 5-keyword validation system working
- [ ] Dual-mode video player operational
- [ ] CDN delivering content optimally
- [ ] Monitoring and analytics collecting data

### User Journey Verification
- [ ] New user onboarding flow complete
- [ ] 30-second drama playback smooth
- [ ] Context guessing phase working
- [ ] Pronunciation training functional
- [ ] Magic Moment experience delivered
- [ ] Error recovery systems active
- [ ] Content creation wizard operational

## Next Steps After Deployment

1. **Monitor Performance Metrics** - Track all KPIs for first 24 hours
2. **User Feedback Collection** - Gather feedback on V2 features
3. **Performance Optimization** - Fine-tune based on real usage data
4. **Content Migration** - Migrate existing V1 content to V2 format
5. **Feature Rollout** - Gradual rollout of advanced V2 features

---

**Deployment Lead**: Development Team  
**Deployment Date**: 2025-01-02  
**Version**: SmarTalk V2.0.0  
**Status**: Ready for Production Deployment
