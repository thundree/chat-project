/**
 * Utility functions for API key validation and management
 */

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
 * Mask API key for display (show first 8 and last 4 characters)
 */
export const maskApiKey = (key: string): string => {
  if (!key || key.length < 12) return "***";
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
};

/**
 * Get provider display name
 */
export const getProviderDisplayName = (
  provider: "openai" | "google"
): string => {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "google":
      return "Google AI";
    default:
      return provider;
  }
};

/**
 * Get API key documentation URL
 */
export const getApiKeyDocUrl = (provider: "openai" | "google"): string => {
  switch (provider) {
    case "openai":
      return "https://platform.openai.com/api-keys";
    case "google":
      return "https://aistudio.google.com/app/apikey";
    default:
      return "#";
  }
};
