import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import videoRoutes from "./routes/videoRoutes.js";


dotenv.config();
connectDB(); // <--- connect to MongoDB

const app = express();

// middleware to parse JSON
app.use(express.json());

// test route
app.get("/api/test", (req, res) => {
  res.send("API is running...");
});

// Video routes
app.use("/api/videos", videoRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));









