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
  origin: ["http://localhost:5173", "http://localhost:3000"], // Frontend URLs
  credentials: true
}));

// middleware to parse JSON
app.use(express.json());

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









