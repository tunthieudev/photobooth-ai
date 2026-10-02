import {
  TrackedFace,
  FaceLandmarkPoint,
  FaceExpressions,
  FaceKeypoints,
  BoundingBox,
  HeadPose,
} from "../types";

// Dynamic holder for MediaPipe FaceLandmarker instance
let landmarkerInstance: any = null;
let initPromise: Promise<any> | null = null;

// CDN assets for MediaPipe tasks-vision WASM & Model
const WASM_CDN_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
const MODEL_ASSET_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/**
 * Initializes and caches the MediaPipe Face Landmarker singleton
 */
export async function getFaceLandmarker(maxFaces: number = 5): Promise<any> {
  if (landmarkerInstance) return landmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Dynamic import to prevent SSR breakages in Next.js
      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");

      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_CDN_URL);

      // Attempt GPU delegate first, gracefully degrade to CPU if GPU is unsupported
      let landmarker: any;
      try {
        landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_URL,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: maxFaces,
        });
      } catch (gpuError) {
        console.warn("MediaPipe GPU delegate unavailable, falling back to CPU:", gpuError);
        landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_URL,
            delegate: "CPU",
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: maxFaces,
        });
      }

      landmarkerInstance = landmarker;
      return landmarker;
    } catch (err) {
      console.error("Failed to initialize MediaPipe FaceLandmarker:", err);
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Parses raw MediaPipe results into rich TrackedFace structures
 */
export function processFaceLandmarks(
  faceLandmarkerResult: any,
  _videoWidth?: number,
  _videoHeight?: number
): TrackedFace[] {
  if (!faceLandmarkerResult || !faceLandmarkerResult.faceLandmarks) {
    return [];
  }

  const { faceLandmarks, faceBlendshapes } = faceLandmarkerResult;
  const trackedFaces: TrackedFace[] = [];

  for (let i = 0; i < faceLandmarks.length; i++) {
    const raw: FaceLandmarkPoint[] = faceLandmarks[i];
    if (!raw || raw.length === 0) continue;

    // 1. Calculate Bounding Box
    let minX = 1,
      maxX = 0,
      minY = 1,
      maxY = 0;
    for (const pt of raw) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }

    // Add 10% safety padding around face box
    const padX = (maxX - minX) * 0.1;
    const padY = (maxY - minY) * 0.1;
    const box: BoundingBox = {
      x: Math.max(0, minX - padX),
      y: Math.max(0, minY - padY),
      width: Math.min(1, maxX - minX + padX * 2),
      height: Math.min(1, maxY - minY + padY * 2),
    };

    // 2. Extract Keypoints by Landmark Indices
    const getPt = (idx: number): FaceLandmarkPoint => raw[idx] || { x: 0.5, y: 0.5, z: 0 };

    const keypoints: FaceKeypoints = {
      leftEye: getPt(468) || getPt(159),
      rightEye: getPt(473) || getPt(386),
      leftEyeOuter: getPt(33),
      rightEyeOuter: getPt(263),
      noseTip: getPt(1),
      noseBridge: getPt(168),
      mouthCenter: getPt(13),
      upperLip: getPt(0),
      lowerLip: getPt(17),
      leftMouthCorner: getPt(61),
      rightMouthCorner: getPt(291),
      forehead: getPt(10),
      chin: getPt(152),
      leftCheek: getPt(234),
      rightCheek: getPt(454),
      leftEarTragus: getPt(127),
      rightEarTragus: getPt(356),
    };

    // 3. Compute Head Pose (Pitch, Yaw, Roll)
    const headPose = computeHeadPose(keypoints, raw);

    // 4. Extract Expressions (Blendshapes or Geometric Fallback)
    const blendshapeScores = faceBlendshapes?.[i]?.categories;
    const expressions = computeExpressions(blendshapeScores, keypoints);

    // 5. Face Scale & Center
    const center = {
      x: (box.x + box.width / 2),
      y: (box.y + box.height / 2),
    };
    const scale = Math.sqrt(box.width * box.width + box.height * box.height);

    trackedFaces.push({
      id: i + 1,
      box,
      center,
      scale,
      headPose,
      expressions,
      keypoints,
      rawLandmarks: raw,
    });
  }

  return trackedFaces;
}

/**
 * Calculates 3D Head Pose rotation angles in degrees (Pitch, Yaw, Roll)
 */
function computeHeadPose(kp: FaceKeypoints, _raw?: FaceLandmarkPoint[]): HeadPose {
  // Roll: 2D angle between eyes
  const dX = kp.rightEye.x - kp.leftEye.x;
  const dY = kp.rightEye.y - kp.leftEye.y;
  const roll = Math.atan2(dY, dX) * (180 / Math.PI);

  // Yaw: Horizontal turn angle based on nose position relative to cheeks
  const cheekDist = Math.max(0.001, kp.rightCheek.x - kp.leftCheek.x);
  const noseOffset = (kp.noseTip.x - kp.leftCheek.x) / cheekDist; // 0.5 is centered
  const yaw = (noseOffset - 0.5) * 120; // Approx degrees: -60 (turn left) to +60 (turn right)

  // Pitch: Vertical tilt angle based on nose bridge vs chin distance
  const faceHeight = Math.max(0.001, kp.chin.y - kp.forehead.y);
  const noseYOffset = (kp.noseTip.y - kp.forehead.y) / faceHeight; // Approx 0.6 is centered
  const pitch = (noseYOffset - 0.6) * 100; // Look up (-) or look down (+)

  return {
    pitch: Math.round(pitch * 10) / 10,
    yaw: Math.round(yaw * 10) / 10,
    roll: Math.round(roll * 10) / 10,
  };
}

/**
 * Extracts facial expressions (blink, wink, smile, mouth open) from blendshapes or geometry
 */
function computeExpressions(blendshapes: any[] | undefined, kp: FaceKeypoints): FaceExpressions {
  let blinkLeft = 0;
  let blinkRight = 0;
  let smile = 0;
  let mouthOpen = 0;
  let browInnerUp = 0;
  let browDownLeft = 0;
  let browDownRight = 0;

  if (blendshapes && blendshapes.length > 0) {
    for (const b of blendshapes) {
      if (b.categoryName === "eyeBlinkLeft") blinkLeft = b.score;
      if (b.categoryName === "eyeBlinkRight") blinkRight = b.score;
      if (b.categoryName === "mouthSmileLeft" || b.categoryName === "mouthSmileRight") {
        smile = Math.max(smile, b.score);
      }
      if (b.categoryName === "jawOpen") mouthOpen = b.score;
      if (b.categoryName === "browInnerUp") browInnerUp = b.score;
      if (b.categoryName === "browDownLeft") browDownLeft = b.score;
      if (b.categoryName === "browDownRight") browDownRight = b.score;
    }
  } else {
    // Geometric fallback estimation if blendshapes are not returned
    const eyeDist = Math.max(0.001, Math.hypot(kp.rightEye.x - kp.leftEye.x, kp.rightEye.y - kp.leftEye.y));
    const mouthHeight = Math.abs(kp.lowerLip.y - kp.upperLip.y);
    const mouthWidth = Math.max(0.001, Math.hypot(kp.rightMouthCorner.x - kp.leftMouthCorner.x, kp.rightMouthCorner.y - kp.leftMouthCorner.y));

    mouthOpen = Math.min(1, (mouthHeight / eyeDist) * 3);
    smile = Math.min(1, Math.max(0, (mouthWidth / eyeDist - 0.7) * 2));
  }

  const isBlinking = blinkLeft > 0.5 && blinkRight > 0.5;
  const isWinkLeft = blinkLeft > 0.5 && blinkRight < 0.3;
  const isWinkRight = blinkRight > 0.5 && blinkLeft < 0.3;
  const isSmiling = smile > 0.45;
  const isMouthOpen = mouthOpen > 0.35;

  return {
    blinkLeft: Math.round(blinkLeft * 100) / 100,
    blinkRight: Math.round(blinkRight * 100) / 100,
    isWinkLeft,
    isWinkRight,
    isBlinking,
    smile: Math.round(smile * 100) / 100,
    isSmiling,
    mouthOpen: Math.round(mouthOpen * 100) / 100,
    isMouthOpen,
    browInnerUp: Math.round(browInnerUp * 100) / 100,
    browDownLeft: Math.round(browDownLeft * 100) / 100,
    browDownRight: Math.round(browDownRight * 100) / 100,
  };
}

/**
 * Clean up landmarker instance when unmounting
 */
export function disposeFaceLandmarker(): void {
  if (landmarkerInstance) {
    try {
      landmarkerInstance.close();
    } catch {}
    landmarkerInstance = null;
  }
}
