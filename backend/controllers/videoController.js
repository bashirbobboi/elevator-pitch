import Video from "../models/Video.js";
import slugify from "slugify";
import { nanoid } from "nanoid";

// Create new video
export const createVideo = async (req, res) => {
  try {
    const { title, videoUrl } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ error: "Title and videoUrl are required" });
    }

    // Generate cleaner shareId: slug + random string
    const slug = slugify(title, { lower: true, strict: true });
    const shareId = `${slug}-${nanoid(6)}`; // e.g. "my-first-pitch-a1b2c3"

    const video = new Video({
      title,
      videoUrl,
      shareId,
    });

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

// Get video by Mongo _id (for admin use)
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get video by shareId (for recruiters)
export const getVideoByShareId = async (req, res) => {
  try {
    const video = await Video.findOne({ shareId: req.params.shareId });
    if (!video) return res.status(404).json({ error: "Video not found" });

    // Return only public fields for recruiters
    res.json({
      title: video.title,
      videoUrl: video.videoUrl,
      shareId: video.shareId,
      createdAt: video.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
