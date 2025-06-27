import { useState, useCallback } from "react";
import type { Chat, Message } from "@/types";
import { UnifiedAIService, type AIProvider } from "@/services/aiService";

export interface UseAIOptions {
  model?: string;
  maxTokens?: number;
  enableStreaming?: boolean;
}

export interface UseAIReturn {
  isLoading: boolean;
  error: string | null;
  currentProvider: AIProvider;
  generateResponse: (
    chat: Chat,
    options?: UseAIOptions
  ) => Promise<Message | null>;
  generateStreamingResponse: (
    chat: Chat,
    onChunk: (chunk: string) => void,
    options?: UseAIOptions
  ) => Promise<Message | null>;
  validateConnection: () => Promise<boolean>;
  getAvailableModels: () => Promise<string[]>;
  switchProvider: (provider: AIProvider) => void;
  getProviderDisplayName: () => string;
  getDefaultModel: () => string;
  clearError: () => void;
  hasApiKey: () => Promise<boolean>;
}

export const useAI = (initialProvider: AIProvider = "openai"): UseAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiService] = useState(() => new UnifiedAIService(initialProvider));

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateResponse = useCallback(
    async (chat: Chat, options: UseAIOptions = {}): Promise<Message | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const { model = aiService.getDefaultModel(), maxTokens = 1000 } =
          options;

        const response = await aiService.getChatCompletion(chat, {
          model,
          maxTokens,
        });

        const message = aiService.createMessageFromResponse(response);
        return message;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  const generateStreamingResponse = useCallback(
    async (
      chat: Chat,
      onChunk: (chunk: string) => void,
      options: UseAIOptions = {}
    ): Promise<Message | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const { model = aiService.getDefaultModel(), maxTokens = 1000 } =
          options;

        const response = await aiService.getStreamingChatCompletion(
          chat,
          onChunk,
          {
            model,
            maxTokens,
          }
        );

        const message = aiService.createMessageFromResponse(response);
        return message;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  const validateConnection = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      return await aiService.validateApiKey();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection validation failed";
      setError(errorMessage);
      return false;
    }
  }, [aiService]);

  const getAvailableModels = useCallback(async (): Promise<string[]> => {
    try {
      setError(null);
      return await aiService.getAvailableModels();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch models";
      setError(errorMessage);
      return [];
    }
  }, [aiService]);

  const switchProvider = useCallback(
    (provider: AIProvider) => {
      aiService.setProvider(provider);
      clearError();
    },
    [aiService, clearError]
  );

  const getProviderDisplayName = useCallback(() => {
    return aiService.getProviderDisplayName();
  }, [aiService]);

  const hasApiKey = useCallback(async (): Promise<boolean> => {
    try {
      return await aiService.hasApiKey();
    } catch {
      return false;
    }
  }, [aiService]);

  const getDefaultModel = useCallback(() => {
    return aiService.getDefaultModel();
  }, [aiService]);

  return {
    isLoading,
    error,
    currentProvider: aiService.getProvider(),
    generateResponse,
    generateStreamingResponse,
    validateConnection,
    getAvailableModels,
    switchProvider,
    getProviderDisplayName,
    getDefaultModel,
    clearError,
    hasApiKey,
  };
};
