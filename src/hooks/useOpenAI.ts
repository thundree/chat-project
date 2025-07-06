import { useState, useCallback } from "react";
import type { Chat, Message } from "@/types";
import {
  getChatCompletion,
  getStreamingChatCompletion,
  createMessageFromResponse,
  validateApiKey,
} from "@/services/openaiService";

export interface UseOpenAIOptions {
  model?: string;
  maxTokens?: number;
  enableStreaming?: boolean;
}

export interface UseOpenAIReturn {
  isLoading: boolean;
  error: string | null;
  generateResponse: (
    chat: Chat,
    options?: UseOpenAIOptions
  ) => Promise<Message | null>;
  generateStreamingResponse: (
    chat: Chat,
    onChunk: (chunk: string) => void,
    options?: UseOpenAIOptions
  ) => Promise<Message | null>;
  validateConnection: () => Promise<boolean>;
  clearError: () => void;
}

export const useOpenAI = (): UseOpenAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateResponse = useCallback(
    async (
      chat: Chat,
      options: UseOpenAIOptions = {}
    ): Promise<Message | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const { model = "", maxTokens = 1000 } = options;

        const response = await getChatCompletion(chat, model, maxTokens);
        const message = createMessageFromResponse(response, "character");

        return message;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate response";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const generateStreamingResponse = useCallback(
    async (
      chat: Chat,
      onChunk: (chunk: string) => void,
      options: UseOpenAIOptions = {}
    ): Promise<Message | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const { model = "", maxTokens = 1000 } = options;

        const response = await getStreamingChatCompletion(
          chat,
          model,
          maxTokens,
          onChunk
        );

        const message = createMessageFromResponse(response, "character");

        return message;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to generate streaming response";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const validateConnection = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      return await validateApiKey();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to validate API connection";
      setError(errorMessage);
      return false;
    }
  }, []);

  return {
    isLoading,
    error,
    generateResponse,
    generateStreamingResponse,
    validateConnection,
    clearError,
  };
};
