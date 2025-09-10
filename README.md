# Elevator Pitch - Full Stack Application

A full-stack application for creating and managing elevator pitch videos.

## Project Structure

```
elevator-pitch/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express + MongoDB
├── package.json       # Root package.json for managing both apps
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   - Copy `backend/.env.example` to `backend/.env`
   - Add your MongoDB connection string and other secrets

### Development

**Run both frontend and backend simultaneously:**
```bash
npm run dev
```

**Run individually:**
```bash
# Frontend only (React + Vite)
npm run dev:frontend

# Backend only (Node.js + Express)
npm run dev:backend
```

### Production

```bash
# Build frontend
npm run build

# Start backend
npm start
```

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Modern JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM