// API endpoints for videos
import express from "express";
import { createVideo, getVideos, getVideoById } from "../controllers/videoController.js";

const router = express.Router();

// POST /api/videos   → create video
router.post("/", createVideo);

// GET /api/videos    → get all videos
router.get("/", getVideos);

// GET /api/videos/:id → get video by ID
router.get("/:id", getVideoById);

export default router;
