#!/bin/bash

echo "🚀 Railway Build Script Starting..."

echo "📦 Installing backend dependencies..."
cd backend
npm install --production

echo "✅ Backend dependencies installed successfully!"

echo "🎯 Build completed!"
