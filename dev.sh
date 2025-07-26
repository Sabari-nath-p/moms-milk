#!/bin/bash

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if ports are available
check_ports() {
    if lsof -i :3000 >/dev/null 2>&1; then
        echo "Port 3000 is already in use. Please free up the port and try again."
        exit 1
    fi
    if lsof -i :5433 >/dev/null 2>&1; then
        echo "Port 5433 is already in use. Please free up the port and try again."
        exit 1
    fi
}

# Function to cleanup on error
cleanup() {
    echo "Error occurred. Cleaning up..."
    docker-compose down
    exit 1
}

# Set error handling
set -e
trap cleanup ERR

# Check Docker
check_docker

# Check if required ports are available
check_ports

# Stop any running containers
echo "Stopping any existing containers..."
docker-compose down

# Clean up any old build cache (optional)
echo "Cleaning up old build cache..."
docker builder prune -f

# Build and start the containers
echo "Building and starting containers..."
docker-compose up --build -d

# Wait for services to be healthy
echo "Waiting for services to be ready..."
attempt=1
max_attempts=30
until docker-compose ps | grep "healthy" | wc -l | grep -q "2" || [ $attempt -eq $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Waiting for services to be healthy..."
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "Services failed to become healthy within the timeout period"
    docker-compose logs
    cleanup
fi

echo "All services are up and healthy!"
echo "API is available at http://localhost:3000"
echo "API Documentation is available at http://localhost:3000/api"

# Show logs
echo "Showing logs..."
docker-compose logs -f
