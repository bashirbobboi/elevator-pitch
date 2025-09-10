import fs from 'fs';
import path from 'path';

// Delete a file from the uploads directory
export const deleteFile = (filePath) => {
  try {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.join(process.cwd(), cleanPath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`File deleted: ${fullPath}`);
      return true;
    } else {
      console.log(`File not found: ${fullPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

// Check if a file exists
export const fileExists = (filePath) => {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.join(process.cwd(), cleanPath);
    return fs.existsSync(fullPath);
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error);
    return false;
  }
};

// Get file size
export const getFileSize = (filePath) => {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.join(process.cwd(), cleanPath);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return stats.size;
    }
    return 0;
  } catch (error) {
    console.error(`Error getting file size ${filePath}:`, error);
    return 0;
  }
};
