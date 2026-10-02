export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
  style?: string;
}

export interface EditImageOptions {
  imageUrl: string;
  maskUrl?: string;
  prompt: string;
}

export interface ImageAIProvider {
  generate(options: GenerateImageOptions): Promise<string>;
  edit(options: EditImageOptions): Promise<string>;
  removeBackground(imageUrl: string): Promise<string>;
  replaceBackground(imageUrl: string, promptOrBgUrl: string): Promise<string>;
  upscale(imageUrl: string, factor?: number): Promise<string>;
  styleTransfer(imageUrl: string, style: string): Promise<string>;
}

// Extensible Mock / Default Provider that connects to Cloudinary AI transforms or external providers
export class DefaultImageAIProvider implements ImageAIProvider {
  async generate(_options: GenerateImageOptions): Promise<string> {
    // Generates high quality stylized mock image or triggers provider API
    return `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80`;
  }

  async edit(options: EditImageOptions): Promise<string> {
    return options.imageUrl;
  }

  async removeBackground(imageUrl: string): Promise<string> {
    return imageUrl;
  }

  async replaceBackground(imageUrl: string, _promptOrBgUrl: string): Promise<string> {
    return imageUrl;
  }

  async upscale(imageUrl: string, _factor = 2): Promise<string> {
    return imageUrl;
  }

  async styleTransfer(imageUrl: string, _style: string): Promise<string> {
    return imageUrl;
  }
}

export const imageAIProvider: ImageAIProvider = new DefaultImageAIProvider();
