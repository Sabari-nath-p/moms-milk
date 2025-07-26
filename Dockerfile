FROM node:18-alpine

# Install build dependencies and curl for healthcheck
RUN apk add --no-cache curl python3 make g++

WORKDIR /app

# First, copy only package files to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--experimental-global-webcrypto"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api || exit 1

# Start the application
CMD ["node", "--experimental-global-webcrypto", "dist/main"]
CMD ["npm", "run", "start:prod"]
