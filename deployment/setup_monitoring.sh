#!/bin/bash

# Script to set up monitoring for Multi-RoleAI
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

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Configuration
APP_DIR="/opt/multiroleai"
LOG_DIR="/var/log/multiroleai"

# Create log directory if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
    log "Creating log directory..."
    mkdir -p "$LOG_DIR"
    chmod 755 "$LOG_DIR"
fi

# Set up PM2 monitoring
log "Setting up PM2 monitoring..."
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Please run the install_dependencies.sh script first."
    exit 1
fi

# Configure PM2 logging
log "Configuring PM2 logging..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true

# Set up PM2 monitoring dashboard
log "Setting up PM2 monitoring dashboard..."
pm2 install pm2-server-monit

# Set up log rotation for application logs
log "Setting up log rotation for application logs..."
cat > /etc/logrotate.d/multiroleai << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF

# Create a monitoring script
log "Creating monitoring script..."
MONITOR_SCRIPT="$APP_DIR/scripts/monitor.sh"
mkdir -p "$APP_DIR/scripts"
cat > "$MONITOR_SCRIPT" << EOF
#!/bin/bash

# Monitoring script for Multi-RoleAI
# This script checks the health of various components and sends alerts if needed

# Configuration
APP_DIR="$APP_DIR"
LOG_DIR="$LOG_DIR"
ALERT_EMAIL="admin@yourdomain.com"  # Replace with your email

# Function to send alert
send_alert() {
    local subject="\$1"
    local message="\$2"
    echo "\$message" | mail -s "Multi-RoleAI Alert: \$subject" "\$ALERT_EMAIL"
    echo "\$(date): ALERT - \$subject: \$message" >> "\$LOG_DIR/alerts.log"
}

# Check if the application is running
if ! pm2 show multiroleai > /dev/null 2>&1; then
    send_alert "Application Down" "The Multi-RoleAI application is not running!"
    pm2 restart multiroleai || echo "Failed to restart application"
fi

# Check disk space
disk_usage=\$(df -h / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ "\$disk_usage" -gt 90 ]; then
    send_alert "Disk Space Critical" "Disk usage is at \${disk_usage}% on the server."
fi

# Check memory usage
mem_usage=\$(free | grep Mem | awk '{print \$3/\$2 * 100.0}' | cut -d. -f1)
if [ "\$mem_usage" -gt 90 ]; then
    send_alert "Memory Usage Critical" "Memory usage is at \${mem_usage}% on the server."
fi

# Check PostgreSQL
if ! sudo -u postgres psql -c "SELECT 1;" > /dev/null 2>&1; then
    send_alert "Database Down" "PostgreSQL database is not running!"
    systemctl restart postgresql || echo "Failed to restart PostgreSQL"
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    send_alert "Nginx Down" "Nginx is not running!"
    systemctl restart nginx || echo "Failed to restart Nginx"
fi

# Check for failed backups
latest_backup=\$(find $BACKUP_DIR -name "multiroleai-*.sql.gz" -type f -mtime -1 | wc -l)
if [ "\$latest_backup" -eq 0 ]; then
    send_alert "Backup Failure" "No database backup was created in the last 24 hours."
fi

# Log successful check
echo "\$(date): Monitoring check completed successfully." >> "\$LOG_DIR/monitoring.log"
EOF

# Make the monitoring script executable
chmod +x "$MONITOR_SCRIPT"

# Set up cron job for monitoring
log "Setting up cron job for monitoring..."
CRON_JOB="*/15 * * * * $MONITOR_SCRIPT >> $LOG_DIR/monitoring.log 2>&1"

# Check if cron job already exists
if ! (crontab -l 2>/dev/null | grep -q "$MONITOR_SCRIPT"); then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    log "Cron job added for monitoring every 15 minutes."
else
    log "Cron job for monitoring already exists."
fi

# Create a README file with monitoring information
log "Creating monitoring README..."
cat > "$APP_DIR/MONITORING.md" << EOF
# Multi-RoleAI Monitoring

## Available Monitoring Tools

1. **PM2 Monitoring**
   - To view application status: \`pm2 status\`
   - To view detailed metrics: \`pm2 monit\`
   - To view logs: \`pm2 logs multiroleai\`

2. **System Monitoring**
   - Automated checks run every 15 minutes via cron
   - Alerts are sent to the configured email address
   - Check the monitoring logs: \`cat $LOG_DIR/monitoring.log\`

3. **Database Monitoring**
   - Check database status: \`sudo systemctl status postgresql\`
   - Database backups are stored in: \`$BACKUP_DIR\`
   - Restore a backup using: \`$BACKUP_DIR/restore_database.sh\`

4. **Nginx Monitoring**
   - Check Nginx status: \`sudo systemctl status nginx\`
   - View access logs: \`cat /var/log/nginx/access.log\`
   - View error logs: \`cat /var/log/nginx/error.log\`

## Manual Checks

1. **Application Health Check**
   - Visit: https://yourdomain.com/api/health

2. **Database Connection Check**
   - Run: \`cd $APP_DIR && npx prisma db execute --sql "SELECT 1;"\`

3. **SSL Certificate Check**
   - Run: \`certbot certificates\`
   - Check expiry date of your certificates

## Troubleshooting

1. **Application Issues**
   - Restart the application: \`pm2 restart multiroleai\`
   - Check for errors: \`pm2 logs multiroleai --err --lines 100\`

2. **Database Issues**
   - Restart PostgreSQL: \`sudo systemctl restart postgresql\`
   - Check PostgreSQL logs: \`sudo journalctl -u postgresql\`

3. **Nginx Issues**
   - Test configuration: \`sudo nginx -t\`
   - Restart Nginx: \`sudo systemctl restart nginx\`
   - Check logs: \`sudo journalctl -u nginx\`
EOF

log "Monitoring setup completed successfully!"
log "PM2 monitoring is enabled for the application."
log "System monitoring checks will run every 15 minutes."
log "Check $APP_DIR/MONITORING.md for more information on monitoring."
