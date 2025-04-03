#!/bin/bash

# Script to install all required dependencies for Multi-RoleAI on a Linux VPS
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

# Update package lists
log "Updating package lists..."
apt-get update

# Install essential tools
log "Installing essential tools..."
apt-get install -y curl wget git build-essential apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js and npm
log "Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    log "Node.js $(node -v) and npm $(npm -v) installed."
else
    log "Node.js $(node -v) and npm $(npm -v) already installed."
fi

# Install Yarn
log "Installing Yarn..."
if ! command -v yarn &> /dev/null; then
    npm install -g yarn
    log "Yarn $(yarn -v) installed."
else
    log "Yarn $(yarn -v) already installed."
fi

# Install PM2 for process management
log "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    log "PM2 installed."
else
    log "PM2 already installed."
fi

# Install Docker
log "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    # Add current user to docker group
    usermod -aG docker $(whoami)
    log "Docker installed and user added to docker group."
else
    log "Docker already installed."
fi

# Install nginx
log "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    log "Nginx installed."
else
    log "Nginx already installed."
fi

# Install Certbot for Let's Encrypt
log "Installing Certbot for Let's Encrypt..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
    log "Certbot installed."
else
    log "Certbot already installed."
fi

# Install PostgreSQL
log "Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib
    log "PostgreSQL installed."
else
    log "PostgreSQL already installed."
fi

log "All dependencies installed successfully!"
