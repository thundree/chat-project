import type { Chat, Message, SenderType } from "@/types";

// OpenAI Service
import * as OpenAIService from "./openaiService";

// Google AI Service
import * as GoogleAIService from "./googleAIService";

export type AIProvider = "openai" | "google-ai";

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

  constructor(provider: AIProvider = "openai") {
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
      case "openai":
        return OpenAIService.getChatCompletion(chat, model, maxTokens);
      case "google-ai":
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
      case "openai":
        return OpenAIService.getStreamingChatCompletion(
          chat,
          model,
          maxTokens,
          onChunk
        );
      case "google-ai":
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
      case "openai":
        return OpenAIService.validateApiKey();
      case "google-ai":
        return GoogleAIService.validateApiKey();
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Get available models for the configured provider
   */
  async getAvailableModels(): Promise<string[]> {
    switch (this.provider) {
      case "openai":
        return OpenAIService.getAvailableModels();
      case "google-ai":
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
      case "openai":
        return OpenAIService.createMessageFromResponse(response, sender);
      case "google-ai":
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
      case "openai":
        return "gpt-3.5-turbo";
      case "google-ai":
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
      case "openai": {
        // OpenAI doesn't have a getModelInfo function, so we'll create basic info
        const isGPT4 = modelId.includes("gpt-4");
        return {
          name: modelId,
          tier: isGPT4 ? "premium" : "pro",
          description: isGPT4 ? "Advanced GPT-4 model" : "Standard GPT model",
          provider: "openai",
        };
      }
      case "google-ai": {
        const info = GoogleAIService.getModelInfo(modelId);
        return {
          ...info,
          provider: "google-ai",
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
      case "openai":
        return "OpenAI";
      case "google-ai":
        return "Google AI (Gemini)";
      default:
        return this.provider;
    }
  }
}

// Create default instances for easy importing
export const openAIService = new UnifiedAIService("openai");
export const googleAIService = new UnifiedAIService("google-ai");

// Export individual services for direct access if needed
export { OpenAIService, GoogleAIService };

// Export a factory function to create configured services
export const createAIService = (provider: AIProvider): UnifiedAIService => {
  return new UnifiedAIService(provider);
};

// Default export is OpenAI for backward compatibility
export default openAIService;
