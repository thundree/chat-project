import type { Chat, Message, SenderType } from "@/types";
import { httpClient } from "@/utils/httpClient";
import DatabaseService from "./databaseService";
import { OPENROUTER_API_KEY_INDEX } from "@/constants";

// OpenRouter API configuration
let OPENROUTER_API_KEY: string | null = null;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Function to get API key from database
const getApiKey = async (): Promise<string | null> => {
  OPENROUTER_API_KEY ??= await DatabaseService.getActiveApiKey(
    OPENROUTER_API_KEY_INDEX
  );
  return OPENROUTER_API_KEY;
};

// Function to refresh API key from database
export const refreshApiKey = async (): Promise<void> => {
  OPENROUTER_API_KEY = await DatabaseService.getActiveApiKey(
    OPENROUTER_API_KEY_INDEX
  );
};

// Types for OpenRouter API (similar to OpenAI but with some extensions)
export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterCompletionRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  // OpenRouter-specific options
  transforms?: string[];
  models?: string[];
  route?: "fallback";
  provider?: {
    allow_fallbacks?: boolean;
    require_parameters?: boolean;
    data_collection?: "deny" | "allow";
  };
}

export interface OpenRouterCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description?: string;
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

/**
 * Convert app message format to OpenRouter message format
 */
export const convertToOpenRouterMessage = (
  message: Message
): OpenRouterMessage => {
  const content = Array.isArray(message.text)
    ? message.text.join("\n")
    : message.text;

  switch (message.sender) {
    case "character":
      return { role: "assistant", content };
    case "user":
    default:
      return { role: "user", content };
  }
};

/**
 * Prepare messages for OpenRouter API from a chat
 */
export const prepareMessagesForOpenRouter = (
  chat: Chat
): OpenRouterMessage[] => {
  const messages: OpenRouterMessage[] = [];

  // Add system message with character prompt if available
  if (chat.characterInitialPrompt) {
    messages.push({
      role: "system",
      content: chat.characterInitialPrompt,
    });
  }

  // Add character's initial message if available
  if (chat.characterInitialMessage && chat.characterInitialMessage.length > 0) {
    messages.push({
      role: "assistant",
      content: chat.characterInitialMessage.join("\n"),
    });
  }

  // Add all chat messages
  if (chat.messages && chat.messages.length > 0) {
    chat.messages.forEach((message) => {
      messages.push(convertToOpenRouterMessage(message));
    });
  }

  return messages;
};

/**
 * Get chat completion from OpenRouter API
 */
export const getChatCompletion = async (
  chat: Chat,
  model: string = "openai/gpt-3.5-turbo",
  maxTokens: number = 1000
): Promise<string> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error(
        "OpenRouter API key is not configured. Please configure your API key in the application settings."
      );
    }

    const messages = prepareMessagesForOpenRouter(chat);
    const temperature = chat.temperature || 0.7;

    const requestBody: OpenRouterCompletionRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await httpClient<OpenRouterCompletionResponse>(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "TTInteractive Chat",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response received from OpenRouter");
    }

    return content;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    throw error;
  }
};

/**
 * Process a single line of streaming data
 */
const processStreamingLine = (
  line: string,
  onChunk?: (chunk: string) => void
): { content: string; isDone: boolean } => {
  if (!line.startsWith("data: ")) {
    return { content: "", isDone: false };
  }

  const data = line.slice(6);
  if (data === "[DONE]") {
    return { content: "", isDone: true };
  }

  try {
    const parsed = JSON.parse(data);
    const content = parsed.choices[0]?.delta?.content;
    if (content) {
      onChunk?.(content);
      return { content, isDone: false };
    }
  } catch {
    // Skip invalid JSON
  }

  return { content: "", isDone: false };
};

/**
 * Process streaming response from OpenRouter
 */
const processStreamingResponse = async (
  response: Response,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  let fullResponse = "";
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        const { content, isDone } = processStreamingLine(line, onChunk);
        if (isDone) {
          return fullResponse;
        }
        fullResponse += content;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullResponse;
};

/**
 * Get streaming chat completion from OpenRouter
 */
export const getStreamingChatCompletion = async (
  chat: Chat,
  model: string = "openai/gpt-3.5-turbo",
  maxTokens: number = 1000,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error(
        "OpenRouter API key is not configured. Please configure your API key in the application settings."
      );
    }

    const messages = prepareMessagesForOpenRouter(chat);
    const temperature = chat.temperature || 0.7;

    const requestBody: OpenRouterCompletionRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "TTInteractive Chat",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    return await processStreamingResponse(response, onChunk);
  } catch (error) {
    console.error("Error getting streaming chat completion:", error);
    throw error;
  }
};

/**
 * Alternative implementation using httpClient (for backend proxy)
 */
export const getChatCompletionViaProxy = async (
  chat: Chat,
  model: string = "openai/gpt-3.5-turbo",
  maxTokens: number = 1000,
  proxyEndpoint: string = "/api/openrouter/chat/completions"
): Promise<string> => {
  try {
    const messages = prepareMessagesForOpenRouter(chat);
    const temperature = chat.temperature || 0.7;

    const requestBody: OpenRouterCompletionRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await httpClient<OpenRouterCompletionResponse>(
      proxyEndpoint,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      }
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response received from OpenRouter via proxy");
    }

    return content;
  } catch (error) {
    console.error("Error getting chat completion via proxy:", error);
    throw error;
  }
};

/**
 * Create a new message from the AI response
 */
export const createMessageFromResponse = (
  response: string,
  sender: SenderType = "character"
): Message => {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    sender,
    text: [response],
  };
};

/**
 * Validate OpenRouter API key
 */
export const validateApiKey = async (): Promise<boolean> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return false;
    }

    // Test with a simple request to list models
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "TTInteractive Chat",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Invalid OpenRouter API key:", error);
    return false;
  }
};

/**
 * Check if API key exists (without making API calls)
 */
export const hasApiKey = async (): Promise<boolean> => {
  const apiKey = await getApiKey();
  return !!apiKey;
};

/**
 * Filter out specialized models that we don't want to show
 */
const filterSupportedModels = (model: OpenRouterModel): boolean => {
  const id = model?.id?.toLowerCase();
  const modality = model?.architecture?.modality;
  return (
    !id.includes("vision") &&
    !id.includes("dalle") &&
    !id.includes("whisper") &&
    !id.includes("tts") &&
    !id.includes("embedding") &&
    (modality === "text" || modality === "text->text")
  );
};

/**
 * Sort models with popular ones first
 */
const sortModelsByPopularity = (a: string, b: string): number => {
  const popularModels = [
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/gpt-3.5-turbo",
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3-haiku",
    "google/gemini-2.0-flash-exp",
    "google/gemini-pro",
    "meta-llama/llama-3.1-8b-instruct",
    "mistralai/mistral-7b-instruct",
  ];

  const aIndex = popularModels.indexOf(a);
  const bIndex = popularModels.indexOf(b);

  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex;
  }
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;

  return a.localeCompare(b);
};

/**
 * Get fallback models if API call fails
 */
const getFallbackModels = (): string[] => {
  return [
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/gpt-3.5-turbo",
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3-haiku",
    "google/gemini-2.0-flash-exp",
    "meta-llama/llama-3.1-8b-instruct",
    "mistralai/mistral-7b-instruct",
  ];
};

/**
 * Get available OpenRouter models
 */
export const getAvailableModels = async (): Promise<string[]> => {
  try {
    // Note: OpenRouter models endpoint is public and doesn't require API key
    const response = await httpClient<OpenRouterModelsResponse>(
      `${OPENROUTER_BASE_URL}/models`,
      {
        method: "GET",
        headers: {
          "HTTP-Referer": window.location.origin,
          "X-Title": "TTInteractive Chat",
        },
      }
    );

    // Filter and sort models
    return response.data
      .filter(filterSupportedModels)
      .map((model) => model.id)
      .sort(sortModelsByPopularity);
  } catch (error) {
    console.error("Error fetching available OpenRouter models:", error);
    return getFallbackModels();
  }
};

/**
 * Determine the tier of a model based on its ID
 */
const getModelTier = (modelId: string): "free" | "pro" | "premium" => {
  const modelLower = modelId.toLowerCase();

  // Free tier models (some models have free tier or very low cost)
  if (
    modelLower.includes("gpt-3.5-turbo") ||
    modelLower.includes("gemini-flash") ||
    modelLower.includes("llama-3.1-8b") ||
    modelLower.includes("mistral-7b") ||
    modelLower.includes("claude-3-haiku")
  ) {
    return "free";
  }

  // Premium tier models (expensive/large models)
  if (
    modelLower.includes("gpt-4o") ||
    modelLower.includes("claude-3.5-sonnet") ||
    modelLower.includes("claude-3-opus") ||
    modelLower.includes("gemini-pro") ||
    modelLower.includes("llama-3.1-70b") ||
    modelLower.includes("llama-3.1-405b")
  ) {
    return "premium";
  }

  return "pro";
};

/**
 * Generate a description based on the model provider
 */
const getModelDescription = (modelId: string): string => {
  if (modelId.startsWith("openai/")) {
    return "OpenAI model via OpenRouter";
  }
  if (modelId.startsWith("anthropic/")) {
    return "Anthropic Claude model via OpenRouter";
  }
  if (modelId.startsWith("google/")) {
    return "Google Gemini model via OpenRouter";
  }
  if (modelId.startsWith("meta-llama/")) {
    return "Meta Llama model via OpenRouter";
  }
  if (modelId.startsWith("mistralai/")) {
    return "Mistral AI model via OpenRouter";
  }

  return "AI model via OpenRouter";
};

/**
 * Get model information including tier and description
 */
export const getModelInfo = (
  modelId: string
): {
  name: string;
  tier: "free" | "pro" | "premium";
  description: string;
  provider: typeof OPENROUTER_API_KEY_INDEX;
} => {
  return {
    name: modelId,
    tier: getModelTier(modelId),
    description: getModelDescription(modelId),
    provider: OPENROUTER_API_KEY_INDEX,
  };
};
