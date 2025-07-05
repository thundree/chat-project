export const OPEN_AI_API_KEY_INDEX = "openai";
export const GOOGLE_AI_API_KEY_INDEX = "google-ai";

export const API_KEY_PROVIDERS = [
  OPEN_AI_API_KEY_INDEX,
  GOOGLE_AI_API_KEY_INDEX,
] as const;

export type AIProvider = (typeof API_KEY_PROVIDERS)[number];
