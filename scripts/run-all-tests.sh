#!/bin/bash

# SmarTalk MVP - Comprehensive Test Runner
# This script runs all tests and generates a comprehensive test report

set -e

echo "🧪 SmarTalk MVP - Running All Tests"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
BACKEND_TESTS_PASSED=false
MOBILE_TESTS_PASSED=false
E2E_TESTS_PASSED=false
PERFORMANCE_TESTS_PASSED=false
LINT_PASSED=false

# Create test results directory
mkdir -p test-results

echo -e "${BLUE}📋 Test Plan:${NC}"
echo "1. Backend Unit & Integration Tests"
echo "2. Mobile Unit & Component Tests"
echo "3. End-to-End User Journey Tests"
echo "4. Performance Tests"
echo "5. Code Quality & Linting"
echo "6. Test Coverage Analysis"
echo ""

# Function to run tests with error handling
run_test_suite() {
    local test_name=$1
    local test_command=$2
    local log_file=$3
    
    echo -e "${YELLOW}🔄 Running $test_name...${NC}"
    
    if eval "$test_command" > "$log_file" 2>&1; then
        echo -e "${GREEN}✅ $test_name passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name failed${NC}"
        echo "   See $log_file for details"
        return 1
    fi
}

# 1. Backend Tests
echo -e "${BLUE}🔧 Backend Tests${NC}"
echo "=================="

if run_test_suite "Backend Unit Tests" "cd backend && npm test" "test-results/backend-tests.log"; then
    BACKEND_TESTS_PASSED=true
fi

if run_test_suite "Backend Coverage" "cd backend && npm run test:coverage" "test-results/backend-coverage.log"; then
    echo "   Coverage report: backend/coverage/index.html"
fi

# 2. Mobile Tests
echo -e "${BLUE}📱 Mobile Tests${NC}"
echo "==============="

if run_test_suite "Mobile Unit Tests" "cd mobile && npm test" "test-results/mobile-tests.log"; then
    MOBILE_TESTS_PASSED=true
fi

if run_test_suite "Mobile Coverage" "cd mobile && npm run test:coverage" "test-results/mobile-coverage.log"; then
    echo "   Coverage report: mobile/coverage/index.html"
fi

# 3. End-to-End Tests
echo -e "${BLUE}🎯 End-to-End Tests${NC}"
echo "==================="

if run_test_suite "E2E User Journey" "cd mobile && npm test -- --testPathPattern=e2e" "test-results/e2e-tests.log"; then
    E2E_TESTS_PASSED=true
fi

# 4. Performance Tests
echo -e "${BLUE}⚡ Performance Tests${NC}"
echo "===================="

if run_test_suite "Performance Tests" "cd mobile && npm test -- --testPathPattern=performance" "test-results/performance-tests.log"; then
    PERFORMANCE_TESTS_PASSED=true
fi

# 5. Code Quality & Linting
echo -e "${BLUE}🔍 Code Quality${NC}"
echo "==============="

if run_test_suite "Backend Linting" "cd backend && npm run lint" "test-results/backend-lint.log"; then
    if run_test_suite "Mobile Linting" "cd mobile && npm run lint" "test-results/mobile-lint.log"; then
        LINT_PASSED=true
    fi
fi

# 6. TypeScript Compilation
echo -e "${BLUE}📝 TypeScript Compilation${NC}"
echo "========================="

run_test_suite "Backend Build" "cd backend && npm run build" "test-results/backend-build.log"
run_test_suite "Mobile TypeCheck" "cd mobile && npm run typecheck" "test-results/mobile-typecheck.log"

# Generate Test Summary Report
echo -e "${BLUE}📊 Generating Test Summary${NC}"
echo "=========================="

cat > test-results/test-summary.md << EOF
# SmarTalk MVP Test Results

Generated: $(date)

## Test Suite Results

| Test Suite | Status | Details |
|------------|--------|---------|
| Backend Unit Tests | $([ "$BACKEND_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED") | Unit and integration tests for API endpoints |
| Mobile Unit Tests | $([ "$MOBILE_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED") | Component and service tests for React Native app |
| End-to-End Tests | $([ "$E2E_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED") | Complete user journey from onboarding to activation |
| Performance Tests | $([ "$PERFORMANCE_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED") | App startup, video loading, and interaction performance |
| Code Quality | $([ "$LINT_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED") | ESLint and code style validation |

## Coverage Targets

- **Backend**: >80% line coverage
- **Mobile**: >80% line coverage

## Performance Targets

- **App Startup**: <2 seconds
- **Video Loading**: <3 seconds  
- **vTPR Interactions**: <100ms response time

## Critical User Journey Tests

The E2E tests validate the complete "First Deadly Contact" experience:

1. **App Launch** → User opens app for first time
2. **Onboarding** → Pain-point resonance and method explanation
3. **Interest Selection** → User chooses learning theme (travel/movies/workplace)
4. **Drama Preview** → User watches 1-minute mini-drama with subtitles
5. **vTPR Learning** → User completes 15 vocabulary exercises
6. **Magic Moment** → User watches same drama without subtitles (ACTIVATION)
7. **Journey Continuation** → Learning map and speaking tips

## Analytics Validation

Tests verify that all critical events are tracked:
- Conversion funnel from launch to activation
- User behavior and engagement metrics
- Performance and error tracking
- A/B testing and optimization data

## Next Steps

$(if [ "$BACKEND_TESTS_PASSED" = true ] && [ "$MOBILE_TESTS_PASSED" = true ] && [ "$E2E_TESTS_PASSED" = true ]; then
    echo "🎉 **All critical tests passed!** Ready for deployment pipeline."
else
    echo "⚠️ **Some tests failed.** Review failed test logs before proceeding."
fi)

EOF

# Display final results
echo ""
echo -e "${BLUE}📋 Final Test Results${NC}"
echo "====================="

if [ "$BACKEND_TESTS_PASSED" = true ] && [ "$MOBILE_TESTS_PASSED" = true ] && [ "$E2E_TESTS_PASSED" = true ] && [ "$PERFORMANCE_TESTS_PASSED" = true ] && [ "$LINT_PASSED" = true ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "✅ Backend tests: PASSED"
    echo "✅ Mobile tests: PASSED"
    echo "✅ E2E tests: PASSED"
    echo "✅ Performance tests: PASSED"
    echo "✅ Code quality: PASSED"
    echo ""
    echo -e "${GREEN}🚀 Ready for production deployment!${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "$([ "$BACKEND_TESTS_PASSED" = true ] && echo "✅" || echo "❌") Backend tests"
    echo "$([ "$MOBILE_TESTS_PASSED" = true ] && echo "✅" || echo "❌") Mobile tests"
    echo "$([ "$E2E_TESTS_PASSED" = true ] && echo "✅" || echo "❌") E2E tests"
    echo "$([ "$PERFORMANCE_TESTS_PASSED" = true ] && echo "✅" || echo "❌") Performance tests"
    echo "$([ "$LINT_PASSED" = true ] && echo "✅" || echo "❌") Code quality"
    echo ""
    echo -e "${YELLOW}📝 Check test-results/ directory for detailed logs${NC}"
    echo -e "${YELLOW}📊 Full report: test-results/test-summary.md${NC}"
    exit 1
fi