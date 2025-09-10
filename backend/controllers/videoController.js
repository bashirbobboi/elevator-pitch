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

    const slug = slugify(title, { lower: true, strict: true });
    const shareId = `${slug}-${nanoid(6)}`;

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

// Get all videos (admin use)
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get video by Mongo _id (admin use)
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get video by shareId (recruiter view + track analytics)
export const getVideoByShareId = async (req, res) => {
  try {
    const { viewerId } = req.body; // frontend sends UUID from localStorage
    const video = await Video.findOne({ shareId: req.params.shareId });

    if (!video) return res.status(404).json({ error: "Video not found" });

    // Increment total views
    video.viewCount += 1;

    // Track unique viewers
    if (viewerId && !video.uniqueViewers.includes(viewerId)) {
      video.uniqueViewers.push(viewerId);
    }

    // Update last viewed
    video.lastViewed = new Date();

    await video.save();

    // Return recruiter-friendly response
    res.json({
      title: video.title,
      videoUrl: video.videoUrl,
      shareId: video.shareId,
      viewCount: video.viewCount,
      uniqueViewers: video.uniqueViewers.length,
      lastViewed: video.lastViewed,
      createdAt: video.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
