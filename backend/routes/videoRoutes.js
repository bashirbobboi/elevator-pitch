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
} from "../controllers/videoController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/", createVideo);             // Create video (with external URL)
router.post("/upload", upload.single("video"), uploadVideo); // Upload video file
router.get("/", getVideos);                // Admin: list videos
router.get("/:id", getVideoById);          // Admin: get by Mongo _id
router.put("/:id", updateVideo);           // Admin: update video
router.delete("/:id", deleteVideo);        // Admin: delete video
router.get("/:id/file-info", getVideoFileInfo); // Admin: get file info
router.post("/share/:shareId", getVideoByShareId); // Recruiter view + track
router.get("/:id/stats", getVideoAnalytics);       // Admin: stats for one
router.get("/admin/all-stats", getAllAnalytics);   // Admin: stats for all

export default router;
