#!/bin/bash

# SmarTalk Database Backup and Recovery Script
# Supports automated backups, point-in-time recovery, and disaster recovery

set -e

# Configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"smartalk_db"}
DB_USER=${DB_USER:-"smartalk_user"}
BACKUP_DIR=${BACKUP_DIR:-"/backup/postgresql"}
RETENTION_DAYS=${RETENTION_DAYS:-"30"}
S3_BUCKET=${S3_BUCKET:-"smartalk-backups"}

# Logging
LOG_FILE="/var/log/smartalk-backup.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function: Full Database Backup
backup_full() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/smartalk_full_$timestamp.sql"
    
    log "Starting full database backup..."
    
    # Create compressed backup
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --if-exists --create \
        | gzip > "$backup_file.gz"
    
    if [ $? -eq 0 ]; then
        log "Full backup completed: $backup_file.gz"
        
        # Upload to S3 if configured
        if [ ! -z "$S3_BUCKET" ]; then
            aws s3 cp "$backup_file.gz" "s3://$S3_BUCKET/full/" --storage-class STANDARD_IA
            log "Backup uploaded to S3: s3://$S3_BUCKET/full/"
        fi
        
        return 0
    else
        log "ERROR: Full backup failed"
        return 1
    fi
}

# Function: Incremental Backup (WAL archiving)
backup_incremental() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local wal_dir="$BACKUP_DIR/wal"
    
    log "Starting incremental backup (WAL archiving)..."
    
    mkdir -p "$wal_dir"
    
    # Archive WAL files
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -c "SELECT pg_switch_wal();" > /dev/null
    
    # Copy WAL files to backup directory
    find /var/lib/postgresql/*/main/pg_wal -name "*.ready" -type f | while read wal_file; do
        base_name=$(basename "$wal_file" .ready)
        cp "/var/lib/postgresql/*/main/pg_wal/$base_name" "$wal_dir/"
        
        # Upload to S3
        if [ ! -z "$S3_BUCKET" ]; then
            aws s3 cp "$wal_dir/$base_name" "s3://$S3_BUCKET/wal/"
        fi
    done
    
    log "Incremental backup completed"
}

# Function: Point-in-Time Recovery Backup
backup_pitr() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local pitr_dir="$BACKUP_DIR/pitr_$timestamp"
    
    log "Starting point-in-time recovery backup..."
    
    mkdir -p "$pitr_dir"
    
    # Start backup
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -c "SELECT pg_start_backup('PITR Backup $timestamp', false, false);" > /dev/null
    
    # Copy data directory
    rsync -av --exclude='pg_wal/*' --exclude='postmaster.pid' \
        /var/lib/postgresql/*/main/ "$pitr_dir/"
    
    # Stop backup
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -c "SELECT pg_stop_backup(false, true);" > /dev/null
    
    # Compress backup
    tar -czf "$pitr_dir.tar.gz" -C "$BACKUP_DIR" "$(basename "$pitr_dir")"
    rm -rf "$pitr_dir"
    
    # Upload to S3
    if [ ! -z "$S3_BUCKET" ]; then
        aws s3 cp "$pitr_dir.tar.gz" "s3://$S3_BUCKET/pitr/" --storage-class STANDARD_IA
    fi
    
    log "PITR backup completed: $pitr_dir.tar.gz"
}

# Function: Restore from backup
restore_backup() {
    local backup_file="$1"
    local target_db="${2:-$DB_NAME}"
    
    if [ -z "$backup_file" ]; then
        log "ERROR: Backup file not specified"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR: Backup file not found: $backup_file"
        return 1
    fi
    
    log "Starting database restore from: $backup_file"
    
    # Create target database if it doesn't exist
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$target_db" 2>/dev/null || true
    
    # Restore from backup
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$target_db"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$target_db" < "$backup_file"
    fi
    
    if [ $? -eq 0 ]; then
        log "Database restore completed successfully"
        return 0
    else
        log "ERROR: Database restore failed"
        return 1
    fi
}

# Function: Clean old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -name "smartalk_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "pitr_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    # Clean S3 backups if configured
    if [ ! -z "$S3_BUCKET" ]; then
        aws s3api list-objects-v2 --bucket "$S3_BUCKET" --prefix "full/" \
            --query "Contents[?LastModified<='$(date -d "$RETENTION_DAYS days ago" --iso-8601)'].Key" \
            --output text | xargs -I {} aws s3 rm "s3://$S3_BUCKET/{}"
    fi
    
    log "Cleanup completed"
}

# Function: Verify backup integrity
verify_backup() {
    local backup_file="$1"
    local temp_db="smartalk_verify_$(date +%s)"
    
    log "Verifying backup integrity: $backup_file"
    
    # Create temporary database and restore
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$temp_db"
    
    if restore_backup "$backup_file" "$temp_db"; then
        # Run basic integrity checks
        local table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$temp_db" \
            -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
        
        local user_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$temp_db" \
            -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
        
        log "Backup verification successful - Tables: $table_count, Users: $user_count"
        
        # Cleanup temporary database
        dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$temp_db"
        return 0
    else
        log "ERROR: Backup verification failed"
        dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$temp_db" 2>/dev/null || true
        return 1
    fi
}

# Function: Database health check
health_check() {
    log "Performing database health check..."
    
    # Check connection
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null; then
        log "ERROR: Database connection failed"
        return 1
    fi
    
    # Check disk space
    local disk_usage=$(df "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log "WARNING: Backup disk usage is $disk_usage%"
    fi
    
    # Check database size
    local db_size=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));")
    
    log "Database health check completed - Size: $db_size, Disk usage: $disk_usage%"
}

# Main execution
case "$1" in
    "full")
        health_check
        backup_full
        cleanup_old_backups
        ;;
    "incremental")
        backup_incremental
        ;;
    "pitr")
        backup_pitr
        ;;
    "restore")
        restore_backup "$2" "$3"
        ;;
    "verify")
        verify_backup "$2"
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {full|incremental|pitr|restore|verify|cleanup|health}"
        echo ""
        echo "Commands:"
        echo "  full        - Create full database backup"
        echo "  incremental - Create incremental backup (WAL)"
        echo "  pitr        - Create point-in-time recovery backup"
        echo "  restore     - Restore from backup file"
        echo "  verify      - Verify backup integrity"
        echo "  cleanup     - Remove old backups"
        echo "  health      - Check database health"
        echo ""
        echo "Examples:"
        echo "  $0 full"
        echo "  $0 restore /backup/smartalk_full_20240119_120000.sql.gz"
        echo "  $0 verify /backup/smartalk_full_20240119_120000.sql.gz"
        exit 1
        ;;
esac