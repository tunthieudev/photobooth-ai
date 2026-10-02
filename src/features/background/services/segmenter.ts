let segmenterInstance: any = null;
let initPromise: Promise<any> | null = null;

const WASM_CDN_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
const MODEL_ASSET_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

export async function getSelfieSegmenter(): Promise<any> {
  if (segmenterInstance) return segmenterInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_CDN_URL);

      let segmenter: any;
      try {
        segmenter = await ImageSegmenter.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputConfidenceMasks: true,
          outputCategoryMask: false,
        });
      } catch (gpuErr) {
        console.warn("GPU delegate not supported for ImageSegmenter, falling back to CPU:", gpuErr);
        segmenter = await ImageSegmenter.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_URL,
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          outputConfidenceMasks: true,
          outputCategoryMask: false,
        });
      }

      segmenterInstance = segmenter;
      return segmenter;
    } catch (err: any) {
      console.error("Failed to initialize MediaPipe ImageSegmenter:", err);
      return null;
    }
  })();

  return initPromise;
}

export interface SegmentationPipelineResult {
  maskCanvas: HTMLCanvasElement;
  hasPerson: boolean;
}

/**
 * High-performance offscreen pipeline for processing segmentation masks
 */
export class BackgroundSegmentationPipeline {
  private offscreenMaskCanvas: HTMLCanvasElement | null = null;
  private offscreenMaskCtx: CanvasRenderingContext2D | null = null;
  private smoothedMaskData: Float32Array | null = null;
  private lastMaskWidth: number = 0;
  private lastMaskHeight: number = 0;
  private isProcessing: boolean = false;
  private lastTimestamp: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      this.offscreenMaskCanvas = document.createElement("canvas");
      this.offscreenMaskCtx = this.offscreenMaskCanvas.getContext("2d", {
        willReadFrequently: true,
      });
    }
  }

  /**
   * Processes a video frame and produces a crisp, feathered binary/alpha mask
   */
  public processVideoFrame(
    video: HTMLVideoElement,
    timestamp: number,
    segmenter: any,
    onResult: (result: SegmentationPipelineResult) => void
  ) {
    if (!segmenter || this.isProcessing || !video || video.readyState < 2) {
      return;
    }

    // Throttle slightly to ensure rock-solid 30-60 FPS without pipeline backlog
    if (timestamp - this.lastTimestamp < 24) {
      return;
    }
    this.lastTimestamp = timestamp;
    this.isProcessing = true;

    try {
      segmenter.segmentForVideo(
        video,
        timestamp,
        (result: any) => {
          try {
            const confidenceMask = result.confidenceMasks?.[0];
            if (!confidenceMask) {
              this.isProcessing = false;
              return;
            }

            const maskWidth = confidenceMask.width;
            const maskHeight = confidenceMask.height;
            const maskFloatArray: Float32Array = confidenceMask.getAsFloat32Array();

            if (!this.offscreenMaskCanvas || !this.offscreenMaskCtx) {
              confidenceMask.close?.();
              this.isProcessing = false;
              return;
            }

            if (
              this.offscreenMaskCanvas.width !== maskWidth ||
              this.offscreenMaskCanvas.height !== maskHeight
            ) {
              this.offscreenMaskCanvas.width = maskWidth;
              this.offscreenMaskCanvas.height = maskHeight;
              this.smoothedMaskData = new Float32Array(maskWidth * maskHeight);
              this.lastMaskWidth = maskWidth;
              this.lastMaskHeight = maskHeight;
            }

            const totalPixels = maskWidth * maskHeight;
            const imgData = this.offscreenMaskCtx.createImageData(maskWidth, maskHeight);
            const data32 = new Uint32Array(imgData.data.buffer);
            const smoothed = this.smoothedMaskData!;

            let personPixelCount = 0;

            // Temporal smoothing with alpha threshold to create razor-sharp edges without noise
            for (let i = 0; i < totalPixels; i++) {
              const rawConfidence = maskFloatArray[i];
              // Exponential moving average: 75% new, 25% previous
              const val = smoothed[i] * 0.25 + rawConfidence * 0.75;
              smoothed[i] = val;

              // Apply smoothstep curve for clean edge transition
              let alpha = 0;
              if (val > 0.6) {
                alpha = 255;
                personPixelCount++;
              } else if (val > 0.25) {
                const norm = (val - 0.25) / 0.35;
                alpha = Math.round(norm * 255);
                personPixelCount++;
              }

              // In little-endian RGBA, 0xAABBGGRR:
              // White pixel with calculated alpha:
              data32[i] = (alpha << 24) | 0x00ffffff;
            }

            this.offscreenMaskCtx.putImageData(imgData, 0, 0);
            confidenceMask.close?.();

            onResult({
              maskCanvas: this.offscreenMaskCanvas,
              hasPerson: personPixelCount > totalPixels * 0.02,
            });
          } catch (e) {
            console.error("Mask callback error:", e);
          } finally {
            this.isProcessing = false;
          }
        }
      );
    } catch {
      // In case segmentForVideo throws on frame drop
      this.isProcessing = false;
    }
  }

  /**
   * Generates a soft portrait silhouette fallback mask when MediaPipe is loading
   */
  public generateFallbackMask(width: number, height: number): HTMLCanvasElement | null {
    if (!this.offscreenMaskCanvas || !this.offscreenMaskCtx) return null;
    this.offscreenMaskCanvas.width = width;
    this.offscreenMaskCanvas.height = height;

    const ctx = this.offscreenMaskCtx;
    ctx.clearRect(0, 0, width, height);

    // Soft portrait head & torso oval gradient
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.55,
      width * 0.15,
      width * 0.5,
      height * 0.55,
      width * 0.45
    );
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.75, "rgba(255, 255, 255, 0.8)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.6, width * 0.38, height * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    return this.offscreenMaskCanvas;
  }
}

export const globalSegmentationPipeline = new BackgroundSegmentationPipeline();
