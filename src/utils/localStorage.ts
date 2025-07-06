// Local Storage utility functions for persisting app state

import {
  OPEN_AI_API_KEY_INDEX,
  GOOGLE_AI_API_KEY_INDEX,
  type AIProvider,
} from "@/constants";

/**
 * Generic function to save data to localStorage
 */
export const saveToLocalStorage = <T>(key: string, data: T): boolean => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Generic function to load data from localStorage
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error loading from localStorage (key: ${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove an item from localStorage
 */
export const removeFromLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Clear all localStorage data
 */
export const clearLocalStorage = (): boolean => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = "__localStorage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Specific keys for our app
// NOTE: IndexedDB (via Dexie) is used for:
// - Chat data (ttinteractive_chats)
// - Message history
// - Character data
//
// localStorage is used for smaller, faster data:
export const STORAGE_KEYS = {
  // User preferences and settings (keep in localStorage for fast access)
  SELECTED_MODEL: "ttinteractive_selected_model",
  AVAILABLE_MODELS: "ttinteractive_available_models",
  MODELS_LAST_FETCHED: "ttinteractive_models_last_fetched",
  USER_PREFERENCES: "ttinteractive_user_preferences",
  API_KEY_VALID: "ttinteractive_api_key_valid",
  UI_STATE: "ttinteractive_ui_state",
  SIDEBAR_STATE: "ttinteractive_sidebar_state",
  THEME_PREFERENCE: "ttinteractive_theme",
  // Provider-specific keys
  SELECTED_PROVIDER: "ttinteractive_selected_provider",
  OPENAI_SELECTED_MODEL: "ttinteractive_openai_selected_model",
  OPENAI_AVAILABLE_MODELS: "ttinteractive_openai_available_models",
  GOOGLE_AI_SELECTED_MODEL: "ttinteractive_google_ai_selected_model",
  GOOGLE_AI_AVAILABLE_MODELS: "ttinteractive_google_ai_available_models",
  OLLAMA_SELECTED_MODEL: "ttinteractive_ollama_selected_model",
  OLLAMA_AVAILABLE_MODELS: "ttinteractive_ollama_available_models",

  // Migration flag (to track if we've moved from localStorage to IndexedDB)
  MIGRATION_COMPLETED: "ttinteractive_migration_completed",

  // Legacy key (will be migrated to IndexedDB)
  CHAT_HISTORY: "ttinteractive_chat_history", // deprecated, use IndexedDB
} as const;

// Model-specific functions
export const saveSelectedModel = (model: string): boolean => {
  return saveToLocalStorage(STORAGE_KEYS.SELECTED_MODEL, model);
};

export const loadSelectedModel = (defaultModel: string = ""): string => {
  return loadFromLocalStorage(STORAGE_KEYS.SELECTED_MODEL, defaultModel);
};

export const saveAvailableModels = (models: string[]): boolean => {
  const data = {
    models,
    timestamp: Date.now(),
  };
  return saveToLocalStorage(STORAGE_KEYS.AVAILABLE_MODELS, data);
};

export const loadAvailableModels = (
  defaultModels: string[] = []
): { models: string[]; timestamp: number | null } => {
  const data = loadFromLocalStorage(STORAGE_KEYS.AVAILABLE_MODELS, {
    models: defaultModels,
    timestamp: null,
  });
  return data;
};

/**
 * Check if available models data is stale (older than 24 hours)
 */
export const areModelsStale = (
  timestamp: number | null,
  maxAgeHours: number = 24
): boolean => {
  if (!timestamp) return true;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  return Date.now() - timestamp > maxAgeMs;
};

export const saveSelectedProvider = (provider: AIProvider): boolean => {
  return saveToLocalStorage(STORAGE_KEYS.SELECTED_PROVIDER, provider);
};

export const loadSelectedProvider = (
  defaultProvider: AIProvider = OPEN_AI_API_KEY_INDEX
): AIProvider => {
  return loadFromLocalStorage(STORAGE_KEYS.SELECTED_PROVIDER, defaultProvider);
};

export const saveSelectedModelForProvider = (
  model: string,
  provider: AIProvider
): boolean => {
  let key: string;
  if (provider === OPEN_AI_API_KEY_INDEX) {
    key = STORAGE_KEYS.OPENAI_SELECTED_MODEL;
  } else if (provider === GOOGLE_AI_API_KEY_INDEX) {
    key = STORAGE_KEYS.GOOGLE_AI_SELECTED_MODEL;
  } else {
    key = STORAGE_KEYS.OLLAMA_SELECTED_MODEL;
  }
  return saveToLocalStorage(key, model);
};

export const loadSelectedModelForProvider = (
  provider: AIProvider,
  defaultModel?: string
): string => {
  let key: string;
  let providerDefault: string;

  if (provider === OPEN_AI_API_KEY_INDEX) {
    key = STORAGE_KEYS.OPENAI_SELECTED_MODEL;
    providerDefault = "";
  } else if (provider === GOOGLE_AI_API_KEY_INDEX) {
    key = STORAGE_KEYS.GOOGLE_AI_SELECTED_MODEL;
    providerDefault = "";
  } else {
    key = STORAGE_KEYS.OLLAMA_SELECTED_MODEL;
    providerDefault = "";
  }

  return loadFromLocalStorage(key, defaultModel ?? providerDefault);
};

export const saveAvailableModelsForProvider = (
  models: string[],
  provider: AIProvider
): boolean => {
  let key: string;
  if (provider === OPEN_AI_API_KEY_INDEX) {
    key = STORAGE_KEYS.OPENAI_AVAILABLE_MODELS;
  } else if (provider === GOOGLE_AI_API_KEY_INDEX) {
    key = STORAGE_KEYS.GOOGLE_AI_AVAILABLE_MODELS;
  } else {
    key = STORAGE_KEYS.OLLAMA_AVAILABLE_MODELS;
  }

  const data = {
    models,
    timestamp: Date.now(),
  };
  return saveToLocalStorage(key, data);
};

export const loadAvailableModelsForProvider = (
  provider: AIProvider,
  defaultModels?: string[],
  useDefaults: boolean = true
): { models: string[]; timestamp: number | null } => {
  let key: string;
  let providerDefaults: string[];

  if (provider === OPEN_AI_API_KEY_INDEX) {
    key = STORAGE_KEYS.OPENAI_AVAILABLE_MODELS;
    providerDefaults = [];
  } else if (provider === GOOGLE_AI_API_KEY_INDEX) {
    key = STORAGE_KEYS.GOOGLE_AI_AVAILABLE_MODELS;
    providerDefaults = [];
  } else {
    key = STORAGE_KEYS.OLLAMA_AVAILABLE_MODELS;
    providerDefaults = [];
  }

  const fallbackModels = useDefaults ? defaultModels ?? providerDefaults : [];
  const data = loadFromLocalStorage(key, {
    models: fallbackModels,
    timestamp: null,
  });
  return data;
};

// User preferences functions
export interface UserPreferences {
  selectedModel: string;
  maxTokens: number;
  temperature: number;
  enableStreaming: boolean;
  theme: "light" | "dark" | "auto";
}

export const saveUserPreferences = (
  preferences: Partial<UserPreferences>
): boolean => {
  const currentPreferences = loadUserPreferences();
  const updatedPreferences = { ...currentPreferences, ...preferences };
  return saveToLocalStorage(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
};

export const loadUserPreferences = (): UserPreferences => {
  const defaultPreferences: UserPreferences = {
    selectedModel: "",
    maxTokens: 1000,
    temperature: 0.7,
    enableStreaming: true,
    theme: "auto",
  };
  return loadFromLocalStorage(
    STORAGE_KEYS.USER_PREFERENCES,
    defaultPreferences
  );
};

// Chat history functions (for future use)
export interface ChatSession {
  id: string;
  title: string;
  messages: unknown[];
  createdAt: number;
  updatedAt: number;
}

export const saveChatSession = (session: ChatSession): boolean => {
  const chatHistory = loadChatHistory();
  const existingIndex = chatHistory.findIndex((chat) => chat.id === session.id);

  if (existingIndex >= 0) {
    chatHistory[existingIndex] = { ...session, updatedAt: Date.now() };
  } else {
    chatHistory.push(session);
  }

  // Keep only the last 50 chat sessions
  const sortedHistory = [...chatHistory].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
  const limitedHistory = sortedHistory.slice(0, 50);

  return saveToLocalStorage(STORAGE_KEYS.CHAT_HISTORY, limitedHistory);
};

export const loadChatHistory = (): ChatSession[] => {
  return loadFromLocalStorage(STORAGE_KEYS.CHAT_HISTORY, []);
};

export const deleteChatSession = (sessionId: string): boolean => {
  const chatHistory = loadChatHistory();
  const filteredHistory = chatHistory.filter((chat) => chat.id !== sessionId);
  return saveToLocalStorage(STORAGE_KEYS.CHAT_HISTORY, filteredHistory);
};

// API validation cache
export const saveApiKeyValidation = (isValid: boolean): boolean => {
  const data = {
    isValid,
    timestamp: Date.now(),
  };
  return saveToLocalStorage(STORAGE_KEYS.API_KEY_VALID, data);
};

export const loadApiKeyValidation = (): {
  isValid: boolean;
  timestamp: number | null;
} => {
  return loadFromLocalStorage(STORAGE_KEYS.API_KEY_VALID, {
    isValid: false,
    timestamp: null,
  });
};

/**
 * Check if API key validation is stale (older than 1 hour)
 */
export const isApiValidationStale = (
  timestamp: number | null,
  maxAgeMinutes: number = 60
): boolean => {
  if (!timestamp) return true;
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  return Date.now() - timestamp > maxAgeMs;
};

/**
 * Get storage usage information
 */
export const getStorageInfo = (): {
  used: number;
  available: number;
  percentage: number;
} => {
  try {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        used += key.length + (value?.length ?? 0);
      }
    }

    // Most browsers have a 5-10MB limit for localStorage
    const estimated = 5 * 1024 * 1024; // 5MB estimate
    const percentage = (used / estimated) * 100;

    return {
      used,
      available: estimated - used,
      percentage: Math.min(percentage, 100),
    };
  } catch {
    return { used: 0, available: 0, percentage: 0 };
  }
};

/**
 * Export all app data for backup
 */
export const exportAppData = (): Record<string, unknown> => {
  const data: Record<string, unknown> = {};

  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        data[key] = JSON.parse(value);
      }
    } catch (error) {
      console.warn(`Failed to export data for key ${key}:`, error);
    }
  });

  return data;
};

/**
 * Import app data from backup
 */
export const importAppData = (data: Record<string, unknown>): boolean => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      const storageKeyValues = Object.values(STORAGE_KEYS) as string[];
      if (storageKeyValues.includes(key)) {
        saveToLocalStorage(key, value);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to import app data:", error);
    return false;
  }
};
