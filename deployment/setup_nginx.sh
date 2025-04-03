#!/bin/bash

# Script to configure Nginx as a reverse proxy for Multi-RoleAI
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
DOMAIN="yourdomain.com" # Replace with your actual domain
APP_PORT=3000
NGINX_CONFIG="/etc/nginx/sites-available/multiroleai"

# Prompt for domain if not provided
if [ "$DOMAIN" == "yourdomain.com" ]; then
    read -p "Enter your domain name (e.g., example.com): " DOMAIN_INPUT
    if [ -n "$DOMAIN_INPUT" ]; then
        DOMAIN=$DOMAIN_INPUT
    else
        error "Domain name is required for Nginx configuration."
        exit 1
    fi
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    error "Nginx is not installed. Please run the install_dependencies.sh script first."
    exit 1
fi

# Create Nginx configuration file
log "Creating Nginx configuration..."
cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;

    # SSL configuration will be added by Certbot

    # Application proxy
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    # For larger file uploads
    client_max_body_size 50M;

    # Security headers
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; connect-src 'self' https://api.anthropic.com; frame-ancestors 'self';";
}
EOF

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

# Restart Nginx to apply changes
log "Restarting Nginx..."
systemctl restart nginx

log "Nginx configured successfully as a reverse proxy for Multi-RoleAI."
log "The application will be accessible at http://$DOMAIN (redirecting to https)."
log "Next step: Run setup_ssl.sh to configure SSL with Let's Encrypt."
