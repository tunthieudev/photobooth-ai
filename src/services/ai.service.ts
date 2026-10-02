export interface MemeCaptionRequest {
  imageContext?: string;
  userPrompt?: string;
  tone?: "funny" | "gen_z" | "developer" | "office" | "cute" | "sarcastic" | "friendship" | "couple";
  count?: number;
}

export interface MemeCaptionResponse {
  captions: Array<{
    text: string;
    tone: string;
    position?: "top" | "bottom" | "split";
  }>;
}

export interface PromptEnhanceRequest {
  userPrompt: string;
  style?: string;
}

export interface IAIService {
  generateMemeCaptions(request: MemeCaptionRequest): Promise<MemeCaptionResponse>;
  enhancePrompt(request: PromptEnhanceRequest): Promise<string>;
  suggestConcepts(theme?: string): Promise<string[]>;
}

export class DeepSeekService implements IAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || "";
    this.baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  }

  async generateMemeCaptions(request: MemeCaptionRequest): Promise<MemeCaptionResponse> {
    const tone = request.tone || "funny";
    const count = request.count || 3;
    const prompt = `Generate ${count} witty, viral photobooth/meme captions with a "${tone}" tone based on: "${request.userPrompt || "photobooth fun moment"}".
Return valid JSON with the structure: {"captions": [{"text": "...", "tone": "${tone}", "position": "top"}]}`;

    try {
      if (!this.apiKey || this.apiKey.includes("demo")) {
        // High quality fallback presets when running offline/demo
        return {
          captions: [
            { text: "When you said 'just one photo' 3 hours ago", tone, position: "top" },
            { text: "POV: You found the aesthetic photobooth", tone, position: "top" },
            { text: "Living in 4K, thriving in 60FPS ✨", tone, position: "bottom" },
          ],
        };
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an expert viral meme copywriter. Respond strictly in JSON.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content);
    } catch (err: any) {
      console.warn("Falling back to local meme caption generator:", err?.message);
      return {
        captions: [
          { text: "No thoughts, just vibes ♡", tone, position: "top" },
          { text: "Too cute to care ✨", tone, position: "bottom" },
          { text: "Best memories in frame 📸", tone, position: "top" },
        ],
      };
    }
  }

  async enhancePrompt(request: PromptEnhanceRequest): Promise<string> {
    const style = request.style || "korean photobooth aesthetic";
    try {
      if (!this.apiKey || this.apiKey.includes("demo")) {
        return `masterpiece, ultra-detailed ${style}, vibrant colors, 8k resolution, perfect studio lighting: ${request.userPrompt}`;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an expert AI prompt engineer. Output only the enhanced prompt.",
            },
            {
              role: "user",
              content: `Enhance this image generation prompt for ${style}: "${request.userPrompt}"`,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || request.userPrompt;
    } catch {
      return `high aesthetic, perfect lighting, crisp portrait: ${request.userPrompt}`;
    }
  }

  async suggestConcepts(theme = "general"): Promise<string[]> {
    return [
      `Korean 90s Vintage Film in ${theme}`,
      `Cyberpunk Neon Tokyo Booth`,
      `Cute Pastel Fairy Purikura`,
      `Classic Black & White Editorial`,
      `Y2K Silver Hologram Party`,
    ];
  }
}

export const aiService = new DeepSeekService();
