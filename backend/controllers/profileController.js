import Profile from '../models/Profile.js';
import { deleteFile, fileExists } from '../utils/fileUtils.js';
import path from 'path';

// Create or update the single profile (since this is a single-user platform)
export const createProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, location, linkedInUrl, portfolioUrl } = req.body;

    // Check if a profile already exists (single-user system)
    let profile = await Profile.findOne();
    
    if (profile) {
      // Update existing profile instead of creating new one
      profile.firstName = firstName || profile.firstName;
      profile.lastName = lastName || profile.lastName;
      profile.email = email || profile.email;
      profile.location = location || profile.location;
      profile.linkedInUrl = linkedInUrl || profile.linkedInUrl;
      profile.portfolioUrl = portfolioUrl || profile.portfolioUrl;
      
      await profile.save();
      return res.json(profile);
    }

    // Create first profile if none exists
    profile = new Profile({
      firstName,
      lastName,
      email,
      location,
      linkedInUrl,
      portfolioUrl
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get the single profile (single-user system)
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    
    if (!profile) {
      return res.status(404).json({ error: 'No profile found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update the single profile (single-user system)
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, location, linkedInUrl, portfolioUrl } = req.body;

    // Get the single profile
    const profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ error: 'No profile found' });
    }

    // Update fields (no email uniqueness check needed - single user system)
    profile.firstName = firstName || profile.firstName;
    profile.lastName = lastName || profile.lastName;
    profile.email = email || profile.email;
    profile.location = location || profile.location;
    profile.linkedInUrl = linkedInUrl || profile.linkedInUrl;
    profile.portfolioUrl = portfolioUrl || profile.portfolioUrl;

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne().sort({ createdAt: -1 });
    if (!profile) {
      return res.status(404).json({ error: 'No profile found' });
    }

    // Delete profile picture file if it exists
    if (profile.profilePicture) {
      if (profile.profilePicture.startsWith('http')) {
        // Cloudinary image - delete using public_id
        if (profile.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(profile.cloudinaryId);
            console.log('Deleted profile picture from Cloudinary:', profile.cloudinaryId);
          } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
          }
        }
      } else {
        // Local file - delete from filesystem
        const imagePath = path.join(process.cwd(), profile.profilePicture);
        if (await fileExists(imagePath)) {
          await deleteFile(imagePath);
        }
      }
    }

    await Profile.findByIdAndDelete(profile._id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      useCloudinary: process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true',
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename,
        path: req.file.path
      } : null
    });

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Find the single profile
    const profile = await Profile.findOne();
    if (!profile) {
      console.log('No profile found');
      return res.status(404).json({ error: 'No profile found' });
    }

    console.log('Found profile:', profile._id);

    // Delete old profile picture if it exists and is a local file
    if (profile.profilePicture && !profile.profilePicture.startsWith('http')) {
      const oldImagePath = path.join(process.cwd(), profile.profilePicture);
      if (await fileExists(oldImagePath)) {
        await deleteFile(oldImagePath);
        console.log('Deleted old profile picture');
      }
    }

    // Update profile with new picture path (Cloudinary URL or local path)
    const oldPicture = profile.profilePicture;
    profile.profilePicture = req.file.path || `/uploads/profiles/${req.file.filename}`;
    await profile.save();

    console.log('Profile picture updated:', {
      oldPicture: oldPicture,
      newPicture: profile.profilePicture,
      profileId: profile._id,
      updatedAt: profile.updatedAt
    });

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: profile.profilePicture
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: error.message || 'Failed to upload profile picture' });
  }
};

// Upload resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    console.log('Resume file uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Find existing profile or create new one
    let profile = await Profile.findOne();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please create a profile first.' });
    }

    // Delete old resume file if it exists
    if (profile.resume) {
      const oldResumeFile = path.join(process.cwd(), 'uploads', 'resumes', path.basename(profile.resume));
      if (await fileExists(oldResumeFile)) {
        await deleteFile(oldResumeFile);
      }
    }

    // Update profile with new resume path (handle both local and Cloudinary)
    profile.resume = req.file.path || `/uploads/resumes/${req.file.filename}`;
    await profile.save();

    res.json({
      message: 'Resume uploaded successfully',
      resume: profile.resume
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: error.message });
  }
};
