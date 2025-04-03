#!/bin/bash

# Script to deploy the Multi-RoleAI application
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
APP_DIR="/opt/multiroleai"
LOCAL_CODE_DIR="/root/true-multi-role/multi-roleai"
REPO_URL="https://github.com/yourusername/multi-roleai.git" # Replace with your actual repository URL
BRANCH="main" # Replace with your deployment branch

# Create application directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    log "Creating application directory..."
    mkdir -p "$APP_DIR"
fi

# Check if local code exists
if [ -d "$LOCAL_CODE_DIR" ]; then
    log "Local deployment detected. Copying files from $LOCAL_CODE_DIR..."
    cp -r "$LOCAL_CODE_DIR"/* "$APP_DIR"/
    cp -r "$LOCAL_CODE_DIR"/.[^.]* "$APP_DIR"/ 2>/dev/null || true
else
    # Check if the code is already cloned
    if [ -d "$APP_DIR/.git" ]; then
        log "Repository already exists, pulling latest changes..."
        cd "$APP_DIR"
        git fetch
        git reset --hard origin/$BRANCH
    else
        log "Cloning repository..."
        git clone -b $BRANCH $REPO_URL $APP_DIR
        cd "$APP_DIR"
    fi
fi

# Install dependencies
log "Installing dependencies..."
cd "$APP_DIR"
yarn install

# Install additional CSS dependencies that might be missing
log "Installing additional CSS dependencies..."
cd "$APP_DIR"
yarn add -D autoprefixer postcss tailwindcss

# Create .env file if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
    log "Creating .env file..."
    cat > "$APP_DIR/.env" << EOF
DATABASE_URL=postgresql://multiroleai:multiroleai_password@localhost:5432/multiroleai
NEXTAUTH_URL=https://yourdomain.com  # Replace with your actual domain
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ANTHROPIC_API_KEY=your_anthropic_api_key  # Replace with your actual API key
STORAGE_PATH=/opt/multiroleai/storage
EOF
    log "Created .env file. Remember to update it with your actual values."
else
    log ".env file already exists. Skipping creation."
fi

# Create storage directory if it doesn't exist
if [ ! -d "$APP_DIR/storage" ]; then
    log "Creating storage directory..."
    mkdir -p "$APP_DIR/storage"
    chmod 755 "$APP_DIR/storage"
fi

# Run database migrations
log "Running database migrations..."
cd "$APP_DIR"
npx prisma migrate deploy

# Build the Next.js application
log "Building the application..."
yarn build

# Set up PM2 process
log "Setting up PM2 process..."
pm2 describe multiroleai > /dev/null 2>&1
if [ $? -eq 0 ]; then
    log "Updating existing PM2 process..."
    pm2 reload multiroleai
else
    log "Creating new PM2 process..."
    pm2 start yarn --name "multiroleai" -- start
    pm2 save
    pm2 startup | tail -n 1 | bash
fi

log "Application deployment completed successfully!"
log "The application is now running with PM2 and will start automatically on system boot."
