import { TrackedFace } from "@/features/face-tracking/types";

export interface FaceAnchorMetrics {
  headTop: { x: number; y: number };
  forehead: { x: number; y: number };
  eyesCenter: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  noseTip: { x: number; y: number };
  mouthCenter: { x: number; y: number };
  leftCheek: { x: number; y: number };
  rightCheek: { x: number; y: number };
  chin: { x: number; y: number };
  eyeDistance: number;
  faceWidth: number;
  faceHeight: number;
  rollRad: number;
  yawRad: number;
  pitchRad: number;
  scale: number;
}

/**
 * Calculates accurate canvas coordinates, anchors and 3D rotation metrics for a tracked face
 */
export function getFaceAnchorMetrics(
  face: TrackedFace,
  canvasWidth: number,
  canvasHeight: number,
  isMirrored: boolean
): FaceAnchorMetrics {
  const mapPt = (normX: number, normY: number) => ({
    x: isMirrored ? (1 - normX) * canvasWidth : normX * canvasWidth,
    y: normY * canvasHeight,
  });

  const kp = face.keypoints;
  const leftEye = mapPt(kp.leftEye.x, kp.leftEye.y);
  const rightEye = mapPt(kp.rightEye.x, kp.rightEye.y);
  const forehead = mapPt(kp.forehead.x, kp.forehead.y);
  const chin = mapPt(kp.chin.x, kp.chin.y);
  const noseTip = mapPt(kp.noseTip.x, kp.noseTip.y);
  const mouthCenter = mapPt(kp.mouthCenter.x, kp.mouthCenter.y);
  const leftCheek = mapPt(kp.leftCheek.x, kp.leftCheek.y);
  const rightCheek = mapPt(kp.rightCheek.x, kp.rightCheek.y);

  // Eye midpoint & distance
  const eyesCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  };
  const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);

  // Approximate face dimensions in canvas pixels
  const faceHeight = Math.hypot(chin.x - forehead.x, chin.y - forehead.y) * 1.35;
  const faceWidth = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y) * 1.15;

  // Head Top anchor (extended upward from chin-to-forehead vector)
  const dy = forehead.y - chin.y;
  const dx = forehead.x - chin.x;
  const headTop = {
    x: forehead.x + dx * 0.35,
    y: forehead.y + dy * 0.35,
  };

  // 3D Angles
  // When mirrored, roll angle is flipped horizontally
  const roll = isMirrored ? -face.headPose.roll : face.headPose.roll;
  const rollRad = (roll * Math.PI) / 180;
  const yawRad = (face.headPose.yaw * Math.PI) / 180;
  const pitchRad = (face.headPose.pitch * Math.PI) / 180;

  return {
    headTop,
    forehead,
    eyesCenter,
    leftEye,
    rightEye,
    noseTip,
    mouthCenter,
    leftCheek,
    rightCheek,
    chin,
    eyeDistance,
    faceWidth,
    faceHeight,
    rollRad,
    yawRad,
    pitchRad,
    scale: face.scale,
  };
}

/**
 * Execute canvas operations wrapped in face-relative translation and rotation
 */
export function withFaceTransform(
  ctx: CanvasRenderingContext2D,
  anchor: { x: number; y: number },
  rollRad: number,
  scaleX: number = 1,
  scaleY: number = 1,
  drawFn: () => void
) {
  ctx.save();
  ctx.translate(anchor.x, anchor.y);
  ctx.rotate(rollRad);
  ctx.scale(scaleX, scaleY);
  drawFn();
  ctx.restore();
}

/**
 * Adjusts normalized face keypoints when the source video has been cropped to target aspect ratio
 */
export function adjustFaceForCrop(
  face: TrackedFace,
  sx: number,
  sy: number,
  sWidth: number,
  sHeight: number,
  videoWidth: number,
  videoHeight: number
): TrackedFace {
  const mapPoint = (p: { x: number; y: number; z?: number }) => ({
    x: (p.x * videoWidth - sx) / sWidth,
    y: (p.y * videoHeight - sy) / sHeight,
    z: p.z,
  });

  const newKeypoints = { ...face.keypoints };
  for (const k of Object.keys(newKeypoints) as Array<keyof typeof newKeypoints>) {
    newKeypoints[k] = mapPoint(newKeypoints[k]);
  }

  const newCenter = mapPoint(face.center);
  const newBox = {
    x: (face.box.x * videoWidth - sx) / sWidth,
    y: (face.box.y * videoHeight - sy) / sHeight,
    width: (face.box.width * videoWidth) / sWidth,
    height: (face.box.height * videoHeight) / sHeight,
  };

  return {
    ...face,
    keypoints: newKeypoints,
    center: newCenter,
    box: newBox,
  };
}

