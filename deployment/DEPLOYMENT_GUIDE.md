# Multi-RoleAI VPS Deployment Guide

This guide will walk you through deploying the Multi-RoleAI application on a Linux VPS. The deployment scripts are designed to automate the process as much as possible.

## Prerequisites

1. A Linux VPS running Ubuntu 20.04 or higher
2. A domain name pointing to your VPS IP address
3. Root or sudo access to the VPS
4. Basic knowledge of Linux command line

## Deployment Overview

The deployment process includes the following steps:

1. Installing required dependencies
2. Setting up the PostgreSQL database
3. Deploying the Multi-RoleAI application
4. Configuring Nginx as a reverse proxy
5. Setting up SSL with Let's Encrypt
6. Implementing a database backup system
7. Setting up monitoring

## Quick Start

If you want to run the entire deployment process automatically, you can use the main deployment script:

```bash
cd /root/true-multi-role/deployment
./deploy.sh
```

This script will run all the steps in sequence and set up your Multi-RoleAI application on the VPS.

## Step-by-Step Deployment

If you prefer to run each step individually, follow these instructions:

### 1. Install Dependencies

```bash
cd /root/true-multi-role/deployment
./install_dependencies.sh
```

This script installs:
- Node.js and npm
- Yarn
- PM2 (for process management)
- Docker
- Nginx
- Certbot (for Let's Encrypt)
- PostgreSQL

### 2. Set Up PostgreSQL Database

```bash
./setup_database.sh
```

This script:
- Creates a PostgreSQL database and user
- Configures PostgreSQL for secure connections
- Sets up the necessary permissions

### 3. Deploy the Application

```bash
./deploy_app.sh
```

This script:
- Clones the application repository (or copies local files)
- Installs dependencies
- Creates a .env file (which you'll need to update with your specific values)
- Runs database migrations
- Builds the Next.js application
- Sets up PM2 to run the application as a service

### 4. Configure Nginx

```bash
./setup_nginx.sh
```

You'll be prompted to enter your domain name. This script:
- Creates an Nginx configuration for your domain
- Sets up a reverse proxy to forward requests to the Next.js application
- Configures security headers
- Enables the site in Nginx

### 5. Set Up SSL with Let's Encrypt

```bash
./setup_ssl.sh
```

You'll be prompted to enter your domain name and email address. This script:
- Obtains SSL certificates from Let's Encrypt
- Configures Nginx to use HTTPS
- Sets up automatic certificate renewal

### 6. Implement Database Backup System

```bash
./setup_backup.sh
```

This script:
- Creates a database backup script
- Sets up a daily cron job to run backups
- Creates a restore script for recovering from backups
- Performs an initial backup

### 7. Set Up Monitoring

```bash
./setup_monitoring.sh
```

This script:
- Configures PM2 monitoring
- Sets up log rotation
- Creates a monitoring script to check system health
- Sets up a cron job to run the monitoring script
- Creates a monitoring README with information on how to use the monitoring tools

## Post-Deployment Tasks

After successful deployment, you should:

1. Update the .env file with your actual values:
   ```bash
   nano /opt/multiroleai/.env
   ```
   
   Update the following values:
   - `NEXTAUTH_URL`: Set to your actual domain (e.g., https://yourdomain.com)
   - `ANTHROPIC_API_KEY`: Set to your actual Anthropic API key

2. Restart the application to apply the changes:
   ```bash
   pm2 restart multiroleai
   ```

3. Test the application by visiting your domain in a web browser.

## Troubleshooting

If you encounter issues during deployment:

1. Check the logs for each step:
   ```bash
   # Application logs
   pm2 logs multiroleai
   
   # Nginx logs
   sudo tail -f /var/log/nginx/error.log
   
   # Database logs
   sudo journalctl -u postgresql
   ```

2. Verify that all services are running:
   ```bash
   # Check application
   pm2 status
   
   # Check Nginx
   sudo systemctl status nginx
   
   # Check PostgreSQL
   sudo systemctl status postgresql
   ```

3. Verify that your domain is pointing to your VPS:
   ```bash
   dig +short yourdomain.com
   ```
   The output should match your VPS IP address.

## Maintenance

Regular maintenance tasks include:

1. Keeping the system updated:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Monitoring disk space:
   ```bash
   df -h
   ```

3. Checking backup status:
   ```bash
   ls -la /opt/multiroleai-backups
   ```

4. Verifying SSL certificate validity:
   ```bash
   certbot certificates
   ```

## Security Considerations

The deployment includes several security measures:

1. HTTPS with Let's Encrypt certificates
2. Security headers in Nginx configuration
3. Database backup system
4. Regular monitoring

For additional security, consider:

1. Setting up a firewall (UFW) to restrict access
2. Implementing fail2ban to prevent brute force attacks
3. Regularly updating the system and application
4. Setting up more comprehensive monitoring

## Support

If you encounter any issues with the deployment scripts, please check the logs and troubleshooting steps above. If you need additional assistance, refer to the project documentation or contact the development team.
