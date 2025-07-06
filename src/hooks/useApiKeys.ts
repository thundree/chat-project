import { useState, useEffect } from "react";
import DatabaseService from "@/services/databaseService";
import { refreshApiKey as refreshGoogleApiKey } from "@/services/googleAIService";
import { refreshApiKey as refreshOpenAIApiKey } from "@/services/openaiService";
import { OPEN_AI_API_KEY_INDEX, GOOGLE_AI_API_KEY_INDEX } from "@/constants";

export const useApiKeys = () => {
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasGoogleKey, setHasGoogleKey] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkApiKeys = async () => {
    try {
      setLoading(true);
      const [openai, google] = await Promise.all([
        DatabaseService.hasApiKey(OPEN_AI_API_KEY_INDEX),
        DatabaseService.hasApiKey(GOOGLE_AI_API_KEY_INDEX),
      ]);
      setHasOpenAIKey(openai);
      setHasGoogleKey(google);
    } catch (error) {
      console.error("Error checking API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveOpenAIKey = async (key: string): Promise<void> => {
    try {
      await DatabaseService.saveApiKey(OPEN_AI_API_KEY_INDEX, key);
      await refreshOpenAIApiKey();
      setHasOpenAIKey(true);
    } catch (error) {
      console.error("Error saving OpenAI key:", error);
      throw error;
    }
  };

  const saveGoogleKey = async (key: string): Promise<void> => {
    try {
      await DatabaseService.saveApiKey(GOOGLE_AI_API_KEY_INDEX, key);
      await refreshGoogleApiKey();
      setHasGoogleKey(true);
    } catch (error) {
      console.error("Error saving Google key:", error);
      throw error;
    }
  };

  const removeOpenAIKey = async (): Promise<void> => {
    try {
      const keys = await DatabaseService.getAllApiKeys(OPEN_AI_API_KEY_INDEX);
      for (const key of keys) {
        await DatabaseService.deleteApiKey(key.id);
      }
      await refreshOpenAIApiKey();
      setHasOpenAIKey(false);
    } catch (error) {
      console.error("Error removing OpenAI key:", error);
      throw error;
    }
  };

  const removeGoogleKey = async (): Promise<void> => {
    try {
      const keys = await DatabaseService.getAllApiKeys(GOOGLE_AI_API_KEY_INDEX);
      for (const key of keys) {
        await DatabaseService.deleteApiKey(key.id);
      }
      await refreshGoogleApiKey();
      setHasGoogleKey(false);
    } catch (error) {
      console.error("Error removing Google key:", error);
      throw error;
    }
  };

  const refreshKeys = async (): Promise<void> => {
    await Promise.all([refreshOpenAIApiKey(), refreshGoogleApiKey()]);
    await checkApiKeys();
  };

  useEffect(() => {
    checkApiKeys();
  }, []);

  return {
    hasOpenAIKey,
    hasGoogleKey,
    loading,
    saveOpenAIKey,
    saveGoogleKey,
    removeOpenAIKey,
    removeGoogleKey,
    refreshKeys,
    checkApiKeys,
  };
};

export default useApiKeys;
