export const OPEN_AI_API_KEY_INDEX = "openai";
export const GOOGLE_AI_API_KEY_INDEX = "google-ai";
export const OLLAMA_API_KEY_INDEX = "ollama-ai";
export const OPENROUTER_API_KEY_INDEX = "openrouter";

export const API_KEY_PROVIDERS = [
  OPEN_AI_API_KEY_INDEX,
  GOOGLE_AI_API_KEY_INDEX,
  OLLAMA_API_KEY_INDEX,
  OPENROUTER_API_KEY_INDEX,
] as const;

export type AIProvider = (typeof API_KEY_PROVIDERS)[number];

export const CHAT_STORAGE_KEY = "ttinteractive_chats";
