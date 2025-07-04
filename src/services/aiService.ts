import type { Chat, Message, SenderType } from "@/types";

// OpenAI Service
import * as OpenAIService from "./openaiService";

// Google AI Service
import * as GoogleAIService from "./googleAIService";
import {
  GOOGLE_AI_API_KEY_INDEX,
  OPEN_AI_API_KEY_INDEX,
  type AIProvider,
} from "@/constants";

export interface AIServiceConfig {
  provider: AIProvider;
  model: string;
  maxTokens?: number;
}

export interface AIMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
}

/**
 * Unified AI service that can work with multiple providers
 */
export class UnifiedAIService {
  private provider: AIProvider;

  constructor(provider: AIProvider = OPEN_AI_API_KEY_INDEX) {
    this.provider = provider;
  }

  /**
   * Get chat completion from the configured AI provider
   */
  async getChatCompletion(
    chat: Chat,
    config: Omit<AIServiceConfig, "provider">
  ): Promise<string> {
    const { model, maxTokens = 1000 } = config;

    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return OpenAIService.getChatCompletion(chat, model, maxTokens);
      case GOOGLE_AI_API_KEY_INDEX:
        return GoogleAIService.getChatCompletion(chat, model, maxTokens);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Get streaming chat completion from the configured AI provider
   */
  async getStreamingChatCompletion(
    chat: Chat,
    onChunk: (chunk: string) => void,
    config: Omit<AIServiceConfig, "provider">
  ): Promise<string> {
    const { model, maxTokens = 1000 } = config;

    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return OpenAIService.getStreamingChatCompletion(
          chat,
          model,
          maxTokens,
          onChunk
        );
      case GOOGLE_AI_API_KEY_INDEX:
        return GoogleAIService.getStreamingChatCompletion(
          chat,
          model,
          maxTokens,
          onChunk
        );
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Validate API key for the configured provider
   */
  async validateApiKey(): Promise<boolean> {
    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return OpenAIService.validateApiKey();
      case GOOGLE_AI_API_KEY_INDEX:
        return GoogleAIService.validateApiKey();
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Check if API key exists for the configured provider (without making API calls)
   */
  async hasApiKey(): Promise<boolean> {
    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return OpenAIService.hasApiKey();
      case GOOGLE_AI_API_KEY_INDEX:
        return GoogleAIService.hasApiKey();
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Get available models for the configured provider
   */
  async getAvailableModels(): Promise<string[]> {
    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return OpenAIService.getAvailableModels();
      case GOOGLE_AI_API_KEY_INDEX:
        return GoogleAIService.getAvailableModels();
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Create a message from AI response
   */
  createMessageFromResponse(
    response: string,
    sender: SenderType = "character"
  ): Message {
    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return OpenAIService.createMessageFromResponse(response, sender);
      case GOOGLE_AI_API_KEY_INDEX:
        return GoogleAIService.createMessageFromResponse(response, sender);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Get the current provider
   */
  getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * Switch to a different AI provider
   */
  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  /**
   * Get default model for the current provider
   */
  getDefaultModel(): string {
    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return "gpt-3.5-turbo";
      case GOOGLE_AI_API_KEY_INDEX:
        return "gemini-1.5-flash";
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Get model information including tier and description
   */
  getModelInfo(modelId: string): {
    name: string;
    tier: "free" | "pro" | "premium";
    description: string;
    provider: AIProvider;
  } {
    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX: {
        // OpenAI doesn't have a getModelInfo function, so we'll create basic info
        const isGPT4 = modelId.includes("gpt-4");
        return {
          name: modelId,
          tier: isGPT4 ? "premium" : "pro",
          description: isGPT4 ? "Advanced GPT-4 model" : "Standard GPT model",
          provider: OPEN_AI_API_KEY_INDEX,
        };
      }
      case GOOGLE_AI_API_KEY_INDEX: {
        const info = GoogleAIService.getModelInfo(modelId);
        return {
          ...info,
          provider: GOOGLE_AI_API_KEY_INDEX,
        };
      }
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(): string {
    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return "OpenAI (GPT)";
      case GOOGLE_AI_API_KEY_INDEX:
        return "Google AI (Gemini)";
      default:
        return this.provider;
    }
  }
}

// Create default instances for easy importing
export const openAIService = new UnifiedAIService(OPEN_AI_API_KEY_INDEX);
export const googleAIService = new UnifiedAIService(GOOGLE_AI_API_KEY_INDEX);

// Export individual services for direct access if needed
export { OpenAIService, GoogleAIService };

// Export a factory function to create configured services
export const createAIService = (provider: AIProvider): UnifiedAIService => {
  return new UnifiedAIService(provider);
};

// Default export is OpenAI for backward compatibility
export default openAIService;
