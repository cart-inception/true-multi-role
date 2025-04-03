#!/bin/bash

# Script to set up initial Nginx configuration without SSL
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
APP_PORT=3000
NGINX_CONFIG="/etc/nginx/sites-available/multiroleai"
TEMPLATE_CONFIG="/root/true-multi-role/deployment/nginx-initial.conf"

# Prompt for domain
read -p "Enter your domain name (e.g., example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    error "Domain name is required for Nginx configuration."
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    error "Nginx is not installed. Please run the install_dependencies.sh script first."
    exit 1
fi

# Create Nginx configuration file from template
log "Creating initial Nginx configuration..."
cp "$TEMPLATE_CONFIG" "$NGINX_CONFIG"
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "$NGINX_CONFIG"

# Create symbolic link to enable the site
if [ ! -f "/etc/nginx/sites-enabled/multiroleai" ]; then
    log "Enabling site configuration..."
    ln -s "$NGINX_CONFIG" /etc/nginx/sites-enabled/
fi

# Test Nginx configuration
log "Testing Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    error "Nginx configuration test failed. Please check the error message above."
    exit 1
fi

# Reload Nginx to apply changes
log "Reloading Nginx..."
systemctl reload nginx
if [ $? -ne 0 ]; then
    error "Failed to reload Nginx. Please check the error message above."
    exit 1
fi

log "Initial Nginx configuration completed successfully!"
log "Your Multi-RoleAI application is now accessible at http://$DOMAIN"
log "Next, run setup_ssl.sh to set up SSL certificates."
