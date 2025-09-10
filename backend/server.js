import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Video from "./models/Video.js";  // 👈 add this at the top


dotenv.config();
connectDB(); // <--- connect to MongoDB

const app = express();

// middleware to parse JSON
app.use(express.json());

// test route
app.get("/api/test", (req, res) => {
  res.send("API is running...");
});



// Temporary route to create a video
app.post("/api/videos", async (req, res) => {
  try {
    const { title, videoUrl } = req.body;

    const video = new Video({ title, videoUrl });
    await video.save();

    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Temporary route to fetch all videos
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



