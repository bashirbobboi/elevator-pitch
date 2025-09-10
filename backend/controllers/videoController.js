// Logic: upload, fetch, track views
import Video from "../models/Video.js";

// Create new video
export const createVideo = async (req, res) => {
  try {
    const { title, videoUrl } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ error: "Title and videoUrl are required" });
    }

    const video = new Video({ title, videoUrl });
    await video.save();

    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all videos
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single video by ID
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
