import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Video storage configuration
export const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elevator-pitch/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm', 'avi'],
    public_id: (req, file) => {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `video-${timestamp}-${random}`;
    },
  },
});

// Resume storage configuration  
export const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elevator-pitch/resumes',
    resource_type: 'raw', // For PDFs and other documents
    allowed_formats: ['pdf'],
    public_id: (req, file) => {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      return `resume-${timestamp}-${random}-${cleanName.replace('.pdf', '')}`;
    },
  },
});

// Profile picture storage configuration
export const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elevator-pitch/profiles',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto', format: 'auto' }],
    public_id: (req, file) => {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `profile-${timestamp}-${random}`;
    },
  },
});

// Helper function to delete files from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType 
    });
    console.log('Deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;
