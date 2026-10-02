"use client";

import React, { useRef, useEffect } from "react";
import { TrackedFace } from "../types";
import { useFaceTrackingStore } from "../stores/useFaceTrackingStore";
import { useCameraStore } from "@/stores/useCameraStore";

interface FaceTrackingOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  trackedFacesRef: React.RefObject<TrackedFace[]>;
}

// MediaPipe standard contour landmark sequences
const CONTOURS = {
  faceOval: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
    378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
    162, 21, 54, 103, 67, 109, 10,
  ],
  leftEye: [
    33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161,
    246, 33,
  ],
  rightEye: [
    263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387,
    388, 466, 263,
  ],
  leftEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
  rightEyebrow: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
  lipsOuter: [
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402,
    317, 14, 87, 178, 88, 95, 78, 61,
  ],
  noseBridge: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2],
};

export const FaceTrackingOverlay: React.FC<FaceTrackingOverlayProps> = ({
  videoRef,
  trackedFacesRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isTrackingEnabled, isDebugMode } = useFaceTrackingStore();
  const { isMirrored } = useCameraStore();

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Sync canvas dimensions with video stream
      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Clear previous frame
      ctx.clearRect(0, 0, width, height);

      const faces = trackedFacesRef.current || [];

      // If tracking disabled or debug mode off and no debug rendering needed
      if (!isTrackingEnabled || (!isDebugMode && faces.length === 0)) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Only draw debug visualizations if isDebugMode is explicitly turned on
      if (isDebugMode) {
        faces.forEach((face) => {
          drawFaceDebug(ctx, face, width, height, isMirrored);
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [videoRef, trackedFacesRef, isTrackingEnabled, isDebugMode, isMirrored]);

  if (!isTrackingEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full object-cover"
    />
  );
};

/**
 * Draws debug visualization for a tracked face (mesh contours, bounding box, 3D pose, expressions)
 */
function drawFaceDebug(
  ctx: CanvasRenderingContext2D,
  face: TrackedFace,
  width: number,
  height: number,
  isMirrored: boolean
) {
  // Helper to map normalized coordinate to canvas pixel space
  const mapPoint = (normX: number, normY: number) => {
    const x = isMirrored ? (1 - normX) * width : normX * width;
    const y = normY * height;
    return { x, y };
  };

  const raw = face.rawLandmarks;

  // 1. Draw Facial Contours
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(6, 182, 212, 0.75)"; // Cyan neon

  const drawContour = (indices: number[]) => {
    if (!indices || indices.length === 0) return;
    ctx.beginPath();
    for (let i = 0; i < indices.length; i++) {
      const pt = raw[indices[i]];
      if (!pt) continue;
      const { x, y } = mapPoint(pt.x, pt.y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  drawContour(CONTOURS.faceOval);
  ctx.strokeStyle = "rgba(16, 185, 129, 0.8)"; // Emerald green for eyes
  drawContour(CONTOURS.leftEye);
  drawContour(CONTOURS.rightEye);
  ctx.strokeStyle = "rgba(245, 158, 11, 0.8)"; // Amber for eyebrows
  drawContour(CONTOURS.leftEyebrow);
  drawContour(CONTOURS.rightEyebrow);
  ctx.strokeStyle = "rgba(244, 63, 94, 0.8)"; // Rose for lips
  drawContour(CONTOURS.lipsOuter);
  ctx.strokeStyle = "rgba(139, 92, 246, 0.8)"; // Violet for nose bridge
  drawContour(CONTOURS.noseBridge);

  // 2. Draw Landmark Dots (Keypoints)
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  const keyPts = [
    face.keypoints.noseTip,
    face.keypoints.chin,
    face.keypoints.forehead,
    face.keypoints.leftEye,
    face.keypoints.rightEye,
    face.keypoints.mouthCenter,
  ];

  for (const pt of keyPts) {
    if (!pt) continue;
    const { x, y } = mapPoint(pt.x, pt.y);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Draw Bounding Box with Futuristic Corner Brackets
  const boxX = isMirrored
    ? (1 - (face.box.x + face.box.width)) * width
    : face.box.x * width;
  const boxY = face.box.y * height;
  const boxW = face.box.width * width;
  const boxH = face.box.height * height;

  ctx.strokeStyle = "rgba(99, 102, 241, 0.9)"; // Indigo
  ctx.lineWidth = 2;
  const bracketSize = Math.min(24, boxW * 0.2);

  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(boxX, boxY + bracketSize);
  ctx.lineTo(boxX, boxY);
  ctx.lineTo(boxX + bracketSize, boxY);
  ctx.stroke();

  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(boxX + boxW - bracketSize, boxY);
  ctx.lineTo(boxX + boxW, boxY);
  ctx.lineTo(boxX + boxW, boxY + bracketSize);
  ctx.stroke();

  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(boxX, boxY + boxH - bracketSize);
  ctx.lineTo(boxX, boxY + boxH);
  ctx.lineTo(boxX + bracketSize, boxY + boxH);
  ctx.stroke();

  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(boxX + boxW - bracketSize, boxY + boxH);
  ctx.lineTo(boxX + boxW, boxY + boxH);
  ctx.lineTo(boxX + boxW, boxY + boxH - bracketSize);
  ctx.stroke();

  // 4. Draw 3D Head Pose Axes at Nose Tip
  const nose = mapPoint(face.keypoints.noseTip.x, face.keypoints.noseTip.y);
  const axisLength = Math.min(boxW, boxH) * 0.35;
  const yawRad = (face.headPose.yaw * Math.PI) / 180;
  const pitchRad = (face.headPose.pitch * Math.PI) / 180;
  const rollRad = (face.headPose.roll * Math.PI) / 180;

  // Yaw axis (Green - horizontal turn)
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#10b981";
  ctx.beginPath();
  ctx.moveTo(nose.x, nose.y);
  ctx.lineTo(
    nose.x + Math.cos(rollRad) * axisLength * (isMirrored ? -Math.cos(yawRad) : Math.cos(yawRad)),
    nose.y + Math.sin(rollRad) * axisLength
  );
  ctx.stroke();

  // Pitch axis (Red - vertical tilt)
  ctx.strokeStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(nose.x, nose.y);
  ctx.lineTo(
    nose.x - Math.sin(rollRad) * axisLength,
    nose.y + Math.sin(pitchRad) * axisLength + axisLength * 0.5
  );
  ctx.stroke();

  // 5. Expression & Pose Tags Badge above bounding box
  const badgeX = boxX;
  const badgeY = Math.max(20, boxY - 32);

  // Expression Badges
  const activeExpressions: string[] = [];
  if (face.expressions.isSmiling) {
    activeExpressions.push(`😊 Smile ${Math.round(face.expressions.smile * 100)}%`);
  }
  if (face.expressions.isWinkLeft) activeExpressions.push("😉 Wink L");
  if (face.expressions.isWinkRight) activeExpressions.push("😉 Wink R");
  if (face.expressions.isBlinking) activeExpressions.push("👁️ Blink");
  if (face.expressions.isMouthOpen) {
    activeExpressions.push(`😮 Open ${Math.round(face.expressions.mouthOpen * 100)}%`);
  }

  const labelText = `Face #${face.id} [Y:${face.headPose.yaw}° P:${face.headPose.pitch}° R:${face.headPose.roll}°]`;
  const exprText = activeExpressions.length > 0 ? activeExpressions.join(" | ") : "😐 Neutral";

  // Background pill for label
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  const labelMetrics = ctx.measureText(labelText);
  const exprMetrics = ctx.measureText(exprText);
  const pillW = Math.max(labelMetrics.width, exprMetrics.width) + 16;
  const pillH = 34;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.beginPath();
  roundRect(ctx, badgeX, badgeY - 10, pillW, pillH, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(99, 102, 241, 0.6)";
  ctx.stroke();

  // Face Pose text
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(labelText, badgeX + 8, badgeY + 4);

  // Expressions text
  ctx.fillStyle = face.expressions.isSmiling ? "#facc15" : "#94a3b8";
  ctx.fillText(exprText, badgeX + 8, badgeY + 18);

  ctx.restore();
}

/**
 * Utility to draw rounded rectangles on HTML5 Canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
