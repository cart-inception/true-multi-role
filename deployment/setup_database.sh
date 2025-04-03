#!/bin/bash

# Script to set up PostgreSQL database for Multi-RoleAI
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

# Database credentials
DB_NAME="multiroleai"
DB_USER="multiroleai"
DB_PASSWORD="multiroleai_password" # Should be changed in production

# Check if PostgreSQL service is running
log "Checking PostgreSQL status..."
if systemctl is-active --quiet postgresql; then
    log "PostgreSQL is running."
else
    log "Starting PostgreSQL..."
    systemctl start postgresql
    systemctl enable postgresql
fi

# Create database and user if they don't exist
log "Creating database and user..."
# We need to run commands as postgres user
sudo -u postgres psql -c "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Grant privileges
log "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Configure PostgreSQL for remote connections if needed
log "Configuring PostgreSQL for connections..."
# Backup the original postgresql.conf file if it hasn't been backed up yet
POSTGRES_CONF=$(sudo -u postgres psql -t -c "SHOW config_file;" | xargs)
if [ ! -f "${POSTGRES_CONF}.orig" ]; then
    cp "${POSTGRES_CONF}" "${POSTGRES_CONF}.orig"
    log "Created backup of PostgreSQL configuration."
fi

# Allow PostgreSQL to listen on all interfaces
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "${POSTGRES_CONF}"

# Backup the original pg_hba.conf file if it hasn't been backed up yet
PG_HBA_CONF=$(sudo -u postgres psql -t -c "SHOW hba_file;" | xargs)
if [ ! -f "${PG_HBA_CONF}.orig" ]; then
    cp "${PG_HBA_CONF}" "${PG_HBA_CONF}.orig"
    log "Created backup of pg_hba configuration."
fi

# Add a line for remote connections if it doesn't exist
if ! grep -q "host $DB_NAME $DB_USER 0.0.0.0/0 md5" "${PG_HBA_CONF}"; then
    echo "host $DB_NAME $DB_USER 0.0.0.0/0 md5" >> "${PG_HBA_CONF}"
    log "Added remote connection configuration to pg_hba.conf."
fi

# Restart PostgreSQL to apply changes
systemctl restart postgresql

log "PostgreSQL database setup completed successfully."
log "Database credentials:"
log "  Database name: $DB_NAME"
log "  Username: $DB_USER"
log "  Password: $DB_PASSWORD"
log "  Host: localhost"
log "  Port: 5432"
log "These credentials should be used in your .env file."
