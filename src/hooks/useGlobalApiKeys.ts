import { useState, useEffect } from "react";
import DatabaseService from "@/services/databaseService";
import { refreshApiKey as refreshGoogleApiKey } from "@/services/googleAIService";
import { refreshApiKey as refreshOpenAIApiKey } from "@/services/openaiService";
import { refreshApiKey as refreshOpenRouterApiKey } from "@/services/openrouterService";
import {
  OPEN_AI_API_KEY_INDEX,
  GOOGLE_AI_API_KEY_INDEX,
  OLLAMA_API_KEY_INDEX,
  OPENROUTER_API_KEY_INDEX,
  type AIProvider,
} from "@/constants";
import { validateApiKeyForProvider } from "@/utils/apiKeyUtils";

export interface ApiKeyState {
  hasOpenAIKey: boolean;
  hasGoogleKey: boolean;
  hasOllamaKey: boolean;
  hasOpenRouterKey: boolean;
  loading: boolean;
  isSaving: boolean;
}

export interface ApiKeyActions {
  saveApiKey: (provider: AIProvider, key: string) => Promise<void>;
  removeApiKey: (provider: AIProvider) => Promise<void>;
  refreshKeys: () => Promise<void>;
  checkApiKeys: () => Promise<void>;
  validateKey: (provider: AIProvider, key: string) => boolean;
  hasApiKeyForProvider: (provider: AIProvider) => boolean;
}

// Create a global state for API keys to keep components synchronized
let globalApiKeyState: ApiKeyState = {
  hasOpenAIKey: false,
  hasGoogleKey: false,
  hasOllamaKey: false,
  hasOpenRouterKey: false,
  loading: true,
  isSaving: false,
};

const listeners = new Set<(state: ApiKeyState) => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(globalApiKeyState));
};

const updateGlobalState = (updates: Partial<ApiKeyState>) => {
  globalApiKeyState = { ...globalApiKeyState, ...updates };
  notifyListeners();
};

export const useGlobalApiKeys = (): ApiKeyState & ApiKeyActions => {
  const [localState, setLocalState] = useState<ApiKeyState>(globalApiKeyState);

  useEffect(() => {
    // Add this component as a listener
    const updateLocalState = (state: ApiKeyState) => {
      setLocalState(state);
    };

    listeners.add(updateLocalState);

    // Initialize if this is the first component
    if (listeners.size === 1) {
      checkApiKeys();
    }

    return () => {
      listeners.delete(updateLocalState);
    };
  }, []);

  const checkApiKeys = async (): Promise<void> => {
    try {
      updateGlobalState({ loading: true });

      const [openaiExists, googleExists, ollamaExists, openrouterExists] =
        await Promise.all([
          DatabaseService.hasApiKey(OPEN_AI_API_KEY_INDEX),
          DatabaseService.hasApiKey(GOOGLE_AI_API_KEY_INDEX),
          DatabaseService.hasApiKey(OLLAMA_API_KEY_INDEX),
          DatabaseService.hasApiKey(OPENROUTER_API_KEY_INDEX),
        ]);

      updateGlobalState({
        hasOpenAIKey: openaiExists,
        hasGoogleKey: googleExists,
        hasOllamaKey: ollamaExists,
        hasOpenRouterKey: openrouterExists,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking API keys:", error);
      updateGlobalState({ loading: false });
    }
  };

  const saveApiKey = async (
    provider: AIProvider,
    key: string
  ): Promise<void> => {
    if (!validateKey(provider, key)) {
      throw new Error(`Invalid ${provider} API key format`);
    }

    try {
      updateGlobalState({ isSaving: true });

      await DatabaseService.saveApiKey(provider, key.trim());

      // Refresh the specific service
      switch (provider) {
        case OPEN_AI_API_KEY_INDEX:
          await refreshOpenAIApiKey();
          updateGlobalState({ hasOpenAIKey: true });
          break;
        case GOOGLE_AI_API_KEY_INDEX:
          await refreshGoogleApiKey();
          updateGlobalState({ hasGoogleKey: true });
          break;
        case OLLAMA_API_KEY_INDEX:
          updateGlobalState({ hasOllamaKey: true });
          break;
        case OPENROUTER_API_KEY_INDEX:
          await refreshOpenRouterApiKey();
          updateGlobalState({ hasOpenRouterKey: true });
          break;
      }
    } catch (error) {
      console.error(`Error saving ${provider} key:`, error);
      throw error;
    } finally {
      updateGlobalState({ isSaving: false });
    }
  };

  const removeApiKey = async (provider: AIProvider): Promise<void> => {
    try {
      updateGlobalState({ isSaving: true });

      const keys = await DatabaseService.getAllApiKeys(provider);
      for (const key of keys) {
        await DatabaseService.deleteApiKey(key.id);
      }

      // Refresh the specific service and update state
      switch (provider) {
        case OPEN_AI_API_KEY_INDEX:
          await refreshOpenAIApiKey();
          updateGlobalState({ hasOpenAIKey: false });
          break;
        case GOOGLE_AI_API_KEY_INDEX:
          await refreshGoogleApiKey();
          updateGlobalState({ hasGoogleKey: false });
          break;
        case OLLAMA_API_KEY_INDEX:
          updateGlobalState({ hasOllamaKey: false });
          break;
        case OPENROUTER_API_KEY_INDEX:
          await refreshOpenRouterApiKey();
          updateGlobalState({ hasOpenRouterKey: false });
          break;
      }
    } catch (error) {
      console.error(`Error removing ${provider} key:`, error);
      throw error;
    } finally {
      updateGlobalState({ isSaving: false });
    }
  };

  const refreshKeys = async (): Promise<void> => {
    await Promise.all([
      refreshOpenAIApiKey(),
      refreshGoogleApiKey(),
      refreshOpenRouterApiKey(),
    ]);
    await checkApiKeys();
  };

  const validateKey = (provider: AIProvider, key: string): boolean => {
    return validateApiKeyForProvider(key, provider);
  };

  const hasApiKeyForProvider = (provider: AIProvider): boolean => {
    switch (provider) {
      case OPEN_AI_API_KEY_INDEX:
        return localState.hasOpenAIKey;
      case GOOGLE_AI_API_KEY_INDEX:
        return localState.hasGoogleKey;
      case OLLAMA_API_KEY_INDEX:
        return localState.hasOllamaKey;
      case OPENROUTER_API_KEY_INDEX:
        return localState.hasOpenRouterKey;
      default:
        return false;
    }
  };

  return {
    ...localState,
    saveApiKey,
    removeApiKey,
    refreshKeys,
    checkApiKeys,
    validateKey,
    hasApiKeyForProvider,
  };
};

export default useGlobalApiKeys;
