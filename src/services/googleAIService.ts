import { GoogleGenAI } from "@google/genai";
import type { Chat, Message, SenderType } from "@/types";
import { httpClient } from "@/utils/httpClient";
import DatabaseService from "./databaseService";

// Google AI API configuration
let GOOGLE_AI_API_KEY: string | null = null;

// Function to get API key from database
const getApiKey = async (): Promise<string | null> => {
  GOOGLE_AI_API_KEY ??= await DatabaseService.getActiveApiKey("google");
  return GOOGLE_AI_API_KEY;
};

// Function to refresh API key from database
export const refreshApiKey = async (): Promise<void> => {
  GOOGLE_AI_API_KEY = await DatabaseService.getActiveApiKey("google");
  genAI = null; // Reset client so it gets reinitialized with new key
};

// Initialize Google AI client
let genAI: GoogleGenAI | null = null;

const initializeGoogleAI = async (): Promise<GoogleGenAI | null> => {
  const apiKey = await getApiKey();
  if (!genAI && apiKey) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

// Types for Google AI API
export interface GoogleAIMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GoogleAICompletionRequest {
  model: string;
  contents: GoogleAIMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
  systemInstruction?: {
    parts: { text: string }[];
  };
}

export interface GoogleAICompletionResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Convert app message format to Google AI message format
 */
export const convertToGoogleAIMessage = (message: Message): GoogleAIMessage => {
  const content = Array.isArray(message.text)
    ? message.text.join("\n")
    : message.text;

  switch (message.sender) {
    case "character":
      return {
        role: "model",
        parts: [{ text: content }],
      };
    case "user":
    default:
      return {
        role: "user",
        parts: [{ text: content }],
      };
  }
};

// IMPORTANT: Gemini 2.5+ models require conversations to end with a user message
// This function ensures compatibility with both older and newer Gemini models

/**
 * Prepare messages for Google AI API from a chat
 */
export const prepareMessagesForGoogleAI = (
  chat: Chat
): {
  messages: GoogleAIMessage[];
  systemInstruction?: string;
} => {
  const messages: GoogleAIMessage[] = [];
  let systemInstruction: string | undefined;

  // Add system instruction if available
  if (chat.characterInitialPrompt) {
    systemInstruction = chat.characterInitialPrompt;
  }

  // Add character's initial message if available
  if (chat.characterInitialMessage && chat.characterInitialMessage.length > 0) {
    messages.push({
      role: "model",
      parts: [{ text: chat.characterInitialMessage.join("\n") }],
    });
  }

  // Add all chat messages
  if (chat.messages && chat.messages.length > 0) {
    chat.messages.forEach((message) => {
      messages.push(convertToGoogleAIMessage(message));
    });
  }

  // Ensure the conversation ends with a user message (required for Gemini 2.5+ models)
  if (messages.length > 0 && messages[messages.length - 1].role === "model") {
    // If the last message is from the model, we need to add a user message
    // This typically happens when we're generating a response to the user's last message
    // In this case, we should look at the last user message to continue the conversation

    // Find the last user message in the conversation
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessageIndex = i;
        break;
      }
    }

    if (lastUserMessageIndex >= 0) {
      // Remove any model messages after the last user message
      messages.splice(lastUserMessageIndex + 1);
    } else if (messages.length === 1 && messages[0].role === "model") {
      // If we only have the character's initial message, add a generic user greeting
      messages.push({
        role: "user",
        parts: [{ text: "Hello" }],
      });
    }
  }

  // If we have no messages at all, add a default user message
  if (messages.length === 0) {
    messages.push({
      role: "user",
      parts: [{ text: "Hello" }],
    });
  }

  return { messages, systemInstruction };
};

/**
 * Get chat completion from Google AI using the official SDK
 */
export const getChatCompletion = async (
  chat: Chat,
  model: string = "gemini-2.5-flash",
  maxTokens: number = 1000
): Promise<string> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error(
        "Google AI API key is not configured. Please configure your API key in the application settings."
      );
    }

    const ai = await initializeGoogleAI();
    if (!ai) {
      throw new Error("Failed to initialize Google AI client");
    }

    const { messages, systemInstruction } = prepareMessagesForGoogleAI(chat);
    const temperature = parseFloat(chat.temperature) || 0.7;

    // Prepare the content for the new API
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    const params: GoogleAICompletionRequest = {
      model,
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    // Add system instruction if available
    if (systemInstruction) {
      params.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const result = await ai.models.generateContent(params);
    const response = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!response) {
      throw new Error("No response received from Google AI");
    }

    return response;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    throw error;
  }
};

/**
 * Get streaming chat completion from Google AI
 */
export const getStreamingChatCompletion = async (
  chat: Chat,
  model: string = "gemini-2.5-flash",
  maxTokens: number = 1000,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error(
        "Google AI API key is not configured. Please configure your API key in the application settings."
      );
    }

    const ai = await initializeGoogleAI();
    if (!ai) {
      throw new Error("Failed to initialize Google AI client");
    }

    const { messages, systemInstruction } = prepareMessagesForGoogleAI(chat);
    const temperature = parseFloat(chat.temperature) || 0.7;

    // Prepare the content for the new API
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    const params: GoogleAICompletionRequest = {
      model,
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    // Add system instruction if available
    if (systemInstruction) {
      params.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const streamResult = await ai.models.generateContentStream(params);
    let fullResponse = "";

    for await (const chunk of streamResult) {
      const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (chunkText) {
        fullResponse += chunkText;
        onChunk?.(chunkText);
      }
    }

    return fullResponse;
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
  model: string = "gemini-2.5-flash",
  maxTokens: number = 1000,
  proxyEndpoint: string = "/api/google-ai/generateContent"
): Promise<string> => {
  try {
    const { messages, systemInstruction } = prepareMessagesForGoogleAI(chat);
    const temperature = parseFloat(chat.temperature) || 0.7;

    const requestBody: GoogleAICompletionRequest = {
      model,
      contents: messages,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    // Add system instruction if available
    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await httpClient<GoogleAICompletionResponse>(
      proxyEndpoint,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      }
    );

    const content = response.candidates[0]?.content?.parts[0]?.text;

    if (!content) {
      throw new Error("No response received from Google AI via proxy");
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
 * Validate Google AI API key
 */
export const validateApiKey = async (): Promise<boolean> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return false;
    }

    const ai = await initializeGoogleAI();
    if (!ai) {
      return false;
    }

    // Test with a simple request using 1.5 Flash for compatibility
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: "Hello" }] }],
    });
    return !!result.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("Invalid Google AI API key:", error);
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

// Types for Google AI models
interface GoogleAIModel {
  name: string;
  displayName: string;
  description?: string;
  supportedActions?: string[];
}

/**
 * Get available Google AI models
 */
export const getAvailableModels = async (): Promise<string[]> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error("Google AI API key not configured");
    }

    const ai = await initializeGoogleAI();
    if (!ai) {
      throw new Error("Failed to initialize Google AI client");
    }

    // Fetch models from Google AI API
    const modelsResult = await ai.models.list();

    // Collect all models by iterating through the async iterator
    const allModels: GoogleAIModel[] = [];
    for await (const model of modelsResult) {
      allModels.push(model as GoogleAIModel);
    }

    // Extract model names and filter for text generation models
    const availableModels = allModels
      .filter(
        (model: GoogleAIModel) =>
          model.supportedActions?.includes("generateContent") &&
          !model.name.includes("embedding") &&
          !model.name.includes("tts") &&
          !model.name.includes("image") &&
          !model.name.includes("aqa") &&
          !model.name.includes("gemma") // Filter out Gemma models for now
      )
      .map((model: GoogleAIModel) => model.name.replace("models/", ""))
      .sort((a: string, b: string) => {
        // Sort to put stable models before experimental/preview models
        const aIsStable = !a.includes("exp") && !a.includes("preview");
        const bIsStable = !b.includes("exp") && !b.includes("preview");

        if (aIsStable && !bIsStable) return -1;
        if (!aIsStable && bIsStable) return 1;

        return a.localeCompare(b);
      });

    return availableModels;
  } catch (error) {
    console.error("Error fetching available models:", error);
    // Fallback to known models if API call fails
    return [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
    ];
  }
};

/**
 * Get model information and pricing tier
 */
export const getModelInfo = (
  modelId: string
): {
  name: string;
  tier: "free" | "pro" | "premium";
  description: string;
} => {
  const modelInfo: Record<
    string,
    { name: string; tier: "free" | "pro" | "premium"; description: string }
  > = {
    // Gemini 2.5 models (newest)
    "gemini-2.5-pro": {
      name: "Gemini 2.5 Pro",
      tier: "premium",
      description:
        "Most powerful thinking model with maximum response accuracy",
    },
    "gemini-2.5-flash": {
      name: "Gemini 2.5 Flash",
      tier: "pro",
      description:
        "Best model for price-performance with thinking capabilities",
    },
    "gemini-2.5-flash-lite-preview-06-17": {
      name: "Gemini 2.5 Flash Lite",
      tier: "free",
      description: "Most cost-efficient model optimized for high throughput",
    },

    // Gemini 2.0 models
    "gemini-2.0-flash": {
      name: "Gemini 2.0 Flash",
      tier: "pro",
      description: "Next generation model with speed and realtime streaming",
    },
    "gemini-2.0-flash-lite": {
      name: "Gemini 2.0 Flash Lite",
      tier: "free",
      description: "Cost-efficient and low latency version of 2.0 Flash",
    },

    // Gemini 1.5 models (stable)
    "gemini-1.5-flash": {
      name: "Gemini 1.5 Flash",
      tier: "free",
      description: "Fast and versatile model for most tasks",
    },
    "gemini-1.5-flash-8b": {
      name: "Gemini 1.5 Flash 8B",
      tier: "free",
      description: "Smaller, faster version of Flash for high volume tasks",
    },
    "gemini-1.5-pro": {
      name: "Gemini 1.5 Pro",
      tier: "pro",
      description: "Complex reasoning tasks requiring more intelligence",
    },

    // Legacy models
    "gemini-1.0-pro": {
      name: "Gemini 1.0 Pro",
      tier: "pro",
      description: "Previous generation pro model (legacy)",
    },
  };

  return (
    modelInfo[modelId] || {
      name: modelId,
      tier: "pro",
      description: "Unknown model",
    }
  );
};
