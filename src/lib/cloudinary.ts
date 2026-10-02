import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDERS = {
  USERS: "photobooth/users",
  ORIGINALS: "photobooth/originals",
  RESULTS: "photobooth/results",
  THUMBNAILS: "photobooth/thumbnails",
  AI: "photobooth/ai",
  EVENTS: "photobooth/events",
  FRAMES: "assets/frames",
  STICKERS: "assets/stickers",
  EFFECTS: "assets/effects",
  BACKGROUNDS: "assets/backgrounds",
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

export async function uploadBase64Image(
  base64Data: string,
  folder: CloudinaryFolder,
  publicId?: string
) {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      public_id: publicId,
      resource_type: "auto",
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    return {
      success: false,
      error: error?.message || "Upload failed",
    };
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  options?: { width?: number; height?: number; crop?: string; quality?: string }
) {
  return cloudinary.url(publicId, {
    width: options?.width,
    height: options?.height,
    crop: options?.crop || "limit",
    quality: options?.quality || "auto",
    fetch_format: "auto",
    secure: true,
  });
}

export default cloudinary;
