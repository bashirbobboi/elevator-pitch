import Video from "../models/Video.js";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { deleteFile, fileExists } from "../utils/fileUtils.js";

// Create new video (with external URL)
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

// Upload video file
export const uploadVideo = async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const slug = slugify(title, { lower: true, strict: true });
    const shareId = `${slug}-${nanoid(6)}`;

    const video = new Video({
      title,
      videoUrl: `/uploads/${req.file.filename}`, // Store relative path
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

// Get analytics for a single video (by Mongo _id)
export const getVideoAnalytics = async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
      if (!video) return res.status(404).json({ error: "Video not found" });
  
      res.json({
        title: video.title,
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
  
  // Get analytics for ALL videos (admin overview)
  export const getAllAnalytics = async (req, res) => {
    try {
      const videos = await Video.find();
  
      const analytics = videos.map(video => ({
        title: video.title,
        shareId: video.shareId,
        viewCount: video.viewCount,
        uniqueViewers: video.uniqueViewers.length,
        lastViewed: video.lastViewed,
        createdAt: video.createdAt,
      }));
  
      res.json(analytics);
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

// Delete video (admin use)
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Delete the video file if it's a local upload
    if (video.videoUrl && video.videoUrl.startsWith('/uploads/')) {
      const fileDeleted = deleteFile(video.videoUrl);
      if (!fileDeleted) {
        console.warn(`Warning: Could not delete file ${video.videoUrl}`);
      }
    }

    // Delete from database
    await Video.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: "Video deleted successfully",
      deletedVideo: {
        id: video._id,
        title: video.title,
        shareId: video.shareId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update video (admin use)
export const updateVideo = async (req, res) => {
  try {
    const { title } = req.body;
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Update title if provided
    if (title) {
      video.title = title;
      // Regenerate shareId if title changed
      const slug = slugify(title, { lower: true, strict: true });
      video.shareId = `${slug}-${nanoid(6)}`;
    }

    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get video file info (admin use)
export const getVideoFileInfo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const fileInfo = {
      videoId: video._id,
      title: video.title,
      shareId: video.shareId,
      videoUrl: video.videoUrl,
      isLocalFile: video.videoUrl && video.videoUrl.startsWith('/uploads/'),
      fileExists: false,
      fileSize: 0
    };

    // If it's a local file, check if it exists and get size
    if (fileInfo.isLocalFile) {
      fileInfo.fileExists = fileExists(video.videoUrl);
      if (fileInfo.fileExists) {
        const { getFileSize } = await import("../utils/fileUtils.js");
        fileInfo.fileSize = getFileSize(video.videoUrl);
      }
    }

    res.json(fileInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


