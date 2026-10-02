import { NextRequest, NextResponse } from "next/server";
import { uploadBase64Image, CLOUDINARY_FOLDERS } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mediaBase64, fileName, mediaType = "image" } = body;

    if (!mediaBase64) {
      return NextResponse.json({ error: "No media file provided" }, { status: 400 });
    }

    // Upload to Cloudinary Backgrounds folder
    const uploadRes = await uploadBase64Image(
      mediaBase64,
      CLOUDINARY_FOLDERS.BACKGROUNDS,
      fileName ? `bg_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, "_")}` : undefined
    );

    if (!uploadRes.success || !uploadRes.url) {
      return NextResponse.json(
        {
          success: false,
          error: uploadRes.error || "Failed to upload to Cloudinary",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadRes.url,
      publicId: uploadRes.publicId,
      mediaType,
    });
  } catch (error: any) {
    console.error("Background upload API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
