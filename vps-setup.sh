#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create application directory
mkdir -p /var/www/momsMilk
cd /var/www/momsMilk

# Install Git if not already installed
apt-get install -y git

# Clone the repository (you'll need to do this manually after setting up GitHub secrets)
# git clone https://github.com/Sabari-nath-p/moms-milk.git .

# Set up environment (you'll need to create this file with your environment variables)
cat > .env << 'ENV'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=moms_milk

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
ENV

# Install dependencies
npm install

# Build the application
npm run build

# Start the application with PM2
pm2 start dist/main.js --name momsMilk

# Save PM2 process list and configure to start on system startup
pm2 save
pm2 startup
