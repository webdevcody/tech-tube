import { publicEnv } from "~/config/publicEnv";

/**
 * Generate a Cloudinary video URL from a public ID
 */
export function getVideoUrl(
  publicId: string,
  options?: {
    quality?: string;
    format?: string;
    transformation?: string;
  }
): string {
  const {
    quality = "auto",
    format = "auto",
    transformation = "",
  } = options || {};

  let url = `https://res.cloudinary.com/${publicEnv.cloudName}/video/upload/`;

  if (quality !== "auto") {
    url += `q_${quality}/`;
  }

  if (format !== "auto") {
    url += `f_${format}/`;
  }

  if (transformation) {
    url += `${transformation}/`;
  }

  url += publicId;

  return url;
}

/**
 * Generate a Cloudinary thumbnail URL from a video public ID
 */
export function getThumbnailUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
    quality?: string;
  }
): string {
  const {
    width = 640,
    height = 360,
    crop = "fill",
    gravity = "auto",
    quality = "auto",
  } = options || {};

  let url = `https://res.cloudinary.com/${publicEnv.cloudName}/video/upload/`;
  url += `w_${width},h_${height},c_${crop},g_${gravity},q_${quality}/`;
  url += `${publicId}.jpg`;

  return url;
}

/**
 * Extract video metadata from Cloudinary response
 */
export function extractVideoMetadata(cloudinaryResponse: any) {
  return {
    publicId: cloudinaryResponse.public_id,
    duration: cloudinaryResponse.duration,
    width: cloudinaryResponse.width,
    height: cloudinaryResponse.height,
    format: cloudinaryResponse.format,
    bytes: cloudinaryResponse.bytes,
    url: cloudinaryResponse.secure_url,
    thumbnailUrl:
      cloudinaryResponse.thumbnail_url ||
      getThumbnailUrl(cloudinaryResponse.public_id),
  };
}

/**
 * Generate a Cloudinary image URL from a public ID
 */
export function getImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    gravity?: string;
  }
): string {
  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
    gravity = "auto",
  } = options || {};

  let url = `https://res.cloudinary.com/${publicEnv.cloudName}/image/upload/`;

  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  if (transformations.length > 0) {
    url += `${transformations.join(",")}/${publicId}`;
  } else {
    url += publicId;
  }

  return url;
}

/**
 * Upload an image file to Cloudinary using the unsigned upload endpoint
 */
export async function uploadImage(file: File): Promise<{
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", publicEnv.uploadPreset);
  formData.append("folder", "profile-images"); // Organize uploads in a folder

  const uploadUrl = `https://api.cloudinary.com/v1_1/${publicEnv.cloudName}/image/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

/**
 * Validate Cloudinary configuration
 */
export function isCloudinaryConfigured(): boolean {
  return !!(publicEnv.cloudName && publicEnv.uploadPreset);
}
