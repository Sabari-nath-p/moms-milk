#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install Docker
apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /var/www/momsMilk
cd /var/www/momsMilk

# Create admin user SQL
cat > create_admin.sql << EOL
INSERT INTO users (id, "fullName", email, password, role, "createdAt", "updatedAt")
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Admin User',
  'admin@momsmilk.com',
  '\$2b\$10\$YourHashedPasswordHere',  -- Replace with actual hashed password
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
EOL

# Add firewall rules
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5432/tcp
ufw allow 5050/tcp
ufw --force enable
