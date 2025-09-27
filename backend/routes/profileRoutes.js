import express from 'express';
import multer from 'multer';
import Profile from '../models/Profile.js';
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  uploadProfilePicture,
  uploadResume
} from '../controllers/profileController.js';
import { resumeUpload, profileUpload } from '../config/multer.js';

const router = express.Router();

// Using profileUpload from multer config (handles both local and Cloudinary)

// Profile routes
router.post('/', createProfile);
router.get('/', getProfile);
router.put('/', updateProfile);
router.delete('/', deleteProfile);

// Debug route to see all profiles
router.get('/debug/all', async (req, res) => {
  try {
    const profiles = await Profile.find({}).sort({ createdAt: -1 });
    res.json({
      count: profiles.length,
      profiles: profiles.map(p => ({
        _id: p._id,
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        createdAt: p.createdAt,
        hasProfilePicture: !!p.profilePicture,
        hasResume: !!p.resume
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cleanup route to remove test profiles
router.delete('/debug/cleanup', async (req, res) => {
  try {
    // Delete test profiles (keep only the main one with resume)
    const result = await Profile.deleteMany({
      $or: [
        { email: { $regex: /test|example|newdeploy/i } },
        { email: 'bashirbobboi@gmail.comewf' } // Remove typo version
      ]
    });
    
    res.json({
      message: `Cleaned up ${result.deletedCount} test profiles`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile picture upload route
router.post('/upload-picture', profileUpload.single('profilePicture'), uploadProfilePicture);

// Resume upload route
router.post('/upload-resume', (req, res, next) => {
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadResume);

export default router;
