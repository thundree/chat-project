import OpenAI from "openai";
import type { Chat, Message, SenderType } from "@/types";
import { httpClient } from "@/utils/httpClient";
import DatabaseService from "./databaseService";
import { OPEN_AI_API_KEY_INDEX } from "@/constants";

// OpenAI API configuration
let OPENAI_API_KEY: string | null = null;
let openai: OpenAI | null = null;

// Function to get API key from database
const getApiKey = async (): Promise<string | null> => {
  OPENAI_API_KEY ??= await DatabaseService.getActiveApiKey(
    OPEN_AI_API_KEY_INDEX
  );
  return OPENAI_API_KEY;
};

// Function to refresh API key from database
export const refreshApiKey = async (): Promise<void> => {
  OPENAI_API_KEY = await DatabaseService.getActiveApiKey(OPEN_AI_API_KEY_INDEX);
  openai = null; // Reset client so it gets reinitialized with new key
};

// Initialize OpenAI client
const initializeOpenAI = async (): Promise<OpenAI | null> => {
  const apiKey = await getApiKey();
  if (!openai && apiKey) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, you should proxy through your backend
    });
  }
  return openai;
};

// Types for OpenAI API
export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenAICompletionResponse {
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

/**
 * Convert app message format to OpenAI message format
 */
export const convertToOpenAIMessage = (message: Message): OpenAIMessage => {
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
 * Prepare messages for OpenAI API from a chat
 */
export const prepareMessagesForOpenAI = (chat: Chat): OpenAIMessage[] => {
  const messages: OpenAIMessage[] = [];

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
      messages.push(convertToOpenAIMessage(message));
    });
  }

  return messages;
};

/**
 * Get chat completion from OpenAI using the official SDK
 */
export const getChatCompletion = async (
  chat: Chat,
  model: string = "",
  maxTokens: number = 1000
): Promise<string> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error(
        "OpenAI API key is not configured. Please configure your API key in the application settings."
      );
    }

    const client = await initializeOpenAI();
    if (!client) {
      throw new Error("Failed to initialize OpenAI client");
    }

    const messages = prepareMessagesForOpenAI(chat);
    const temperature = chat.temperature || 0.7;

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response received from OpenAI");
    }

    return response;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    throw error;
  }
};

/**
 * Get streaming chat completion from OpenAI
 */
export const getStreamingChatCompletion = async (
  chat: Chat,
  model: string = "",
  maxTokens: number = 1000,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error(
        "OpenAI API key is not configured. Please configure your API key in the application settings."
      );
    }

    const client = await initializeOpenAI();
    if (!client) {
      throw new Error("Failed to initialize OpenAI client");
    }

    const messages = prepareMessagesForOpenAI(chat);
    const temperature = chat.temperature || 0.7;

    const stream = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (content) {
        fullResponse += content;
        onChunk?.(content);
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
  model: string = "",
  maxTokens: number = 1000,
  proxyEndpoint: string = "/api/openai/chat/completions"
): Promise<string> => {
  try {
    const messages = prepareMessagesForOpenAI(chat);
    const temperature = chat.temperature || 0.7;

    const requestBody: OpenAICompletionRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await httpClient<OpenAICompletionResponse>(proxyEndpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response received from OpenAI via proxy");
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
 * Validate OpenAI API key
 */
export const validateApiKey = async (): Promise<boolean> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return false;
    }

    const client = await initializeOpenAI();
    if (!client) {
      return false;
    }

    // Test with a simple request
    await client.models.list();
    return true;
  } catch (error) {
    console.error("Invalid OpenAI API key:", error);
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
 * Get available OpenAI models
 */
export const getAvailableModels = async (): Promise<string[]> => {
  try {
    const client = await initializeOpenAI();
    if (!client) {
      return [];
    }

    const models = await client.models.list();
    // let's skip image models and focus on text-based models
    return models.data
      .filter(
        (model) =>
          model.id.includes("gpt") &&
          !model.id.includes("image") &&
          !model.id.includes("vision") &&
          !model.id.includes("dall-e") &&
          !model.id.includes("dalle") &&
          !model.id.includes("transcribe")
      )
      .map((model) => model.id)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Error fetching available models:", error);
    return [];
  }
};
