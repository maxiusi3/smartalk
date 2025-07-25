#!/bin/bash

# SmarTalk Production Deployment Script
# Handles zero-downtime deployment with health checks and rollback capability

set -e

# Configuration
DEPLOYMENT_ENV=${DEPLOYMENT_ENV:-"production"}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"smartalk"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
HEALTH_CHECK_TIMEOUT=${HEALTH_CHECK_TIMEOUT:-"300"}
ROLLBACK_ON_FAILURE=${ROLLBACK_ON_FAILURE:-"true"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
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

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if required environment variables are set
    required_vars=("DATABASE_URL" "REDIS_URL" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Check Docker availability
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check Kubernetes availability (if using K8s)
    if command -v kubectl &> /dev/null; then
        if ! kubectl cluster-info &> /dev/null; then
            warning "Kubernetes cluster not accessible, falling back to Docker Compose"
            USE_KUBERNETES=false
        else
            USE_KUBERNETES=true
        fi
    else
        USE_KUBERNETES=false
    fi
    
    # Check database connectivity
    log "Checking database connectivity..."
    if ! pg_isready -d "$DATABASE_URL" &> /dev/null; then
        error "Cannot connect to database"
        exit 1
    fi
    
    success "Pre-deployment checks passed"
}

# Build and push Docker images
build_and_push_images() {
    log "Building Docker images..."
    
    # Build backend image
    docker build -f docker/Dockerfile.backend -t "$DOCKER_REGISTRY/backend:$IMAGE_TAG" .
    
    # Push to registry if not local deployment
    if [ "$DEPLOYMENT_ENV" != "local" ]; then
        log "Pushing images to registry..."
        docker push "$DOCKER_REGISTRY/backend:$IMAGE_TAG"
    fi
    
    success "Docker images built and pushed"
}

# Database migration
run_database_migration() {
    log "Running database migrations..."
    
    # Create a temporary container to run migrations
    docker run --rm \
        -e DATABASE_URL="$DATABASE_URL" \
        "$DOCKER_REGISTRY/backend:$IMAGE_TAG" \
        npx prisma migrate deploy
    
    success "Database migrations completed"
}

# Deploy using Kubernetes
deploy_kubernetes() {
    log "Deploying to Kubernetes..."
    
    # Apply namespace
    kubectl apply -f k8s/namespace.yaml
    
    # Update secrets
    kubectl create secret generic smartalk-secrets \
        --from-literal=database-url="$DATABASE_URL" \
        --from-literal=redis-url="$REDIS_URL" \
        --from-literal=jwt-secret="$JWT_SECRET" \
        --namespace=smartalk \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy backend
    kubectl apply -f k8s/backend-deployment.yaml
    
    # Apply ingress
    kubectl apply -f k8s/ingress.yaml
    
    # Wait for rollout to complete
    kubectl rollout status deployment/smartalk-backend -n smartalk --timeout=300s
    
    success "Kubernetes deployment completed"
}

# Deploy using Docker Compose
deploy_docker_compose() {
    log "Deploying using Docker Compose..."
    
    # Create environment file
    cat > .env.prod << EOF
POSTGRES_DB=smartalk_db
POSTGRES_USER=smartalk_user
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=$FRONTEND_URL
GRAFANA_PASSWORD=$GRAFANA_PASSWORD
EOF
    
    # Deploy services
    docker-compose -f docker/docker-compose.prod.yml --env-file .env.prod up -d
    
    success "Docker Compose deployment completed"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    local endpoint="http://localhost:3000/api/v1/health"
    local timeout=$HEALTH_CHECK_TIMEOUT
    local interval=10
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if curl -f "$endpoint" &> /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        log "Waiting for service to be healthy... ($elapsed/$timeout seconds)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    error "Health check failed after $timeout seconds"
    return 1
}

# Smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    # Test critical endpoints
    local base_url="http://localhost:3000/api/v1"
    
    # Test health endpoint
    if ! curl -f "$base_url/health" &> /dev/null; then
        error "Health endpoint test failed"
        return 1
    fi
    
    # Test interests endpoint
    if ! curl -f "$base_url/interests" &> /dev/null; then
        error "Interests endpoint test failed"
        return 1
    fi
    
    # Test database connectivity through API
    local response=$(curl -s "$base_url/interests" | jq -r 'length')
    if [ "$response" -eq 0 ]; then
        warning "No interests found in database"
    fi
    
    success "Smoke tests passed"
}

# Rollback function
rollback_deployment() {
    error "Deployment failed, initiating rollback..."
    
    if [ "$USE_KUBERNETES" = true ]; then
        # Rollback Kubernetes deployment
        kubectl rollout undo deployment/smartalk-backend -n smartalk
        kubectl rollout status deployment/smartalk-backend -n smartalk --timeout=300s
    else
        # Rollback Docker Compose deployment
        docker-compose -f docker/docker-compose.prod.yml down
        # Restore previous version (implementation depends on your backup strategy)
        warning "Manual rollback may be required for Docker Compose deployment"
    fi
    
    error "Rollback completed"
}

# Post-deployment tasks
post_deployment_tasks() {
    log "Running post-deployment tasks..."
    
    # Warm up cache
    log "Warming up application cache..."
    curl -s "http://localhost:3000/api/v1/interests" > /dev/null
    curl -s "http://localhost:3000/api/v1/dramas/by-interest/1" > /dev/null
    
    # Send deployment notification (implement based on your notification system)
    log "Sending deployment notification..."
    # slack_notify "SmarTalk production deployment completed successfully"
    
    # Update monitoring dashboards
    log "Updating monitoring configuration..."
    # This would typically involve updating Grafana dashboards or similar
    
    success "Post-deployment tasks completed"
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    rm -f .env.prod
    docker system prune -f --volumes
}

# Main deployment function
main() {
    log "Starting SmarTalk production deployment..."
    log "Environment: $DEPLOYMENT_ENV"
    log "Image tag: $IMAGE_TAG"
    
    # Trap to handle failures
    trap 'if [ "$ROLLBACK_ON_FAILURE" = true ]; then rollback_deployment; fi; cleanup; exit 1' ERR
    
    # Deployment steps
    pre_deployment_checks
    build_and_push_images
    run_database_migration
    
    if [ "$USE_KUBERNETES" = true ]; then
        deploy_kubernetes
    else
        deploy_docker_compose
    fi
    
    health_check
    run_smoke_tests
    post_deployment_tasks
    cleanup
    
    success "SmarTalk production deployment completed successfully!"
    log "Application is now available at: http://localhost:3000"
    log "Monitoring dashboard: http://localhost:3001"
}

# Script execution
case "$1" in
    "deploy")
        main
        ;;
    "rollback")
        rollback_deployment
        ;;
    "health-check")
        health_check
        ;;
    "smoke-test")
        run_smoke_tests
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check|smoke-test}"
        echo ""
        echo "Commands:"
        echo "  deploy      - Full production deployment"
        echo "  rollback    - Rollback to previous version"
        echo "  health-check - Check application health"
        echo "  smoke-test  - Run smoke tests"
        echo ""
        echo "Environment variables:"
        echo "  DEPLOYMENT_ENV - Deployment environment (default: production)"
        echo "  IMAGE_TAG      - Docker image tag (default: latest)"
        echo "  DATABASE_URL   - PostgreSQL connection string"
        echo "  REDIS_URL      - Redis connection string"
        echo "  JWT_SECRET     - JWT signing secret"
        exit 1
        ;;
esac