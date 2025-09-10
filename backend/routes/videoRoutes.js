import express from "express";
import {
  createVideo,
  uploadVideo,
  getVideos,
  getVideoById,
  getVideoByShareId,
  getVideoAnalytics,
  getAllAnalytics,
} from "../controllers/videoController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/", createVideo);             // Create video (with external URL)
router.post("/upload", upload.single("video"), uploadVideo); // Upload video file
router.get("/", getVideos);                // Admin: list videos
router.get("/:id", getVideoById);          // Admin: get by Mongo _id
router.post("/share/:shareId", getVideoByShareId); // Recruiter view + track
router.get("/:id/stats", getVideoAnalytics);       // Admin: stats for one
router.get("/admin/all-stats", getAllAnalytics);   // Admin: stats for all

export default router;
