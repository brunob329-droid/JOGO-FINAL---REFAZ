#!/bin/bash
# Start script for Refaz - Local Development

set -e

echo "🎓 Refaz - Dilemas Contábeis"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js $(node -v)"
echo ""

# Navigate to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 Project directory: $SCRIPT_DIR"
echo ""

# Option menu
echo "Choose startup mode:"
echo "1) Backend only (node server/server.js)"
echo "2) Frontend only (npm start in client/)"
echo "3) Both (in separate terminals - requires tmux or manual)"
echo "4) Production build (npm run build in client/)"
echo "5) Docker Compose (requires Docker)"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "Starting backend..."
        node server/server.js
        ;;
    2)
        echo "Starting frontend dev server..."
        cd client
        npm install
        npm start
        ;;
    3)
        echo "Starting both services..."
        echo "Backend will run in background. Frontend in foreground."
        node server/server.js &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
        cd client
        npm install
        npm start
        ;;
    4)
        echo "Building frontend for production..."
        cd client
        npm install
        npm run build
        echo "✓ Production build complete in client/build/"
        echo "Run 'npx serve -s build -l 3000' to serve"
        ;;
    5)
        echo "Starting with Docker Compose..."
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker not found. Install from https://docker.com"
            exit 1
        fi
        docker-compose up --build
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
