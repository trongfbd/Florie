import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Thin wrapper around the Gemini SDK. Mirrors the Google Sign-In pattern from
 * Sprint 7: absent config degrades to a clear 503, never a crash, so the rest
 * of the app works normally with AI features simply turned off.
 */
@Injectable()
export class GeminiService {
  private readonly client: GoogleGenerativeAI | null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException('Tính năng AI chưa được cấu hình trên máy chủ');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch {
      throw new ServiceUnavailableException('Không thể kết nối tới dịch vụ AI, vui lòng thử lại sau');
    }
  }
}
