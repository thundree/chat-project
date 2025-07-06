import type { Chat, Message, SenderType } from "@/types";

// OpenAI Service
import * as OpenAIService from "./openaiService";

// Google AI Service
import * as GoogleAIService from "./googleAIService";

// Ollama Service
import * as OllamaService from "./ollamaService";

// OpenRouter Service
import * as OpenRouterService from "./openrouterService";

import {
  GOOGLE_AI_API_KEY_INDEX,
  OPEN_AI_API_KEY_INDEX,
  OLLAMA_API_KEY_INDEX,
  OPENROUTER_API_KEY_INDEX,
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
      case OLLAMA_API_KEY_INDEX:
        return OllamaService.getChatCompletion(chat, model, maxTokens);
      case OPENROUTER_API_KEY_INDEX:
        return OpenRouterService.getChatCompletion(chat, model, maxTokens);
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
      case OLLAMA_API_KEY_INDEX:
        return OllamaService.getStreamingChatCompletion(
          chat,
          model,
          maxTokens,
          onChunk
        );
      case OPENROUTER_API_KEY_INDEX:
        return OpenRouterService.getStreamingChatCompletion(
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
      case OLLAMA_API_KEY_INDEX:
        return OllamaService.validateApiKey();
      case OPENROUTER_API_KEY_INDEX:
        return OpenRouterService.validateApiKey();
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
      case OLLAMA_API_KEY_INDEX:
        return OllamaService.hasApiKey();
      case OPENROUTER_API_KEY_INDEX:
        return OpenRouterService.hasApiKey();
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
      case OLLAMA_API_KEY_INDEX:
        return OllamaService.getAvailableModels();
      case OPENROUTER_API_KEY_INDEX:
        return OpenRouterService.getAvailableModels();
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
      case OLLAMA_API_KEY_INDEX:
        return OllamaService.createMessageFromResponse(response, sender);
      case OPENROUTER_API_KEY_INDEX:
        return OpenRouterService.createMessageFromResponse(response, sender);
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
        return "";
      case GOOGLE_AI_API_KEY_INDEX:
        return "";
      case OLLAMA_API_KEY_INDEX:
        // For Ollama, we should try to get the first available model
        // This is a fallback if no models are available yet
        return "";
      case OPENROUTER_API_KEY_INDEX:
        return "";
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Get default model for the current provider, preferring first available model for Ollama
   */
  async getDefaultModelAsync(): Promise<string> {
    switch (this.provider) {
      case OPEN_AI_API_KEY_INDEX:
        return "";
      case GOOGLE_AI_API_KEY_INDEX:
        return "";
      case OLLAMA_API_KEY_INDEX:
      case OPENROUTER_API_KEY_INDEX:
        try {
          const availableModels = await this.getAvailableModels();
          return availableModels.length > 0 ? availableModels[0] : "";
        } catch {
          return "";
        }

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
      case OLLAMA_API_KEY_INDEX: {
        const info = OllamaService.getModelInfo(modelId);
        return {
          ...info,
          provider: OLLAMA_API_KEY_INDEX,
        };
      }
      case OPENROUTER_API_KEY_INDEX: {
        const info = OpenRouterService.getModelInfo(modelId);
        return {
          ...info,
          provider: OPENROUTER_API_KEY_INDEX,
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
      case OLLAMA_API_KEY_INDEX:
        return "Ollama (Local)";
      case OPENROUTER_API_KEY_INDEX:
        return "OpenRouter (Multi-Provider)";
      default:
        return this.provider;
    }
  }
}

// Create default instances for easy importing
export const openAIService = new UnifiedAIService(OPEN_AI_API_KEY_INDEX);
export const googleAIService = new UnifiedAIService(GOOGLE_AI_API_KEY_INDEX);
export const ollamaService = new UnifiedAIService(OLLAMA_API_KEY_INDEX);
export const openRouterService = new UnifiedAIService(OPENROUTER_API_KEY_INDEX);

// Export individual services for direct access if needed
export { OpenAIService, GoogleAIService, OllamaService, OpenRouterService };

// Export a factory function to create configured services
export const createAIService = (provider: AIProvider): UnifiedAIService => {
  return new UnifiedAIService(provider);
};

// Default export is OpenAI for backward compatibility
export default openAIService;
