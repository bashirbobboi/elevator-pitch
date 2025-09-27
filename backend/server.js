import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import videoRoutes from "./routes/videoRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";


dotenv.config();
connectDB(); // <--- connect to MongoDB

const app = express();

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

// test route
app.get("/api/test", (req, res) => {
  res.send("API is running...");
});

// Video routes
app.use("/api/videos", videoRoutes);

// Profile routes
app.use("/api/profile", profileRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));









