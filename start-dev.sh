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
echo "   Backend: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers in background
echo "Starting backend server..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "Starting frontend server..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
