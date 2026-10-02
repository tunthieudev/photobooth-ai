export interface CameraSettings {
  deviceId?: string;
  facingMode: "user" | "environment";
  aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
  isMirrored: boolean;
  resolution: {
    width: number;
    height: number;
  };
}
