#!/bin/bash

# Main deployment script for Multi-RoleAI
# This script orchestrates the entire VPS deployment process

set -e # Exit on any error

# Directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

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

# Step 1: Verify system requirements
log "Step 1: Verifying system requirements"
if [[ "$(lsb_release -is)" != "Ubuntu" ]]; then
    error "This script is designed for Ubuntu systems. Detected: $(lsb_release -is)"
    exit 1
fi

# Step 2: Install dependencies
log "Step 2: Installing system dependencies"
bash "$SCRIPT_DIR/install_dependencies.sh"
if [ $? -ne 0 ]; then
    error "Failed to install dependencies"
    exit 1
fi

# Step 3: Set up PostgreSQL database
log "Step 3: Setting up PostgreSQL database"
bash "$SCRIPT_DIR/setup_database.sh"
if [ $? -ne 0 ]; then
    error "Failed to set up database"
    exit 1
fi

# Step 4: Deploy application
log "Step 4: Deploying application"
bash "$SCRIPT_DIR/deploy_app.sh"
if [ $? -ne 0 ]; then
    error "Failed to deploy application"
    exit 1
fi

# Step 5: Configure Nginx
log "Step 5: Configuring Nginx"
bash "$SCRIPT_DIR/setup_nginx.sh"
if [ $? -ne 0 ]; then
    error "Failed to configure Nginx"
    exit 1
fi

# Step 6: Set up SSL with Let's Encrypt
log "Step 6: Setting up SSL with Let's Encrypt"
bash "$SCRIPT_DIR/setup_ssl.sh"
if [ $? -ne 0 ]; then
    error "Failed to set up SSL"
    exit 1
fi

# Step 7: Set up database backup system
log "Step 7: Setting up database backup system"
bash "$SCRIPT_DIR/setup_backup.sh"
if [ $? -ne 0 ]; then
    error "Failed to set up backup system"
    exit 1
fi

# Step 8: Set up monitoring
log "Step 8: Setting up monitoring"
bash "$SCRIPT_DIR/setup_monitoring.sh"
if [ $? -ne 0 ]; then
    warning "Failed to set up monitoring, but continuing deployment"
fi

log "Deployment completed successfully!"
log "You can now access your Multi-RoleAI application at https://your-domain.com"
log "Please make sure to update your DNS records to point to this server's IP address."
