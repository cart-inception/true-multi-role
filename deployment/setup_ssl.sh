#!/bin/bash

# Script to set up SSL with Let's Encrypt for Multi-RoleAI
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
DOMAIN="yourdomain.com" # Replace with your actual domain
EMAIL="admin@yourdomain.com" # Replace with your actual email

# Prompt for domain if not provided
if [ "$DOMAIN" == "yourdomain.com" ]; then
    read -p "Enter your domain name (e.g., example.com): " DOMAIN_INPUT
    if [ -n "$DOMAIN_INPUT" ]; then
        DOMAIN=$DOMAIN_INPUT
    else
        error "Domain name is required for SSL setup."
        exit 1
    fi
fi

# Prompt for email if not provided
if [ "$EMAIL" == "admin@yourdomain.com" ]; then
    read -p "Enter your email address for Let's Encrypt notifications: " EMAIL_INPUT
    if [ -n "$EMAIL_INPUT" ]; then
        EMAIL=$EMAIL_INPUT
    else
        warning "Using default email: $EMAIL"
    fi
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    error "Certbot is not installed. Please run the install_dependencies.sh script first."
    exit 1
fi

# Check if Nginx is installed and running
if ! systemctl is-active --quiet nginx; then
    error "Nginx is not running. Please make sure Nginx is properly configured and running."
    exit 1
fi

# Check if domain is properly configured in DNS
log "Checking if domain is properly configured in DNS..."
if ! host $DOMAIN > /dev/null 2>&1; then
    warning "Could not resolve $DOMAIN. Make sure your DNS records are properly configured to point to this server's IP address."
    read -p "Do you want to continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        log "SSL setup aborted. Please configure your DNS records and try again."
        exit 0
    fi
fi

# Obtain SSL certificate
log "Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# Check if certificate was obtained successfully
if [ $? -ne 0 ]; then
    error "Failed to obtain SSL certificate. Please check the error message above."
    exit 1
fi

# Configure auto-renewal
log "Setting up automatic certificate renewal..."
if ! grep -q "certbot renew" /etc/crontab; then
    echo "0 3 * * * root certbot renew --quiet" >> /etc/crontab
    log "Added certificate renewal to crontab."
else
    log "Certificate renewal already configured in crontab."
fi

log "SSL setup completed successfully!"
log "Your Multi-RoleAI application is now accessible securely at https://$DOMAIN"
log "SSL certificates will be automatically renewed before they expire."
