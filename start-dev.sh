#!/bin/bash

# Elevator Pitch - Development Startup Script

echo "🚀 Starting Elevator Pitch Development Environment..."
echo ""

# Check if node_modules exist in both directories
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo "✅ All dependencies installed!"
echo ""
echo "🌐 Starting both frontend and backend..."
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev
