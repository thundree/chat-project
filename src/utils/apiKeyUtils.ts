/**
 * Utility functions for API key validation and management
 */

import {
  OLLAMA_API_KEY_INDEX,
  OPEN_AI_API_KEY_INDEX,
  GOOGLE_AI_API_KEY_INDEX,
  type AIProvider,
} from "@/constants";

/**
 * Validate OpenAI API key format
 */
export const validateOpenAIKey = (key: string): boolean => {
  if (!key || typeof key !== "string") return false;
  // OpenAI keys start with "sk-" and are typically 51 characters long
  return key.startsWith("sk-") && key.length >= 40;
};

/**
 * Validate Google AI API key format
 */
export const validateGoogleAIKey = (key: string): boolean => {
  if (!key || typeof key !== "string") return false;
  // Google AI keys typically start with "AI" and are 39+ characters long
  return key.startsWith("AI") && key.length >= 35;
};

/**
 * Validate Ollama base URL format
 * For Ollama, we store the base URL instead of an API key
 */
export const validateOllamaBaseUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;

  // Basic URL validation
  try {
    const urlObj = new URL(url);
    // Should be http or https protocol
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Validate API key/config for the given provider
 */
export const validateApiKeyForProvider = (
  key: string,
  provider: AIProvider
): boolean => {
  switch (provider) {
    case OPEN_AI_API_KEY_INDEX:
      return validateOpenAIKey(key);
    case GOOGLE_AI_API_KEY_INDEX:
      return validateGoogleAIKey(key);
    case OLLAMA_API_KEY_INDEX:
      return validateOllamaBaseUrl(key);
    default:
      return false;
  }
};

/**
 * Mask API key for display (show first 8 and last 4 characters)
 */
export const maskApiKey = (key: string): string => {
  if (!key || key.length < 12) return "***";
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
};

/**
 * Get provider display name
 */
export const getProviderDisplayName = (provider: AIProvider): string => {
  switch (provider) {
    case OPEN_AI_API_KEY_INDEX:
      return "OpenAI";
    case GOOGLE_AI_API_KEY_INDEX:
      return "Google AI";
    case OLLAMA_API_KEY_INDEX:
      return "Ollama";
    default:
      return provider;
  }
};

/**
 * Get API key documentation URL
 */
export const getApiKeyDocUrl = (provider: AIProvider): string => {
  switch (provider) {
    case OPEN_AI_API_KEY_INDEX:
      return "https://platform.openai.com/api-keys";
    case GOOGLE_AI_API_KEY_INDEX:
      return "https://aistudio.google.com/app/apikey";
    case OLLAMA_API_KEY_INDEX:
      return "https://ollama.readthedocs.io/en/installation/";
    default:
      return "#";
  }
};
