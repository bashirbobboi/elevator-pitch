import express from "express";
import {
  createVideo,
  uploadVideo,
  getVideos,
  getVideoById,
  getVideoByShareId,
  getVideoAnalytics,
  getAllAnalytics,
  deleteVideo,
  updateVideo,
  getVideoFileInfo,
  downloadResumeWithButton,
  trackWatchProgress,
  trackButtonClick,
} from "../controllers/videoController.js";
import videoUpload from "../config/multer.js";

const router = express.Router();

router.post("/", createVideo);             // Create video (with external URL)
router.post("/upload", videoUpload.single("video"), uploadVideo); // Upload video file
router.get("/", getVideos);                // Admin: list videos
router.get("/:id", getVideoById);          // Admin: get by Mongo _id
router.put("/:id", updateVideo);           // Admin: update video
router.delete("/:id", deleteVideo);        // Admin: delete video
router.get("/:id/file-info", getVideoFileInfo); // Admin: get file info
router.post("/share/:shareId", getVideoByShareId); // Recruiter view + track
router.get("/share/:shareId/resume", downloadResumeWithButton); // Download resume with button
router.post("/share/:shareId/track-progress", trackWatchProgress); // Track video watch progress
router.post("/share/:shareId/track-click", trackButtonClick); // Track button clicks
router.get("/:id/stats", getVideoAnalytics);       // Admin: stats for one
router.get("/admin/all-stats", getAllAnalytics);   // Admin: stats for all

export default router;
