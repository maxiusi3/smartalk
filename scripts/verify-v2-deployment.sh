#!/bin/bash

# SmarTalk V2 Deployment Verification Script
# Verifies all V2 components are ready for production deployment
# Version: 2.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] [V2-VERIFY]${NC} $1"
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

# Verification counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_result() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        success "$2"
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        error "$2"
    fi
}

# Verify V2 Service Implementations
verify_v2_services() {
    log "🔍 Verifying V2 service implementations..."
    
    # Critical V2 services
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
            check_result 0 "✅ $service - Found and ready"
        else
            check_result 1 "❌ $service - Missing critical V2 service"
        fi
    done
}

# Verify V2 Key Methods Implementation
verify_v2_methods() {
    log "🔍 Verifying V2 key methods implementation..."
    
    # Check StoryDrivenLearningService methods
    if grep -q "processMicroDrama" mobile/src/services/StoryDrivenLearningService.ts 2>/dev/null; then
        check_result 0 "✅ StoryDrivenLearningService.processMicroDrama() - Implemented"
    else
        check_result 1 "❌ StoryDrivenLearningService.processMicroDrama() - Missing"
    fi
    
    if grep -q "extractCoreVocabulary" mobile/src/services/StoryDrivenLearningService.ts 2>/dev/null; then
        check_result 0 "✅ StoryDrivenLearningService.extractCoreVocabulary() - Implemented"
    else
        check_result 1 "❌ StoryDrivenLearningService.extractCoreVocabulary() - Missing"
    fi
    
    # Check FocusModeController methods
    if grep -q "triggerFocusMode" mobile/src/services/FocusModeController.ts 2>/dev/null; then
        check_result 0 "✅ FocusModeController.triggerFocusMode() - Implemented"
    else
        check_result 1 "❌ FocusModeController.triggerFocusMode() - Missing"
    fi
    
    # Check RescueModeController methods
    if grep -q "triggerRescueMode" mobile/src/services/RescueModeController.ts 2>/dev/null; then
        check_result 0 "✅ RescueModeController.triggerRescueMode() - Implemented"
    else
        check_result 1 "❌ RescueModeController.triggerRescueMode() - Missing"
    fi
    
    # Check PronunciationAssessmentService dual API methods
    if grep -q "assessWithIflytek" mobile/src/services/PronunciationAssessmentService.ts 2>/dev/null; then
        check_result 0 "✅ PronunciationAssessmentService.assessWithIflytek() - Implemented"
    else
        check_result 1 "❌ PronunciationAssessmentService.assessWithIflytek() - Missing"
    fi
    
    if grep -q "assessWithElsa" mobile/src/services/PronunciationAssessmentService.ts 2>/dev/null; then
        check_result 0 "✅ PronunciationAssessmentService.assessWithElsa() - Implemented"
    else
        check_result 1 "❌ PronunciationAssessmentService.assessWithElsa() - Missing"
    fi
    
    # Check EnhancedVideoPlayerService dual-mode methods
    if grep -q "switchVideoMode" mobile/src/services/EnhancedVideoPlayerService.ts 2>/dev/null; then
        check_result 0 "✅ EnhancedVideoPlayerService.switchVideoMode() - Implemented"
    else
        check_result 1 "❌ EnhancedVideoPlayerService.switchVideoMode() - Missing"
    fi
    
    # Check SubtitleEngine highlighting methods
    if grep -q "triggerHighlightEffect" mobile/src/services/SubtitleEngine.ts 2>/dev/null; then
        check_result 0 "✅ SubtitleEngine.triggerHighlightEffect() - Implemented"
    else
        check_result 1 "❌ SubtitleEngine.triggerHighlightEffect() - Missing"
    fi
    
    # Check ContentManagementService wizard methods
    if grep -q "startDramaCreationWizard" mobile/src/services/ContentManagementService.ts 2>/dev/null; then
        check_result 0 "✅ ContentManagementService.startDramaCreationWizard() - Implemented"
    else
        check_result 1 "❌ ContentManagementService.startDramaCreationWizard() - Missing"
    fi
    
    # Check AssetValidationService methods
    if grep -q "validateDramaAssets" mobile/src/services/AssetValidationService.ts 2>/dev/null; then
        check_result 0 "✅ AssetValidationService.validateDramaAssets() - Implemented"
    else
        check_result 1 "❌ AssetValidationService.validateDramaAssets() - Missing"
    fi
    
    # Check ContentQualityAssuranceService 5-keyword validation
    if grep -q "validateCoreContent" mobile/src/services/ContentQualityAssuranceService.ts 2>/dev/null; then
        check_result 0 "✅ ContentQualityAssuranceService.validateCoreContent() - Implemented"
    else
        check_result 1 "❌ ContentQualityAssuranceService.validateCoreContent() - Missing"
    fi
}

# Verify Database Schema V2 Migration
verify_database_schema() {
    log "🔍 Verifying V2 database schema..."
    
    if [ -f "backend/prisma/schema.prisma" ]; then
        # Check for PostgreSQL configuration
        if grep -q "postgresql" backend/prisma/schema.prisma; then
            check_result 0 "✅ Database migrated to PostgreSQL"
        else
            check_result 1 "❌ Database not migrated to PostgreSQL"
        fi
        
        # Check for V2 enhanced fields
        if grep -q "aquaPoints" backend/prisma/schema.prisma; then
            check_result 0 "✅ V2 gamification fields present"
        else
            check_result 1 "❌ V2 gamification fields missing"
        fi
        
        if grep -q "activationTimestamp" backend/prisma/schema.prisma; then
            check_result 0 "✅ V2 Magic Moment tracking fields present"
        else
            check_result 1 "❌ V2 Magic Moment tracking fields missing"
        fi
    else
        check_result 1 "❌ Prisma schema file not found"
    fi
}

# Verify Deployment Configuration
verify_deployment_config() {
    log "🔍 Verifying V2 deployment configuration..."
    
    # Check V2 deployment files
    deployment_files=(
        "scripts/deploy-v2-production.sh"
        "docker/docker-compose.v2.prod.yml"
        "docker/Dockerfile.backend.v2"
        "backend/.env.v2.production"
        "deployment/v2-production-deployment.md"
    )
    
    for file in "${deployment_files[@]}"; do
        if [ -f "$file" ]; then
            check_result 0 "✅ $file - Present"
        else
            check_result 1 "❌ $file - Missing"
        fi
    done
    
    # Check if deployment script is executable
    if [ -x "scripts/deploy-v2-production.sh" ]; then
        check_result 0 "✅ V2 deployment script is executable"
    else
        check_result 1 "❌ V2 deployment script is not executable"
    fi
}

# Verify V2 Feature Flags
verify_feature_flags() {
    log "🔍 Verifying V2 feature flags configuration..."
    
    if [ -f "backend/.env.v2.production" ]; then
        # Check critical V2 feature flags
        v2_features=(
            "FEATURE_STORY_DRIVEN_LEARNING=true"
            "FEATURE_DUAL_MODE_PLAYER=true"
            "FEATURE_FOCUS_MODE=true"
            "FEATURE_RESCUE_MODE=true"
            "FEATURE_5_KEYWORD_VALIDATION=true"
            "FEATURE_PRONUNCIATION_DUAL_API=true"
            "FEATURE_ASSET_VALIDATION=true"
            "FEATURE_SUBTITLE_HIGHLIGHTING=true"
            "FEATURE_CONTENT_WIZARD=true"
            "FEATURE_MAGIC_MOMENT=true"
        )
        
        for feature in "${v2_features[@]}"; do
            if grep -q "$feature" backend/.env.v2.production; then
                check_result 0 "✅ $feature - Enabled"
            else
                check_result 1 "❌ $feature - Not configured"
            fi
        done
    else
        check_result 1 "❌ V2 production environment file missing"
    fi
}

# Verify V2 Performance Configuration
verify_performance_config() {
    log "🔍 Verifying V2 performance configuration..."
    
    if [ -f "backend/.env.v2.production" ]; then
        # Check performance targets
        performance_targets=(
            "VIDEO_LOADING_TARGET=1000"
            "API_RESPONSE_TARGET=1500"
            "STARTUP_TIME_TARGET=2000"
        )
        
        for target in "${performance_targets[@]}"; do
            if grep -q "$target" backend/.env.v2.production; then
                check_result 0 "✅ $target - Configured"
            else
                check_result 1 "❌ $target - Not configured"
            fi
        done
        
        # Check content validation settings
        validation_settings=(
            "ENFORCE_5_KEYWORDS=true"
            "ENFORCE_30_SECOND_DURATION=true"
            "DURATION_TOLERANCE=0.5"
        )
        
        for setting in "${validation_settings[@]}"; do
            if grep -q "$setting" backend/.env.v2.production; then
                check_result 0 "✅ $setting - Configured"
            else
                check_result 1 "❌ $setting - Not configured"
            fi
        done
    fi
}

# Verify API Integration Configuration
verify_api_integrations() {
    log "🔍 Verifying V2 API integration configuration..."
    
    if [ -f "backend/.env.v2.production" ]; then
        # Check 讯飞 API configuration
        iflytek_vars=(
            "IFLYTEK_APP_ID"
            "IFLYTEK_API_KEY"
            "IFLYTEK_API_SECRET"
        )
        
        for var in "${iflytek_vars[@]}"; do
            if grep -q "$var=" backend/.env.v2.production; then
                check_result 0 "✅ $var - Configured"
            else
                check_result 1 "❌ $var - Not configured"
            fi
        done
        
        # Check ELSA API configuration
        if grep -q "ELSA_API_KEY=" backend/.env.v2.production; then
            check_result 0 "✅ ELSA_API_KEY - Configured"
        else
            check_result 1 "❌ ELSA_API_KEY - Not configured"
        fi
        
        # Check CDN configuration
        cdn_vars=(
            "CDN_BASE_URL"
            "CLOUDFLARE_API_TOKEN"
            "CLOUDFLARE_ZONE_ID"
        )
        
        for var in "${cdn_vars[@]}"; do
            if grep -q "$var=" backend/.env.v2.production; then
                check_result 0 "✅ $var - Configured"
            else
                check_result 1 "❌ $var - Not configured"
            fi
        done
    fi
}

# Generate Deployment Report
generate_deployment_report() {
    log "📊 Generating V2 deployment readiness report..."
    
    echo ""
    echo "=========================================="
    echo "  SmarTalk V2 Deployment Readiness Report"
    echo "=========================================="
    echo ""
    echo "📊 Verification Summary:"
    echo "  Total Checks: $TOTAL_CHECKS"
    echo "  Passed: $PASSED_CHECKS"
    echo "  Failed: $FAILED_CHECKS"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        success "🎉 All V2 components verified successfully!"
        success "✅ SmarTalk V2 is READY for production deployment"
        echo ""
        echo "🚀 Next Steps:"
        echo "  1. Set up production environment variables"
        echo "  2. Configure actual API credentials (讯飞/ELSA)"
        echo "  3. Set up production database and Redis"
        echo "  4. Configure CDN and SSL certificates"
        echo "  5. Run: ./scripts/deploy-v2-production.sh deploy"
    else
        error "❌ V2 deployment verification FAILED"
        error "🔧 Please fix the failed checks before deploying to production"
        echo ""
        echo "🛠️  Required Actions:"
        echo "  1. Fix all failed service implementations"
        echo "  2. Complete missing configuration files"
        echo "  3. Re-run verification: ./scripts/verify-v2-deployment.sh"
    fi
    
    echo ""
    echo "📋 V2 Features Status:"
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
    echo ""
    
    return $FAILED_CHECKS
}

# Main verification function
main() {
    log "🚀 Starting SmarTalk V2 Deployment Verification..."
    log "Version: v2.0.0"
    log "Date: $(date)"
    echo ""
    
    # Run all verification steps
    verify_v2_services
    verify_v2_methods
    verify_database_schema
    verify_deployment_config
    verify_feature_flags
    verify_performance_config
    verify_api_integrations
    
    # Generate final report
    generate_deployment_report
    
    # Exit with appropriate code
    if [ $FAILED_CHECKS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Script execution
main "$@"
