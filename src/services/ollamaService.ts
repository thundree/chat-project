import type { Chat, Message, SenderType } from "@/types";
import { httpClient } from "@/utils/httpClient";
import DatabaseService from "./databaseService";
import { OLLAMA_API_KEY_INDEX } from "@/constants";

// Ollama API configuration
let OLLAMA_API_KEY: string | null = null;
let OLLAMA_BASE_URL = "http://localhost:11434"; // Default Ollama URL

// Function to get API key from database (for authentication if needed)
const getApiKey = async (): Promise<string | null> => {
  OLLAMA_API_KEY ??= await DatabaseService.getActiveApiKey(
    OLLAMA_API_KEY_INDEX
  );
  return OLLAMA_API_KEY;
};

// Function to refresh API key from database
export const refreshApiKey = async (): Promise<void> => {
  OLLAMA_API_KEY = await DatabaseService.getActiveApiKey(OLLAMA_API_KEY_INDEX);
};

// Function to get or set base URL (stored as API key for simplicity)
const getBaseUrl = async (): Promise<string> => {
  const storedUrl = await getApiKey();
  return storedUrl ?? OLLAMA_BASE_URL;
};

// Types for Ollama API
export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[]; // base64 encoded images for multimodal models
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  format?: "json";
  options?: {
    temperature?: number;
    top_k?: number;
    top_p?: number;
    num_predict?: number;
    seed?: number;
    [key: string]: unknown;
  };
  keep_alive?: string;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  response?: string; // for completion endpoint
  done: boolean;
  done_reason?: string;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaModel {
  name: string;
  model?: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    families?: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaModelsResponse {
  models: OllamaModel[];
}

/**
 * Convert app message format to Ollama message format
 */
export const convertToOllamaMessage = (message: Message): OllamaMessage => {
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
 * Prepare messages for Ollama API from a chat
 */
export const prepareMessagesForOllama = (chat: Chat): OllamaMessage[] => {
  const messages: OllamaMessage[] = [];

  // Add system message with character prompt if available
  if (chat.characterConversationBase) {
    messages.push({
      role: "system",
      content: chat.characterConversationBase,
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
      messages.push(convertToOllamaMessage(message));
    });
  }

  return messages;
};

/**
 * Get chat completion from Ollama using the chat endpoint
 */
export const getChatCompletion = async (
  chat: Chat,
  model: string = "llama3.2",
  maxTokens: number = 1000
): Promise<string> => {
  try {
    const baseUrl = await getBaseUrl();
    const messages = prepareMessagesForOllama(chat);
    const temperature = chat.temperature || 0.7;

    const requestBody: OllamaChatRequest = {
      model,
      messages,
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };

    const response = await httpClient<OllamaChatResponse>(
      `${baseUrl}/api/chat`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.message?.content;

    if (!content) {
      throw new Error("No response received from Ollama");
    }

    return content;
  } catch (error) {
    console.error("Error getting chat completion from Ollama:", error);
    throw error;
  }
};

/**
 * Get streaming chat completion from Ollama
 */
export const getStreamingChatCompletion = async (
  chat: Chat,
  model: string = "llama3.2",
  maxTokens: number = 1000,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const baseUrl = await getBaseUrl();
  const messages = prepareMessagesForOllama(chat);
  const temperature = chat.temperature || 0.7;

  const requestBody: OllamaChatRequest = {
    model,
    messages,
    stream: true,
    options: {
      temperature,
      num_predict: maxTokens,
    },
  };

  return processStreamingResponse(baseUrl, requestBody, onChunk);
};

/**
 * Process streaming response from Ollama
 */
const processStreamingResponse = async (
  baseUrl: string,
  requestBody: OllamaChatRequest,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const response = await fetchStreamingResponse(baseUrl, requestBody);
  return handleStreamingData(response, onChunk);
};

/**
 * Fetch streaming response from Ollama API
 */
const fetchStreamingResponse = async (
  baseUrl: string,
  requestBody: OllamaChatRequest
): Promise<Response> => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

/**
 * Handle streaming data from response
 */
const handleStreamingData = async (
  response: Response,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  const decoder = new TextDecoder();
  let fullResponse = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const content = processChunkLines(chunk);

      if (content) {
        fullResponse += content;
        onChunk?.(content);
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullResponse;
};

/**
 * Process chunk lines and extract content
 */
const processChunkLines = (chunk: string): string => {
  const lines = chunk.split("\n").filter((line) => line.trim());
  let content = "";

  for (const line of lines) {
    try {
      const data: OllamaChatResponse = JSON.parse(line);
      if (data.message?.content) {
        content += data.message.content;
      }
    } catch {
      // Skip malformed JSON lines
      console.warn("Failed to parse streaming response line:", line);
    }
  }

  return content;
};

/**
 * Alternative implementation using httpClient (for backend proxy)
 */
export const getChatCompletionViaProxy = async (
  chat: Chat,
  model: string = "llama3.2",
  maxTokens: number = 1000,
  proxyEndpoint: string = "/api/ollama/chat"
): Promise<string> => {
  try {
    const messages = prepareMessagesForOllama(chat);
    const temperature = chat.temperature || 0.7;

    const requestBody: OllamaChatRequest = {
      model,
      messages,
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };

    const response = await httpClient<OllamaChatResponse>(proxyEndpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const content = response.message?.content;

    if (!content) {
      throw new Error("No response received from Ollama via proxy");
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
 * Validate Ollama connection (check if server is accessible)
 */
export const validateApiKey = async (): Promise<boolean> => {
  try {
    const baseUrl = await getBaseUrl();

    // Test with a simple request to list models
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Ollama connection validation failed:", error);
    return false;
  }
};

/**
 * Check if Ollama configuration exists (always true since Ollama doesn't require API keys)
 */
export const hasApiKey = async (): Promise<boolean> => {
  // For Ollama, we always return true since it doesn't require API keys by default
  // The "API key" field is used to store the base URL
  return true;
};

/**
 * Get available Ollama models
 */
export const getAvailableModels = async (): Promise<string[]> => {
  try {
    const baseUrl = await getBaseUrl();

    const response = await httpClient<OllamaModelsResponse>(
      `${baseUrl}/api/tags`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract model names from the response
    return response.models
      .map((model: OllamaModel) => model.name)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Error fetching available Ollama models:", error);
    // Return some common Ollama models as fallback
    return [
      "llama3.2",
      "llama3.1",
      "llama3",
      "mistral",
      "codellama",
      "phi3",
      "gemma2",
    ];
  }
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
  provider: typeof OLLAMA_API_KEY_INDEX;
} => {
  // All Ollama models are essentially "free" since they run locally
  const tier: "free" | "pro" | "premium" = "free";
  let description = "Local Ollama model";

  // Provide more specific descriptions for known models
  if (modelId.includes("llama3")) {
    description = "Meta's Llama 3 family - excellent general purpose models";
  } else if (modelId.includes("mistral")) {
    description = "Mistral AI's efficient and capable language model";
  } else if (modelId.includes("codellama")) {
    description = "Meta's Code Llama - specialized for code generation";
  } else if (modelId.includes("phi")) {
    description = "Microsoft's Phi models - small but capable";
  } else if (modelId.includes("gemma")) {
    description = "Google's Gemma models - lightweight and efficient";
  }

  return {
    name: modelId,
    tier,
    description,
    provider: OLLAMA_API_KEY_INDEX,
  };
};

/**
 * Set custom Ollama base URL
 */
export const setBaseUrl = async (url: string): Promise<void> => {
  OLLAMA_BASE_URL = url;
  // Store the URL as the "API key" for persistence
  await DatabaseService.saveApiKey(OLLAMA_API_KEY_INDEX, url);
  await refreshApiKey();
};

/**
 * Get current Ollama base URL
 */
export const getCurrentBaseUrl = async (): Promise<string> => {
  return await getBaseUrl();
};
