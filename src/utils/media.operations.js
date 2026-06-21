import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and deletes the local file afterwards.
 * @param {Object} file - The file object from Multer (contains path, mimetype, originalname, etc.)
 * @returns {Promise<string>} - The public secure URL of the uploaded resource.
 */

const uploadToCloudinary = async (file) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const localFilePath = file.path;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response.secure_url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

/**
 * Helper to extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary resource URL
 * @returns {string|null} - The public ID
 */

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    let publicIdParts = parts.slice(uploadIndex + 1);

    if (publicIdParts[0] && publicIdParts[0].match(/^v\d+$/)) {
      publicIdParts = publicIdParts.slice(1);
    }

    const publicIdWithExtension = publicIdParts.join('/');
    const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return publicIdWithExtension;
    }
    return publicIdWithExtension.substring(0, lastDotIndex);
  } catch (error) {
    console.error("Error extracting public ID from URL:", error);
    return null;
  }
};

/**
 * Helper to determine resource type from Cloudinary URL
 * @param {string} url - Cloudinary resource URL
 * @returns {string} - "image" | "video" | "raw"
 */

const getResourceTypeFromUrl = (url) => {
  if (!url) return "image";
  if (url.includes("/video/")) {
    return "video";
  }
  if (url.includes("/raw/")) {
    return "raw";
  }
  return "image";
};

/**
 * Deletes a resource from Cloudinary given its URL.
 * @param {string} url - Cloudinary resource URL to delete.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 */

const deleteFromCloudinary = async (url) => {
  try {
    if (!url) throw new Error("No URL provided");

    const publicId = getPublicIdFromUrl(url);
    const resourceType = getResourceTypeFromUrl(url);

    if (!publicId) throw new Error("Invalid URL or public ID could not be extracted");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error.message);
    return false;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
