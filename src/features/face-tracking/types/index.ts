export interface FaceLandmarkPoint {
  x: number; // Normalized 0..1 (from left to right)
  y: number; // Normalized 0..1 (from top to bottom)
  z?: number; // Normalized depth
}

export interface BoundingBox {
  x: number; // Normalized 0..1
  y: number;
  width: number;
  height: number;
}

export interface HeadPose {
  pitch: number; // Degrees: look up (-) / look down (+)
  yaw: number;   // Degrees: turn left (-) / turn right (+)
  roll: number;  // Degrees: tilt left (-) / tilt right (+)
}

export interface FaceExpressions {
  blinkLeft: number;      // 0..1
  blinkRight: number;     // 0..1
  isWinkLeft: boolean;    // Left closed, right open
  isWinkRight: boolean;   // Right closed, left open
  isBlinking: boolean;    // Both closed
  smile: number;          // 0..1
  isSmiling: boolean;     // Threshold > 0.45
  mouthOpen: number;      // 0..1
  isMouthOpen: boolean;   // Threshold > 0.35
  browInnerUp: number;    // 0..1
  browDownLeft: number;   // 0..1
  browDownRight: number;  // 0..1
}

export interface FaceKeypoints {
  // Eyes
  leftEye: FaceLandmarkPoint;
  rightEye: FaceLandmarkPoint;
  leftEyeOuter: FaceLandmarkPoint;
  rightEyeOuter: FaceLandmarkPoint;
  // Nose
  noseTip: FaceLandmarkPoint;
  noseBridge: FaceLandmarkPoint;
  // Mouth
  mouthCenter: FaceLandmarkPoint;
  upperLip: FaceLandmarkPoint;
  lowerLip: FaceLandmarkPoint;
  leftMouthCorner: FaceLandmarkPoint;
  rightMouthCorner: FaceLandmarkPoint;
  // Head & Contour
  forehead: FaceLandmarkPoint;
  chin: FaceLandmarkPoint;
  leftCheek: FaceLandmarkPoint;
  rightCheek: FaceLandmarkPoint;
  leftEarTragus: FaceLandmarkPoint;
  rightEarTragus: FaceLandmarkPoint;
}

export interface TrackedFace {
  id: number;
  box: BoundingBox;
  center: { x: number; y: number };
  scale: number;
  headPose: HeadPose;
  expressions: FaceExpressions;
  keypoints: FaceKeypoints;
  rawLandmarks: FaceLandmarkPoint[];
}

export type FaceTrackingStatus =
  | "uninitialized"
  | "loading"
  | "ready"
  | "error"
  | "disabled";
