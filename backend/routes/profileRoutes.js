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

// Cleanup route to consolidate to single profile (single-user system)
router.post('/debug/consolidate', async (req, res) => {
  try {
    // Find the main profile (the one with resume and profile picture)
    const mainProfile = await Profile.findOne({ 
      email: 'bashirbobboi@gmail.com',
      resume: { $ne: null }
    });
    
    if (!mainProfile) {
      return res.status(404).json({ error: 'Main profile not found' });
    }

    // Delete all other profiles
    const result = await Profile.deleteMany({
      _id: { $ne: mainProfile._id }
    });
    
    res.json({
      message: `Consolidated to single profile. Removed ${result.deletedCount} duplicate profiles`,
      deletedCount: result.deletedCount,
      keptProfile: {
        _id: mainProfile._id,
        email: mainProfile.email,
        firstName: mainProfile.firstName,
        lastName: mainProfile.lastName
      }
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
