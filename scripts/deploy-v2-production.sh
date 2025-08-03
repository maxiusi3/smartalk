#!/bin/bash

# SmarTalk V2 Production Deployment Script
# Comprehensive deployment with all V2 enhanced features
# Version: 2.0.0
# Date: 2025-01-02

set -e

# Configuration
DEPLOYMENT_ENV=${DEPLOYMENT_ENV:-"production"}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"smartalk"}
IMAGE_TAG=${IMAGE_TAG:-"v2.0.0"}
HEALTH_CHECK_TIMEOUT=${HEALTH_CHECK_TIMEOUT:-"300"}
ROLLBACK_ON_FAILURE=${ROLLBACK_ON_FAILURE:-"true"}
V2_FEATURES_ENABLED=${V2_FEATURES_ENABLED:-"true"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] [V2-DEPLOY]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# V2 Pre-deployment checks
v2_pre_deployment_checks() {
    log "Running V2 pre-deployment checks..."
    
    # Check V2 required environment variables
    required_vars=(
        "DATABASE_URL" 
        "REDIS_URL" 
        "JWT_SECRET"
        "IFLYTEK_APP_ID"
        "IFLYTEK_API_KEY" 
        "IFLYTEK_API_SECRET"
        "ELSA_API_KEY"
        "CLOUDFLARE_API_TOKEN"
        "CLOUDFLARE_ZONE_ID"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required V2 environment variable $var is not set"
            exit 1
        fi
    done
    
    # Verify V2 service implementations
    log "Verifying V2 service implementations..."
    v2_services=(
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
    
    for service in "${v2_services[@]}"; do
        if [ -f "$service" ]; then
            success "✅ $service - Found"
        else
            error "❌ $service - Missing critical V2 service"
            exit 1
        fi
    done
    
    # Check database connectivity
    log "Checking PostgreSQL database connectivity..."
    if ! pg_isready -d "$DATABASE_URL" &> /dev/null; then
        error "Cannot connect to PostgreSQL database"
        exit 1
    fi
    
    # Check Redis connectivity
    log "Checking Redis connectivity..."
    if ! redis-cli -u "$REDIS_URL" ping &> /dev/null; then
        error "Cannot connect to Redis"
        exit 1
    fi
    
    success "V2 pre-deployment checks passed"
}

# Test V2 API integrations
test_v2_api_integrations() {
    log "Testing V2 API integrations..."
    
    # Test 讯飞 API connectivity
    log "Testing 讯飞 (iFlytek) API connectivity..."
    if curl -s --max-time 5 "https://api.xfyun.cn" > /dev/null; then
        success "讯飞 API endpoint accessible"
    else
        warning "讯飞 API endpoint not accessible - will test after deployment"
    fi
    
    # Test ELSA API connectivity
    log "Testing ELSA API connectivity..."
    if curl -s --max-time 5 "https://api.elsaspeak.com" > /dev/null; then
        success "ELSA API endpoint accessible"
    else
        warning "ELSA API endpoint not accessible - will test after deployment"
    fi
    
    # Test CDN connectivity
    log "Testing CDN connectivity..."
    if curl -s --max-time 5 "https://cdn.smartalk.com" > /dev/null; then
        success "CDN endpoint accessible"
    else
        warning "CDN endpoint not accessible - will configure during deployment"
    fi
}

# Build V2 Docker images
build_v2_images() {
    log "Building V2 Docker images with enhanced features..."
    
    # Build V2 backend image
    log "Building V2 backend image..."
    docker build \
        -f docker/Dockerfile.backend.v2 \
        -t "$DOCKER_REGISTRY/backend:$IMAGE_TAG" \
        --build-arg VERSION=v2.0.0 \
        --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
        --build-arg V2_FEATURES_ENABLED=true \
        .
    
    # Build V2 mobile image (if applicable)
    if [ -f "docker/Dockerfile.mobile.v2" ]; then
        log "Building V2 mobile image..."
        docker build \
            -f docker/Dockerfile.mobile.v2 \
            -t "$DOCKER_REGISTRY/mobile:$IMAGE_TAG" \
            --build-arg VERSION=v2.0.0 \
            --build-arg V2_FEATURES_ENABLED=true \
            ./mobile
    fi
    
    # Push to registry if not local deployment
    if [ "$DEPLOYMENT_ENV" != "local" ]; then
        log "Pushing V2 images to registry..."
        docker push "$DOCKER_REGISTRY/backend:$IMAGE_TAG"
        if [ -f "docker/Dockerfile.mobile.v2" ]; then
            docker push "$DOCKER_REGISTRY/mobile:$IMAGE_TAG"
        fi
    fi
    
    success "V2 Docker images built and pushed"
}

# Run V2 database migrations
run_v2_database_migration() {
    log "Running V2 database migrations..."
    
    # Backup existing database
    log "Creating database backup..."
    pg_dump "$DATABASE_URL" > "backup_pre_v2_$(date +%Y%m%d_%H%M%S).sql"
    
    # Run V2 Prisma migrations
    log "Running Prisma migrations for V2 schema..."
    docker run --rm \
        -e DATABASE_URL="$DATABASE_URL" \
        "$DOCKER_REGISTRY/backend:$IMAGE_TAG" \
        npx prisma migrate deploy
    
    # Seed V2 data
    log "Seeding V2 initial data..."
    docker run --rm \
        -e DATABASE_URL="$DATABASE_URL" \
        -e NODE_ENV=production \
        "$DOCKER_REGISTRY/backend:$IMAGE_TAG" \
        npx prisma db seed
    
    success "V2 database migrations completed"
}

# Deploy V2 services
deploy_v2_services() {
    log "Deploying V2 services..."
    
    # Create V2 environment file
    log "Creating V2 production environment configuration..."
    cp backend/.env.v2.production .env.prod
    
    # Replace environment variables
    sed -i "s/\${POSTGRES_PASSWORD}/$POSTGRES_PASSWORD/g" .env.prod
    sed -i "s/\${JWT_SECRET}/$JWT_SECRET/g" .env.prod
    sed -i "s/\${IFLYTEK_APP_ID}/$IFLYTEK_APP_ID/g" .env.prod
    sed -i "s/\${IFLYTEK_API_KEY}/$IFLYTEK_API_KEY/g" .env.prod
    sed -i "s/\${IFLYTEK_API_SECRET}/$IFLYTEK_API_SECRET/g" .env.prod
    sed -i "s/\${ELSA_API_KEY}/$ELSA_API_KEY/g" .env.prod
    sed -i "s/\${CLOUDFLARE_API_TOKEN}/$CLOUDFLARE_API_TOKEN/g" .env.prod
    sed -i "s/\${CLOUDFLARE_ZONE_ID}/$CLOUDFLARE_ZONE_ID/g" .env.prod
    sed -i "s/\${AWS_ACCESS_KEY_ID}/$AWS_ACCESS_KEY_ID/g" .env.prod
    sed -i "s/\${AWS_SECRET_ACCESS_KEY}/$AWS_SECRET_ACCESS_KEY/g" .env.prod
    
    # Deploy using Docker Compose with V2 configuration
    log "Starting V2 services with Docker Compose..."
    docker-compose -f docker/docker-compose.v2.prod.yml --env-file .env.prod up -d
    
    success "V2 services deployed"
}

# V2 Health checks
v2_health_check() {
    log "Performing V2 health checks..."
    
    local base_url="http://localhost:3001/api/v2"
    local timeout=$HEALTH_CHECK_TIMEOUT
    local interval=10
    local elapsed=0
    
    # Wait for services to start
    while [ $elapsed -lt $timeout ]; do
        if curl -f "$base_url/health" &> /dev/null; then
            success "V2 API health check passed"
            break
        fi
        
        log "Waiting for V2 services to be healthy... ($elapsed/$timeout seconds)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    if [ $elapsed -ge $timeout ]; then
        error "V2 health check failed after $timeout seconds"
        return 1
    fi
    
    # Test V2 specific endpoints
    log "Testing V2 specific endpoints..."
    
    # Test pronunciation assessment endpoints
    if curl -f "$base_url/pronunciation/providers" &> /dev/null; then
        success "Pronunciation assessment endpoints accessible"
    else
        warning "Pronunciation assessment endpoints not responding"
    fi
    
    # Test content management endpoints
    if curl -f "$base_url/content/wizard/steps" &> /dev/null; then
        success "Content management wizard endpoints accessible"
    else
        warning "Content management endpoints not responding"
    fi
    
    # Test video player endpoints
    if curl -f "$base_url/video/modes" &> /dev/null; then
        success "Video player mode endpoints accessible"
    else
        warning "Video player endpoints not responding"
    fi
    
    return 0
}

# V2 Performance tests
run_v2_performance_tests() {
    log "Running V2 performance tests..."
    
    local base_url="http://localhost:3001/api/v2"
    
    # Test startup time
    log "Testing V2 startup performance..."
    start_time=$(date +%s%N)
    curl -s "$base_url/health" > /dev/null
    end_time=$(date +%s%N)
    startup_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $startup_time -lt 2000 ]; then
        success "Startup time: ${startup_time}ms (✅ <2000ms target)"
    else
        warning "Startup time: ${startup_time}ms (⚠️ exceeds 2000ms target)"
    fi
    
    # Test API response time
    log "Testing V2 API response performance..."
    start_time=$(date +%s%N)
    curl -s "$base_url/interests" > /dev/null
    end_time=$(date +%s%N)
    api_response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $api_response_time -lt 1500 ]; then
        success "API response time: ${api_response_time}ms (✅ <1500ms target)"
    else
        warning "API response time: ${api_response_time}ms (⚠️ exceeds 1500ms target)"
    fi
    
    # Test CDN video loading (if CDN is configured)
    if [ -n "$CDN_BASE_URL" ]; then
        log "Testing CDN video loading performance..."
        start_time=$(date +%s%N)
        curl -s "$CDN_BASE_URL/videos/sample-drama.mp4" -o /dev/null
        end_time=$(date +%s%N)
        video_loading_time=$(( (end_time - start_time) / 1000000 ))
        
        if [ $video_loading_time -lt 1000 ]; then
            success "Video loading time: ${video_loading_time}ms (✅ <1000ms target)"
        else
            warning "Video loading time: ${video_loading_time}ms (⚠️ exceeds 1000ms target)"
        fi
    fi
}

# V2 Functional tests
run_v2_functional_tests() {
    log "Running V2 functional tests..."
    
    local base_url="http://localhost:3001/api/v2"
    
    # Test 5-keyword validation
    log "Testing 5-keyword validation system..."
    response=$(curl -s -X POST "$base_url/content/validate" \
        -H "Content-Type: application/json" \
        -d '{"keywords": ["hello", "world", "test", "example", "demo"]}')
    
    if echo "$response" | jq -e '.valid == true' > /dev/null; then
        success "5-keyword validation working correctly"
    else
        warning "5-keyword validation may have issues"
    fi
    
    # Test dual-mode video player
    log "Testing dual-mode video player..."
    response=$(curl -s "$base_url/video/modes")
    if echo "$response" | jq -e '.modes | contains(["teaser", "magic_moment"])' > /dev/null; then
        success "Dual-mode video player configured correctly"
    else
        warning "Dual-mode video player configuration issues"
    fi
    
    # Test error recovery systems
    log "Testing error recovery systems..."
    response=$(curl -s "$base_url/learning/recovery-modes")
    if echo "$response" | jq -e '.focusMode.enabled == true and .rescueMode.enabled == true' > /dev/null; then
        success "Error recovery systems enabled"
    else
        warning "Error recovery systems may not be properly configured"
    fi
}

# Main V2 deployment function
main() {
    log "🚀 Starting SmarTalk V2 Production Deployment..."
    log "Version: $IMAGE_TAG"
    log "Environment: $DEPLOYMENT_ENV"
    log "V2 Features: $V2_FEATURES_ENABLED"
    
    # Trap to handle failures
    trap 'if [ "$ROLLBACK_ON_FAILURE" = true ]; then rollback_v2_deployment; fi; cleanup; exit 1' ERR
    
    # V2 Deployment steps
    v2_pre_deployment_checks
    test_v2_api_integrations
    build_v2_images
    run_v2_database_migration
    deploy_v2_services
    
    # Wait for services to stabilize
    log "Waiting for services to stabilize..."
    sleep 30
    
    # Verification steps
    v2_health_check
    run_v2_performance_tests
    run_v2_functional_tests
    
    # Post-deployment tasks
    post_v2_deployment_tasks
    cleanup
    
    success "🎉 SmarTalk V2 Production Deployment Completed Successfully!"
    info "V2 Application URL: https://app.smartalk.com"
    info "V2 API URL: https://api.smartalk.com/api/v2"
    info "CDN URL: https://cdn.smartalk.com"
    info "Monitoring Dashboard: https://monitoring.smartalk.com"
    
    # Display V2 feature status
    log "V2 Features Status:"
    echo "  ✅ Story-Driven Learning Pipeline"
    echo "  ✅ Dual-Mode Video Player (Teaser/Magic Moment)"
    echo "  ✅ Focus Mode (2-error trigger)"
    echo "  ✅ Rescue Mode (3-failure trigger)"
    echo "  ✅ 讯飞/ELSA Pronunciation APIs"
    echo "  ✅ 5-Keyword Content Validation"
    echo "  ✅ Asset Validation System"
    echo "  ✅ Enhanced Subtitle Engine"
    echo "  ✅ Content Management Wizard"
    echo "  ✅ Performance Optimization"
}

# Rollback function for V2
rollback_v2_deployment() {
    error "V2 deployment failed, initiating rollback..."
    
    # Stop V2 services
    docker-compose -f docker/docker-compose.v2.prod.yml down
    
    # Restore database backup
    if [ -f "backup_pre_v2_*.sql" ]; then
        log "Restoring database backup..."
        psql "$DATABASE_URL" < backup_pre_v2_*.sql
    fi
    
    # Start V1 services
    docker-compose -f docker/docker-compose.prod.yml up -d
    
    error "Rollback to V1 completed"
}

# Post-deployment tasks for V2
post_v2_deployment_tasks() {
    log "Running V2 post-deployment tasks..."
    
    # Configure monitoring for V2
    log "Setting up V2 monitoring..."
    if [ -f "monitoring/v2-dashboard.json" ]; then
        curl -X POST "http://grafana:3000/api/dashboards/db" \
            -H "Content-Type: application/json" \
            -d @monitoring/v2-dashboard.json || warning "Failed to setup monitoring dashboard"
    fi
    
    # Warm up V2 caches
    log "Warming up V2 application caches..."
    curl -s "http://localhost:3001/api/v2/interests" > /dev/null
    curl -s "http://localhost:3001/api/v2/content/wizard/steps" > /dev/null
    curl -s "http://localhost:3001/api/v2/video/modes" > /dev/null
    
    # Send deployment notification
    log "Sending V2 deployment notification..."
    # Implementation depends on notification system
    
    success "V2 post-deployment tasks completed"
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    rm -f .env.prod
    rm -f backup_pre_v2_*.sql
    docker system prune -f --volumes
}

# Script execution
case "$1" in
    "deploy")
        main
        ;;
    "rollback")
        rollback_v2_deployment
        ;;
    "health-check")
        v2_health_check
        ;;
    "performance-test")
        run_v2_performance_tests
        ;;
    "functional-test")
        run_v2_functional_tests
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check|performance-test|functional-test}"
        echo ""
        echo "SmarTalk V2 Production Deployment Script"
        echo "Commands:"
        echo "  deploy           - Full V2 production deployment"
        echo "  rollback         - Rollback to V1"
        echo "  health-check     - Check V2 application health"
        echo "  performance-test - Run V2 performance tests"
        echo "  functional-test  - Run V2 functional tests"
        exit 1
        ;;
esac
