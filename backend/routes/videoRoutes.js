import express from "express";
import {
  createVideo,
  getVideos,
  getVideoById,
  getVideoByShareId,
} from "../controllers/videoController.js";

const router = express.Router();

router.post("/", createVideo);        // Create video
router.get("/", getVideos);           // Admin: all videos
router.get("/:id", getVideoById);     // Admin: single video by _id
router.post("/share/:shareId", getVideoByShareId); // Recruiter view + analytics

export default router;
