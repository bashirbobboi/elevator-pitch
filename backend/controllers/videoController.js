import Video from "../models/Video.js";
import Profile from "../models/Profile.js";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { deleteFile, fileExists } from "../utils/fileUtils.js";
import { createDownloadableResume } from "../utils/pdfUtils.js";

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

    // Handle both local and Cloudinary file paths
    const videoUrl = req.file.path || `/uploads/${req.file.filename}`;
    
    const video = new Video({
      title,
      videoUrl: videoUrl, // Store full URL for Cloudinary or relative path for local
      shareId,
    });

    await video.save();

    // Create downloadable resume with button if user has a resume
    try {
      const profile = await Profile.findOne({ resume: { $ne: null } }).sort({ updatedAt: -1 });
      if (profile && profile.resume) {
        const originalResumePath = `uploads${profile.resume.replace('/uploads', '')}`;
        const downloadablePath = await createDownloadableResume(originalResumePath, shareId);
        console.log(`✅ Created downloadable resume with elevator pitch button: ${downloadablePath}`);
      }
    } catch (resumeError) {
      console.warn("⚠️ Could not create downloadable resume:", resumeError.message);
      // Don't fail the video upload if resume processing fails
    }

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

// Download resume with elevator pitch button
export const downloadResumeWithButton = async (req, res) => {
  try {
    const { shareId } = req.params;
    
    // Find the video by shareId
    const video = await Video.findOne({ shareId });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Get profile with resume
    const profile = await Profile.findOne({ resume: { $ne: null } }).sort({ updatedAt: -1 });
    if (!profile || !profile.resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Handle Cloudinary URLs vs local files
    if (profile.resume.startsWith('http')) {
      // For Cloudinary URLs, redirect to the original resume
      console.log('Resume is stored in Cloudinary, redirecting to original file');
      return res.redirect(profile.resume);
    } else {
      // For local files, create downloadable version
      const originalFileName = profile.resume.split('/').pop();
      const fileNameWithoutExt = originalFileName.replace('.pdf', '');
      const downloadablePath = `uploads/resumes/${fileNameWithoutExt}_downloadable.pdf`;

      // Check if downloadable version exists, create it if it doesn't
      if (!await fileExists(downloadablePath)) {
        try {
          console.log(`Creating downloadable resume for shareId: ${shareId}`);
          await createDownloadableResume(profile.resume, shareId);
          console.log(`✅ Created downloadable resume: ${downloadablePath}`);
        } catch (createError) {
          console.error('Error creating downloadable resume:', createError);
          return res.status(500).json({ error: "Failed to create downloadable resume" });
        }
      }

      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${profile.firstName}_${profile.lastName}_Resume.pdf"`);
      
      // Send file
      res.sendFile(downloadablePath, { root: process.cwd() });
    }
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ error: error.message });
  }
};

// Track video watch progress
export const trackWatchProgress = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { viewerId, currentTime, duration } = req.body;

    if (!viewerId || currentTime === undefined) {
      return res.status(400).json({ error: "viewerId and currentTime are required" });
    }

    const video = await Video.findOne({ shareId });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Find or create viewer analytics
    let viewerAnalytic = video.viewerAnalytics.find(va => va.viewerId === viewerId);
    if (!viewerAnalytic) {
      viewerAnalytic = {
        viewerId,
        firstView: new Date(),
        lastView: new Date(),
        totalWatchTime: 0,
        completedVideo: false,
        resumeDownloaded: false,
        portfolioClicked: false,
        linkedinClicked: false
      };
      video.viewerAnalytics.push(viewerAnalytic);
    }

    // Update watch time (store the maximum time reached)
    viewerAnalytic.totalWatchTime = Math.max(viewerAnalytic.totalWatchTime, currentTime);
    viewerAnalytic.lastView = new Date();

    // Check if video was completed (90% or more)
    if (duration && currentTime >= (duration * 0.9)) {
      viewerAnalytic.completedVideo = true;
    }

    // Update completion rate
    const completedViewers = video.viewerAnalytics.filter(va => va.completedVideo).length;
    const totalViewers = video.viewerAnalytics.length;
    video.completionRate = totalViewers > 0 ? (completedViewers / totalViewers) * 100 : 0;

    await video.save();
    res.json({ success: true, watchTime: viewerAnalytic.totalWatchTime });
  } catch (error) {
    console.error('Error tracking watch progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// Track button clicks (resume download, portfolio, linkedin)
export const trackButtonClick = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { viewerId, buttonType } = req.body;

    if (!viewerId || !buttonType) {
      return res.status(400).json({ error: "viewerId and buttonType are required" });
    }

    const video = await Video.findOne({ shareId });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Find or create viewer analytics
    let viewerAnalytic = video.viewerAnalytics.find(va => va.viewerId === viewerId);
    if (!viewerAnalytic) {
      viewerAnalytic = {
        viewerId,
        firstView: new Date(),
        lastView: new Date(),
        totalWatchTime: 0,
        completedVideo: false,
        resumeDownloaded: false,
        portfolioClicked: false,
        linkedinClicked: false
      };
      video.viewerAnalytics.push(viewerAnalytic);
    }

    // Track the specific button click
    switch (buttonType) {
      case 'resume':
        viewerAnalytic.resumeDownloaded = true;
        video.resumeDownloads = (video.resumeDownloads || 0) + 1;
        break;
      case 'portfolio':
        viewerAnalytic.portfolioClicked = true;
        video.portfolioClicks = (video.portfolioClicks || 0) + 1;
        break;
      case 'linkedin':
        viewerAnalytic.linkedinClicked = true;
        video.linkedinClicks = (video.linkedinClicks || 0) + 1;
        break;
      default:
        return res.status(400).json({ error: "Invalid buttonType" });
    }

    viewerAnalytic.lastView = new Date();
    await video.save();

    res.json({ success: true, buttonType, totalClicks: video[`${buttonType}${buttonType === 'resume' ? 'Downloads' : 'Clicks'}`] });
  } catch (error) {
    console.error('Error tracking button click:', error);
    res.status(500).json({ error: error.message });
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

      // Calculate average watch time
      const totalWatchTime = video.viewerAnalytics.reduce((sum, va) => sum + (va.totalWatchTime || 0), 0);
      const avgWatchTime = video.viewerAnalytics.length > 0 ? totalWatchTime / video.viewerAnalytics.length : 0;

      // Calculate engagement metrics
      const completedViewers = video.viewerAnalytics.filter(va => va.completedVideo).length;
      const resumeDownloadRate = video.viewerAnalytics.filter(va => va.resumeDownloaded).length;
      const portfolioClickRate = video.viewerAnalytics.filter(va => va.portfolioClicked).length;
      const linkedinClickRate = video.viewerAnalytics.filter(va => va.linkedinClicked).length;
  
      res.json({
        title: video.title,
        shareId: video.shareId,
        viewCount: video.viewCount,
        uniqueViewers: video.uniqueViewers.length,
        firstViewed: video.firstViewed,
        lastViewed: video.lastViewed,
        createdAt: video.createdAt,
        // Advanced Analytics
        completionRate: video.completionRate || 0,
        avgWatchTime: Math.round(avgWatchTime),
        totalResumeDownloads: video.resumeDownloads || 0,
        totalPortfolioClicks: video.portfolioClicks || 0,
        totalLinkedinClicks: video.linkedinClicks || 0,
        // Engagement Rates (percentage of viewers who performed action)
        resumeDownloadRate: video.uniqueViewers.length > 0 ? Math.round((resumeDownloadRate / video.uniqueViewers.length) * 100) : 0,
        portfolioClickRate: video.uniqueViewers.length > 0 ? Math.round((portfolioClickRate / video.uniqueViewers.length) * 100) : 0,
        linkedinClickRate: video.uniqueViewers.length > 0 ? Math.round((linkedinClickRate / video.uniqueViewers.length) * 100) : 0,
        // Detailed viewer analytics
        viewerAnalytics: video.viewerAnalytics.map(va => ({
          viewerId: va.viewerId,
          firstView: va.firstView,
          lastView: va.lastView,
          watchTime: va.totalWatchTime || 0,
          completed: va.completedVideo || false,
          resumeDownloaded: va.resumeDownloaded || false,
          portfolioClicked: va.portfolioClicked || false,
          linkedinClicked: va.linkedinClicked || false
        }))
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

    // Initialize viewerSessions if it doesn't exist
    if (!video.viewerSessions) {
      video.viewerSessions = new Map();
    }

    // Ensure uniqueViewers is an array
    if (!Array.isArray(video.uniqueViewers)) {
      video.uniqueViewers = [];
    }

    // Remove any duplicate viewer IDs (cleanup for existing data)
    video.uniqueViewers = [...new Set(video.uniqueViewers)];

    const now = new Date();
    const sessionKey = viewerId || 'anonymous';
    const lastViewTime = video.viewerSessions.get(sessionKey);
    
    // Only count as new view if:
    // 1. No previous view from this viewer, OR
    // 2. Last view was more than 30 seconds ago (prevents rapid refresh spam)
    // 3. Additional protection: in development, require at least 5 seconds between views to handle React StrictMode
    const timeSinceLastView = lastViewTime ? (now - new Date(lastViewTime)) : Infinity;
    const minInterval = process.env.NODE_ENV === 'development' ? 5000 : 30000; // 5s in dev, 30s in prod
    const shouldCountView = !lastViewTime || timeSinceLastView > minInterval;

    if (shouldCountView) {
      // Increment total views
      video.viewCount += 1;
      
      // Update session tracking
      video.viewerSessions.set(sessionKey, now.toISOString());
      
      // Track unique viewers (only add if not already in array)
      if (viewerId && !video.uniqueViewers.includes(viewerId)) {
        video.uniqueViewers.push(viewerId);
        console.log(`Added new unique viewer: ${viewerId} to video: ${video.title}`);
        
        // Set first viewed timestamp if this is the first viewer
        if (!video.firstViewed) {
          video.firstViewed = now;
        }
      } else if (viewerId && video.uniqueViewers.includes(viewerId)) {
        console.log(`Viewer ${viewerId} already exists in uniqueViewers for video: ${video.title}`);
      }

      // Update last viewed
      video.lastViewed = now;

      // Initialize or update viewer analytics
      if (viewerId) {
        let viewerAnalytic = video.viewerAnalytics.find(va => va.viewerId === viewerId);
        if (!viewerAnalytic) {
          viewerAnalytic = {
            viewerId,
            firstView: now,
            lastView: now,
            totalWatchTime: 0,
            completedVideo: false,
            resumeDownloaded: false,
            portfolioClicked: false,
            linkedinClicked: false
          };
          video.viewerAnalytics.push(viewerAnalytic);
        } else {
          viewerAnalytic.lastView = now;
        }
      }

      await video.save();
    }

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


