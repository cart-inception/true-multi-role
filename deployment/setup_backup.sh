#!/bin/bash

# Script to set up database backup system for Multi-RoleAI
set -e # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

# Configuration
DB_NAME="multiroleai"
DB_USER="multiroleai"
BACKUP_DIR="/opt/multiroleai-backups"
BACKUP_RETENTION_DAYS=30

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
    chmod 700 "$BACKUP_DIR"
fi

# Create backup script
log "Creating backup script..."
BACKUP_SCRIPT="$BACKUP_DIR/backup_database.sh"
cat > "$BACKUP_SCRIPT" << EOF
#!/bin/bash

# Script to backup the Multi-RoleAI database
# Generated by setup_backup.sh

# Configuration
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
BACKUP_DIR="$BACKUP_DIR"
BACKUP_RETENTION_DAYS=$BACKUP_RETENTION_DAYS

# Get current date for filename
DATE=\$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="\$BACKUP_DIR/\$DB_NAME-\$DATE.sql.gz"

# Perform backup
echo "Starting backup of \$DB_NAME database..."
sudo -u postgres pg_dump \$DB_NAME | gzip > "\$BACKUP_FILE"

# Check if backup was successful
if [ \$? -eq 0 ]; then
    echo "Backup completed successfully: \$BACKUP_FILE"
    # Set proper permissions
    chmod 600 "\$BACKUP_FILE"
    
    # Delete old backups
    echo "Cleaning up old backups..."
    find "\$BACKUP_DIR" -name "\$DB_NAME-*.sql.gz" -type f -mtime +\$BACKUP_RETENTION_DAYS -delete
    echo "Backup process completed."
else
    echo "Backup failed!"
    exit 1
fi
EOF

# Make the backup script executable
chmod +x "$BACKUP_SCRIPT"

# Set up cron job for daily backups
log "Setting up cron job for daily backups..."
CRON_JOB="0 2 * * * $BACKUP_SCRIPT >> $BACKUP_DIR/backup.log 2>&1"

# Check if cron job already exists
if ! (crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"); then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    log "Cron job added for daily backups at 2:00 AM."
else
    log "Cron job for backup already exists."
fi

# Create a script for backup restoration
log "Creating restoration script..."
RESTORE_SCRIPT="$BACKUP_DIR/restore_database.sh"
cat > "$RESTORE_SCRIPT" << EOF
#!/bin/bash

# Script to restore a Multi-RoleAI database backup
# Generated by setup_backup.sh

# Configuration
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
BACKUP_DIR="$BACKUP_DIR"

# Display available backups
echo "Available backups:"
ls -lt \$BACKUP_DIR/*.sql.gz | awk '{print \$9}' | nl

# Prompt for backup selection
read -p "Enter the number of the backup to restore: " BACKUP_NUM
BACKUP_FILE=\$(ls -lt \$BACKUP_DIR/*.sql.gz | awk '{print \$9}' | sed -n "\${BACKUP_NUM}p")

if [ -z "\$BACKUP_FILE" ]; then
    echo "Invalid selection. Exiting."
    exit 1
fi

echo "You selected: \$BACKUP_FILE"
read -p "Are you sure you want to restore this backup? This will OVERWRITE the current database. (y/n): " CONFIRM

if [ "\$CONFIRM" != "y" ]; then
    echo "Restoration aborted."
    exit 0
fi

echo "Restoring database from backup..."
# Create a temporary file for the uncompressed backup
TEMP_FILE=\$(mktemp)
gunzip -c "\$BACKUP_FILE" > "\$TEMP_FILE"

# Temporarily disable all connections to the database
sudo -u postgres psql -c "UPDATE pg_database SET datallowconn = false WHERE datname = '\$DB_NAME';"
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '\$DB_NAME';"

# Drop and recreate the database
sudo -u postgres psql -c "DROP DATABASE \$DB_NAME;"
sudo -u postgres psql -c "CREATE DATABASE \$DB_NAME OWNER \$DB_USER;"

# Restore the backup
sudo -u postgres psql \$DB_NAME < "\$TEMP_FILE"

# Re-enable connections
sudo -u postgres psql -c "UPDATE pg_database SET datallowconn = true WHERE datname = '\$DB_NAME';"

# Clean up
rm "\$TEMP_FILE"

echo "Database restoration completed successfully."
EOF

# Make the restore script executable
chmod +x "$RESTORE_SCRIPT"

# Perform an initial backup
log "Performing initial backup..."
$BACKUP_SCRIPT

log "Database backup system has been set up successfully!"
log "Daily backups will be performed at 2:00 AM and stored in $BACKUP_DIR"
log "Backups will be retained for $BACKUP_RETENTION_DAYS days."
log "To restore a backup, run: $RESTORE_SCRIPT"
