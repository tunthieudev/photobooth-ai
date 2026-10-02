import mongoose, { Schema, Model } from "mongoose";
import {
  IUser,
  IAsset,
  IPhoto,
  ITemplate,
  IFilter,
  IEffect,
  IFrame,
  ISticker,
  IAIJob,
  IAIGeneration,
  IEvent,
  ICreditTransaction,
} from "@/types";

// User Schema
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ["user", "creator", "admin"], default: "user" },
    plan: { type: String, enum: ["free", "pro", "event"], default: "free" },
    credits: { type: Number, default: 20 },
  },
  { timestamps: true }
);

// Asset Schema
const AssetSchema = new Schema<IAsset>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["frame", "sticker", "effect", "background", "filter_lut", "sound"],
      required: true,
      index: true,
    },
    category: { type: String, required: true, index: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnailUrl: { type: String },
    tags: [{ type: String }],
    isPremium: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Photo Schema
const PhotoSchema = new Schema<IPhoto>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", index: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    layoutSlug: { type: String },
    filterApplied: { type: String },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Template Schema
const TemplateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    previewUrl: { type: String, required: true },
    layout: { type: Schema.Types.Mixed, required: true },
    frameUrl: { type: String },
    defaultFilter: { type: String },
    stickers: [
      {
        assetId: String,
        url: String,
        x: Number,
        y: Number,
        scale: Number,
        rotation: Number,
      },
    ],
    background: { type: String },
    isPremium: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Filter Schema
const FilterSchema = new Schema<IFilter>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true, index: true },
    thumbnailUrl: { type: String },
    cssFilter: { type: String },
    webglShader: { type: String },
    settings: { type: Schema.Types.Mixed, default: {} },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Effect Schema
const EffectSchema = new Schema<IEffect>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true, index: true },
    thumbnailUrl: { type: String, required: true },
    tracking: { type: String, enum: ["face", "segmentation", "particles", "screen"], required: true },
    maxFaces: { type: Number, default: 5 },
    assets: [
      {
        anchor: {
          type: String,
          enum: ["forehead", "leftEye", "rightEye", "nose", "mouth", "leftCheek", "rightCheek", "chin"],
        },
        url: String,
        offsetX: Number,
        offsetY: Number,
        scale: Number,
        rotation: Number,
        opacity: Number,
      },
    ],
    triggers: { type: Schema.Types.Mixed },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Frame Schema
const FrameSchema = new Schema<IFrame>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    aspectRatio: { type: String, default: "4:3" },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Sticker Schema
const StickerSchema = new Schema<ISticker>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    isAnimated: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// AI Job Schema
const AIJobSchema = new Schema<IAIJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    tool: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      index: true,
    },
    inputParams: { type: Schema.Types.Mixed, required: true },
    resultUrl: { type: String },
    resultData: { type: Schema.Types.Mixed },
    error: { type: String },
    creditsCost: { type: Number, default: 1 },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// AI Generation Schema
const AIGenerationSchema = new Schema<IAIGeneration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "AIJob", required: true },
    prompt: { type: String },
    style: { type: String },
    inputImageUrl: { type: String },
    outputImageUrl: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Event Schema
const EventSchema = new Schema<IEvent>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    logoUrl: { type: String },
    brandColor: { type: String, default: "#F43F5E" },
    frameId: { type: Schema.Types.ObjectId, ref: "Frame" },
    templateId: { type: Schema.Types.ObjectId, ref: "Template" },
    hashtag: { type: String },
    bannerUrl: { type: String },
    qrCodeUrl: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isKioskModeEnabled: { type: Boolean, default: false },
    photoCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Credit Transaction Schema
const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["purchase", "usage", "refund", "bonus"], required: true },
    description: { type: String, required: true },
    referenceId: { type: String },
  },
  { timestamps: true }
);

// Project Schema (for custom work-in-progress booth sessions / purikura canvas)
export interface IProject {
  _id?: string;
  userId?: string;
  title: string;
  state: Record<string, any>;
  previewUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String, default: "Untitled Booth Project" },
    state: { type: Schema.Types.Mixed, required: true },
    previewUrl: { type: String },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
export const Photo: Model<IPhoto> = mongoose.models.Photo || mongoose.model<IPhoto>("Photo", PhotoSchema);
export const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema);
export const Filter: Model<IFilter> = mongoose.models.Filter || mongoose.model<IFilter>("Filter", FilterSchema);
export const Effect: Model<IEffect> = mongoose.models.Effect || mongoose.model<IEffect>("Effect", EffectSchema);
export const Frame: Model<IFrame> = mongoose.models.Frame || mongoose.model<IFrame>("Frame", FrameSchema);
export const Sticker: Model<ISticker> = mongoose.models.Sticker || mongoose.model<ISticker>("Sticker", StickerSchema);
export const AIJob: Model<IAIJob> = mongoose.models.AIJob || mongoose.model<IAIJob>("AIJob", AIJobSchema);
export const AIGeneration: Model<IAIGeneration> = mongoose.models.AIGeneration || mongoose.model<IAIGeneration>("AIGeneration", AIGenerationSchema);
export const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export const CreditTransaction: Model<ICreditTransaction> = mongoose.models.CreditTransaction || mongoose.model<ICreditTransaction>("CreditTransaction", CreditTransactionSchema);
export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
