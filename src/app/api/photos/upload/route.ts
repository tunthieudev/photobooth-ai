import { NextRequest, NextResponse } from "next/server";
import { uploadBase64Image, CLOUDINARY_FOLDERS } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/mongodb";
import { Photo } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, layoutSlug, filterApplied, isFinalResult = true } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    const folder = isFinalResult ? CLOUDINARY_FOLDERS.RESULTS : CLOUDINARY_FOLDERS.ORIGINALS;

    // 1. Upload to Cloudinary
    const uploadRes = await uploadBase64Image(imageBase64, folder);

    if (!uploadRes.success || !uploadRes.url) {
      return NextResponse.json(
        { error: uploadRes.error || "Failed to upload to Cloudinary" },
        { status: 500 }
      );
    }

    // 2. Save record to MongoDB if database is connected
    let savedPhoto = null;
    try {
      await connectToDatabase();
      savedPhoto = await Photo.create({
        url: uploadRes.url,
        publicId: uploadRes.publicId,
        thumbnailUrl: uploadRes.url,
        layoutSlug: layoutSlug || "korean-4-cut",
        filterApplied: filterApplied || "normal",
        isPublic: true,
        metadata: {
          width: uploadRes.width,
          height: uploadRes.height,
          format: uploadRes.format,
        },
      });
    } catch (dbErr) {
      console.warn("MongoDB save skipped/failed (upload succeeded):", dbErr);
    }

    return NextResponse.json({
      success: true,
      url: uploadRes.url,
      publicId: uploadRes.publicId,
      photoId: savedPhoto?._id,
    });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
