import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import videoRoutes from "./routes/videoRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";


dotenv.config();

const app = express();

// Connect to MongoDB with error handling
const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    // Continue without MongoDB for healthcheck to work
  }
};

// Initialize database connection
initializeDatabase();

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

// middleware to parse JSON with increased limit for large files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// test route for healthcheck
app.get("/api/test", (req, res) => {
  res.json({
    status: "OK",
    message: "API is running",
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5001,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Video routes
app.use("/api/videos", videoRoutes);

// Profile routes
app.use("/api/profile", profileRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Healthcheck available at: /api/test`);
});

// Handle server startup errors
server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});









